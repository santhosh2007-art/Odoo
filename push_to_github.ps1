# Dayflow HRMS - Push to GitHub
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Dayflow HRMS - Push to GitHub" -ForegroundColor Cyan
Write-Host "Repository: https://github.com/santhosh2007-art/Odoo" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

# Determine git executable
$gitPath = (Get-Command git -ErrorAction SilentlyContinue)?.Source
if (-not $gitPath) {
    $localGit = Join-Path $PSScriptRoot ".git_tools\cmd\git.exe"
    if (Test-Path $localGit) {
        $gitPath = $localGit
        Write-Host "Using bundled portable Git from .git_tools..." -ForegroundColor DarkGray
    } else {
        Write-Error "Git executable not found."
        return
    }
}

if (-not (Test-Path ".git")) {
    & $gitPath init
}

& $gitPath add .
& $gitPath commit -m "feat: complete Dayflow HRMS in Java Spring Boot with Admin & Pay User roles" 2>$null
& $gitPath branch -M main

& $gitPath remote remove origin 2>$null
& $gitPath remote add origin https://github.com/santhosh2007-art/Odoo.git

Write-Host "`nPushing to GitHub... (If prompted in browser, complete sign-in)" -ForegroundColor Yellow
& $gitPath push -u origin main --force

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "Push completed! Verify at: https://github.com/santhosh2007-art/Odoo" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
