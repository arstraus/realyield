const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const database = require('./database.cjs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
    app.quit();
}

let mainWindow;

const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // In production, load the index.html. In dev, load localhost.
    if (process.env.ELECTRON_START_URL) {
        mainWindow.loadURL(process.env.ELECTRON_START_URL);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
    }
};

app.on('ready', () => {
    // Initialize SQLite database
    database.initDatabase();
    
    createWindow();

    // ==========================================
    // DATABASE IPC HANDLERS (SQLite)
    // ==========================================
    
    // Get all scenarios
    ipcMain.handle('db-get-all-scenarios', async () => {
        try {
            return database.getAllScenarios();
        } catch (error) {
            console.error('Error getting scenarios:', error);
            throw error;
        }
    });

    // Get single scenario
    ipcMain.handle('db-get-scenario', async (event, id) => {
        try {
            return database.getScenario(id);
        } catch (error) {
            console.error('Error getting scenario:', error);
            throw error;
        }
    });

    // Create scenario
    ipcMain.handle('db-create-scenario', async (event, scenario) => {
        try {
            return database.createScenario(scenario);
        } catch (error) {
            console.error('Error creating scenario:', error);
            throw error;
        }
    });

    // Update scenario
    ipcMain.handle('db-update-scenario', async (event, id, scenario) => {
        try {
            return database.updateScenario(id, scenario);
        } catch (error) {
            console.error('Error updating scenario:', error);
            throw error;
        }
    });

    // Delete scenario
    ipcMain.handle('db-delete-scenario', async (event, id) => {
        try {
            return database.deleteScenario(id);
        } catch (error) {
            console.error('Error deleting scenario:', error);
            throw error;
        }
    });

    // Toggle favorite
    ipcMain.handle('db-toggle-favorite', async (event, id) => {
        try {
            return database.toggleFavorite(id);
        } catch (error) {
            console.error('Error toggling favorite:', error);
            throw error;
        }
    });

    // Search scenarios
    ipcMain.handle('db-search-scenarios', async (event, query) => {
        try {
            return database.searchScenarios(query);
        } catch (error) {
            console.error('Error searching scenarios:', error);
            throw error;
        }
    });

    // Get recent scenarios
    ipcMain.handle('db-get-recent-scenarios', async (event, limit) => {
        try {
            return database.getRecentScenarios(limit);
        } catch (error) {
            console.error('Error getting recent scenarios:', error);
            throw error;
        }
    });

    // Get favorite scenarios
    ipcMain.handle('db-get-favorite-scenarios', async () => {
        try {
            return database.getFavoriteScenarios();
        } catch (error) {
            console.error('Error getting favorite scenarios:', error);
            throw error;
        }
    });

    // Duplicate scenario
    ipcMain.handle('db-duplicate-scenario', async (event, id) => {
        try {
            return database.duplicateScenario(id);
        } catch (error) {
            console.error('Error duplicating scenario:', error);
            throw error;
        }
    });

    // ==========================================
    // FILE DIALOG HANDLERS (Import/Export)
    // ==========================================
    
    // Save scenario to external file (export)
    ipcMain.handle('save-scenario-to-disk', async (event, content, suggestedName) => {
        const defaultName = suggestedName 
            ? suggestedName.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json'
            : 'scenario.json';
            
        const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
            title: 'Export Scenario',
            defaultPath: defaultName,
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });

        if (canceled || !filePath) return null;

        await fs.writeFile(filePath, JSON.stringify(content, null, 2));
        return filePath;
    });

    // Load scenario from external file (import)
    ipcMain.handle('load-scenario-from-disk', async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
            title: 'Import Scenario',
            properties: ['openFile'],
            filters: [{ name: 'JSON Files', extensions: ['json'] }]
        });

        if (canceled || filePaths.length === 0) return null;

        const content = await fs.readFile(filePaths[0], 'utf-8');
        const data = JSON.parse(content);
        
        return {
            data,
            filePath: filePaths[0]
        };
    });

    // Quick save to existing file path
    ipcMain.handle('save-scenario-to-path', async (event, filePath, content) => {
        try {
            await fs.writeFile(filePath, JSON.stringify(content, null, 2));
            return { success: true };
        } catch (error) {
            console.error('Error saving to path:', error);
            throw error;
        }
    });
});

app.on('window-all-closed', () => {
    database.closeDatabase();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Cleanup on quit
app.on('before-quit', () => {
    database.closeDatabase();
});
