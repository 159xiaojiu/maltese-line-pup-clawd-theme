# 生成启动快捷方式（指向 .bat，比 VBS 更稳定）
$ErrorActionPreference = "Stop"

$ThemeRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ClawdRoot = "C:\Users\23986\Desktop\clawd-on-desk"
$Bat = Join-Path $ThemeRoot "launcher\Start-Clawd.bat"
$Icon = Join-Path $ClawdRoot "assets\icon.ico"
$Desktop = [Environment]::GetFolderPath("Desktop")

if (-not (Test-Path $Bat)) { throw "Missing $Bat" }
if (-not (Test-Path $Icon)) { throw "Missing icon: $Icon" }

$shell = New-Object -ComObject WScript.Shell

function New-ClawdShortcut($Path) {
    $dir = Split-Path -Parent $Path
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    if (Test-Path $Path) { Remove-Item -Force $Path }
    $lnk = $shell.CreateShortcut($Path)
    $lnk.TargetPath = $Bat
    $lnk.WorkingDirectory = $ThemeRoot
    $lnk.IconLocation = "$Icon,0"
    $lnk.Description = "Start Clawd desktop pet"
    $lnk.Save()
    Write-Host "OK $Path"
}

New-ClawdShortcut (Join-Path $ThemeRoot "启动线条小狗桌宠.lnk")
New-ClawdShortcut (Join-Path $Desktop "启动线条小狗桌宠.lnk")
if (Test-Path $ClawdRoot) {
    New-ClawdShortcut (Join-Path $ClawdRoot "启动线条小狗桌宠.lnk")
}

Write-Host "Done."
