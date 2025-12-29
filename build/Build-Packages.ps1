#Requires -Version 7.0

<#
.SYNOPSIS
    Automated build script for ChalCP dual-purpose package
    
.DESCRIPTION
    This script automates the process of building both VS Code extension and npm packages:
    1. Validates environment and dependencies
    2. Compiles TypeScript source code
    3. Increments the package version (patch)
    4. Creates the VSIX package (for VS Code)
    5. Creates the npm .tgz package (for standalone MCP server)
    6. Reports the output location
    
.PARAMETER VersionType
    Type of version increment: patch, minor, or major (default: patch)
    
.PARAMETER SkipVersionIncrement
    Skip version increment and use current version
    
.PARAMETER CompileOnly
    Only compile TypeScript without creating VSIX
    
.EXAMPLE
    .\Build-VSIX.ps1
    Builds VSIX with automatic patch version increment (0.0.1 → 0.0.2)
    
.EXAMPLE
    .\Build-VSIX.ps1 -VersionType minor
    Builds VSIX with minor version increment (0.0.1 → 0.1.0)
    
.EXAMPLE
    .\Build-VSIX.ps1 -SkipVersionIncrement
    Builds VSIX without changing version number
    
.EXAMPLE
    .\Build-VSIX.ps1 -CompileOnly
    Only compiles TypeScript without creating VSIX package
#>

[CmdletBinding()]
param(
    [Parameter()]
    [ValidateSet('patch', 'minor', 'major')]
    [string]$VersionType = 'patch',
    
    [Parameter()]
    [switch]$SkipVersionIncrement,
    
    [Parameter()]
    [switch]$CompileOnly
)

# Script configuration
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

# Import shared utilities
. "$PSScriptRoot\Utils.ps1"

# Path configuration
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ExtensionDir = Join-Path $ProjectRoot "mcp"
$PackageJsonPath = Join-Path $ExtensionDir "package.json"
$DistPath = Join-Path $ExtensionDir "dist"
$ArtifactsDir = Join-Path $ProjectRoot "artifacts"

#region Helper Functions

function Get-PackageVersion {
    Get-PackageJsonProperty -PackageJsonPath $PackageJsonPath -PropertyName 'version'
}

#endregion

#region Validation

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  ChalCP Build Script" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Step "Validating environment..."

# Create artifacts directory if it doesn't exist
if (-not (Test-Path $ArtifactsDir)) {
    New-Item -Path $ArtifactsDir -ItemType Directory | Out-Null
    Write-Success "Created artifacts directory"
}
else {
    Write-Success "Artifacts directory exists"
}

# Check Node.js
if (-not (Test-Command 'node')) {
    Write-ErrorMsg "Node.js is not installed or not in PATH"
    Write-Host "`nDownload from: https://nodejs.org/`n"
    exit 1
}

$nodeVersion = node --version
Write-Success "Node.js $nodeVersion"

# Check npm
if (-not (Test-Command 'npm')) {
    Write-ErrorMsg "npm is not installed or not in PATH"
    exit 1
}

$npmVersion = npm --version
Write-Success "npm v$npmVersion"

# Check extension directory
if (-not (Test-Path $ExtensionDir)) {
    Write-ErrorMsg "Extension directory not found: $ExtensionDir"
    exit 1
}

Write-Success "Extension directory found"

# Check package.json
if (-not (Test-Path $PackageJsonPath)) {
    Write-ErrorMsg "package.json not found: $PackageJsonPath"
    exit 1
}

Write-Success "package.json found"

# Check node_modules
$NodeModulesPath = Join-Path $ExtensionDir "node_modules"
if (-not (Test-Path $NodeModulesPath)) {
    Write-WarningMsg "node_modules not found, running npm install..."
    Push-Location $ExtensionDir
    try {
        npm install
        Write-Success "Dependencies installed"
    }
    catch {
        Write-ErrorMsg "Failed to install dependencies: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Success "Dependencies installed"
}

$currentVersion = Get-PackageVersion
Write-Success "Current version: $currentVersion"

#endregion

#region Compilation

Write-Step "Compiling TypeScript..."

Push-Location $ExtensionDir
try {
    # Clean dist directory
    if (Test-Path $DistPath) {
        Remove-Item $DistPath -Recurse -Force
        Write-Host "  Cleaned dist/ directory"
    }
    
    # Compile TypeScript
    $compileOutput = npm run compile 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "TypeScript compilation failed"
        Write-Host $compileOutput
        exit 1
    }
    
    # Verify compilation
    $extensionJs = Join-Path $DistPath "extension.js"
    if (-not (Test-Path $extensionJs)) {
        Write-ErrorMsg "Compilation failed: dist/extension.js not found"
        exit 1
    }
    
    Write-Success "TypeScript compiled successfully"
    
    # Count compiled files
    $compiledFiles = (Get-ChildItem $DistPath -Recurse -File).Count
    Write-Host "  Compiled $compiledFiles files to dist/"
}
catch {
    Write-ErrorMsg "Compilation error: $_"
    exit 1
}
finally {
    Pop-Location
}

