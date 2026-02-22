const vscode = require('vscode');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

/**
 * Get all Claude Code terminals
 */
function getClaudeTerminals() {
  return vscode.window.terminals.filter(t => t.name.startsWith('Claude Code'));
}

/**
 * Get the next available tab number for Claude Code
 */
function getNextTabNumber() {
  const claudeTerminals = getClaudeTerminals();
  if (claudeTerminals.length === 0) return 1;

  const numbers = claudeTerminals.map(t => {
    const match = t.name.match(/Claude Code(?: (\d+))?$/);
    if (match) {
      return match[1] ? parseInt(match[1], 10) : 1;
    }
    return 0;
  }).filter(n => n > 0);

  let nextNum = 1;
  while (numbers.includes(nextNum)) {
    nextNum++;
  }
  return nextNum;
}

/**
 * Generate tab name based on number
 */
function getTabName(number) {
  return number === 1 ? 'Claude Code' : `Claude Code ${number}`;
}

/**
 * Find existing Claude terminal and focus it (for single-instance mode)
 */
function focusExistingClaudeTerminal() {
  const claudeTerminals = getClaudeTerminals();
  if (claudeTerminals.length > 0) {
    claudeTerminals[0].show();
    return true;
  }
  return false;
}

/**
 * Create a new Claude Code terminal
 * @param {string} command - The command to run
 * @param {string|null} sessionTitle - Optional session title for resumed sessions
 * @param {string|null} cwd - Working directory for the terminal
 */
function createClaudeTerminal(command = 'claude', sessionTitle = null, cwd = null) {
  const config = vscode.workspace.getConfiguration('claude-launcher');
  const singleInstance = config.get('singleInstance', false);

  if (singleInstance && command === 'claude') {
    if (focusExistingClaudeTerminal()) {
      return;
    }
  }

  // Use session title for resumed sessions, numbered name for new sessions
  let tabName;
  if (sessionTitle) {
    const maxLen = 35;
    tabName = sessionTitle.length > maxLen
      ? sessionTitle.substring(0, maxLen) + '…'
      : sessionTitle;
  } else {
    const tabNumber = getNextTabNumber();
    tabName = getTabName(tabNumber);
  }

  const terminalOptions = {
    name: tabName,
    location: vscode.TerminalLocation.Editor
  };

  // Set working directory if provided
  if (cwd) {
    terminalOptions.cwd = cwd;
  }

  const terminal = vscode.window.createTerminal(terminalOptions);

  terminal.show();

  setTimeout(() => {
    terminal.sendText(command);
  }, 500);

  return terminal;
}

/**
 * Format time ago string
 */
function formatTimeAgo(date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  return `${diffDays}d ago`;
}

/**
 * Get summary from session file (for sessions not yet in index)
 */
async function getSessionSummary(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());

    // Look for summary entry first
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'summary' && obj.summary) {
          return obj.summary;
        }
      } catch { continue; }
    }

    // Fallback: first user message
    for (const line of lines) {
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'user' && obj.message?.content) {
          const text = typeof obj.message.content === 'string'
            ? obj.message.content.trim()
            : '';
          if (text && !text.startsWith('[')) {
            return text.substring(0, 50) + (text.length > 50 ? '...' : '');
          }
        }
      } catch { continue; }
    }
    return null;
  } catch { return null; }
}

/**
 * Get recent sessions from index + new files for a specific workspace folder
 * @param {string} workspaceFolder - The workspace folder path
 */
