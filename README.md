# 线条小狗 · 小白 — Clawd 桌宠主题

> 使用 **Moonlab Studio 线条小狗 Maltese** 官方 LINE 贴图预览动图 + Tenor 二创 GIF 组装的桌宠主题，适配 [Clawd on Desk](https://github.com/rullerzhou-afk/clawd-on-desk) 与 Cursor Agent 状态联动。

## 当前版本（v3.0）— 多形态

同一状态会**随机切换**不同表情（Clawd 内置机制），不再只有一种开心脸。

| 逻辑状态 | 几种形态 | 举例 |
|----------|----------|------|
| idle 待机 | 3 种 + 4 种随机小动作 | 趴金毛、趴地呼吸、竖拇指；派对帽、抱爱心、探头、送花 |
| thinking 思考 | 3 种 | 捂脸震惊、发呆流口水、躺沙发省略号 |
| working 工作 | 3 档强度 | 双狗忙碌、扑咬玩耍、超忙震惊（AI 并发越多越「忙」） |
| attention 开心 | **8 种** | 抱爱心、举爪跳、派对帽、捧花、贴贴、撒花、跳舞、吐舌 |
| error 出错 | 2 种 | 趴地沮丧、发呆 |
| notification 通知 | 2 种 | 感叹号弹出、举爪跳 |
| sleeping / waking | 各 1~2 种 | 趴地呼吸、竖拇指/招手 |

> 敲键盘「认真工作」动图还在从更多 LINE 套系里找；找到后会替换 `working` 第一档。

## Clawd 桌宠到底能干什么？（功能说明）

**不只是摆设。** 装好 Clawd + 连接 Cursor 后，小白会跟着 AI 的真实工作状态变表情：

| 你在 Cursor 里发生的事 | 小白变成 |
|----------------------|----------|
| 刚发出一条指令 | 思考中 |
| AI 正在跑工具/写代码 | 工作中（并发多会更「忙」） |
| 开了子任务/子代理 | 杂耍/更忙 |
| 跑错了 | 沮丧/出错 |
| 任务完成 | 随机一种开心（8 种里抽） |
| AI 要你点「允许/拒绝」 | 通知警报 |
| 你 60 秒没动鼠标 | 睡觉 |
| 双击小白 | 随机庆祝动画 |

连接方式：Clawd 启动后会自动往 `~/.cursor/hooks.json` 注册 **Cursor Agent Hooks**，不用你手写代码。

如果**不连 Cursor**，小白也能当普通桌宠：待机、双击互动、鼠标久了睡觉——但没有「AI 正在工作」那些状态。

## 项目亮点（作品集向）

- **真实 IP + 多形态**：官方 LINE 贴图风格，开心/待机/工作均有多种变体
- **一键安装**：`install.ps1` 复制到 Clawd 主题目录即可切换

## 版权说明

贴图版权归 **Moonlab Studio（MALTESE）** 所有。本仓库仅供个人学习、本地桌宠使用；**请勿商用或二次分发贴图文件**。上传 GitHub 前请自行确认是否合适。

## 快速开始

### 1. 安装 Clawd on Desk

从 [Clawd Releases](https://github.com/rullerzhou-afk/clawd-on-desk/releases) 下载 Windows 安装包并安装。

### 2. 安装本主题

```powershell
cd "C:\Users\23986\Desktop\maltese-line-pup-theme"
.\install.ps1
```

### 3. 启用主题

打开 Clawd → **设置 → 主题** → 选择 **「线条小狗 · 小白」**。

### 4. 连接 Cursor（可选）

Clawd 支持 Cursor Agent Hook，启动后会自动注册，桌宠会跟随 AI 工作状态变化。

## 主题结构

```
maltese-line-pup-theme/
├── theme.json              # 主题配置
├── assets/
│   ├── maltese-idle-follow.svg   # 待机动画（眼球追踪）
│   ├── maltese-thinking.svg      # AI 思考中
│   ├── maltese-working.svg       # AI 工作中
│   ├── maltese-error.svg         # 出错
│   ├── maltese-happy.svg         # 完成/开心
│   ├── maltese-notification.svg  # 通知
│   ├── maltese-sleeping.svg      # 睡觉
│   └── maltese-waking.svg        # 醒来
├── scripts/generate_assets.py    # SVG 素材生成脚本
└── install.ps1                   # 一键安装
```

## 校验主题

```powershell
node "C:\Users\23986\Desktop\clawd-on-desk\scripts\validate-theme.js" .
```

## 作者

- GitHub: [@159xiaojiu](https://github.com/159xiaojiu)
- 转岗目标：AI 产品经理

## License

原创 SVG 素材 © 159xiaojiu。请勿将本主题用于商业销售或冒充官方周边。
