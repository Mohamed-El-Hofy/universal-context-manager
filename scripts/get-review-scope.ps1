param(
    [Parameter(Mandatory)][string]$Repository,
    [ValidateSet('WorkingTree','History')][string]$Mode = 'WorkingTree',
    [string]$BaseRef
)
$ErrorActionPreference = 'Stop'
$Repository = (Resolve-Path -LiteralPath $Repository).Path
function GitText([string[]]$Arguments) {
    $process = [System.Diagnostics.Process]::new()
    $process.StartInfo.FileName = 'git'
    $process.StartInfo.UseShellExecute = $false
    $process.StartInfo.CreateNoWindow = $true
    $process.StartInfo.RedirectStandardOutput = $true
    $process.StartInfo.RedirectStandardError = $true
    $process.StartInfo.StandardOutputEncoding = [System.Text.UTF8Encoding]::new($false)
    $process.StartInfo.StandardErrorEncoding = [System.Text.UTF8Encoding]::new($false)
    foreach ($arg in (@('-C',$Repository) + $Arguments)) { $process.StartInfo.ArgumentList.Add($arg) }
    try {
        $null = $process.Start()
        $stdoutTask = $process.StandardOutput.ReadToEndAsync()
        $stderrTask = $process.StandardError.ReadToEndAsync()
        $process.WaitForExit()
        $stdout = $stdoutTask.GetAwaiter().GetResult()
        $stderr = $stderrTask.GetAwaiter().GetResult()
        if ($process.ExitCode -ne 0) { throw ('Git failed: ' + $stderr.Trim()) }
        if ($stderr) { Write-Verbose $stderr.Trim() }
        return $stdout.TrimEnd([char[]]"`r`n")
    } finally { $process.Dispose() }
}
function GitNames([string[]]$Arguments) {
    $raw = GitText ($Arguments + @('-z','--'))
    return @($raw.Split([char]0) | Where-Object { $_.Length -gt 0 })
}
$Repository = (GitText @('rev-parse','--show-toplevel')).Trim()
if ($Mode -eq 'WorkingTree') {
    $staged = @(GitNames @('diff','--cached','--name-only'))
    $unstaged = @(GitNames @('diff','--name-only'))
    $untracked = @(GitNames @('ls-files','--others','--exclude-standard'))
    [PSCustomObject]@{
        Mode=$Mode; Repository=$Repository
        StagedFiles=$staged; UnstagedFiles=$unstaged; UntrackedFiles=$untracked
        StagedPatch=(GitText @('diff','--cached','--no-ext-diff','--no-textconv','--'))
        UnstagedPatch=(GitText @('diff','--no-ext-diff','--no-textconv','--'))
    } | ConvertTo-Json -Depth 5
} else {
    if ([string]::IsNullOrWhiteSpace($BaseRef)) { throw 'History mode requires BaseRef.' }
    $baseCommit = GitText @('rev-parse','--verify','--end-of-options',($BaseRef + '^{commit}'))
    $mergeBase = GitText @('merge-base',$baseCommit,'HEAD')
    [PSCustomObject]@{
        Mode=$Mode; Repository=$Repository; BaseRef=$BaseRef; MergeBase=$mergeBase
        Files=@(GitNames @('diff','--name-only',$mergeBase,'HEAD'))
        Patch=(GitText @('diff','--no-ext-diff','--no-textconv',$mergeBase,'HEAD','--'))
    } | ConvertTo-Json -Depth 5
}
