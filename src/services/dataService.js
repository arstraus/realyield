/**
 * Unified Data Service
 * 
 * Provides a consistent API for data operations that works across:
 * - Electron (SQLite via IPC)
 * - Web (Supabase)
 * - Fallback (localStorage for demo/offline)
 */

import { supabase, isSupabaseConfigured } from './supabase';

// Environment detection
const isElectron = () => typeof window !== 'undefined' && window.electronAPI !== undefined;
const isWeb = () => !isElectron() && isSupabaseConfigured();
const isFallback = () => !isElectron() && !isSupabaseConfigured();

/**
 * Get current environment mode
 */
export const getEnvironment = () => {
    if (isElectron()) return 'electron';
    if (isWeb()) return 'web';
    return 'fallback';
};

// ==========================================
// SCENARIOS
// ==========================================

/**
 * Get all scenarios for the current user
 */
export const getAllScenarios = async () => {
    if (isElectron()) {
        return window.electronAPI.getAllScenarios();
    }
    
    if (isWeb()) {
        const { data, error } = await supabase
            .from('scenarios')
            .select('*')
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform to match Electron format
        return data.map(row => ({
            ...row,
            data: row.data,
            tags: row.tags || [],
            is_favorite: row.is_favorite
        }));
    }
    
    // Fallback: localStorage
    const stored = localStorage.getItem('realyield_scenarios');
    return stored ? JSON.parse(stored) : [];
};

/**
 * Get a single scenario by ID
 */
