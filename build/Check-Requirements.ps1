
[CmdletBinding()]
param()

# Import shared utilities
. "$PSScriptRoot\Utils.ps1"

# Determine project root directory
$Script:ProjectRoot = if (Test-Path (Join-Path $PSScriptRoot "package.json")) {
    # Script is in root folder
    $PSScriptRoot
} elseif (Test-Path (Join-Path $PSScriptRoot "..\mcp-vscode-extension\package.json")) {
    # Script is in build subfolder
    Join-Path $PSScriptRoot "..\mcp-vscode-extension"
} else {
    # Default to current location
    $PSScriptRoot
}

# Script configuration
$Script:Config = @{
    NodeMinVersion = [version]"18.0.0"
    VSCodeMinVersion = [version]"1.85.0"
    RequiredTools = @('node', 'npm', 'code', 'vsce')
}

# Result tracking
$Script:Results = @{
    Passed = @()
    Failed = @()
    Warnings = @()
}

#region Helper Functions

function Add-Result {
    <#
    .SYNOPSIS
        Adds a check result to the tracking collection.
    #>
    param(
        [Parameter(Mandatory)]
        [string]$Check,
        
        [Parameter(Mandatory)]
        [ValidateSet('Passed', 'Failed', 'Warnings')]
        [string]$Category,
        
        [string]$Details
    )
    
    $Script:Results[$Category] += @{
        Check = $Check
        Details = $Details
    }
}

#endregion

#region Validation Functions

function Test-NodeJsInstallation {
    <#
    .SYNOPSIS
        Validates Node.js installation and version.
    #>
    [CmdletBinding()]
    param()
    
    $checkName = "Node.js Installation"
    
    try {
        $nodeVersion = node --version 2>$null
        
        if (-not $nodeVersion) {
            Write-CheckResult -Check $checkName -Status 'Fail' -Message "Not found"
            Add-Result -Check $checkName -Category 'Failed' -Details "Node.js is not installed or not in PATH"
            return $false
        }
        
        # Parse version (remove 'v' prefix)
        $versionString = $nodeVersion.TrimStart('v')
        $installedVersion = [version]$versionString
        
        if ($installedVersion -ge $Script:Config.NodeMinVersion) {
            Write-CheckResult -Check $checkName -Status 'Pass' -Message "v$versionString"
            Add-Result -Check $checkName -Category 'Passed' -Details "Version $versionString meets requirement (>= $($Script:Config.NodeMinVersion))"
            return $true
        } else {
            Write-CheckResult -Check $checkName -Status 'Fail' -Message "v$versionString (requires >= $($Script:Config.NodeMinVersion))"
            Add-Result -Check $checkName -Category 'Failed' -Details "Version $versionString is below minimum required version $($Script:Config.NodeMinVersion)"
            return $false
        }
    }
    catch {
        Write-CheckResult -Check $checkName -Status 'Fail' -Message "Error: $($_.Exception.Message)"
        Add-Result -Check $checkName -Category 'Failed' -Details $_.Exception.Message
        return $false
    }
}

function Test-NpmInstallation {
    <#
    .SYNOPSIS
        Validates npm installation.
    #>
    [CmdletBinding()]
    param()
    
    $checkName = "npm (Node Package Manager)"
    
    try {
        $npmVersion = npm --version 2>$null
        
        if (-not $npmVersion) {
            Write-CheckResult -Check $checkName -Status 'Fail' -Message "Not found"
            Add-Result -Check $checkName -Category 'Failed' -Details "npm is not installed or not in PATH"
            return $false
        }
        
        Write-CheckResult -Check $checkName -Status 'Pass' -Message "v$npmVersion"
        Add-Result -Check $checkName -Category 'Passed' -Details "Version $npmVersion"
        return $true
    }
    catch {
        Write-CheckResult -Check $checkName -Status 'Fail' -Message "Error: $($_.Exception.Message)"
        Add-Result -Check $checkName -Category 'Failed' -Details $_.Exception.Message
        return $false
    }
}

