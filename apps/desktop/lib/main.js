// @ts-nocheck
import { app, BrowserWindow, dialog, Menu, shell } from 'electron';
import { spawn } from 'node:child_process';
import { startDshService, resolveDshEntry } from './dsh-service.js';
import { createWindowOptions } from './window-options.js';
const APP_NAME = 'DeepSeek Harness';
let mainWindow;
let service;
let serviceUrl;
let overlayThemeTimer;
app.setName(APP_NAME);
function createWindow(url) {
    if (process.platform === 'win32')
        Menu.setApplicationMenu(null);
    mainWindow = new BrowserWindow(createWindowOptions());
    if (process.platform === 'win32') {
        mainWindow.setMenu(null);
        mainWindow.setMenuBarVisibility(false);
    }
    mainWindow.webContents.setWindowOpenHandler(({ url: externalUrl }) => {
        void shell.openExternal(externalUrl);
        return { action: 'deny' };
    });
    mainWindow.webContents.on('will-navigate', (event, nextUrl) => {
        const currentUrl = mainWindow?.webContents.getURL();
        if (currentUrl && new URL(nextUrl).origin !== new URL(currentUrl).origin) {
            event.preventDefault();
            void shell.openExternal(nextUrl);
        }
    });
    mainWindow.once('ready-to-show', () => mainWindow?.show());
    mainWindow.webContents.on('did-finish-load', () => {
        void syncTitleBarOverlay();
        if (overlayThemeTimer)
            clearInterval(overlayThemeTimer);
        overlayThemeTimer = setInterval(() => void syncTitleBarOverlay(), 750);
    });
    mainWindow.on('closed', () => {
        if (overlayThemeTimer)
            clearInterval(overlayThemeTimer);
        overlayThemeTimer = undefined;
        mainWindow = undefined;
    });
    void mainWindow.loadURL(url);
}
async function syncTitleBarOverlay() {
    if (process.platform === 'darwin' || !mainWindow || mainWindow.isDestroyed())
        return;
    let dark = false;
    try {
        dark = await mainWindow.webContents.executeJavaScript("document.body?.hasAttribute('data-ds-dark-theme') || document.documentElement?.style.colorScheme === 'dark'", true);
    }
    catch {
        return;
    }
    mainWindow.setTitleBarOverlay({
        color: dark ? '#171a1e' : '#f5f7fb',
        symbolColor: dark ? '#e7eef1' : '#34434d',
        height: 36,
    });
}
function installWinuxshProfile() {
    if (process.env.DSH_DESKTOP_SKIP_WINUXSH_INSTALL === '1')
        return Promise.resolve();
    const child = spawn(process.execPath, [
        resolveDshEntry(),
        'plugin',
        '--profile',
        'web',
        'add',
        '@cmx666/dsh-winuxsh-local@^0.1.0-rc.6',
        '@cmx666/dsh-winuxsh-sandbox@^0.1.0-rc.6',
    ], {
        env: { ...process.env, ELECTRON_RUN_AS_NODE: '1', DSH_DESKTOP: '1' },
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
    });
    return new Promise((resolve, reject) => {
        let output = '';
        child.stdout?.on('data', chunk => { output += chunk.toString(); });
        child.stderr?.on('data', chunk => { output += chunk.toString(); });
        child.once('error', reject);
        child.once('exit', code => code === 0
            ? resolve()
            : reject(new Error(`Winuxsh profile installation failed (exit=${String(code)}).\n${output}`)));
    });
}
async function launch() {
    await installWinuxshProfile();
    service = startDshService({
        electronExecutable: process.execPath,
        environment: {
            ...process.env,
            NODE_OPTIONS: '',
            DSH_DESKTOP: '1',
        },
    });
    serviceUrl = await service.ready;
    createWindow(serviceUrl);
}
async function stopService() {
    service?.stop();
    service = undefined;
}
const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) {
    app.quit();
}
else {
    app.on('second-instance', () => {
        if (!mainWindow)
            return;
        if (mainWindow.isMinimized())
            mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
    });
    app.whenReady().then(async () => {
        try {
            await launch();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            await dialog.showMessageBox({
                type: 'error',
                title: `${APP_NAME} failed to start`,
                message: 'DeepSeek Harness could not start.',
                detail: message,
            });
            await stopService();
            app.quit();
        }
    });
}
app.on('activate', () => {
    if (!mainWindow && serviceUrl)
        createWindow(serviceUrl);
});
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        app.quit();
});
app.on('before-quit', () => {
    void stopService();
});
//# sourceMappingURL=main.js.map