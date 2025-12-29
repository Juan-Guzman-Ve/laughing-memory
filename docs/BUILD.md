# Building ChalCP

## Prerequisites

- Node.js 18.x or higher
- PowerShell 7+
- Run `npm install` in `mcp-vscode-extension` folder

## Automated Build (Recommended)

```powershell
cd c:\git\chalCP\build
.\Build-VSIX.ps1
```

**Output:**
- `chalcp-0.1.0.vsix` (1.48 MB) → VS Code extension
- `chalcp-0.1.0.tgz` (16 KB) → Standalone MCP server

Both saved to `../artifacts/`

## Build Options

```powershell
# Build with patch version increment (0.1.0 → 0.1.1)
.\Build-VSIX.ps1

# Build without version change
.\Build-VSIX.ps1 -SkipVersionIncrement

# Minor version (0.1.0 → 0.2.0)
.\Build-VSIX.ps1 -VersionType minor

# Major version (0.1.0 → 1.0.0)
.\Build-VSIX.ps1 -VersionType major
```

## Manual Build

If you need to build manually:

```powershell
cd mcp-vscode-extension

# Compile TypeScript
npm run compile

# Create VSIX
npm run package

# Create npm package
npm run pack
```

## What Gets Built

### VSIX Package (VS Code Extension)
- Size: ~1.48 MB
- Contents: Compiled code + dependencies (1170 files)
- Use: Install in VS Code

### TGZ Package (Standalone Server)
- Size: ~16 KB
- Contents: Compiled code only (24 files)
- Use: Run with any AI client (Claude, Continue.dev, etc.)

## Next Steps

- [Install VSIX Extension](INSTALL_VSIX.md)
- [Install Standalone Server](INSTALL_STANDALONE.md)
