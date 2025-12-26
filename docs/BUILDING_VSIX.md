# Building VSIX Package

## Overview

This guide explains how to create a `.vsix` file for installing and distributing your MCP VS Code extension.

---

## Prerequisites

Ensure you have:
1. ✅ Completed `npm install`
2. ✅ VS Code Extension Manager (vsce) installed globally
3. ✅ Project compiled successfully

**Check your setup:**
```powershell
# Verify vsce is installed
vsce --version

# Verify project is compiled
Test-Path .\dist
```

---

## Step 1: Update Package Information

Before building, update your [package.json](../package.json):

```json
{
  "name": "mcp-vscode-extension",
  "displayName": "MCP Server Extension",
  "version": "0.0.1",
  "publisher": "your-publisher-name",  // ⚠️ Change this
  "description": "Model Context Protocol server as a VS Code extension"
}
```

**Important fields:**
- `publisher` - Your VS Code Marketplace publisher name (required)
- `version` - Semantic version (increment for updates)
- `displayName` - User-friendly extension name

---

## Step 2: Compile the Project

Ensure TypeScript is compiled to JavaScript:

```powershell
npm run compile
```

This creates the `dist/` folder with compiled code.

**Verify compilation:**
- Check that `dist/extension.js` exists
- Check that `dist/server/index.js` exists

---

## Step 3: Build VSIX Package

Run the packaging command:

```powershell
npm run package
```

**Or manually:**
```powershell
vsce package
```

**Output:**
```
mcp-vscode-extension-0.0.1.vsix
```

The `.vsix` file is created in the project root.

---

## Step 4: Install the VSIX

### Option A: Command Line Installation

```powershell
code --install-extension mcp-vscode-extension-0.0.1.vsix
```

### Option B: VS Code UI Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Click "..." menu (top right)
4. Select "Install from VSIX..."
5. Browse to your `.vsix` file
6. Click "Install"

### Option C: Manual Installation

Copy the `.vsix` file to:
- **Windows**: `%USERPROFILE%\.vscode\extensions\`
- **macOS/Linux**: `~/.vscode/extensions/`

Then reload VS Code.

---

## Verification

After installation:

1. **Check Extension is Loaded**
   - Extensions panel → Search "MCP Server"
   - Should show as installed

2. **Test Commands**
   - Press `Ctrl+Shift+P`
   - Type "MCP: Start Server"
   - Check Output panel → "MCP Server"

3. **Check Status Bar**
   - Look for MCP Server indicator (bottom right)

---

## Troubleshooting

### Error: "Missing publisher name"

Update `publisher` field in [package.json](../package.json):
```json
"publisher": "your-name-or-org"
```

### Error: "dist folder not found"

Run compilation first:
```powershell
npm run compile
```

### Error: "vsce not found"

Install vsce globally:
```powershell
npm install -g @vscode/vsce
```

### Warning: README links broken

Add repository URL to [package.json](../package.json):
```json
"repository": {
  "type": "git",
  "url": "https://github.com/your-username/mcp-vscode-extension"
}
```

Or skip warning:
```powershell
vsce package --no-yarn
```

---

## Distribution Options

### 1. Share VSIX File Directly
Send the `.vsix` file to users who can install it manually.

### 2. Publish to VS Code Marketplace
```powershell
# Create publisher account at https://marketplace.visualstudio.com/
vsce publish
```

### 3. Host on GitHub Releases
1. Create a GitHub release
2. Upload `.vsix` as release asset
3. Users download and install

---

## Version Management

### Update Version
```powershell
# Increment patch (0.0.1 → 0.0.2)
npm version patch

# Increment minor (0.0.1 → 0.1.0)
npm version minor

# Increment major (0.0.1 → 1.0.0)
npm version major
```

### Rebuild After Version Update
```powershell
npm run compile
npm run package
```

---

## Quick Reference

**Full build process:**
```powershell
# 1. Install dependencies (if needed)
npm install

# 2. Compile TypeScript
npm run compile

# 3. Package extension
npm run package

# 4. Install locally
code --install-extension mcp-vscode-extension-0.0.1.vsix
```

**One-liner (after initial setup):**
```powershell
npm run compile && npm run package
```

---

## Files Included in VSIX

The `.vsix` package includes:
- `dist/` folder (compiled JavaScript)
- `package.json` (manifest)
- `.vscodeignore` (controls what's excluded)
- Required `node_modules` (only MCP SDK)

**Excluded** (per `.vscodeignore`):
- `src/` folder (TypeScript source)
- `tsconfig.json`
- `.gitignore`
- `node_modules` (except MCP SDK)

---

## Best Practices

1. ✅ Always test with F5 before packaging
2. ✅ Update version number for each release
3. ✅ Keep CHANGELOG.md updated
4. ✅ Test installation on clean VS Code instance
5. ✅ Verify all commands work after installation

---

## Additional Resources

- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce Documentation](https://github.com/microsoft/vscode-vsce)
- [Extension Manifest Reference](https://code.visualstudio.com/api/references/extension-manifest)
