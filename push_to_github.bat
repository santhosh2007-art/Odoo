@echo off
echo ==========================================================
echo Pushing Dayflow HRMS code to https://github.com/santhosh2007-art/Odoo
echo ==========================================================

:: Initialize git repository if not already initialized
if not exist ".git" (
    git init
)

:: Stage all files
git add .

:: Commit files
git commit -m "feat: complete Dayflow HRMS in Java Spring Boot with Admin and Pay User roles"

:: Rename branch to main
git branch -M main

:: Set remote origin
git remote remove origin 2>nul
git remote add origin https://github.com/santhosh2007-art/Odoo.git

:: Push to remote main
echo Pushing to GitHub...
git push -u origin main

echo ==========================================================
echo Done! Please verify at https://github.com/santhosh2007-art/Odoo
echo ==========================================================
pause
