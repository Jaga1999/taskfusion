import { contextBridge, ipcRenderer } from 'electron'

interface ElectronAPI {
  platform: string;
  onOpenExportDialog: (callback: () => void) => () => void;
  onStartTimer: (callback: () => void) => () => void;
  onToggleTimer: (callback: () => void) => () => void;
  onQuickAddTask: (callback: () => void) => () => void;
  onToggleWindow: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

class PreloadScript {
  private platform: string;

  constructor() {
    this.platform = process.platform;
  }

  public init(): void {
    this.exposeAPI();
  }

  private exposeAPI(): void {
    contextBridge.exposeInMainWorld('electron', {
      platform: this.platform,
      onOpenExportDialog: (callback: () => void) => {
        ipcRenderer.on('open-export-dialog', callback);
        return () => ipcRenderer.removeListener('open-export-dialog', callback);
      },
      onStartTimer: (callback: () => void) => {
        ipcRenderer.on('start-timer', callback);
        return () => ipcRenderer.removeListener('start-timer', callback);
      },
      onToggleTimer: (callback: () => void) => {
        ipcRenderer.on('toggle-timer', callback);
        return () => ipcRenderer.removeListener('toggle-timer', callback);
      },
      onQuickAddTask: (callback: () => void) => {
        ipcRenderer.on('quick-add-task', callback);
        return () => ipcRenderer.removeListener('quick-add-task', callback);
      },
      onToggleWindow: (callback: () => void) => {
        ipcRenderer.on('toggle-window', callback);
        return () => ipcRenderer.removeListener('toggle-window', callback);
      }
    });
  }
}

// Initialize the preload script
const preloadScript = new PreloadScript();
preloadScript.init();
