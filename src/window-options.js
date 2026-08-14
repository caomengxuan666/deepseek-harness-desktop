import { fileURLToPath } from 'node:url'

const APP_ICON = fileURLToPath(new URL('../assets/icon.png', import.meta.url))

export function createWindowOptions(platform = process.platform) {
  return {
    width: 1440,
    height: 960,
    minWidth: 960,
    minHeight: 640,
    show: false,
    title: 'DeepSeek Harness',
    backgroundColor: '#f5f7fb',
    icon: APP_ICON,
    frame: false,
    roundedCorners: true,
    thickFrame: true,
    hasShadow: true,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#f5f7fb',
      symbolColor: '#34434d',
      height: 36,
    },
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  }
}