# Exit if compile-only mode
if ($CompileOnly) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Compilation Complete!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    exit 0
}

#endregion

#region Version Management

if (-not $SkipVersionIncrement) {
    Write-Step "Incrementing version ($VersionType)..."
    
    Push-Location $ExtensionDir
    try {
        $versionOutput = npm version $VersionType --no-git-tag-version 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-ErrorMsg "Version increment failed"
            Write-Host $versionOutput
            exit 1
        }
        
        $newVersion = Get-PackageVersion
        Write-Success "Version updated: $currentVersion → $newVersion"
    }
    catch {
        Write-ErrorMsg "Version update error: $_"
        exit 1
    }
    finally {
        Pop-Location
    }
}
else {
    Write-Step "Skipping version increment (current: $currentVersion)"
}

#endregion

#region VSIX Packaging

Write-Step "Creating VSIX package..."

Push-Location $ExtensionDir
try {
    # Clean old artifacts at the beginning
    if (Test-Path $ArtifactsDir) {
        Get-ChildItem $ArtifactsDir -Filter "chalcp-*.vsix" | Remove-Item -Force -ErrorAction SilentlyContinue
        Get-ChildItem $ArtifactsDir -Filter "chalcp-*.tgz" | Remove-Item -Force -ErrorAction SilentlyContinue
    }
    
    # Create VSIX (will output to ../artifacts due to package.json script)
    $packageOutput = npm run package 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "VSIX packaging failed"
        Write-Host $packageOutput
        exit 1
    }
    
    # Find created VSIX file in artifacts directory
    $vsixFile = Get-ChildItem $ArtifactsDir -Filter "*.vsix" | Select-Object -First 1
    
    if (-not $vsixFile) {
        Write-ErrorMsg "VSIX file not found in artifacts directory"
        exit 1
    }
    
    $vsixSize = [math]::Round($vsixFile.Length / 1MB, 2)
    Write-Success "VSIX package created: $($vsixFile.Name) ($vsixSize MB)"
    Write-InfoMsg "Location: artifacts\"
    
    # Get file count from output (optional, don't fail if not found)
    $packageOutputString = $packageOutput -join "`n"
    if ($packageOutputString -match '(\d+) files') {
        $fileCount = $matches[1]
        Write-InfoMsg "Package contains $fileCount files"
    }
}
catch {
    Write-ErrorMsg "Packaging error: $_"
    Write-Host "Error details: $($_.Exception.Message)"
    Write-Host "Stack trace: $($_.ScriptStackTrace)"
    exit 1
}
finally {
    Pop-Location
}

#endregion

#region NPM Package

Write-Step "Creating npm package..."

Push-Location $ExtensionDir
try {
    # Create npm package (will output to ../artifacts due to package.json script)
    $packOutput = npm run pack 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-ErrorMsg "npm pack failed"
        Write-Host $packOutput
        exit 1
    }
    
    # Find created .tgz file in artifacts directory
    $tgzFile = Get-ChildItem $ArtifactsDir -Filter "*.tgz" | Select-Object -First 1
    
    if (-not $tgzFile) {
        Write-ErrorMsg ".tgz file not found in artifacts directory"
        exit 1
    }
    
    $tgzSize = [math]::Round($tgzFile.Length / 1KB, 2)
    Write-Success "npm package created: $($tgzFile.Name) ($tgzSize KB)"
}
catch {
    Write-ErrorMsg "npm pack error: $_"
    exit 1
}
finally {
    Pop-Location
}

#endregion

#region Summary

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$finalVersion = Get-PackageVersion
Write-Host "Package Version:    " -NoNewline
Write-Host $finalVersion -ForegroundColor Green

Write-Host "`nVS Code Extension:" -ForegroundColor Cyan
Write-Host "  File:    " -NoNewline
Write-Host $vsixFile.Name -ForegroundColor Green
Write-Host "  Size:    " -NoNewline
Write-Host "$vsixSize MB" -ForegroundColor Green
Write-Host "  Install: " -NoNewline
Write-Host "code --install-extension `"$($vsixFile.FullName)`"" -ForegroundColor Gray

Write-Host "`nStandalone MCP Server:" -ForegroundColor Cyan
Write-Host "  File:    " -NoNewline
Write-Host $tgzFile.Name -ForegroundColor Green
Write-Host "  Size:    " -NoNewline
Write-Host "$tgzSize KB" -ForegroundColor Green
Write-Host "  Extract: " -NoNewline
Write-Host "tar -xzf `"$($tgzFile.FullName)`"" -ForegroundColor Gray

Write-Host "`nArtifacts Location: " -NoNewline
Write-Host $ArtifactsDir -ForegroundColor Yellow

Write-Host "`n"

#endregion
