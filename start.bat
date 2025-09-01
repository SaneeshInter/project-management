@echo off
REM Project Management System - Windows Start Script

setlocal enabledelayedexpansion

REM Colors (limited support in Windows CMD)
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:print_header
echo %BLUE%================================%NC%
echo %BLUE%  Project Management System%NC%
echo %BLUE%================================%NC%
echo.

:main
if "%1"=="docker-dev" goto start_docker_dev
if "%1"=="docker" goto start_docker_prod
if "%1"=="manual" goto start_manual
if "%1"=="help" goto show_help
if "%1"=="-h" goto show_help
if "%1"=="--help" goto show_help
if "%1"=="" goto show_menu

echo %RED%[ERROR]%NC% Unknown option: %1
echo Use 'start.bat help' for available options.
exit /b 1

:show_menu
call :print_header
echo Choose how to start the project:
echo.
echo 1^) Docker Development ^(Recommended^)
echo 2^) Docker Production
echo 3^) Manual Setup
echo 4^) Show Help
echo.
set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto start_docker_dev
if "%choice%"=="2" goto start_docker_prod
if "%choice%"=="3" goto start_manual
if "%choice%"=="4" goto show_help

echo %RED%[ERROR]%NC% Invalid choice. Use 'start.bat help' for options.
exit /b 1

:start_docker_dev
echo %GREEN%[INFO]%NC% Starting with Docker in development mode...
call :check_docker
if errorlevel 1 exit /b 1

echo %GREEN%[INFO]%NC% Building and starting services...
docker-compose -f docker-compose.dev.yml up --build
goto end

:start_docker_prod
echo %GREEN%[INFO]%NC% Starting with Docker in production mode...
call :check_docker
if errorlevel 1 exit /b 1

echo %GREEN%[INFO]%NC% Building and starting services...
docker-compose up --build
goto end

:start_manual
echo %GREEN%[INFO]%NC% Starting manually...
call :check_node
if errorlevel 1 exit /b 1

REM Check if .env files exist
if not exist "backend\.env" (
    echo %YELLOW%[WARNING]%NC% Backend .env file not found. Creating from example...
    copy "backend\.env.example" "backend\.env" >nul
    echo %YELLOW%[WARNING]%NC% Please edit backend\.env with your database configuration
)

if not exist "frontend\.env" (
    echo %YELLOW%[WARNING]%NC% Frontend .env file not found. Creating from example...
    copy "frontend\.env.example" "frontend\.env" >nul
)

REM Backend setup
echo %GREEN%[INFO]%NC% Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Failed to install backend dependencies
    exit /b 1
)

echo %GREEN%[INFO]%NC% Setting up database...
call npx prisma generate
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Failed to generate Prisma client
    exit /b 1
)

call npx prisma migrate dev
if errorlevel 1 (
    echo %YELLOW%[WARNING]%NC% Migration failed, trying to deploy...
    call npx prisma migrate deploy
)

echo %GREEN%[INFO]%NC% Seeding database...
call npm run db:seed

echo %GREEN%[INFO]%NC% Starting backend server...
start /b cmd /c "npm run start:dev"

cd ..\frontend
echo %GREEN%[INFO]%NC% Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Failed to install frontend dependencies
    exit /b 1
)

echo %GREEN%[INFO]%NC% Starting frontend server...
start /b cmd /c "npm run dev"

timeout /t 5 /nobreak >nul

echo.
echo %GREEN%[INFO]%NC% Services started successfully!
echo.
echo %GREEN%Frontend:%NC% http://localhost:3000
echo %GREEN%Backend API:%NC% http://localhost:3001
echo %GREEN%API Docs:%NC% http://localhost:3001/api/docs
echo.
echo %GREEN%[INFO]%NC% Demo accounts:
echo   Admin: admin@intersmart.com / password123
echo   PM: pm@intersmart.com / password123
echo   Developer: arjun@intersmart.com / password123
echo   Client: client@example.com / password123
echo.
echo %GREEN%[INFO]%NC% Press any key to stop all services...
pause >nul

echo %GREEN%[INFO]%NC% Stopping services...
taskkill /f /im node.exe >nul 2>&1
goto end

:check_docker
echo %GREEN%[INFO]%NC% Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Docker is not installed. Please install Docker first.
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Docker is not running. Please start Docker first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)
exit /b 0

:check_node
echo %GREEN%[INFO]%NC% Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)
exit /b 0

:show_help
call :print_header
echo Usage: start.bat [option]
echo.
echo Options:
echo   docker-dev    Start with Docker in development mode
echo   docker        Start with Docker in production mode
echo   manual        Start manually ^(requires Node.js 18+^)
echo   help          Show this help message
echo.
echo Examples:
echo   start.bat docker-dev    # Recommended for development
echo   start.bat docker        # For production
echo   start.bat manual        # Manual setup
echo.
echo Requirements:
echo   Docker mode: Docker ^& Docker Compose
echo   Manual mode: Node.js 18+, PostgreSQL 14+
goto end

:end
endlocal