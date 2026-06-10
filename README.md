# 线条小狗 · 小白 — Clawd 桌宠主题

线条小狗 Maltese 风格桌宠主题，适配 [Clawd on Desk](https://github.com/rullerzhou-afk/clawd-on-desk)，支持 Cursor Agent 状态联动。

当前版本：**v3.4.2**（透明底多形态 GIF/PNG）

## 功能

连接 Cursor Agent 后，桌宠会随 AI 工作状态切换表情：

| Cursor 中的状态 | 桌宠表现 |
|----------------|----------|
| 发出指令 | 思考中 |
| 运行工具 / 写代码 | 工作中（并发越多越「忙」） |
| 子任务 / 子代理 | 杂耍 / 更忙 |
| 出错 | 沮丧 |
| 任务完成 | 开心（多种随机形态） |
| 需要确认权限 | 通知 |
| 长时间无鼠标操作 | 睡觉 |
| 双击桌宠 | 庆祝动画 |

未连接 Cursor 时，仍可作为普通桌宠使用：待机、双击互动、鼠标闲置后睡觉。

同一逻辑状态包含多种随机形态（待机、开心、工作等均有多个变体）。

## 快速开始

### 1. 安装 Clawd on Desk

从 [Clawd Releases](https://github.com/rullerzhou-afk/clawd-on-desk/releases) 下载并安装。

### 2. 安装本主题

```powershell
git clone https://github.com/159xiaojiu/maltese-line-pup-clawd-theme.git
cd maltese-line-pup-clawd-theme
.\install.ps1
```

或在本仓库目录直接运行 `install.ps1`。

### 3. 启用主题

打开 Clawd → **设置 → 主题** → 选择 **「线条小狗 · 小白」**。

### 4. 一键启动（Windows）

双击仓库根目录的 **`【双击我启动桌宠】.bat`**，启动 Clawd 并加载主题。

### 5. 连接 Cursor（可选）

Clawd 启动后会自动注册 Cursor Agent Hooks，桌宠跟随 Agent 工作状态变化。

## 主题结构

```
maltese-line-pup-theme/
├── theme.json           # 主题配置
├── assets/              # 透明底动图与静态图
├── launcher/            # 启动脚本
├── install.ps1          # 安装到 Clawd 主题目录
└── scripts/             # 素材构建与校验工具
```

## 校验主题

```powershell
node path\to\clawd-on-desk\scripts\validate-theme.js .
```

## 版权说明

贴图版权归 **Moonlab Studio（MALTESE）** 所有。本仓库仅供个人学习、本地桌宠使用；请勿商用或二次分发贴图文件。
