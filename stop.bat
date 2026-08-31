@echo off
title 停止查查服务

echo 正在停止查查服务…
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":8700 " ^| findstr LISTENING') do (
    taskkill /f /pid %%p >nul 2>&1 && echo 已停止后端（PID %%p）
)
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":5178 " ^| findstr LISTENING') do (
    taskkill /f /pid %%p >nul 2>&1 && echo 已停止前端（PID %%p）
)
echo 完事。双击 start.bat 重新启动。
echo.
pause
