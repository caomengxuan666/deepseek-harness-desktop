/**
 * Electron shell for the local DSH Web runtime.
 *
 * The shell owns the desktop window and the lifetime of one built `dsh web`
 * child. The Web application remains the product UI and communicates with
 * the child through its existing loopback API.
 * @module @deepseek-ai/dsh-desktop/main
 */

import { app, BrowserWindow, dialog, Menu, shell } from 'electron'
import { spawn, type ChildProcessByStdio } from 'node:child_process'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import type { Readable } from 'node:stream'
import { fileURLToPath } from 'node:url'

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..')
const DEFAULT_CLI_ENTRY = join(REPOSITORY_ROOT, 'apps', 'cli', 'lib', 'bin.js')
const APP_ICON = join(REPOSITORY_ROOT, 'apps', 'desktop', 'assets', 'icon.png')
const STARTUP_TIMEOUT_MS = 30_000
const SHUTDOWN_TIMEOUT_MS = 5_000

type DshProcess = ChildProcessByStdio<null, Readable, Readable>

let dshProcess: DshProcess | undefined
let stopping = false

function cliEntry(): string {
  const entry = process.env.DSH_DESKTOP_CLI ?? DEFAULT_CLI_ENTRY
  if (!existsSync(entry)) {
    throw new Error(`Desktop CLI entry is missing: ${entry}. Run the repository build first.`)
  }
  return entry
}

function waitForWebUrl(child: DshProcess): Promise<string> {
  return new Promise((resolveUrl, reject) => {
    let output = ''
    let settled = false
    const timeout = setTimeout(() => {
      finish(new Error(`dsh web did not announce a URL within ${STARTUP_TIMEOUT_MS}ms.\n${output}`))
    }, STARTUP_TIMEOUT_MS)

    const finish = (error?: Error, url?: string): void => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      child.stdout.off('data', onStdout)
      child.off('error', onError)
      child.off('exit', onExit)
      if (error !== undefined) reject(error)
      else if (url !== undefined) resolveUrl(url)
      else reject(new Error('dsh web exited before announcing a URL'))
    }

    const onStdout = (chunk: Buffer | string): void => {
      output += chunk.toString()
      const match = output.match(/^dsh web:\s+(https?:\/\/\S+)/m)
      if (match?.[1] !== undefined) finish(undefined, match[1])
    }
    const onError = (error: Error): void => finish(error)
    const onExit = (code: number | null, signal: NodeJS.Signals | null): void => {
      finish(new Error(`dsh web exited before startup (code=${String(code)}, signal=${String(signal)}).\n${output}`))
    }

    child.stdout.on('data', onStdout)
    child.on('error', onError)
    child.on('exit', onExit)
  })
}

function startDsh(): Promise<string> {
  const child = spawn(process.env.DSH_DESKTOP_NODE ?? 'node', [cliEntry(), 'web'], {
    cwd: REPOSITORY_ROOT,
    env: { ...process.env, DSH_DESKTOP: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })
  dshProcess = child
  child.stderr.on('data', chunk => process.stderr.write(`[dsh] ${chunk}`))
  child.stdout.on('data', chunk => process.stdout.write(`[dsh] ${chunk}`))
  return waitForWebUrl(child)
}

async function stopDsh(): Promise<void> {
  const child = dshProcess
  dshProcess = undefined
  if (child === undefined || child.exitCode !== null) return

  await new Promise<void>((resolveStop) => {
    let settled = false
    const finish = (): void => {
      if (settled) return
      settled = true
      clearTimeout(timeout)
      resolveStop()
    }
    const timeout = setTimeout(() => {
      child.kill()
      finish()
    }, SHUTDOWN_TIMEOUT_MS)
    child.once('exit', finish)
    child.kill('SIGTERM')
  })
}

function createWindow(webUrl: string): BrowserWindow {
  const window = new BrowserWindow({
    title: 'DeepSeek Harness',
    width: 1440,
    height: 920,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#101114',
    icon: APP_ICON,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })
  window.webContents.on('page-title-updated', event => event.preventDefault())
  const origin = new URL(webUrl).origin
  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url)
    return { action: 'deny' }
  })
  window.webContents.on('will-navigate', (event, url) => {
    if (new URL(url).origin !== origin) {
      event.preventDefault()
      void shell.openExternal(url)
    }
  })
  void window.loadURL(webUrl)
  window.once('ready-to-show', () => window.show())
  return window
}

async function boot(): Promise<void> {
  await app.whenReady()
  app.setName('DeepSeek Harness')
  app.setAppUserModelId('ai.deepseek.harness')
  if (process.platform !== 'darwin') Menu.setApplicationMenu(null)
  try {
    const webUrl = await startDsh()
    createWindow(webUrl)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    dialog.showErrorBox('DeepSeek Harness Desktop', detail)
    await stopDsh()
    app.quit()
  }
}

app.on('before-quit', (event) => {
  if (stopping) return
  event.preventDefault()
  stopping = true
  void stopDsh().finally(() => app.exit(0))
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) void boot()
})

void boot()
