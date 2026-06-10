# 一键推送到 GitHub
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "没有需要提交的更改。" -ForegroundColor Yellow
    exit 0
}

git commit -m "update: maltese line pup theme"
git push origin HEAD
Write-Host "推送完成！" -ForegroundColor Green
