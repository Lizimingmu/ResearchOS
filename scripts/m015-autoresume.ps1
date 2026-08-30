[CmdletBinding()]
param(
    [int]$MaxAttemptsPerSegment = 3,
    [int]$MaxTotalLaunches = 24,
    [int]$RetryDelaySeconds = 10
)

$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$statePath = Join-Path $projectRoot '.agent\M015_RUN_STATE.json'
$promptPath = Join-Path $projectRoot '.agent\OPENCODE_M015_MASTER_PROMPT.md'
$lockPath = Join-Path $projectRoot '.agent\m015-run.lock'
$watchdogPath = Join-Path $projectRoot '.agent\m015-watchdog-state.json'
$logRoot = Join-Path $projectRoot '.agent\m015-run-logs'

New-Item -ItemType Directory -Force -Path $logRoot | Out-Null
$lockStream = $null

function Read-RunState {
    if (-not (Test-Path -LiteralPath $statePath)) {
        throw "Missing run state: $statePath"
    }
    return Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
}

function Get-CurrentSegment($state) {
    return $state.segments | Where-Object { $_.status -ne 'completed' } | Select-Object -First 1
}

function Write-WatchdogState($payload) {
    $json = $payload | ConvertTo-Json -Depth 8
    [System.IO.File]::WriteAllText($watchdogPath, $json, [System.Text.UTF8Encoding]::new($false))
}

try {
    $lockStream = [System.IO.File]::Open($lockPath, 'OpenOrCreate', 'ReadWrite', 'None')
} catch {
    throw 'Another M015 watchdog appears to be running. Stop it before starting a second copy.'
}

try {
    $openCodeWrapper = Get-Command opencode -ErrorAction Stop
    $openCodeRoot = Split-Path $openCodeWrapper.Source -Parent
    $openCodeExe = Join-Path $openCodeRoot 'node_modules\opencode-ai\bin\opencode.exe'
    if (-not (Test-Path -LiteralPath $openCodeExe)) {
        throw "Cannot locate opencode.exe behind wrapper: $($openCodeWrapper.Source)"
    }
    $attempts = @{}
    $launches = 0
    $noProgress = 0
    $previousFingerprint = ''

    while ($launches -lt $MaxTotalLaunches) {
        $state = Read-RunState
        if ($state.runStatus -eq 'awaiting_codex_review') {
            Write-Host 'M015 reached awaiting_codex_review.'
            exit 0
        }
        if ($state.runStatus -eq 'stopped_on_failure') {
            Write-Host 'M015 recorded a safety or unrecoverable failure; watchdog stopped.'
            exit 2
        }

        $segment = Get-CurrentSegment $state
        if ($null -eq $segment) {
            throw 'No unfinished segment exists, but runStatus is not awaiting_codex_review.'
        }

        $segmentId = [string]$segment.id
        if (-not $attempts.ContainsKey($segmentId)) { $attempts[$segmentId] = 0 }
        if ([int]$segment.attempts -ge $MaxAttemptsPerSegment) {
            Write-Host "Persistent retry budget exhausted for $segmentId."
            exit 3
        }
        if ($attempts[$segmentId] -ge $MaxAttemptsPerSegment) {
            Write-Host "Retry budget exhausted for $segmentId."
            exit 3
        }

        $attempts[$segmentId]++
        $launches++
        $stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
        $logPath = Join-Path $logRoot "$stamp-$segmentId-attempt-$($attempts[$segmentId]).log"
        $errorLogPath = "$logPath.stderr"
        $instruction = "Read and execute $promptPath. Resume exactly one segment from the checkpoint, then exit after completion or a safe stop."

        Write-WatchdogState ([ordered]@{
            updatedAt = (Get-Date).ToString('o')
            launch = $launches
            segment = $segmentId
            attemptForSegment = $attempts[$segmentId]
            log = $logPath
            errorLog = $errorLogPath
        })

        Write-Host "Launching OpenCode for $segmentId attempt $($attempts[$segmentId])..."
        $openCodeArguments = @(
            'run',
            '--auto',
            '--dir',
            ('"' + $projectRoot + '"'),
            ('"' + $instruction + '"')
        )
        $openCodeProcess = Start-Process -FilePath $openCodeExe `
            -ArgumentList $openCodeArguments `
            -WorkingDirectory $projectRoot `
            -NoNewWindow `
            -RedirectStandardOutput $logPath `
            -RedirectStandardError $errorLogPath `
            -PassThru `
            -Wait
        $exitCode = $openCodeProcess.ExitCode

        $after = Read-RunState
        $afterSegment = Get-CurrentSegment $after
        $afterId = if ($null -eq $afterSegment) { 'none' } else { [string]$afterSegment.id }
        $fingerprint = "$($after.runStatus)|$afterId|$($after.lastUpdated)"
        if ($fingerprint -eq $previousFingerprint) { $noProgress++ } else { $noProgress = 0 }
        $previousFingerprint = $fingerprint

        if ($after.runStatus -eq 'awaiting_codex_review') {
            Write-Host 'M015 reached awaiting_codex_review.'
            exit 0
        }
        if ($after.runStatus -eq 'stopped_on_failure') {
            Write-Host "OpenCode stopped safely. See $logPath and M015_RUN_STATE.json."
            exit 2
        }
        if ($noProgress -ge 3) {
            Write-Host 'No checkpoint progress across three launches; watchdog stopped.'
            exit 4
        }

        if ($afterId -ne $segmentId) {
            $attempts.Remove($segmentId)
            Write-Host "$segmentId completed; continuing with $afterId."
            continue
        }

        Write-Host "OpenCode exited with code $exitCode before $segmentId completed. Retrying after $RetryDelaySeconds seconds."
        Start-Sleep -Seconds $RetryDelaySeconds
    }

    Write-Host 'Total launch budget exhausted; watchdog stopped.'
    exit 5
} finally {
    if ($null -ne $lockStream) { $lockStream.Dispose() }
    Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
}
