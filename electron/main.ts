import { app, BrowserWindow, Menu, ipcMain, dialog, Tray, globalShortcut, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// Function to check if Next.js server is running
const isNextJsRunning = async (): Promise<boolean> => {
  try {
    await axios.get('http://localhost:3000'); // Try to access Next.js
    return true;
  } catch (err) {
    console.error('Next.js server is not running:', err);
    return false;
  }
};

const createTray = () => {
  const icon = nativeImage.createFromPath(path.join(process.cwd(), 'public', 'window.svg'));
  tray = new Tray(icon);

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show TaskFusion',
      click: () => mainWindow?.show()
    },
    {
      label: 'Start Timer',
      click: () => mainWindow?.webContents.send('start-timer')
    },
    {
      label: 'Export Tasks...',
      click: () => mainWindow?.webContents.send('open-export-dialog')
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => app.quit()
    }
  ]);

  tray.setToolTip('TaskFusion');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
    }
  });
};

const registerShortcuts = () => {
  // Quick add task - Cmd/Ctrl+Shift+A
  globalShortcut.register('CommandOrControl+Shift+A', () => {
    mainWindow?.webContents.send('quick-add-task');
  });

  // Toggle timer - Cmd/Ctrl+Shift+T
  globalShortcut.register('CommandOrControl+Shift+T', () => {
    mainWindow?.webContents.send('toggle-timer');
  });

  // Global shortcut to toggle window visibility
  globalShortcut.register('Alt+Shift+T', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });

  // Global shortcut to start/pause timer
  globalShortcut.register('Alt+Shift+P', () => {
    mainWindow?.webContents.send('toggle-timer');
  });
};

// Create application menu
const createMenu = () => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Quick Add Task',
          accelerator: 'CmdOrCtrl+Shift+A',
          click: () => {
            mainWindow?.webContents.send('quick-add-task');
          }
        },
        {
          label: 'Export Tasks...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            mainWindow?.webContents.send('open-export-dialog');
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Timer',
      submenu: [
        {
          label: 'Toggle Timer',
          accelerator: 'CmdOrCtrl+Shift+T',
          click: () => {
            mainWindow?.webContents.send('toggle-timer');
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};

// Create the Electron window
const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Load the default URL
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000/tasks')
  } else {
    mainWindow.loadURL(`file://${path.join(__dirname, '../out/index.html')}#/tasks`)
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

// Electron app ready event
app.whenReady().then(async () => {
  const isRunning = await isNextJsRunning(); // Check if Next.js is running
  if (isRunning) {
    createWindow(); // Open window if Next.js is running
    createMenu(); // Create application menu
    createTray(); // Create tray icon
    registerShortcuts(); // Register global shortcuts
  } else {
    console.log('Next.js server is not running. Please start the server.');
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      createMenu();
    }
  });
});

// Cleanup when quitting
app.on('before-quit', () => {
  app.isQuitting = true;
  globalShortcut.unregisterAll();
});

// Quit app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
