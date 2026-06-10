# 推送到 GitHub（需用户明确同意后才执行）
$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)

$confirm = Read-Host "确认上传到 GitHub 吗？输入 yes 继续，其他任意键取消"
if ($confirm -ne "yes") {
    Write-Host "已取消，未上传。" -ForegroundColor Yellow
    exit 0
}

if (-not (git remote get-url origin 2>$null)) {
    Write-Host "尚未配置远程仓库。请先确认仓库地址，并由用户同意后再添加 origin。" -ForegroundColor Yellow
    exit 1
}

git add -A
$status = git status --porcelain
if (-not $status) {
    Write-Host "没有需要提交的更改。" -ForegroundColor Yellow
    exit 0
}

git commit -m "update: maltese line pup theme"
git push origin HEAD
Write-Host "推送完成！" -ForegroundColor Green
