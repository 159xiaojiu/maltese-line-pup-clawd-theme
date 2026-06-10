@echo off
setlocal EnableExtensions

set "CLAWD=C:\Users\23986\Desktop\clawd-on-desk"
set "NPM=C:\Program Files\nodejs\npm.cmd"

if not exist "%CLAWD%\package.json" (
  echo.
  echo [FAIL] Clawd folder missing:
  echo %CLAWD%
  pause
  exit /b 1
)

if not exist "%NPM%" (
  echo.
  echo [FAIL] Node.js not installed. Install Node.js first.
  pause
  exit /b 1
)

if not exist "%CLAWD%\node_modules" (
  echo.
  echo [FAIL] Dependencies missing.
  echo Open clawd-on-desk in terminal and run: npm install
  pause
  exit /b 1
)

cd /d "%CLAWD%"
start "ClawdDeskPet" /MIN cmd /k ""%NPM%" start"

echo.
echo Clawd is starting...
echo Check desktop or system tray (bottom-right).
echo Then: right-click pet - Settings - Theme - pick Maltese theme.
echo.
timeout /t 6 /nobreak >nul
endlocal
