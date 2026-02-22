# Claude Code Tabs

Run [Claude Code](https://docs.anthropic.com/en/docs/claude-code) as editor tabs instead of the bottom terminal panel.

Claude Code normally opens in a separate terminal or the integrated terminal at the bottom of your editor. This extension opens it as **editor tabs** — side by side with your code, just like any other file.

## Features

- **Editor Tabs** — Claude Code opens as a tab in the editor area, not the terminal panel. Split, drag, and arrange it like any other editor tab.
- **Session History** — Resume recent sessions from a QuickPick menu. Reads directly from `~/.claude/projects/` so it always matches your actual session history.
- **Smart Tab Naming** — New sessions get numbered names (`Claude Code`, `Claude Code 2`, ...). Resumed sessions show their summary as the tab name.
- **Multi-Project Workspaces** — In multi-root workspaces, each project gets its own "New Session" entry and sessions are grouped by project.
- **Single Instance Mode** — Optional setting to reuse an existing Claude tab instead of opening a new one.

## Usage

Click the 🤖 icon in the editor title bar or press `Cmd+Alt+C` (Mac) / `Ctrl+Alt+C` (Windows/Linux).

A QuickPick menu appears with:

- **New Session** — Start a fresh Claude Code session (one per workspace folder)
- **Recent Sessions** — Resume any of your last 10 sessions, sorted by most recent

### Commands

| Command               | Shortcut (Mac) | Shortcut (Win/Linux) | Description                          |
| --------------------- | -------------- | -------------------- | ------------------------------------ |
| Claude: Open          | `Cmd+Alt+C`    | `Ctrl+Alt+C`         | QuickPick with new + recent sessions |
| Claude: New Session   | —              | —                    | Start a new session directly         |
| Claude: Continue Last | `Cmd+Alt+R`    | `Ctrl+Alt+R`         | Resume the most recent session       |

### Settings

| Setting                          | Default | Description                                            |
| -------------------------------- | ------- | ------------------------------------------------------ |
| `claude-launcher.singleInstance` | `false` | Focus existing Claude tab instead of opening a new one |

## Requirements

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) installed and available in PATH
- VS Code 1.74+ or Cursor

## Install

**Marketplace** — Search for "Claude Code Tabs" in the Extensions view.

**Manual** — Download the `.vsix` from [Releases](https://github.com/johrld/claude-code-tabs/releases), then `Extensions → ... → Install from VSIX...`

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT
