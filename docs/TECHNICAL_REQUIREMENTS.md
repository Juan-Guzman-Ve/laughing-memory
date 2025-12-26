# MCP VS Code Extension - Technical Requirements

## Overview

This document outlines the technical requirements and setup instructions for developing and deploying the MCP (Model Context Protocol) VS Code extension. The extension runs an MCP server within VS Code, enabling AI-powered tooling and workspace interaction.

---

## System Requirements

### Development Machine

#### Required Software

1. **Node.js (v18.x or higher)**
   - Download: https://nodejs.org/
   - Verify installation:
     ```powershell
     node --version  # Should show v18.0.0 or higher
     npm --version   # Should show v9.0.0 or higher
     ```

2. **Visual Studio Code (v1.85.0 or higher)**
   - Download: https://code.visualstudio.com/
   - Verify version: Help → About
   - Required for extension development and testing

3. **Git (for version control)**
   - Download: https://git-scm.com/
   - Verify: `git --version`

#### Optional but Recommended

- **PowerShell 7+** for running build scripts
- **Windows Terminal** for better development experience

### Target User Machine

For users installing the extension:
- Visual Studio Code v1.85.0 or higher
- No Node.js required (bundled in VSIX)

---

## Project Dependencies

### Runtime Dependencies

Located in `package.json` dependencies:

```json
"dependencies": {
  "@modelcontextprotocol/sdk": "^1.25.1"
}
```

**@modelcontextprotocol/sdk**
- Purpose: Core MCP protocol implementation
- Provides: Server, client, transport, and tool interfaces
- Size: ~1 MB (included in VSIX)

### Development Dependencies

Located in `package.json` devDependencies:
### Development Dependencies

Located in `package.json` devDependencies:

```json
"devDependencies": {
  "@types/node": "^20.x",
  "@types/vscode": "^1.85.0",
  "@typescript-eslint/eslint-plugin": "^6.13.0",
  "@typescript-eslint/parser": "^6.13.0",
  "@vscode/vsce": "^2.22.0",
  "eslint": "^8.54.0",
  "typescript": "^5.3.0"
}
```

**Key dependencies:**
- **typescript** (v5.3.0): Compiles TypeScript to JavaScript
- **@types/vscode** (v1.85.0): VS Code API type definitions
- **@vscode/vsce** (v2.22.0): Extension packaging tool
- **eslint**: Code linting and quality checks
- **@types/node**: Node.js type definitions

---

## Installation Process

### Step 1: Clone Repository (if applicable)

```powershell
cd c:\git
git clone <repository-url> chalCP
cd chalCP\mcp-vscode-extension
```

### Step 2: Install Dependencies

```powershell
# Navigate to extension directory
cd c:\git\chalCP\mcp-vscode-extension

# Install all dependencies
npm install
```

**What this does:**
- Downloads and installs all packages from `package.json`
- Creates `node_modules/` directory
- Generates `package-lock.json` for dependency locking
- Installs dev tools (TypeScript, ESLint, vsce)

**Expected output:**
```
added 280 packages, and audited 281 packages in 15s
```

### Step 3: Verify Installation

```powershell
# Check TypeScript compiler
npx tsc --version  # Should show: Version 5.3.0

# Check project structure
Test-Path .\src\extension.ts       # Should be True
Test-Path .\tsconfig.json          # Should be True
Test-Path .\node_modules           # Should be True
```

---

## Build Configuration

### TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2020",
    "outDir": "dist",
    "lib": ["ES2020"],
    "sourceMap": true,
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Key settings:**
- `outDir: "dist"` - Compiled JavaScript goes to dist/ folder
- `rootDir: "src"` - Source TypeScript files in src/ folder
- `sourceMap: true` - Generates .map files for debugging
- `strict: true` - Enables all strict type checking

### Package.json Scripts

```json
"scripts": {
  "vscode:prepublish": "npm run compile",
  "compile": "tsc -p ./",
  "watch": "tsc -watch -p ./",
  "package": "vsce package"
}
```

**Available commands:**
- `npm run compile` - Compile TypeScript once
- `npm run watch` - Compile and watch for changes
- `npm run package` - Create VSIX file
- `npm run lint` - Run ESLint checks

---

## Development Workflow

### Step 1: Make Code Changes

