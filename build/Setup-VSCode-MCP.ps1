#Requires -Version 7.0

<#
.SYNOPSIS
    Configures ChalCP MCP server in VS Code settings
    
.DESCRIPTION
    Automatically adds the ChalCP MCP server configuration to VS Code user settings.
    Detects global installation or uses npm global modules path.
    
.EXAMPLE
    .\Setup-VSCode-MCP.ps1
    Configures the ChalCP MCP server in VS Code
#>

$ErrorActionPreference = 'Stop'

# Import shared utilities
. "$PSScriptRoot\Utils.ps1"

#region Functions

function Get-VSCodeSettingsPath {
    <#
    .SYNOPSIS
        Gets the path to VS Code user settings file
    #>
    return "$env:APPDATA\Code\User\settings.json"
}

function Initialize-SettingsFile {
    <#
    .SYNOPSIS
        Creates VS Code settings file if it doesn't exist
    #>
    param([string]$Path)
    
    if (Test-Path $Path) {
        Write-Success "Found settings file"
        return
    }
    
    Write-WarningMsg "Settings file not found, creating new one..."
    
    $userDir = Split-Path $Path -Parent
    if (-not (Test-Path $userDir)) {
        New-Item -Path $userDir -ItemType Directory -Force | Out-Null
    }
    
    '{}' | Set-Content $Path -Encoding UTF8
    Write-Success "Created new settings file"
}

function Get-MCPServerConfig {
    <#
    .SYNOPSIS
        Determines the MCP server configuration to use
    #>
    
    # First, try global command
    $globalCommand = Get-Command "chalcp-mcp" -ErrorAction SilentlyContinue
    if ($globalCommand) {
        Write-Success "Using global command: chalcp-mcp"
        return @{ command = "chalcp-mcp" }
    }
    
    Write-WarningMsg "Global command not found, searching npm modules..."
    
    # Try to find in npm global modules
    try {
        $npmRoot = npm root -g 2>$null
        if (-not $npmRoot) {
            throw "Could not get npm global root"
        }
        
        $serverPath = Join-Path $npmRoot "chalcp\dist\server\index.js"
        if (-not (Test-Path $serverPath)) {
            throw "Server file not found at: $serverPath"
        }
        
        Write-Success "Found server at: $serverPath"
        return @{
            command = "node"
            args = @($serverPath)
        }
    }
    catch {
        Write-ErrorMsg "Could not locate chalcp installation"
        Write-Host "`nPlease install first: npm install -g chalcp" -ForegroundColor Yellow
        exit 1
    }
}

function Read-VSCodeSettings {
    <#
    .SYNOPSIS
        Reads and parses VS Code settings file
    #>
    param([string]$Path)
    
    $settingsJson = Get-Content $Path -Raw -Encoding UTF8
    
    if ([string]::IsNullOrWhiteSpace($settingsJson)) {
        return @{}
    }
    
    try {
        return $settingsJson | ConvertFrom-Json -AsHashtable
    }
    catch {
        Write-ErrorMsg "Invalid JSON in settings file"
        Write-Host "Creating backup..." -ForegroundColor Yellow
        Copy-Item $Path "$Path.backup" -Force
        Write-Success "Backup created, starting fresh"
        return @{}
    }
}

function Add-MCPServerToSettings {
    <#
    .SYNOPSIS
        Adds or updates MCP server configuration in settings
    #>
    param(
        [hashtable]$Settings,
        [hashtable]$ServerConfig
    )
    
    if (-not $Settings.ContainsKey("mcp.servers")) {
        $Settings["mcp.servers"] = @{}
    }
    
    # Convert PSCustomObject to hashtable if needed
    if ($Settings["mcp.servers"] -is [PSCustomObject]) {
        $mcpServers = @{}
        $Settings["mcp.servers"].PSObject.Properties | ForEach-Object {
            $mcpServers[$_.Name] = $_.Value
        }
        $Settings["mcp.servers"] = $mcpServers
    }
    
    if ($Settings["mcp.servers"].ContainsKey("chalcp")) {
        Write-WarningMsg "Updating existing configuration..."
    }
    
    $Settings["mcp.servers"]["chalcp"] = $ServerConfig
    
    return $Settings
}

function Save-VSCodeSettings {
    <#
    .SYNOPSIS
        Saves settings back to file
    #>
    param(
        [string]$Path,
        [hashtable]$Settings
    )
    
    try {
        $Settings | ConvertTo-Json -Depth 10 | Set-Content $Path -Encoding UTF8
        Write-Success "Settings saved successfully"
    }
    catch {
        Write-ErrorMsg "Failed to save settings: $_"
        exit 1
    }
}

function Test-MCPConfiguration {
    <#
    .SYNOPSIS
        Verifies the MCP configuration was added correctly
    #>
    param([string]$Path)
    
    try {
        $settings = Get-Content $Path -Raw | ConvertFrom-Json
        $chalcpConfig = $settings.'mcp.servers'.chalcp
        
        if (-not $chalcpConfig) {
            Write-ErrorMsg "Verification failed - configuration not found"
            return $false
        }
        
        Write-Success "Configuration verified"
        Write-Host "`nMCP Server Configuration:" -ForegroundColor Cyan
        Write-Host "  Name:    chalcp" -ForegroundColor Gray
        Write-Host "  Command: $($chalcpConfig.command)" -ForegroundColor Gray
        if ($chalcpConfig.args) {
            Write-Host "  Args:    $($chalcpConfig.args -join ' ')" -ForegroundColor Gray
        }
        
        return $true
    }
    catch {
        Write-WarningMsg "Could not verify configuration"
        return $false
    }
}

function Show-CompletionMessage {
    <#
    .SYNOPSIS
        Displays setup completion message and next steps
    #>
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  Setup Complete!" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Reload VS Code:" -ForegroundColor Gray
    Write-Host "     Ctrl+Shift+P → 'Developer: Reload Window'" -ForegroundColor Gray
    Write-Host "`n  2. Verify MCP server is running:" -ForegroundColor Gray
    Write-Host "     View → Output → Select 'MCP' from dropdown" -ForegroundColor Gray
    Write-Host "`n  3. Test in AI chat:" -ForegroundColor Gray
    Write-Host "     Ask: 'Calculate 10 + 5'" -ForegroundColor Gray
    Write-Host "`n"
}

#endregion

#region Main Execution

Write-Header "ChalCP VS Code MCP Setup"

# Get settings file path
Write-Step "Locating VS Code settings..."
$settingsPath = Get-VSCodeSettingsPath

# Ensure settings file exists
Initialize-SettingsFile -Path $settingsPath

# Determine server configuration
Write-Step "Determining server configuration..."
$serverConfig = Get-MCPServerConfig

# Read current settings
Write-Step "Reading current settings..."
$settings = Read-VSCodeSettings -Path $settingsPath

# Add MCP server configuration
Write-Step "Adding MCP server configuration..."
$settings = Add-MCPServerToSettings -Settings $settings -ServerConfig $serverConfig

# Save updated settings
Write-Step "Saving settings..."
Save-VSCodeSettings -Path $settingsPath -Settings $settings

# Verify configuration
Write-Step "Verifying configuration..."
Test-MCPConfiguration -Path $settingsPath | Out-Null

# Show completion message
Show-CompletionMessage

#endregion