export const getScenario = async (id) => {
    if (isElectron()) {
        return window.electronAPI.getScenario(id);
    }
    
    if (isWeb()) {
        const { data, error } = await supabase
            .from('scenarios')
            .select('*')
            .eq('id', id)
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // Fallback
    const scenarios = await getAllScenarios();
    return scenarios.find(s => s.id === id) || null;
};

/**
 * Create a new scenario
 */
export const createScenario = async (scenario) => {
    if (isElectron()) {
        return window.electronAPI.createScenario(scenario);
    }
    
    if (isWeb()) {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
            .from('scenarios')
            .insert({
                user_id: user?.id,
                name: scenario.name || 'Untitled Analysis',
                description: scenario.description || null,
                property_address: scenario.property?.address || null,
                property_city: scenario.property?.city || null,
                property_state: scenario.property?.state || null,
                data: scenario.data,
                tags: scenario.tags || [],
                is_favorite: scenario.is_favorite || false
            })
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // Fallback: localStorage
    const scenarios = await getAllScenarios();
    const newScenario = {
        ...scenario,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };
    scenarios.unshift(newScenario);
    localStorage.setItem('realyield_scenarios', JSON.stringify(scenarios));
    return newScenario;
};

/**
 * Update an existing scenario
 */
export const updateScenario = async (id, scenario) => {
    if (isElectron()) {
        return window.electronAPI.updateScenario(id, scenario);
    }
    
    if (isWeb()) {
        const { data, error } = await supabase
            .from('scenarios')
            .update({
                name: scenario.name,
                description: scenario.description || null,
                property_address: scenario.property?.address || null,
                property_city: scenario.property?.city || null,
                property_state: scenario.property?.state || null,
                data: scenario.data,
                tags: scenario.tags || [],
                is_favorite: scenario.is_favorite || false,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // Fallback
    const scenarios = await getAllScenarios();
    const index = scenarios.findIndex(s => s.id === id);
    if (index !== -1) {
        scenarios[index] = { 
            ...scenarios[index], 
            ...scenario, 
            updated_at: new Date().toISOString() 
        };
        localStorage.setItem('realyield_scenarios', JSON.stringify(scenarios));
        return scenarios[index];
    }
    throw new Error('Scenario not found');
};

/**
 * Delete a scenario
 */
export const deleteScenario = async (id) => {
    if (isElectron()) {
        return window.electronAPI.deleteScenario(id);
    }
    
    if (isWeb()) {
        const { error } = await supabase
            .from('scenarios')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return { success: true };
    }
    
    // Fallback
    const scenarios = await getAllScenarios();
    const filtered = scenarios.filter(s => s.id !== id);
    localStorage.setItem('realyield_scenarios', JSON.stringify(filtered));
    return { success: true };
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (id) => {
    if (isElectron()) {
        return window.electronAPI.toggleFavorite(id);
    }
    
    if (isWeb()) {
        // First get current state
        const scenario = await getScenario(id);
        
        const { data, error } = await supabase
            .from('scenarios')
            .update({ 
                is_favorite: !scenario.is_favorite,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();
        
        if (error) throw error;
        return data;
    }
    
    // Fallback
    const scenarios = await getAllScenarios();
    const scenario = scenarios.find(s => s.id === id);
    if (scenario) {
        scenario.is_favorite = !scenario.is_favorite;
        localStorage.setItem('realyield_scenarios', JSON.stringify(scenarios));
        return scenario;
    }
    throw new Error('Scenario not found');
};

/**
 * Search scenarios by name or address
 */
export const searchScenarios = async (query) => {
    if (isElectron()) {
        return window.electronAPI.searchScenarios(query);
    }
    
    if (isWeb()) {
        const { data, error } = await supabase
            .from('scenarios')
            .select('*')
            .or(`name.ilike.%${query}%,property_address.ilike.%${query}%,property_city.ilike.%${query}%`)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
    
    // Fallback
    const scenarios = await getAllScenarios();
    const lowerQuery = query.toLowerCase();
    return scenarios.filter(s => 
        s.name?.toLowerCase().includes(lowerQuery) ||
        s.property_address?.toLowerCase().includes(lowerQuery) ||
        s.property_city?.toLowerCase().includes(lowerQuery)
    );
};

/**
 * Get favorite scenarios
 */
export const getFavoriteScenarios = async () => {
    if (isElectron()) {
        return window.electronAPI.getFavoriteScenarios();
    }
    
    if (isWeb()) {
        const { data, error } = await supabase
            .from('scenarios')
            .select('*')
            .eq('is_favorite', true)
            .order('updated_at', { ascending: false });
        
        if (error) throw error;
        return data;
    }
    
    // Fallback
    const scenarios = await getAllScenarios();
    return scenarios.filter(s => s.is_favorite);
};

/**
 * Get recent scenarios
 */
export const getRecentScenarios = async (limit = 10) => {
    if (isElectron()) {
        return window.electronAPI.getRecentScenarios(limit);
    }
    
    if (isWeb()) {
        const { data, error } = await supabase
            .from('scenarios')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(limit);
        
        if (error) throw error;
        return data;
    }
    
    // Fallback
    const scenarios = await getAllScenarios();
    return scenarios.slice(0, limit);
};

/**
 * Duplicate a scenario
 */
export const duplicateScenario = async (id) => {
    if (isElectron()) {
        return window.electronAPI.duplicateScenario(id);
    }
    
    const original = await getScenario(id);
    if (!original) throw new Error('Scenario not found');
    
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
};

// ==========================================
// FILE OPERATIONS (Electron only, Web uses download/upload)
// ==========================================

/**
 * Export scenario to file
 */
export const exportToFile = async (content, suggestedName) => {
    if (isElectron()) {
        return window.electronAPI.saveScenarioToDisk(content, suggestedName);
    }
    
    // Web: trigger browser download
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = suggestedName 
        ? `${suggestedName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
        : 'scenario.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return null;
};

/**
 * Import scenario from file
 */
export const importFromFile = async () => {
    if (isElectron()) {
        return window.electronAPI.loadScenarioFromDisk();
    }
    
    // Web: use file input
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = e.target.files?.[0];
            if (!file) {
                resolve(null);
                return;
            }
            
            try {
                const text = await file.text();
                const data = JSON.parse(text);
                resolve({ data, filePath: file.name });
            } catch (err) {
                console.error('Failed to parse file:', err);
                resolve(null);
            }
        };
        input.click();
    });
};

/**
 * Save to specific file path (Electron only)
 */
export const saveToPath = async (filePath, content) => {
    if (isElectron()) {
        return window.electronAPI.saveScenarioToPath(filePath, content);
    }
    // Web: not supported, use exportToFile instead
    return exportToFile(content, 'scenario');
};



