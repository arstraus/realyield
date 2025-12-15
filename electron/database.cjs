const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

/**
 * Initialize the SQLite database
 */
function initDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'realyield.db');
    console.log('Database path:', dbPath);
    
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL'); // Better performance
    
    // Create tables
    db.exec(`
        CREATE TABLE IF NOT EXISTS scenarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            property_address TEXT,
            property_city TEXT,
            property_state TEXT,
            data TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_favorite INTEGER DEFAULT 0,
            tags TEXT
        );
        
        CREATE INDEX IF NOT EXISTS idx_scenarios_name ON scenarios(name);
        CREATE INDEX IF NOT EXISTS idx_scenarios_updated ON scenarios(updated_at);
        CREATE INDEX IF NOT EXISTS idx_scenarios_favorite ON scenarios(is_favorite);
    `);
    
    console.log('Database initialized successfully');
    return db;
}

/**
 * Get all scenarios with computed metrics summary
 */
function getAllScenarios() {
    const stmt = db.prepare(`
        SELECT 
            id, name, description, property_address, property_city, property_state,
            data, created_at, updated_at, is_favorite, tags
        FROM scenarios 
        ORDER BY updated_at DESC
    `);
    
    const rows = stmt.all();
    return rows.map(row => ({
        ...row,
        data: JSON.parse(row.data),
        tags: row.tags ? JSON.parse(row.tags) : [],
        is_favorite: Boolean(row.is_favorite)
    }));
}

/**
 * Get a single scenario by ID
 */
function getScenario(id) {
    const stmt = db.prepare(`
        SELECT * FROM scenarios WHERE id = ?
    `);
    
    const row = stmt.get(id);
    if (!row) return null;
    
    return {
        ...row,
        data: JSON.parse(row.data),
        tags: row.tags ? JSON.parse(row.tags) : [],
        is_favorite: Boolean(row.is_favorite)
    };
}

/**
 * Create a new scenario
 */
function createScenario(scenario) {
    const stmt = db.prepare(`
        INSERT INTO scenarios (name, description, property_address, property_city, property_state, data, tags, is_favorite)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
        scenario.name || 'Untitled Analysis',
        scenario.description || null,
        scenario.property?.address || null,
        scenario.property?.city || null,
        scenario.property?.state || null,
        JSON.stringify(scenario.data),
        scenario.tags ? JSON.stringify(scenario.tags) : null,
        scenario.is_favorite ? 1 : 0
    );
    
    return {
        id: result.lastInsertRowid,
        ...scenario,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
}

/**
 * Update an existing scenario
 */
function updateScenario(id, scenario) {
    const stmt = db.prepare(`
        UPDATE scenarios 
        SET name = ?, 
            description = ?,
            property_address = ?,
            property_city = ?,
            property_state = ?,
            data = ?, 
            tags = ?,
            is_favorite = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    
    stmt.run(
        scenario.name || 'Untitled Analysis',
        scenario.description || null,
        scenario.property?.address || null,
        scenario.property?.city || null,
        scenario.property?.state || null,
        JSON.stringify(scenario.data),
        scenario.tags ? JSON.stringify(scenario.tags) : null,
        scenario.is_favorite ? 1 : 0,
        id
    );
    
    return getScenario(id);
}

/**
 * Delete a scenario
 */
function deleteScenario(id) {
    const stmt = db.prepare('DELETE FROM scenarios WHERE id = ?');
    const result = stmt.run(id);
    return { success: result.changes > 0 };
}

/**
 * Toggle favorite status
 */
function toggleFavorite(id) {
    const stmt = db.prepare(`
        UPDATE scenarios 
        SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `);
    stmt.run(id);
    return getScenario(id);
}

/**
 * Search scenarios by name or address
 */
function searchScenarios(query) {
    const stmt = db.prepare(`
        SELECT * FROM scenarios 
        WHERE name LIKE ? OR property_address LIKE ? OR property_city LIKE ?
        ORDER BY updated_at DESC
    `);
    
    const searchTerm = `%${query}%`;
    const rows = stmt.all(searchTerm, searchTerm, searchTerm);
    
    return rows.map(row => ({
        ...row,
        data: JSON.parse(row.data),
        tags: row.tags ? JSON.parse(row.tags) : [],
        is_favorite: Boolean(row.is_favorite)
    }));
}

/**
 * Get favorite scenarios
 */
function getFavoriteScenarios() {
    const stmt = db.prepare(`
        SELECT * FROM scenarios 
        WHERE is_favorite = 1
        ORDER BY updated_at DESC
    `);
    
    const rows = stmt.all();
    return rows.map(row => ({
        ...row,
        data: JSON.parse(row.data),
        tags: row.tags ? JSON.parse(row.tags) : [],
        is_favorite: true
    }));
}

/**
 * Get recent scenarios (last 10)
 */
function getRecentScenarios(limit = 10) {
    const stmt = db.prepare(`
        SELECT * FROM scenarios 
        ORDER BY updated_at DESC
        LIMIT ?
    `);
    
    const rows = stmt.all(limit);
    return rows.map(row => ({
        ...row,
        data: JSON.parse(row.data),
        tags: row.tags ? JSON.parse(row.tags) : [],
        is_favorite: Boolean(row.is_favorite)
    }));
}

/**
 * Duplicate a scenario
 */
function duplicateScenario(id) {
    const original = getScenario(id);
    if (!original) return null;
    
    return createScenario({
        name: `${original.name} (Copy)`,
        description: original.description,
        property: {
            address: original.property_address,
            city: original.property_city,
            state: original.property_state
        },
        data: original.data,
        tags: original.tags,
        is_favorite: false
    });
}

/**
 * Close database connection
 */
function closeDatabase() {
    if (db) {
        db.close();
        db = null;
    }
}

module.exports = {
    initDatabase,
    getAllScenarios,
    getScenario,
    createScenario,
    updateScenario,
    deleteScenario,
    toggleFavorite,
    searchScenarios,
    getFavoriteScenarios,
    getRecentScenarios,
    duplicateScenario,
    closeDatabase
};



