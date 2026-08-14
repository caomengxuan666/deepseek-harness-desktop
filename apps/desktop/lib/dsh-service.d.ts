export function resolveDshEntry(): any;
export function unpackedPath(path: any): any;
export function extractReadyUrl(output: any): string | undefined;
export function resolveWindowsPickerPatch(): string;
export function resolveWinuxshPatch(): string;
export function buildDshArgs(entry: any, { platform, windowsPickerPatch, winuxshPatch, }?: {
    platform?: NodeJS.Platform | undefined;
    windowsPickerPatch?: string | undefined;
    winuxshPatch?: string | undefined;
}): any[];
export function startDshService({ electronExecutable, entry, environment, platform, timeoutMs, }?: {
    entry?: any;
    environment?: NodeJS.ProcessEnv | undefined;
    platform?: NodeJS.Platform | undefined;
    timeoutMs?: number | undefined;
}): {
    child: import("child_process").ChildProcessByStdio<null, import("stream").Readable, import("stream").Readable>;
    ready: Promise<any>;
    stop: () => void;
};
export function dshEntryUrl(): string;
//# sourceMappingURL=dsh-service.d.ts.map