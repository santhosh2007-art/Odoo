@echo off
setlocal enabledelayedexpansion
echo ==========================================================
echo Dayflow HRMS - Push to GitHub
echo Repository: https://github.com/santhosh2007-art/Odoo
echo ==========================================================

:: Check if git is available in PATH, else use bundled portable Git
where git >nul 2>nul
if %errorlevel% equ 0 (
    set GIT_CMD=git
) else if exist "%~dp0.git_tools\cmd\git.exe" (
    set "GIT_CMD=%~dp0.git_tools\cmd\git.exe"
    echo Using portable Git from .git_tools...
) else (
    echo [ERROR] Git could not be found.
    pause
    exit /b 1
)

:: Ensure repository is initialized
if not exist "%~dp0.git" (
    "%GIT_CMD%" init
)

:: Stage all files
"%GIT_CMD%" add .

:: Commit
"%GIT_CMD%" commit -m "feat: complete Dayflow HRMS in Java Spring Boot with Admin & Pay User roles" 2>nul

:: Set main branch and remote
"%GIT_CMD%" branch -M main
"%GIT_CMD%" remote remove origin 2>nul
"%GIT_CMD%" remote add origin https://github.com/santhosh2007-art/Odoo.git

:: Push to remote
echo.
echo Pushing changes to GitHub...
echo (If prompted, sign in to your GitHub account)
echo.
"%GIT_CMD%" push -u origin main --force

echo.
echo ==========================================================
echo Push completed!
echo ==========================================================
pause
