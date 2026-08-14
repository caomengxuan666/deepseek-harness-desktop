# DeepSeek Harness Desktop

The first desktop shell for DeepSeek Harness. Electron owns one native window and one local `dsh web` process; the existing Web application remains responsible for the interface and API protocol.

## Development

Build the Host, Client, and Web artifacts, compile the shell, then launch Electron from the repository root:

```sh
npm run desktop:dev
```

The shell uses the published `@deepseek-ai/dsh` CLI from `node_modules/@deepseek-ai/dsh/lib/bin.js` by default and automatically applies `config/winuxsh.patch.yml`. `DSH_DESKTOP_CLI` can point at another built CLI entry, `DSH_DESKTOP_WINUXSH_PATCH` can point at another patch overlay, and `DSH_DESKTOP_NODE` can select the Node executable used for the child process.

## Winuxsh

Windows Desktop uses the Winuxsh-backed `tool-bash` provider instead of the PowerShell tool. Install Winuxsh and make `winuxsh.exe` available on `PATH`, or set `winuxshPath`/`pwshPath` in a custom patch overlay. Each model shell call runs as `winuxsh -c <command>` through the DSH subprocess and sandbox services.

The provider packages are installed from npm. For a fresh DSH profile, install them into that profile before starting Desktop:

```sh
pnpm add --dir "$DSH_HOME/profiles/web" @cmx666/dsh-winuxsh-local @cmx666/dsh-winuxsh-sandbox
```

The Desktop patch then enables `winuxsh-sandbox` and `tool-bash`, and disables the PowerShell equivalents.

## Model providers

The desktop shell uses the same Web settings as the browser client. Open **Settings → Models** to add OpenAI, Anthropic, or a custom provider; the `llm-pi-ai` adapter supports OpenAI Responses, OpenAI Chat Completions, and OpenAI-compatible gateways. The desktop shell does not require DeepSeek credentials.

This is a development MVP. Installer packaging, code signing, automatic updates, and a bundled runtime are separate release work.
