@echo off
cd /d "%~dp0"

set BINARY=zakat.exe
if not exist "%BINARY%" (
    echo Error: %BINARY% not found.
    pause
    exit /b 1
)

set PORT=8080
if exist .env (
    for /f "tokens=1,* delims==" %%a in ('findstr /b "PORT=" .env') do set PORT=%%b
)

echo Starting Zakat Calculator on http://localhost:%PORT%
echo Press Ctrl+C to stop.
echo.

start "" "http://localhost:%PORT%"
timeout /t 2 /nobreak >nul

"%BINARY%"

echo.
echo Server stopped.
pause
