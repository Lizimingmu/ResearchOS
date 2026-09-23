@echo off
setlocal enabledelayedexpansion

chcp 65001 >nul
title ResearchOS Pilot Launcher

echo ===================================================
echo           ResearchOS Pilot Launcher
echo ===================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 Node.js 环境。
    echo 请安装 Node.js (推荐 v18 或更高版本): https://nodejs.org/
    echo.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [错误] 未检测到 npm。请检查 Node.js 安装及环境变量 PATH。
    echo.
    pause
    exit /b 1
)

if not exist node_modules (
    echo [提示] 首次运行，正在安装依赖 (npm install)...
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败，请检查网络后重试。
        echo.
        pause
        exit /b 1
    )
)

echo [1/3] 正在编译前端资源 (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [错误] 编译失败，请查看上方报错信息。
    echo.
    pause
    exit /b 1
)

if "%RESEARCHOS_PORT%"=="" (
    set RESEARCHOS_PORT=5173
)

echo [2/3] 正在启动本地 Pilot 服务 (端口: %RESEARCHOS_PORT%)...
echo [3/3] 正在打开浏览器...
start http://localhost:%RESEARCHOS_PORT%

echo.
echo ===================================================
echo  ResearchOS 已启动！
echo  访问地址: http://localhost:%RESEARCHOS_PORT%
echo.
echo  提示：
echo  - 点击「开始试用」即可开始 30-45 分钟沉浸式学习体验
echo  - 完成每节学习后可提交反馈
echo  - 按 Ctrl+C 可停止本地服务
echo ===================================================
echo.

node scripts/serve.mjs

if %errorlevel% neq 0 (
    echo.
    echo 服务已退出。
    pause
)