Edit TypeScript files in `src/` directory:
- [src/extension.ts](../mcp-vscode-extension/src/extension.ts) - Extension entry point
- [src/serverManager.ts](../mcp-vscode-extension/src/serverManager.ts) - Server lifecycle management
- [src/server/mcpServer.ts](../mcp-vscode-extension/src/server/mcpServer.ts) - MCP protocol implementation

### Step 2: Compile Changes

```powershell
npm run compile
```

**Or use watch mode for automatic compilation:**
```powershell
npm run watch
```

### Step 3: Test in Extension Development Host

1. Open project in VS Code: `code c:\git\chalCP\mcp-vscode-extension`
2. Press **F5** to launch Extension Development Host
3. A new VS Code window opens with the extension loaded
4. Test commands using **Ctrl+Shift+P**:
   - "MCP: Start Server"
   - "MCP: Stop Server"
   - "MCP: Restart Server"
5. View logs in Output panel → "MCP Server"

### Step 4: Debug

- Set breakpoints in TypeScript files
- Use Debug Console in main VS Code window
- Check Extension Host logs: Help → Toggle Developer Tools

---

---

## Project Structure

```
c:\git\chalCP\
├── mcp-vscode-extension/          # Extension source code
│   ├── src/
│   │   ├── extension.ts           # Extension activation and commands
│   │   ├── serverManager.ts       # MCP server lifecycle manager
│   │   └── server/
│   │       ├── index.ts           # Server entry point
│   │       └── mcpServer.ts       # MCP protocol implementation
│   ├── dist/                      # Compiled JavaScript (generated)
│   │   ├── extension.js
│   │   ├── serverManager.js
│   │   └── server/
│   │       ├── index.js
│   │       └── mcpServer.js
│   ├── node_modules/              # Dependencies (generated)
│   ├── package.json               # Extension manifest
│   ├── tsconfig.json              # TypeScript configuration
│   ├── LICENSE                    # License file
│   ├── README.md                  # User documentation
│   └── icon.png                   # Extension icon (128x128)
├── build/                         # Build scripts
│   ├── Build-VSIX.ps1             # Automated build script
│   ├── Check-Requirements.ps1     # Requirements validation
│   └── GitSetup.ps1               # Git configuration
├── docs/                          # Documentation
│   ├── BUILDING_VSIX.md           # Build instructions
│   └── TECHNICAL_REQUIREMENTS.md  # This file
└── resources/                     # Shared resources
    └── icon.png                   # Source icon file
```

### Key Files Explained

#### Extension Files

**[extension.ts](../mcp-vscode-extension/src/extension.ts)**
- Entry point for VS Code extension
- Handles activation and deactivation
- Registers commands and UI elements
- Creates output channel for logging

**[serverManager.ts](../mcp-vscode-extension/src/serverManager.ts)**
- Manages MCP server lifecycle
- Spawns Node.js child process
- Handles server start/stop/restart
- Monitors server health

**[mcpServer.ts](../mcp-vscode-extension/src/server/mcpServer.ts)**
- Implements MCP protocol server
- Defines available tools and resources
- Handles client requests
- Interfaces with VS Code API

#### Configuration Files

**[package.json](../mcp-vscode-extension/package.json)**
- Extension manifest (required by VS Code)
- Defines commands, settings, activation events
- Lists dependencies
- Specifies extension metadata

**[tsconfig.json](../mcp-vscode-extension/tsconfig.json)**
- TypeScript compiler configuration
- Defines output directory and module system
- Sets strict type checking rules

---

## Building for Distribution

### Manual Build Process

```powershell
# 1. Navigate to extension directory
cd c:\git\chalCP\mcp-vscode-extension

# 2. Ensure dependencies are installed
npm install

# 3. Compile TypeScript to JavaScript
npm run compile

# 4. Create VSIX package
npm run package
```

**Output:**
```
mcp-vscode-extension-0.0.1.vsix (1.48 MB)
```

### Automated Build Process

Use the provided PowerShell script:

```powershell
cd c:\git\chalCP
.\build\Build-VSIX.ps1
```

**What it does:**
1. Validates environment
2. Compiles TypeScript
3. Increments version number
4. Creates VSIX package
5. Reports success with file location

---

## Extension Requirements

### VS Code API Requirements

```json
"engines": {
  "vscode": "^1.85.0"
}
```

The extension requires VS Code 1.85.0 or higher.

### Extension Manifest

