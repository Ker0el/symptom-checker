@echo off
title 查查 · 健康参考
cd /d %~dp0

echo ==============================
echo   查查 · 家庭健康参考
echo   先别慌，也别百度
echo ==============================
echo.

REM 首次运行先装依赖
if not exist server\node_modules (
    echo [1/3] 第一次运行，安装后端依赖…
    cd server
    call npm install --no-audit --no-fund
    cd ..
)
if not exist web\node_modules (
    echo [1/3] 第一次运行，安装前端依赖…
    cd web
    call npm install --no-audit --no-fund
    cd ..
)

REM 检查端口占用
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8700 " ^| findstr LISTENING') do (
    echo [警告] 端口 8700 已被占用（PID %%p），后端可能起不来。
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5178 " ^| findstr LISTENING') do (
    echo [警告] 端口 5178 已被占用（PID %%p），前端可能起不来。
)

echo [2/3] 启动后端（新窗口）…
start "查查-server" cmd /k "cd /d %~dp0server && node src/index.js"

echo [3/3] 启动前端（新窗口）…
start "查查-web" cmd /k "cd /d %~dp0web && npm run dev"

REM 等前端起来再开浏览器
timeout /t 5 /nobreak >nul
start "" "http://localhost:5178"

echo.
echo 查查已启动：http://localhost:5178
echo 两个小窗口（查查-server / 查查-web）关掉 = 服务停止
echo 或双击 stop.bat 一键停止。
echo.
pause
