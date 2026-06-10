# 一键安装「线条小狗 · 小白」主题到 Clawd on Desk
$ErrorActionPreference = "Stop"
$ThemeId = "maltese-line-pup"
$Source = Split-Path -Parent $MyInvocation.MyCommand.Path
$TargetRoot = Join-Path $env:APPDATA "clawd-on-desk\themes"
$Target = Join-Path $TargetRoot $ThemeId

Write-Host "正在安装主题到: $Target" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $TargetRoot | Out-Null

if (Test-Path $Target) {
    Remove-Item -Recurse -Force $Target
}

Copy-Item -Recurse -Force $Source $Target
# 避免把安装脚本自身递归复制进主题目录的冗余副本（Copy-Item 会复制整个源目录）
Remove-Item -Force (Join-Path $Target "install.ps1") -ErrorAction SilentlyContinue
Remove-Item -Force (Join-Path $Target "push_github.ps1") -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force (Join-Path $Target ".git") -ErrorAction SilentlyContinue

Write-Host "安装完成！" -ForegroundColor Green
Write-Host "打开 Clawd on Desk → 设置 → 主题 → 选择「线条小狗 · 小白」" -ForegroundColor Yellow