Required fields in [package.json](../mcp-vscode-extension/package.json):

```json
{
  "name": "mcp-vscode-extension",
  "displayName": "MCP Server Extension",
  "description": "Model Context Protocol server as a VS Code extension",
  "version": "0.0.1",
  "publisher": "chalcp",
  "license": "UNLICENSED",
  "icon": "icon.png",
  "engines": {
    "vscode": "^1.85.0"
  },
  "main": "./dist/extension.js",
  "activationEvents": ["onStartupFinished"]
}
```

### Extension Activation

**Activation event:** `onStartupFinished`
- Extension activates when VS Code finishes loading
- Allows auto-start of MCP server if configured
- Minimal impact on VS Code startup time

---

## Deployment Options

### Option 1: Direct VSIX Installation (Recommended for Internal Use)

Share the `.vsix` file with team members:

```powershell
# Users install via command line
code --install-extension mcp-vscode-extension-0.0.1.vsix

# Or via VS Code UI
# Extensions → ... → Install from VSIX
```

### Option 2: Network Share Deployment

```powershell
# Copy to shared location
Copy-Item "mcp-vscode-extension-0.0.1.vsix" "\\network\extensions\"

# Users install from network
code --install-extension "\\network\extensions\mcp-vscode-extension-0.0.1.vsix"
```

### Option 3: Internal Package Repository

For enterprise environments:
- Upload to Artifactory, Nexus, or similar
- Provide download link in documentation
- Users download and install locally

---

## Configuration Settings

### Available Settings

Users can configure the extension via VS Code settings:

```json
{
  "mcpServer.autoStart": true,
  "mcpServer.port": 3000,
  "mcpServer.logLevel": "info"
}
```

**Settings details:**
- `mcpServer.autoStart` (boolean) - Auto-start server on VS Code launch
- `mcpServer.port` (number) - Port for server communication
- `mcpServer.logLevel` (string) - Logging verbosity: debug, info, warn, error

### Accessing Settings

**Via UI:**
1. File → Preferences → Settings
2. Search "MCP Server"
3. Modify settings

**Via settings.json:**
```powershell
# Open settings file
code $env:APPDATA\Code\User\settings.json
```

---

## Available Commands

The extension provides these commands (accessed via Ctrl+Shift+P):

| Command | Command ID | Description |
|---------|-----------|-------------|
| MCP: Start Server | `mcp-extension.start` | Start the MCP server |
| MCP: Stop Server | `mcp-extension.stop` | Stop the MCP server |
| MCP: Restart Server | `mcp-extension.restart` | Restart the MCP server |

---

## Troubleshooting

### Common Issues

**Issue: Extension doesn't activate**
- Check VS Code version (must be 1.85.0+)
- Verify extension is enabled: Extensions → MCP Server Extension
- Check Developer Tools: Help → Toggle Developer Tools

**Issue: Server won't start**
- Check Output panel: View → Output → "MCP Server"
- Verify Node.js is available (though bundled in extension)
- Check port 3000 is not in use

**Issue: Commands not appearing**
- Reload window: Ctrl+Shift+P → "Reload Window"
- Reinstall extension
- Check extension manifest: package.json contains commands

**Issue: Compilation errors**
```powershell
# Clean rebuild
Remove-Item -Recurse -Force dist, node_modules
npm install
npm run compile
```

---

## Performance Considerations

### Extension Size
- VSIX package: ~1.48 MB
- Includes MCP SDK and dependencies
- Reasonable for internal distribution

### Memory Usage
- Extension host: ~50-100 MB
- MCP server process: ~30-50 MB
- Total: ~80-150 MB (negligible on modern systems)

### Startup Impact
- Activation: onStartupFinished (minimal impact)
- Auto-start setting: adds 1-2 seconds if enabled
- Can be disabled for faster startup

---

## Automated Build Script

### Build-VSIX.ps1

Located at [build/Build-VSIX.ps1](../build/Build-VSIX.ps1), this PowerShell script automates the entire build process.

**Usage:**

```powershell
# Standard build (increments patch version)
.\build\Build-VSIX.ps1

# Increment minor version (0.0.1 → 0.1.0)
.\build\Build-VSIX.ps1 -VersionType minor

# Increment major version (0.0.1 → 1.0.0)
.\build\Build-VSIX.ps1 -VersionType major

# Build without version increment
.\build\Build-VSIX.ps1 -SkipVersionIncrement

# Compile only (no VSIX)
.\build\Build-VSIX.ps1 -CompileOnly
```