function Test-VSCodeInstallation {
    <#
    .SYNOPSIS
        Validates VS Code installation and version.
    #>
    [CmdletBinding()]
    param()
    
    $checkName = "Visual Studio Code"
    
    try {
        $codeOutput = code --version 2>$null
        
        if (-not $codeOutput) {
            Write-CheckResult -Check $checkName -Status 'Fail' -Message "Not found"
            Add-Result -Check $checkName -Category 'Failed' -Details "VS Code is not installed or not in PATH"
            return $false
        }
        
        # VS Code --version returns three lines: version, commit, architecture
        $versionLine = ($codeOutput -split "`n")[0].Trim()
        $installedVersion = [version]$versionLine
        
        if ($installedVersion -ge $Script:Config.VSCodeMinVersion) {
            Write-CheckResult -Check $checkName -Status 'Pass' -Message "v$versionLine"
            Add-Result -Check $checkName -Category 'Passed' -Details "Version $versionLine meets requirement (>= $($Script:Config.VSCodeMinVersion))"
            return $true
        } else {
            Write-CheckResult -Check $checkName -Status 'Fail' -Message "v$versionLine (requires >= $($Script:Config.VSCodeMinVersion))"
            Add-Result -Check $checkName -Category 'Failed' -Details "Version $versionLine is below minimum required version $($Script:Config.VSCodeMinVersion)"
            return $false
        }
    }
    catch {
        Write-CheckResult -Check $checkName -Status 'Fail' -Message "Error: $($_.Exception.Message)"
        Add-Result -Check $checkName -Category 'Failed' -Details $_.Exception.Message
        return $false
    }
}

function Test-VsceInstallation {
    <#
    .SYNOPSIS
        Validates VS Code Extension Manager (vsce) installation.
    #>
    [CmdletBinding()]
    param()
    
    $checkName = "VS Code Extension Manager (vsce)"
    
    try {
        $vsceVersion = vsce --version 2>$null
        
        if (-not $vsceVersion) {
            Write-CheckResult -Check $checkName -Status 'Warning' -Message "Not found (optional for development)"
            Add-Result -Check $checkName -Category 'Warnings' -Details "vsce is not installed. Install with: npm install -g @vscode/vsce"
            return $false
        }
        
        Write-CheckResult -Check $checkName -Status 'Pass' -Message "v$vsceVersion"
        Add-Result -Check $checkName -Category 'Passed' -Details "Version $vsceVersion"
        return $true
    }
    catch {
        Write-CheckResult -Check $checkName -Status 'Warning' -Message "Error checking version"
        Add-Result -Check $checkName -Category 'Warnings' -Details $_.Exception.Message
        return $false
    }
}

function Test-ProjectDependencies {
    <#
    .SYNOPSIS
        Validates that project dependencies are installed.
    #>
    [CmdletBinding()]
    param()
    
    $checkName = "Project Dependencies (node_modules)"
    $nodeModulesPath = Join-Path $Script:ProjectRoot "node_modules"
    
    if (Test-Path $nodeModulesPath) {
        Write-CheckResult -Check $checkName -Status 'Pass' -Message "Installed"
        Add-Result -Check $checkName -Category 'Passed' -Details "node_modules folder exists"
        return $true
    } else {
        Write-CheckResult -Check $checkName -Status 'Warning' -Message "Not found. Run 'npm install' in project root"
        Add-Result -Check $checkName -Category 'Warnings' -Details "Run 'npm install' in the project root directory"
        return $false
    }
}

function Test-CompiledOutput {
    <#
    .SYNOPSIS
        Validates that the project has been compiled.
    #>
    [CmdletBinding()]
    param()
    
    $checkName = "Compiled Output (dist folder)"
    $distPath = Join-Path $Script:ProjectRoot "dist"
    
    if (Test-Path $distPath) {
        Write-CheckResult -Check $checkName -Status 'Pass' -Message "Found"
        Add-Result -Check $checkName -Category 'Passed' -Details "dist folder exists"
        return $true
    } else {
        Write-CheckResult -Check $checkName -Status 'Warning' -Message "Not found. Run 'npm run compile'"
        Add-Result -Check $checkName -Category 'Warnings' -Details "Run 'npm run compile' in the project root directory"
        return $false
    }
}

#endregion

#region Summary Functions

