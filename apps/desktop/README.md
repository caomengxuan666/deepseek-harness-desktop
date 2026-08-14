# DeepSeek Harness Desktop

The first desktop shell for DeepSeek Harness. Electron owns one native window and one local `dsh web` process; the existing Web application remains responsible for the interface and API protocol.

## Development

Build the Host, Client, and Web artifacts, compile the shell, then launch Electron from the repository root:

```sh
npm run desktop:dev
```

The shell expects `apps/cli/lib/bin.js` and `apps/web/dist` to exist. `DSH_DESKTOP_CLI` can point at another built CLI entry, and `DSH_DESKTOP_NODE` can select the Node executable used for the child process.

## Model providers

The desktop shell uses the same Web settings as the browser client. Open **Settings → Models** to add OpenAI, Anthropic, or a custom provider; the `llm-pi-ai` adapter supports OpenAI Responses, OpenAI Chat Completions, and OpenAI-compatible gateways. The desktop shell does not require DeepSeek credentials.

This is a development MVP. Installer packaging, code signing, automatic updates, and a bundled runtime are separate release work.