async function getRecentSessionsForFolder(workspaceFolder) {
  try {
    if (!workspaceFolder) return [];

    const projectDir = workspaceFolder.replace(/\//g, '-');
    const sessionsPath = path.join(os.homedir(), '.claude', 'projects', projectDir);
    const indexPath = path.join(sessionsPath, 'sessions-index.json');

    // Read index
    let indexedSessions = new Map();
    try {
      const indexContent = await fs.readFile(indexPath, 'utf8');
      const index = JSON.parse(indexContent);
      index.entries.forEach(e => {
        if (e.summary && !e.isSidechain) {
          indexedSessions.set(e.sessionId, {
            id: e.sessionId,
            title: e.summary,
            updated_at: new Date(e.modified)
          });
        }
      });
    } catch {}

    // Check for new session files not in index
    try {
      const files = await fs.readdir(sessionsPath);
      const sessionFiles = files.filter(f => f.endsWith('.jsonl'));

      for (const f of sessionFiles) {
        const sessionId = f.replace('.jsonl', '');
        const filePath = path.join(sessionsPath, f);
        const stat = await fs.stat(filePath);

        // If file is newer than indexed version or not indexed
        const indexed = indexedSessions.get(sessionId);
        if (!indexed || stat.mtime > indexed.updated_at) {
          const summary = await getSessionSummary(filePath);
          if (summary) {
            indexedSessions.set(sessionId, {
              id: sessionId,
              title: summary,
              updated_at: stat.mtime
            });
          }
        }
      }
    } catch {}

    // Sort by date and return top 5
    return [...indexedSessions.values()]
      .sort((a, b) => b.updated_at - a.updated_at)
      .slice(0, 5);
  } catch {
    return [];
  }
}

/**
 * Get all workspace folders
 */
function getWorkspaceFolders() {
  const folders = vscode.workspace.workspaceFolders || [];
  return folders.map(f => ({
    name: f.name,
    path: f.uri.fsPath
  }));
}

function activate(context) {
  // Command: Smart Open (Icon click) - shows QuickPick with New Session per project + Recent Sessions
  const smartOpenCommand = vscode.commands.registerCommand('claude-launcher.smartOpen', async () => {
    const workspaceFolders = getWorkspaceFolders();
    const items = [];

    // Add "New Session" for each workspace folder
    if (workspaceFolders.length === 0) {
      items.push({
        label: '$(add) New Session',
        description: 'Start a fresh Claude Code session',
        action: 'new',
        cwd: null
      });
    } else {
      for (const folder of workspaceFolders) {
        items.push({
          label: `$(add) New Session (${folder.name})`,
          description: folder.path,
          action: 'new',
          cwd: folder.path
        });
      }
    }

    // Gather sessions from all workspace folders
    const allSessions = [];
    for (const folder of workspaceFolders) {
      const sessions = await getRecentSessionsForFolder(folder.path);
      sessions.forEach(s => {
        allSessions.push({
          ...s,
          projectName: folder.name,
          projectPath: folder.path
        });
      });
    }

    // Sort all sessions by date and take top 10
    allSessions.sort((a, b) => b.updated_at - a.updated_at);
    const recentSessions = allSessions.slice(0, 10);

    if (recentSessions.length > 0) {
      items.push({ label: '', kind: vscode.QuickPickItemKind.Separator });
      recentSessions.forEach(s => {
        const label = s.title || `Session ${s.id.substring(0, 8)}`;
        const projectSuffix = workspaceFolders.length > 1 ? ` (${s.projectName})` : '';
        items.push({
          label: `$(history) ${label}`,
          description: `${formatTimeAgo(s.updated_at)}${projectSuffix}`,
          action: 'resume',
          id: s.id,
          cwd: s.projectPath,
          sessionTitle: label
        });
      });
    }

    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: 'Claude Code'
    });

    if (!selected) return;

    if (selected.action === 'new') {
      createClaudeTerminal('claude', null, selected.cwd);
    } else {
      createClaudeTerminal(`claude --resume ${selected.id}`, selected.sessionTitle, selected.cwd);
    }
  });

  // Command: Open new session directly
  const openCommand = vscode.commands.registerCommand('claude-launcher.open', async () => {
    createClaudeTerminal('claude');
  });

  // Command: Continue last session
  const continueCommand = vscode.commands.registerCommand('claude-launcher.continue', async () => {
    createClaudeTerminal('claude --continue');
  });

  context.subscriptions.push(smartOpenCommand);
  context.subscriptions.push(openCommand);
  context.subscriptions.push(continueCommand);
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
