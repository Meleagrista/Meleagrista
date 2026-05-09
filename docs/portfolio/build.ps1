Param(
    [string]$MainFile = "main.tex",
    [string]$OutputDir = "output"
)

$ErrorActionPreference = "Stop"

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptRoot
$resolvedOutputDir = Join-Path $scriptRoot $OutputDir

if (-not (Test-Path $MainFile)) {
    throw "Cannot find '$MainFile' in $scriptRoot."
}

if (-not (Test-Path $resolvedOutputDir)) {
    New-Item -ItemType Directory -Path $resolvedOutputDir | Out-Null
}

$latexmk = Get-Command latexmk -ErrorAction SilentlyContinue
$perl = Get-Command perl -ErrorAction SilentlyContinue

if ($latexmk -and $perl) {
    & $latexmk.Source @("-pdf", "-interaction=nonstopmode", "-halt-on-error", "-outdir=$resolvedOutputDir", $MainFile)
    exit $LASTEXITCODE
}

$pdflatex = Get-Command pdflatex -ErrorAction SilentlyContinue

if (-not $pdflatex) {
    throw "Neither 'latexmk' nor 'pdflatex' was found on PATH. Install a LaTeX distribution such as TeX Live or MiKTeX."
}

& $pdflatex.Source @("-interaction=nonstopmode", "-halt-on-error", "-output-directory=$resolvedOutputDir", $MainFile)
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $pdflatex.Source @("-interaction=nonstopmode", "-halt-on-error", "-output-directory=$resolvedOutputDir", $MainFile)
exit $LASTEXITCODE