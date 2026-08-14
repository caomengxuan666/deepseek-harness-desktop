# Agent Note: Electron shell reuses the local Web runtime

Status: implemented

English | [中文](2026-08-14-electron-desktop-shell.zh.md)

## Problem

DeepSeek Harness ships a browser UI and a local `dsh web` host, but it has no native desktop entry point. A desktop client needs to own a window and the local host process without creating a second UI protocol or bypassing the existing loopback security rules.

## Decision

The first desktop client is an Electron shell under `apps/desktop`. Its main process starts the built `apps/cli/lib/bin.js web` entry, waits for the host's `dsh web: http://...` readiness line, and loads that origin in one `BrowserWindow`. Window navigation stays on the host origin; external links open in the system browser. The renderer has context isolation, no Node integration, and Chromium sandboxing enabled.

The shell owns shutdown: closing the last window quits Electron, sends `SIGTERM` to the child, and force-kills it after a bounded timeout. The CLI and Web application remain the source of the product behavior, API protocol, session persistence, and host capabilities.

The shell removes the Windows application menu, keeps the product title, and reuses the Web favicon for the window and taskbar identity. Model configuration remains in the shared Web settings: the installed `llm-pi-ai` adapter exposes OpenAI Responses, OpenAI Chat Completions, and custom OpenAI-compatible routes, so the desktop entry point does not require DeepSeek credentials.

The current target is a repository development MVP. `desktop:build` builds the existing Host and Client artifacts, builds `apps/web`, and compiles the shell. Installer packaging, code signing, automatic updates, and a bundled runtime are separate decisions.

## Alternatives considered

- **Tauri** — rejected for the first shell because the existing runtime is Node-based and the documented desktop direction already describes Electron loading the Web dist and using an IPC bridge. Tauri remains viable when package size and a Rust host justify a second integration layer.
- **Copy the Web UI into a native renderer** — rejected because it would duplicate the client protocol and make the browser and desktop surfaces diverge.
- **Run only a browser window** — rejected because the desktop entry point must own the local `dsh web` process and clean it up when the application exits.
- **Bundle the complete Harness immediately** — rejected for the MVP because it would combine desktop lifecycle work with runtime packaging, module fallback, native dependencies, signing, and update delivery before the window path is proven.

## Consequences

- The desktop MVP uses the same Web behavior and local API as the browser path, so feature work does not need a second client implementation.
- A built repository is required: the shell currently resolves the CLI and frontend artifacts from the checkout. It is not yet a distributable installer.
- Electron adds a native multi-process runtime and a large dependency to the workspace. The shell must keep the renderer unprivileged and keep host process lifetime under explicit supervision.
- The next release decision is runtime packaging: either ship the CLI and its dependency closure beside Electron or define an installed-runtime contract before adding platform installers.