function Write-Summary {
    <#
    .SYNOPSIS
        Displays a summary of all check results.
    #>
    [CmdletBinding()]
    param()
    
    Write-Header "Summary"
    
    $passedCount = $Script:Results.Passed.Count
    $failedCount = $Script:Results.Failed.Count
    $warningCount = $Script:Results.Warnings.Count
    $totalCount = $passedCount + $failedCount + $warningCount
    
    Write-Host "Total Checks: $totalCount" -ForegroundColor White
    Write-Host "Passed:       $passedCount" -ForegroundColor Green
    Write-Host "Failed:       $failedCount" -ForegroundColor Red
    Write-Host "Warnings:     $warningCount" -ForegroundColor Yellow
    
    if ($failedCount -gt 0) {
        Write-Host "`nFailed Checks:" -ForegroundColor Red
        foreach ($failure in $Script:Results.Failed) {
            Write-Host "  • $($failure.Check)" -ForegroundColor Red
            Write-Host "    $($failure.Details)" -ForegroundColor Gray
        }
    }
    
    if ($warningCount -gt 0) {
        Write-Host "`nWarnings:" -ForegroundColor Yellow
        foreach ($warning in $Script:Results.Warnings) {
            Write-Host "  • $($warning.Check)" -ForegroundColor Yellow
            Write-Host "    $($warning.Details)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
}

function Write-NextSteps {
    <#
    .SYNOPSIS
        Displays recommended next steps based on check results.
    #>
    [CmdletBinding()]
    param()
    
    $failedCount = $Script:Results.Failed.Count
    $warningCount = $Script:Results.Warnings.Count
    
    if ($failedCount -eq 0 -and $warningCount -eq 0) {
        Write-Host "✓ All requirements met! You're ready to develop." -ForegroundColor Green
        Write-Host "`nNext steps:" -ForegroundColor Cyan
        Write-Host "  1. cd mcp" -ForegroundColor White
        Write-Host "  2. npm run compile" -ForegroundColor White
        Write-Host "  3. Press F5 in VS Code to test" -ForegroundColor White
    }
    elseif ($failedCount -eq 0) {
        Write-Host "✓ Core requirements met!" -ForegroundColor Green
        Write-Host "`nRecommended actions:" -ForegroundColor Cyan
        
        if ($Script:Results.Warnings | Where-Object { $_.Check -match "node_modules" }) {
            Write-Host "  • Run: npm install" -ForegroundColor White
        }
        if ($Script:Results.Warnings | Where-Object { $_.Check -match "dist" }) {
            Write-Host "  • Run: npm run compile" -ForegroundColor White
        }
        if ($Script:Results.Warnings | Where-Object { $_.Check -match "vsce" }) {
            Write-Host "  • Run: npm install -g @vscode/vsce (for packaging)" -ForegroundColor White
        }
    }
    else {
        Write-Host "✗ Some requirements are not met." -ForegroundColor Red
        Write-Host "`nRequired actions:" -ForegroundColor Cyan
        
        if ($Script:Results.Failed | Where-Object { $_.Check -match "Node.js" }) {
            Write-Host "  • Install Node.js: https://nodejs.org/" -ForegroundColor White
        }
        if ($Script:Results.Failed | Where-Object { $_.Check -match "Visual Studio Code" }) {
            Write-Host "  • Install VS Code: https://code.visualstudio.com/" -ForegroundColor White
        }
    }
    
    Write-Host ""
}

#endregion

#region Main Function

function Invoke-RequirementsCheck {
    <#
    .SYNOPSIS
        Main function that orchestrates all requirement checks.
    #>
    [CmdletBinding()]
    param()
    
    Write-Header "MCP VS Code Extension - Requirements Checker"
    Write-Host "Validating your development environment...`n" -ForegroundColor Gray
    
    # Core requirements
    Write-Host "Core Requirements:" -ForegroundColor Cyan
    $null = Test-NodeJsInstallation
    $null = Test-NpmInstallation
    $null = Test-VSCodeInstallation
    
    # Optional but recommended
    Write-Host "`nOptional Tools:" -ForegroundColor Cyan
    $null = Test-VsceInstallation
    
    # Project status
    Write-Host "`nProject Status:" -ForegroundColor Cyan
    $null = Test-ProjectDependencies
    $null = Test-CompiledOutput
    
    # Display summary and next steps
    Write-Summary
    Write-NextSteps
    
    # Exit with appropriate code
    $exitCode = if ($Script:Results.Failed.Count -eq 0) { 0 } else { 1 }
    exit $exitCode
}

#endregion

# Execute main function
Set-Location "..\mcp"
Invoke-RequirementsCheck
Set-Location "..\build"
