' 双击「启动线条小狗桌宠」快捷方式 → 运行本脚本
Option Explicit

Dim sh, fso, clawdRoot, nodeModules, msg

clawdRoot = "C:\Users\23986\Desktop\clawd-on-desk"
Set sh = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

If Not fso.FolderExists(clawdRoot) Then
  MsgBox "找不到 Clawd 程序文件夹：" & vbCrLf & clawdRoot & vbCrLf & vbCrLf & "请确认 clawd-on-desk 在桌面上。", 48, "线条小狗桌宠"
  WScript.Quit 1
End If

nodeModules = clawdRoot & "\node_modules"
If Not fso.FolderExists(nodeModules) Then
  MsgBox "Clawd 还没安装依赖。" & vbCrLf & vbCrLf & "请先打开文件夹：" & vbCrLf & clawdRoot & vbCrLf & vbCrLf & "在终端运行：npm install" & vbCrLf & "完成后再双击启动图标。", 48, "线条小狗桌宠"
  WScript.Quit 1
End If

sh.CurrentDirectory = clawdRoot
sh.Run "cmd /c npm start", 0, False

msg = "线条小狗桌宠正在启动！" & vbCrLf & vbCrLf
msg = msg & "① 看桌面是否出现小狗（或默认螃蟹）" & vbCrLf
msg = msg & "② 没有的话，点任务栏右下角 ^ 找托盘图标" & vbCrLf
msg = msg & "③ 右键小狗 →「设置…」→「主题」→ 选「线条小狗 · 小白」" & vbCrLf & vbCrLf
msg = msg & "注意：不要打开 preview.html，那不是桌宠程序。"

MsgBox msg, 64, "线条小狗桌宠 · 已启动"
