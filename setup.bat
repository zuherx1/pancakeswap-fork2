@echo off
title PancakeSwap Fork Setup
color 0B

echo.
echo  ============================================
echo   🥞  PancakeSwap Fork - Windows Setup
echo  ============================================
echo.

:: Check Node.js
echo [1/5] Checking Node.js...
node --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo ERROR: Node.js not found.
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)
echo  Node.js found: 
node --version

:: Check npm
echo.
echo [2/5] Checking npm...
npm --version >nul 2>&1
IF ERRORLEVEL 1 (
    echo ERROR: npm not found.
    pause
    exit /b 1
)
echo  npm found:
npm --version

:: Create .env.local
echo.
echo [3/5] Setting up environment variables...
IF NOT EXIST ".env.local" (
    copy .env.example .env.local
    echo  Created .env.local
) ELSE (
    echo  .env.local already exists
)

echo.
echo  ================================================
echo   IMPORTANT: Edit .env.local before continuing!
echo  ================================================
echo.
echo   Set the following values in .env.local:
echo   - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
echo   - NEXT_PUBLIC_SITE_URL
echo   - NEXT_PUBLIC_SITE_NAME
echo.
echo  Open .env.local in Notepad now...
start notepad .env.local
echo.
pause

:: Install dependencies
echo.
echo [4/5] Installing dependencies (may take several minutes)...
npm install --legacy-peer-deps
IF ERRORLEVEL 1 (
    echo ERROR: npm install failed.
    pause
    exit /b 1
)
echo  Dependencies installed successfully!

:: Start
echo.
echo [5/5] Choose startup mode:
echo   1 = Development (recommended for testing)
echo   2 = Production build + start
echo.
set /p MODE="Enter 1 or 2: "

IF "%MODE%"=="2" (
    echo Building for production...
    npm run build
    IF ERRORLEVEL 1 (
        echo ERROR: Build failed. Check output above.
        pause
        exit /b 1
    )
    echo Starting production server...
    echo Open http://localhost:3000 in your browser
    npm start
) ELSE (
    echo Starting development server...
    echo Open http://localhost:3000 in your browser
    npm run dev
)

pause
