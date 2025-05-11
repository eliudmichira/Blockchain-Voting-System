@echo off
setlocal EnableDelayedExpansion
title Blockchain Voting System Startup
color 0A

REM Store batch file directory
set "APP_DIR=%CD%"
set "ERROR_COUNT=0"
set "SUCCESS=false"

echo =====================================================
echo        Blockchain Voting System Startup
echo =====================================================
echo.

REM Check for required software
call :check_dependencies
if !ERROR_COUNT! GTR 0 (
    color 0C
    echo.
    echo Found !ERROR_COUNT! missing dependencies. Please install them and try again.
    goto :exit_script
)

REM Initialize environment
call :initialize_environment
if !SUCCESS!==false goto :exit_script

REM Start services
call :start_services
if !SUCCESS!==false goto :exit_script

REM Launch application
call :launch_application
if !SUCCESS!==false goto :exit_script

echo.
echo =====================================================
echo        Blockchain Voting System is Ready!
echo =====================================================
echo.
echo Access the application at: http://localhost:8080
echo Admin dashboard at: http://localhost:8080/admin
echo.
echo Press any key to exit this window...
pause > nul
exit /b 0

:check_dependencies
echo Checking required dependencies...
echo.

REM Check for Node.js
node --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    set /a ERROR_COUNT+=1
)

REM Check for npm
npm --version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed or not in PATH
    set /a ERROR_COUNT+=1
)

REM Check for Truffle
truffle version > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Truffle is not installed. Install with: npm install -g truffle
    set /a ERROR_COUNT+=1
)

REM Check for Ganache
where ganache-cli > nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Ganache CLI not found. Install with: npm install -g ganache-cli
    echo [INFO] Will attempt to use Ganache GUI if available
)

if !ERROR_COUNT!==0 (
    echo [SUCCESS] All required dependencies found
    echo.
)
exit /b

:initialize_environment
echo Initializing environment...
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install dependencies
        set "SUCCESS=false"
        exit /b
    )
)

REM Check if Ganache is running (port 7545)
netstat -an | find "7545" > nul
if !ERRORLEVEL! NEQ 0 (
    echo [WARNING] Ganache not detected on port 7545
    echo Please ensure Ganache is running with the following settings:
    echo - PORT: 7545
    echo - NETWORK ID: 5777
    echo - AUTOMINE: Enabled
    echo.
    set /p CONTINUE="Do you want to continue anyway? (Y/N): "
    if /i "!CONTINUE!"=="Y" (
        echo Continuing startup...
    ) else (
        echo Startup aborted by user.
        set "SUCCESS=false"
        exit /b
    )
)

set "SUCCESS=true"
exit /b

:start_services
echo.
echo Starting services...
echo.

REM Start Database API
echo Starting Database API...
start "Database API" cmd /k "cd Database_API && cls && npm start"
timeout /t 3 /nobreak > nul

REM Compile and migrate contracts
echo Compiling smart contracts...
call truffle compile
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Contract compilation failed
    set "SUCCESS=false"
    exit /b
)

echo.
echo Migrating smart contracts to blockchain...
call truffle migrate --reset > "%APP_DIR%\latest-migration.log"
if !ERRORLEVEL! NEQ 0 (
    echo [ERROR] Contract migration failed
    set "SUCCESS=false"
    exit /b
)

REM Extract and display contract address
echo.
echo Contract deployment information:
findstr "contract address" "%APP_DIR%\latest-migration.log"
echo.

REM Start web server
echo Starting web server...
start "Web Server" cmd /k "cls && node server.js"
timeout /t 3 /nobreak > nul

set "SUCCESS=true"
exit /b

:launch_application
echo.
echo Launching application...

REM Wait for server to be ready
set "ATTEMPTS=0"
:check_server
curl -s http://localhost:8080 > nul
if !ERRORLEVEL! NEQ 0 (
    set /a ATTEMPTS+=1
    if !ATTEMPTS! GEQ 10 (
        echo [ERROR] Server failed to start
        set "SUCCESS=false"
        exit /b
    )
    timeout /t 1 /nobreak > nul
    goto :check_server
)

start http://localhost:8080
set "SUCCESS=true"
exit /b

:exit_script
if !SUCCESS!==false (
    color 0C
    echo.
    echo =====================================================
    echo        Startup failed! Check errors above.
    echo =====================================================
    echo.
    pause
    exit /b 1
)
exit /b 0 