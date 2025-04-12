import { app, BrowserWindow, Menu, Tray, globalShortcut, nativeImage } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;
let tray = null;
// Function to check if Next.js server is running
const isNextJsRunning = async () => {
    try {
        await axios.get('http://localhost:3000'); // Try to access Next.js
        return true;
    }
    catch (err) {
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
            click: () => mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show()
        },
        {
            label: 'Start Timer',
            click: () => mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('start-timer')
        },
        {
            label: 'Export Tasks...',
            click: () => mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('open-export-dialog')
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
        if (mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isVisible()) {
            mainWindow.hide();
        }
        else {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
        }
    });
};
const registerShortcuts = () => {
    // Global shortcut to toggle window visibility
    globalShortcut.register('Alt+Shift+T', () => {
        if (mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.isVisible()) {
            mainWindow.hide();
        }
        else {
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.show();
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.focus();
        }
    });
    // Global shortcut to start/pause timer
    globalShortcut.register('Alt+Shift+P', () => {
        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('toggle-timer');
    });
};
// Create application menu
const createMenu = () => {
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'Export Tasks...',
                    accelerator: 'CmdOrCtrl+E',
                    click: () => {
                        mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.webContents.send('open-export-dialog');
                    }
                },
                { type: 'separator' },
                { role: 'quit' }
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
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
        }
    });
    mainWindow.loadURL('http://localhost:3000'); // Load the Next.js app
    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow === null || mainWindow === void 0 ? void 0 : mainWindow.hide();
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
    }
    else {
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
