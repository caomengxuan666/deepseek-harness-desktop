# DeepSeek Harness Desktop

DeepSeek Harness 的首个桌面壳。Electron 管理一个原生窗口和一个本地 `dsh web` 子进程；现有 Web 应用继续负责界面与 API 协议。

## 开发

从仓库根目录构建 Host、Client、Web 产物，编译桌面壳，然后启动 Electron：

```sh
npm run desktop:dev
```

桌面壳要求 `apps/cli/lib/bin.js` 与 `apps/web/dist` 已存在。`DSH_DESKTOP_CLI` 可指定其他已构建的 CLI 入口，`DSH_DESKTOP_NODE` 可指定子进程使用的 Node 可执行文件。

## 模型提供方

桌面壳使用与浏览器客户端相同的 Web 设置。打开“设置 → 模型”即可添加 OpenAI、Anthropic 或自定义提供方；`llm-pi-ai` 适配器支持 OpenAI Responses、OpenAI Chat Completions 和 OpenAI 兼容网关。桌面壳不要求 DeepSeek 凭据。

当前版本是开发 MVP；安装包、代码签名、自动更新和内置运行时属于后续发布工作。
