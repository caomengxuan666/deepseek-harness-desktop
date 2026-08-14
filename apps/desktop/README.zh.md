# DeepSeek Harness Desktop

DeepSeek Harness 的首个桌面壳。Electron 管理一个原生窗口和一个本地 `dsh web` 子进程；现有 Web 应用继续负责界面与 API 协议。

## 开发

从仓库根目录构建 Host、Client、Web 产物，编译桌面壳，然后启动 Electron：

```sh
npm run desktop:dev
```

桌面壳默认使用 `node_modules/@deepseek-ai/dsh/lib/bin.js` 中已发布的 `@deepseek-ai/dsh` CLI，并自动加载 `config/winuxsh.patch.yml`。`DSH_DESKTOP_CLI` 可指定其他已构建的 CLI 入口，`DSH_DESKTOP_WINUXSH_PATCH` 可指定其他 patch 覆盖层，`DSH_DESKTOP_NODE` 可指定子进程使用的 Node 可执行文件。

## Winuxsh

Windows Desktop 使用 Winuxsh 提供的 `tool-bash`，不再使用 PowerShell 工具。请安装 Winuxsh 并将 `winuxsh.exe` 加入 `PATH`，或者在自定义 patch 覆盖层中设置 `winuxshPath`/`pwshPath`。模型的每次 Shell 调用都会通过 DSH subprocess 和 sandbox 服务以 `winuxsh -c <command>` 运行。

Provider 包现在从 npm 安装。对于新的 DSH profile，在启动 Desktop 前执行：

```sh
pnpm add --dir "$DSH_HOME/profiles/web" @cmx666/dsh-winuxsh-local @cmx666/dsh-winuxsh-sandbox
```

Desktop patch 会启用 `winuxsh-sandbox` 和 `tool-bash`，并禁用 PowerShell 对应项。

## 模型提供方

桌面壳使用与浏览器客户端相同的 Web 设置。打开“设置 → 模型”即可添加 OpenAI、Anthropic 或自定义提供方；`llm-pi-ai` 适配器支持 OpenAI Responses、OpenAI Chat Completions 和 OpenAI 兼容网关。桌面壳不要求 DeepSeek 凭据。

当前版本是开发 MVP；安装包、代码签名、自动更新和内置运行时属于后续发布工作。
