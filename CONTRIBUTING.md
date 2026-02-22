# Contributing

Thanks for your interest in contributing to Claude Code Tabs!

## How to Contribute

1. **Fork** the repository
2. **Create a branch** for your change (`git checkout -b feat/my-feature`)
3. **Make your changes** — the entire extension is in `extension.js`
4. **Test** by pressing `F5` in VS Code to launch the Extension Development Host
5. **Submit a Pull Request** with a clear description of what you changed and why

## Reporting Bugs

Open an [issue](https://github.com/johrld/claude-code-tabs/issues) with:

- What you expected to happen
- What actually happened
- VS Code / Cursor version
- OS

## Development Setup

```bash
git clone https://github.com/johrld/claude-code-tabs.git
cd claude-code-tabs
code .
```

Press `F5` to run the extension in a new VS Code window. No build step needed — it's plain JavaScript.

## Code Style

- Keep it simple. The whole extension is a single file.
- No dependencies beyond the VS Code API.
- Test your changes with both VS Code and Cursor if possible.
