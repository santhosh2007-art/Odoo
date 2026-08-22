Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Pushing Dayflow HRMS code to https://github.com/santhosh2007-art/Odoo" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

Set-Location -Path $PSScriptRoot

if (-not (Test-Path ".git")) {
    git init
}

git add .
git commit -m "feat: complete Dayflow HRMS in Java Spring Boot with Admin and Pay User roles"
git branch -M main

git remote remove origin 2>$null
git remote add origin https://github.com/santhosh2007-art/Odoo.git

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin main

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "Done! Please verify at https://github.com/santhosh2007-art/Odoo" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
