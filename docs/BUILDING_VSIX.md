# Building VSIX Package

## Overview

This guide explains how to create a `.vsix` file for distributing your MCP VS Code extension within your organization. The VSIX package is a self-contained installer that can be shared with team members without publishing to the VS Code Marketplace.

---

## Prerequisites

Ensure you have:
1. ✅ Node.js 18.x or higher installed
2. ✅ Project dependencies installed (`npm install`)
3. ✅ VS Code Extension Manager (vsce) installed as dev dependency

**Verify your setup:**
```powershell
# Check Node.js version
node --version  # Should show v18.x or higher

# Verify project dependencies
Test-Path .\node_modules\@vscode\vsce

# Verify TypeScript configuration
Test-Path .\tsconfig.json
```

---

## Step 1: Package Configuration

Your [package.json](../mcp-vscode-extension/package.json) must have these required fields:

```json
{
  "name": "mcp-vscode-extension",
  "displayName": "MCP Server Extension",
  "version": "0.0.1",
  "publisher": "chalcp",
  "license": "UNLICENSED",
  "engines": {
    "vscode": "^1.85.0"
  },
  "main": "./dist/extension.js"
}
```

**Critical fields:**
- `publisher` - Identifier for your organization (lowercase, no spaces)
- `engines.vscode` - Minimum VS Code version required
- `main` - Entry point to compiled extension code
- `license` - Use "UNLICENSED" for internal-only extensions
- `version` - Semantic version (increment for each release)

---

## Step 2: Required Assets

Before building, ensure these files exist:

### LICENSE File
A LICENSE file is required by vsce. For internal extensions:

```text
Copyright (c) 2025 chalCP

This software is proprietary and confidential.
Unauthorized copying, distribution, or use is strictly prohibited.
For internal organizational use only.
```

### Icon File (Optional)
Place a 128x128 PNG icon in the extension root and reference it:
```json
"icon": "icon.png"
```

---

## Step 3: Compile the Project

Compile TypeScript source code to JavaScript:

```powershell
cd mcp-vscode-extension
npm run compile
```

**What happens:**
- TypeScript compiler (`tsc`) reads `tsconfig.json`
- Compiles all `.ts` files from `src/` directory
- Outputs JavaScript files to `dist/` directory
- Generates source maps for debugging

**Verify compilation:**
```powershell
Test-Path .\dist\extension.js          # Main entry point
Test-Path .\dist\serverManager.js      # Server manager
Test-Path .\dist\server\mcpServer.js   # MCP server implementation
```

---

## Step 4: Build VSIX Package

Create the distributable VSIX file:

```powershell
npm run package
```

**What happens:**
1. Runs `vscode:prepublish` script (compiles code)
2. Validates `package.json` manifest
3. Checks for required files (LICENSE, README)
4. Bundles extension files and dependencies
5. Creates `.vsix` file in project root

**Expected output:**
```
✓ Packaged: C:\git\chalCP\mcp-vscode-extension\mcp-vscode-extension-0.0.1.vsix
  (1169 files, 1.48 MB)
```

**What's included in the VSIX:**
- `dist/` - Compiled JavaScript and source maps
- `node_modules/@modelcontextprotocol/sdk` - MCP SDK dependency
- `package.json` - Extension manifest
- `LICENSE` - License file
- `README.md` - Documentation
- `icon.png` - Extension icon

**What's excluded:**
- `src/` - TypeScript source files
- `tsconfig.json` - Build configuration
- `.git/` - Version control files
- Build scripts and other development files

---

## Step 5: Install the VSIX

### Option A: Command Line Installation (Recommended)

```powershell
# Navigate to extension directory
cd c:\git\chalCP\mcp-vscode-extension

# Install the extension
code --install-extension mcp-vscode-extension-0.0.1.vsix
```

**Output:**
```
Installing extensions...
Extension 'mcp-vscode-extension-0.0.1.vsix' was successfully installed.
```

### Option B: VS Code UI Installation