**What the script does:**

1. **Validates environment**
   - Checks Node.js and npm installation
   - Verifies extension directory structure
   - Ensures dependencies are installed

2. **Compiles TypeScript**
   - Cleans dist/ directory
   - Runs TypeScript compiler
   - Verifies compilation success

3. **Updates version** (optional)
   - Increments version in package.json
   - Uses semantic versioning
   - No git tagging (internal use)

4. **Creates VSIX package**
   - Removes old VSIX files
   - Runs vsce package command
   - Validates package creation

5. **Provides summary**
   - Reports version number
   - Shows VSIX file location and size
   - Displays installation command

**Output example:**

```
========================================
  MCP Extension VSIX Build Script
========================================

[10:30:15] Validating environment...
  ✓ Node.js v20.10.0
  ✓ npm v10.2.3
  ✓ Extension directory found
  ✓ package.json found
  ✓ Dependencies installed
  ✓ Current version: 0.0.1

[10:30:16] Compiling TypeScript...
  Cleaned dist/ directory
  ✓ TypeScript compiled successfully
  Compiled 8 files to dist/

[10:30:17] Incrementing version (patch)...
  ✓ Version updated: 0.0.1 → 0.0.2

[10:30:18] Creating VSIX package...
  ✓ VSIX package created: mcp-vscode-extension-0.0.2.vsix (1.48 MB)
  Package contains 1169 files

========================================
  Build Complete!
========================================

Extension Version: 0.0.2
VSIX Location:     C:\git\chalCP\mcp-vscode-extension\mcp-vscode-extension-0.0.2.vsix
VSIX Size:         1.48 MB

Installation Command:
  code --install-extension "C:\git\chalCP\mcp-vscode-extension\mcp-vscode-extension-0.0.2.vsix"
```

---

## Version Control Considerations

### Git Integration

The build script uses `--no-git-tag-version` when updating versions:
- Version changes update package.json only
- No automatic git commits or tags
- Allows manual review before committing

**Recommended workflow:**

```powershell
# 1. Build with version increment
.\build\Build-VSIX.ps1

# 2. Review changes
git diff package.json

# 3. Commit if satisfied
git add mcp-vscode-extension/package.json
git commit -m "Release v0.0.2"

# 4. Tag release (optional)
git tag v0.0.2
```

---

## Additional Resources

### Documentation
- [Building VSIX Guide](BUILDING_VSIX.md) - Detailed build instructions
- [Extension README](../mcp-vscode-extension/README.md) - User documentation

### External Resources
- [VS Code Extension API](https://code.visualstudio.com/api) - Official API documentation
- [TypeScript Handbook](https://www.typescriptlang.org/docs/) - TypeScript reference
- [MCP SDK Documentation](https://modelcontextprotocol.io/) - Model Context Protocol
- [vsce Documentation](https://github.com/microsoft/vscode-vsce) - Extension packaging tool

### Support
For internal support:
- Check Output panel logs (View → Output → "MCP Server")
- Review build script output for errors
- Verify all requirements are met
- Contact development team for assistance

---

## Quick Reference Card

### Essential Commands

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Compile TypeScript | `npm run compile` |
| Watch mode | `npm run watch` |
| Create VSIX | `npm run package` |
| Automated build | `.\build\Build-VSIX.ps1` |

### File Locations

| Item | Path |
|------|------|
| Extension source | `c:\git\chalCP\mcp-vscode-extension\src\` |
| Compiled output | `c:\git\chalCP\mcp-vscode-extension\dist\` |
| Package manifest | `c:\git\chalCP\mcp-vscode-extension\package.json` |
| Build script | `c:\git\chalCP\build\Build-VSIX.ps1` |
| VSIX output | `c:\git\chalCP\mcp-vscode-extension\*.vsix` |

### VS Code Commands

| Command | Shortcut | Purpose |
|---------|----------|---------|
| Command Palette | `Ctrl+Shift+P` | Run extension commands |
| Extensions | `Ctrl+Shift+X` | Manage extensions |
| Output Panel | `Ctrl+Shift+U` | View logs |
| Debug Extension | `F5` | Test in dev host |

---

*Last Updated: December 26, 2025*
