$ErrorActionPreference = 'Stop'
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$skillFiles = @(Get-ChildItem -LiteralPath $root -Filter 'SKILL.md' -File -Recurse)
if ($skillFiles.Count -ne 1 -or $skillFiles[0].FullName -ne (Join-Path $root 'SKILL.md')) {
    throw "Expected one root SKILL.md entrypoint; found $($skillFiles.Count)."
}

$catalogPath = Join-Path $root 'references\catalog.md'
$catalog = Get-Content -LiteralPath $catalogPath -Raw
$links = [regex]::Matches($catalog, '\[Module\]\(([^)]+)\)')
if ($links.Count -ne 83) { throw "Expected 83 catalog modules after integration; found $($links.Count)." }
$missing = @()
foreach ($link in $links) {
    $path = Join-Path (Split-Path -Parent $catalogPath) $link.Groups[1].Value.Replace('/', '\')
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { $missing += $link.Groups[1].Value }
}
if ($missing.Count) { throw "Missing catalog targets: $($missing -join ', ')" }

foreach ($required in @('scripts\ucm.mjs', 'references\continuity\MODULE.md', 'references\continuity\ACTIVATION.md', 'references\continuity\COMPATIBILITY.md', 'tests\ucm.test.mjs', 'README.md', 'LICENSES.md', 'CONTRIBUTING.md', 'docs\maintainers\RELEASE-CHECKLIST.md')) {
    if (-not (Test-Path -LiteralPath (Join-Path $root $required) -PathType Leaf)) { throw "Missing integrated file: $required" }
}
if (-not (Select-String -LiteralPath (Join-Path $root 'SKILL.md') -Pattern 'project-continuity' -Quiet)) {
    throw 'The root skill entrypoint does not route continuity requests.'
}
if (-not (Select-String -LiteralPath (Join-Path $root 'SKILL.md') -Pattern '^name: universal-context-manager$' -Quiet)) {
    throw 'The root skill frontmatter does not use the Universal Context Manager name.'
}
Write-Output 'PASS: single skill entrypoint, 83 valid catalog targets, continuity module and CLI are integrated.'
