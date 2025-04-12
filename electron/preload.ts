import { contextBridge, ipcRenderer } from 'electron'

class PreloadScript {
    public platform: string;
  
    constructor() {
      this.platform = process.platform;
    }
  
    // Expose platform to the renderer process
    public exposePlatform(): void {
      window.electron = {
        platform: this.platform
      };
    }
  
    // Initialize preload script
    public init(): void {
      this.exposePlatform();
    }
  }
  
  // Instantiate and initialize the PreloadScript class
  const preloadScript = new PreloadScript();
  preloadScript.init();

contextBridge.exposeInMainWorld('electron', {
  onOpenExportDialog: (callback: () => void) => {
    ipcRenderer.on('open-export-dialog', callback)
    return () => ipcRenderer.removeListener('open-export-dialog', callback)
  }
})
