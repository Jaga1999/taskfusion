import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
// Convert the `import.meta.url` to `__dirname`
const __dirname = path.dirname(fileURLToPath(import.meta.url));
let mainWindow = null;
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
// Create the Electron window
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Ensure it's pointing to preload.js
            nodeIntegration: false,
            contextIsolation: true,
        }
    });
    mainWindow.loadURL('http://localhost:3000'); // Load the Next.js app
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
};
// Electron app ready event
app.whenReady().then(async () => {
    const isRunning = await isNextJsRunning(); // Check if Next.js is running
    if (isRunning) {
        createWindow(); // Open window if Next.js is running
    }
    else {
        console.log('Next.js server is not running. Please start the server.');
    }
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
// Quit app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
