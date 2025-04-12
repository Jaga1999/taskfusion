// electron.d.ts

export {};  // Ensure the file is treated as a module

declare global {
  interface Window {
    electron: {
      platform: string;
    };
  }
  namespace Electron {
    interface App {
      isQuitting: boolean;
    }
  }
}
