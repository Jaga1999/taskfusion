import { contextBridge, ipcRenderer } from 'electron';
class PreloadScript {
    constructor() {
        this.platform = process.platform;
    }
    init() {
        this.exposeAPI();
    }
    exposeAPI() {
        contextBridge.exposeInMainWorld('electron', {
            platform: this.platform,
            onOpenExportDialog: (callback) => {
                ipcRenderer.on('open-export-dialog', callback);
                return () => ipcRenderer.removeListener('open-export-dialog', callback);
            },
            onStartTimer: (callback) => {
                ipcRenderer.on('start-timer', callback);
                return () => ipcRenderer.removeListener('start-timer', callback);
            },
            onToggleTimer: (callback) => {
                ipcRenderer.on('toggle-timer', callback);
                return () => ipcRenderer.removeListener('toggle-timer', callback);
            }
        });
    }
}
// Initialize the preload script
const preloadScript = new PreloadScript();
preloadScript.init();
