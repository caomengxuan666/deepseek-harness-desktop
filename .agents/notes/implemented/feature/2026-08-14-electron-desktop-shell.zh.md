# Agent Note: Electron 桌面壳复用本地 Web 运行时

Status: implemented

[English](2026-08-14-electron-desktop-shell.md) | 中文

## 问题

DeepSeek Harness 提供浏览器界面和本地 `dsh web` 宿主，但没有原生桌面入口。桌面客户端需要管理一个窗口和本地宿主进程，同时不能创建第二套界面协议，也不能绕过现有的回环安全规则。

## 决策

首个桌面客户端位于 `apps/desktop`，采用 Electron 桌面壳。主进程启动已构建的 `apps/cli/lib/bin.js web` 入口，等待宿主输出 `dsh web: http://...` 就绪行，再把该地址加载到一个 `BrowserWindow` 中。窗口导航保持在宿主源站内，外部链接交给系统浏览器打开。渲染器启用上下文隔离、禁用 Node 集成，并启用 Chromium 沙箱。

桌面壳负责退出流程：最后一个窗口关闭时退出 Electron，向子进程发送 `SIGTERM`，并在有界等待超时后强制结束它。CLI 和 Web 应用继续拥有产品行为、API 协议、会话持久化和宿主能力。

桌面壳移除 Windows 应用菜单，固定产品标题，并复用 Web favicon 作为窗口和任务栏标识。模型配置仍由共享的 Web 设置负责：已安装的 `llm-pi-ai` 适配器提供 OpenAI Responses、OpenAI Chat Completions 和自定义 OpenAI 兼容路由，因此桌面入口不要求 DeepSeek 凭据。

当前目标是仓库开发 MVP。`desktop:build` 会构建现有 Host、Client 产物和 `apps/web`，再编译桌面壳。安装包、代码签名、自动更新和内置运行时属于独立的后续决策。

## 曾考虑的替代方案

- **Tauri** —— 首个桌面壳采用 Electron，因此否决该方案：现有运行时基于 Node，已有桌面方向文档也描述了 Electron 加载 Web dist 并使用 IPC 桥接。等安装体积和 Rust 宿主的收益值得增加第二套集成层时，再评估 Tauri。
- **在原生渲染器中复制 Web 界面** —— 否决，因为这会复制客户端协议，使浏览器和桌面表层逐渐分叉。
- **只打开浏览器窗口** —— 否决，因为桌面入口必须拥有本地 `dsh web` 进程，并在应用退出时清理它。
- **立即内置完整 Harness** —— MVP 阶段否决，因为这会把桌面生命周期与运行时打包、模块回退、原生依赖、签名和更新交付同时绑定，尚未先验证窗口链路。

## 结果

- 桌面 MVP 复用浏览器路径相同的 Web 行为和本地 API，功能开发不需要第二套客户端实现。
- 桌面壳当前要求仓库已经构建完成：它从 checkout 解析 CLI 和前端产物，因此还不是可分发安装包。
- Electron 会向 workspace 增加原生多进程运行时和较大的依赖。桌面壳必须保持渲染器无特权，并明确管理宿主进程生命周期。
- 下一项发布决策是运行时打包：要么把 CLI 及其依赖闭包放在 Electron 旁边交付，要么先定义已安装运行时约定，再添加各平台安装器。