1. Open VS Code
2. Press `Ctrl+Shift+X` to open Extensions panel
3. Click "..." menu (top right corner)
4. Select "Install from VSIX..."
5. Navigate to `c:\git\chalCP\mcp-vscode-extension\`
6. Select `mcp-vscode-extension-0.0.1.vsix`
7. Click "Install" and reload VS Code when prompted

### Distributing to Team Members

Share the `.vsix` file via:
- **Network share**: Copy to shared drive
- **Email**: Attach the `.vsix` file
- **Internal repository**: Upload to artifact storage

Team members can install using either method above.

---

## Verification

After installation:

1. **Check Extension is Loaded**
   - Press `Ctrl+Shift+X` (Extensions panel)
   - Search "MCP Server"
   - Should show as installed with version number

2. **Test Commands**
   - Press `Ctrl+Shift+P` (Command Palette)
   - Type "MCP: Start Server"
   - Check Output panel → Select "MCP Server"
   - Should see server initialization logs

3. **Check Status Bar**
   - Look for MCP Server indicator (bottom status bar)
   - Click indicator for quick server controls

---

## Troubleshooting

### Error: "Manifest missing field: engines"

**Cause:** The `engines` field is missing or malformed in package.json.

**Solution:** Add engines specification:
```json
"engines": {
  "vscode": "^1.85.0"
}
```

### Error: "LICENSE, LICENSE.md, or LICENSE.txt not found"

**Cause:** vsce requires a LICENSE file for all packages.

**Solution:** Create a LICENSE file in the extension root:
```powershell
New-Item -Path .\LICENSE -ItemType File
# Add license text for internal use
```

### Error: "The specified icon wasn't found"

**Cause:** Icon path in package.json points to non-existent file.

**Solution:** 
```powershell
# Copy icon to extension directory
Copy-Item "..\resources\icon.png" ".\icon.png"

# Update package.json to use local path
"icon": "icon.png"
```

### Error: "dist folder not found"

**Cause:** TypeScript hasn't been compiled yet.

**Solution:**
```powershell
npm run compile
```

### Warning: "Extension consists of 1169 files"

**Cause:** Large number of files from dependencies included in VSIX.

**Impact:** Larger package size (1.48 MB) but not critical for internal distribution.

**Optional optimization:** Consider bundling with webpack/esbuild to reduce file count.

---

## Automated Build Process

For streamlined builds, use the automated script:

```powershell
.\build\Build-VSIX.ps1
```

This script automatically:
1. Compiles TypeScript code
2. Increments the patch version
3. Creates the VSIX package
4. Reports the output location

See [Build-VSIX.ps1](../build/Build-VSIX.ps1) for details.

---

## Distribution Options

### 1. Share VSIX File Directly (Recommended for Internal Use)
Send the `.vsix` file to users who can install it manually using one of the methods above.

### 2. Network Share Deployment
```powershell
# Copy to shared location
Copy-Item "mcp-vscode-extension-0.0.1.vsix" "\\network\share\extensions\"

# Users can install from share
code --install-extension "\\network\share\extensions\mcp-vscode-extension-0.0.1.vsix"
```

### 3. Internal Package Repository
For larger organizations, consider hosting on internal artifact repositories (e.g., Artifactory, Nexus).

---

## Version Management

### Manual Version Update
```powershell
# Increment patch (0.0.1 → 0.0.2)
npm version patch

# Increment minor (0.0.1 → 0.1.0)
npm version minor

# Increment major (0.0.1 → 1.0.0)
npm version major
```

### Automated Version Update
Use the build script which handles versioning automatically:
```powershell
.\build\Build-VSIX.ps1
```

---

## Quick Reference

### Full Manual Build Process
```powershell
# 1. Navigate to extension directory
cd c:\git\chalCP\mcp-vscode-extension

# 2. Install dependencies (first time only)
npm install

# 3. Compile TypeScript
npm run compile

# 4. Update version (optional)
npm version patch

# 5. Package extension
npm run package

# 6. Install locally for testing
code --install-extension mcp-vscode-extension-0.0.2.vsix
```

### Quick Build (Automated)
```powershell
# From project root
.\build\Build-VSIX.ps1
```

---

## Files Included in VSIX

The `.vsix` package includes:
- `dist/` - Compiled JavaScript and source maps
- `package.json` - Extension manifest
- `LICENSE` - License file
- `README.md` - User documentation
- `icon.png` - Extension icon (128x128)
- `node_modules/@modelcontextprotocol/sdk` - MCP SDK and dependencies

**Excluded** (via `.vscodeignore`):
- `src/` - TypeScript source files
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - Linter configuration
- `.git/`, `.gitignore` - Version control files
- Development scripts and configuration

---

## Best Practices

1. ✅ Always test with F5 (Extension Development Host) before packaging
2. ✅ Update version number for each release
3. ✅ Test installation on clean VS Code instance before distribution
4. ✅ Verify all commands work after installation
5. ✅ Keep README.md updated with installation instructions
6. ✅ Document breaking changes in release notes
7. ✅ Use semantic versioning (MAJOR.MINOR.PATCH)

---

## Additional Resources

- [VS Code Extension Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
- [MCP SDK Documentation](https://modelcontextprotocol.io/)
