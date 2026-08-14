export function createWindowOptions(): {
    width: number;
    height: number;
    minWidth: number;
    minHeight: number;
    show: boolean;
    title: string;
    backgroundColor: string;
    icon: string;
    frame: boolean;
    roundedCorners: boolean;
    thickFrame: boolean;
    hasShadow: boolean;
    titleBarStyle: string;
    titleBarOverlay: {
        color: string;
        symbolColor: string;
        height: number;
    };
    autoHideMenuBar: boolean;
    webPreferences: {
        contextIsolation: boolean;
        nodeIntegration: boolean;
        sandbox: boolean;
    };
};
//# sourceMappingURL=window-options.d.ts.map