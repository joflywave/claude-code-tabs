# Claude Code Tabs

Open [Claude Code](https://claude.ai/code) as editor tabs in VS Code/Cursor with session history.

## Features

- **One-Click Access** - Robot icon in editor title bar
- **Session Management** - Resume recent sessions from QuickPick menu
- **Smart Tab Naming** - Resumed sessions show their summary as tab name
- **Keyboard Shortcuts** - `Cmd+Alt+C` to open, `Cmd+Alt+R` to continue (Mac)

## Usage

### Quick Open (Recommended)
Click the robot icon in the top-right corner of the editor or press `Cmd+Alt+C` (Mac) / `Ctrl+Alt+C` (Windows/Linux):

- **New Session** - Start a fresh Claude Code session
- **Recent Sessions** - Resume any of your last 5 sessions

### Commands

| Command | Mac | Windows/Linux | Description |
|---------|-----|---------------|-------------|
| Claude: Open | `Cmd+Alt+C` | `Ctrl+Alt+C` | Opens QuickPick with New + Recent sessions |
| Claude: New Session | - | - | Start a new session directly |
| Claude: Continue Last | `Cmd+Alt+R` | `Ctrl+Alt+R` | Resume the most recent session |

### Customize Shortcuts
1. Open Keyboard Shortcuts (`Cmd+K Cmd+S`)
2. Search for "Claude"
3. Click on the shortcut to change it

### Settings

| Setting | Default | Description |
|---------|---------|-------------|
| `claude-launcher.singleInstance` | `false` | Focus existing Claude tab instead of opening new one |

## Requirements

- [Claude Code CLI](https://claude.ai/code) must be installed and available in PATH

## Installation

### From VSIX
1. Download the `.vsix` file
2. In VS Code: `Extensions` → `...` → `Install from VSIX...`
3. Select the downloaded file

### From Marketplace
Search for "Claude Code Tabs" in the Extensions view.

## License

MIT
