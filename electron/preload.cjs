const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ==========================================
    // Database Operations (SQLite)
    // ==========================================
    
    // Get all saved scenarios
    getAllScenarios: () => ipcRenderer.invoke('db-get-all-scenarios'),
    
    // Get a single scenario by ID
    getScenario: (id) => ipcRenderer.invoke('db-get-scenario', id),
    
    // Create a new scenario in the database
    createScenario: (scenario) => ipcRenderer.invoke('db-create-scenario', scenario),
    
    // Update an existing scenario
    updateScenario: (id, scenario) => ipcRenderer.invoke('db-update-scenario', id, scenario),
    
    // Delete a scenario
    deleteScenario: (id) => ipcRenderer.invoke('db-delete-scenario', id),
    
    // Toggle favorite status
    toggleFavorite: (id) => ipcRenderer.invoke('db-toggle-favorite', id),
    
    // Search scenarios
    searchScenarios: (query) => ipcRenderer.invoke('db-search-scenarios', query),
    
    // Get recent scenarios
    getRecentScenarios: (limit) => ipcRenderer.invoke('db-get-recent-scenarios', limit),
    
    // Get favorite scenarios
    getFavoriteScenarios: () => ipcRenderer.invoke('db-get-favorite-scenarios'),
    
    // Duplicate a scenario
    duplicateScenario: (id) => ipcRenderer.invoke('db-duplicate-scenario', id),

    // ==========================================
    // File Operations (Import/Export)
    // ==========================================
    
    // Export scenario to external JSON file
    saveScenarioToDisk: (content, suggestedName) => 
        ipcRenderer.invoke('save-scenario-to-disk', content, suggestedName),
    
    // Import scenario from external JSON file
    loadScenarioFromDisk: () => ipcRenderer.invoke('load-scenario-from-disk'),
    
    // Quick save to an existing file path
    saveScenarioToPath: (filePath, content) => 
        ipcRenderer.invoke('save-scenario-to-path', filePath, content),
});
