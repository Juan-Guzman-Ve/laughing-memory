#Requires -Version 7.0

<#
.SYNOPSIS
    Shared utility functions for MCP Extension build scripts
    
.DESCRIPTION
    This module provides common functions used across build scripts:
    - Output formatting (colored messages, headers)
    - Command validation
    - Path resolution
    
.NOTES
    To use in a script: . "$PSScriptRoot\Utils.ps1"
#>

#region Output Formatting

# Color configuration
$Script:Colors = @{
    Info    = 'Cyan'
    Success = 'Green'
    Warning = 'Yellow'
    Error   = 'Red'
    Gray    = 'Gray'
}

function Write-Header {
    <#
    .SYNOPSIS
        Displays a formatted header with separator lines.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Text,
        
        [int]$Width = 70
    )
    
    Write-Host "`n$('=' * $Width)" -ForegroundColor $Script:Colors.Info
    Write-Host " $Text" -ForegroundColor $Script:Colors.Info
    Write-Host "$('=' * $Width)" -ForegroundColor $Script:Colors.Info
}

function Write-Step {
    <#
    .SYNOPSIS
        Displays a build step message with timestamp.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    Write-Host "`n[$([DateTime]::Now.ToString('HH:mm:ss'))] " -NoNewline -ForegroundColor $Script:Colors.Gray
    Write-Host $Message -ForegroundColor $Script:Colors.Info
}

function Write-Success {
    <#
    .SYNOPSIS
        Displays a success message with checkmark.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    Write-Host "  ✓ " -NoNewline -ForegroundColor $Script:Colors.Success
    Write-Host $Message -ForegroundColor $Script:Colors.Success
}

function Write-ErrorMsg {
    <#
    .SYNOPSIS
        Displays an error message with X symbol.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    Write-Host "  ✗ " -NoNewline -ForegroundColor $Script:Colors.Error
    Write-Host $Message -ForegroundColor $Script:Colors.Error
}

function Write-WarningMsg {
    <#
    .SYNOPSIS
        Displays a warning message with warning symbol.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    Write-Host "  ⚠ " -NoNewline -ForegroundColor $Script:Colors.Warning
    Write-Host $Message -ForegroundColor $Script:Colors.Warning
}

function Write-InfoMsg {
    <#
    .SYNOPSIS
        Displays an informational message with indentation.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Message
    )
    
    Write-Host "  $Message" -ForegroundColor $Script:Colors.Gray
}

function Write-CheckResult {
    <#
    .SYNOPSIS
        Displays a check result with status indicator.
        Used by Check-Requirements.ps1 for validation output.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Check,
        
        [Parameter(Mandatory)]
        [ValidateSet('Pass', 'Fail', 'Warning')]
        [string]$Status,
        
        [string]$Message
    )
    
    $statusSymbol = switch ($Status) {
        'Pass'    { '[✓]'; $color = $Script:Colors.Success }
        'Fail'    { '[✗]'; $color = $Script:Colors.Error }
        'Warning' { '[!]'; $color = $Script:Colors.Warning }
    }
    
    Write-Host "$statusSymbol " -ForegroundColor $color -NoNewline
    Write-Host "$Check" -NoNewline
    
    if ($Message) {
        Write-Host " - $Message" -ForegroundColor $Script:Colors.Gray
    }
    else {
        Write-Host ""
    }
}

#endregion

#region Command Validation

function Test-Command {
    <#
    .SYNOPSIS
        Tests if a command exists and is available in PATH.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$CommandName
    )
    
    $null -ne (Get-Command $CommandName -ErrorAction SilentlyContinue)
}

function Get-CommandVersion {
    <#
    .SYNOPSIS
        Gets the version of a command if available.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$CommandName,
        
        [string]$VersionArgument = '--version'
    )
    
    try {
        $output = & $CommandName $VersionArgument 2>&1
        if ($LASTEXITCODE -eq 0 -or $null -eq $LASTEXITCODE) {
            return $output
        }
        return $null
    }
    catch {
        return $null
    }
}

#endregion

#region Path Utilities

function Get-ProjectRoot {
    <#
    .SYNOPSIS
        Resolves the project root directory from script location.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$ScriptRoot
    )
    
    # Check if script is in build folder
    $parentPath = Split-Path -Parent $ScriptRoot
    
    # Look for mcp folder
    $extensionPath = Join-Path $parentPath "mcp"
    if (Test-Path $extensionPath) {
        return $parentPath
    }
    
    # Check if we're already in extension folder
    $packageJson = Join-Path $ScriptRoot "package.json"
    if (Test-Path $packageJson) {
        return $ScriptRoot
    }
    
    # Default to parent of script location
    return $parentPath
}

function Get-ExtensionDirectory {
    <#
    .SYNOPSIS
        Gets the extension directory path.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$ProjectRoot
    )
    
    $extensionPath = Join-Path $ProjectRoot "mcp"
    
    if (Test-Path $extensionPath) {
        return $extensionPath
    }
    
    # Maybe we're already in the extension directory
    $packageJson = Join-Path $ProjectRoot "package.json"
    if (Test-Path $packageJson) {
        return $ProjectRoot
    }
    
    throw "Extension directory not found"
}

#endregion

#region JSON Utilities

function Get-PackageJsonProperty {
    <#
    .SYNOPSIS
        Reads a property from package.json file.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$PackageJsonPath,
        
        [Parameter(Mandatory)]
        [string]$PropertyName
    )
    
    if (-not (Test-Path $PackageJsonPath)) {
        throw "package.json not found at: $PackageJsonPath"
    }
    
    try {
        $packageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
        return $packageJson.$PropertyName
    }
    catch {
        throw "Failed to read property '$PropertyName' from package.json: $_"
    }
}

function Set-PackageJsonProperty {
    <#
    .SYNOPSIS
        Updates a property in package.json file.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$PackageJsonPath,
        
        [Parameter(Mandatory)]
        [string]$PropertyName,
        
        [Parameter(Mandatory)]
        $PropertyValue
    )
    
    if (-not (Test-Path $PackageJsonPath)) {
        throw "package.json not found at: $PackageJsonPath"
    }
    
    try {
        $packageJson = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
        $packageJson.$PropertyName = $PropertyValue
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath
    }
    catch {
        throw "Failed to update property '$PropertyName' in package.json: $_"
    }
}

#endregion
