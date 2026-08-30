[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$watchdog = Join-Path $PSScriptRoot 'm015-autoresume.ps1'
$statePath = Join-Path $projectRoot '.agent\M015_RUN_STATE.json'
$lockPath = Join-Path $projectRoot '.agent\m015-run.lock'
$pidPath = Join-Path $projectRoot '.agent\m015-watchdog.pid'
$logRoot = Join-Path $projectRoot '.agent\m015-run-logs'
$stdoutPath = Join-Path $logRoot 'watchdog.stdout.log'
$stderrPath = Join-Path $logRoot 'watchdog.stderr.log'

if (-not (Test-Path -LiteralPath $watchdog)) { throw "Missing watchdog: $watchdog" }
if (-not (Test-Path -LiteralPath $statePath)) { throw "Missing run state: $statePath" }
if (Test-Path -LiteralPath $lockPath) {
    $existingPid = if (Test-Path -LiteralPath $pidPath) { Get-Content -LiteralPath $pidPath -Raw } else { '' }
    $existingProcess = if ($existingPid -match '^\d+$') { Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue } else { $null }
    if ($null -ne $existingProcess) {
        throw "M015 watchdog is already running with PID $existingPid."
    }
    Remove-Item -LiteralPath $lockPath -Force
    Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
}

$state = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
if ($state.runStatus -eq 'awaiting_codex_review') {
    Write-Output 'M015 is already awaiting Codex review; nothing was started.'
    exit 0
}

New-Item -ItemType Directory -Force -Path $logRoot | Out-Null
$argumentLine = "-NoProfile -ExecutionPolicy Bypass -File `"$watchdog`""
$process = Start-Process -FilePath 'powershell.exe' `
    -ArgumentList $argumentLine `
    -WorkingDirectory $projectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdoutPath `
    -RedirectStandardError $stderrPath `
    -PassThru

[System.IO.File]::WriteAllText($pidPath, [string]$process.Id, [System.Text.UTF8Encoding]::new($false))
Write-Output "M015 overnight watchdog started in the background. PID=$($process.Id)"
Write-Output "Checkpoint: $statePath"
Write-Output "Logs: $logRoot"
