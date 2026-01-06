/**
 * FlixPicks TV App - Storage Module
 * Handles local storage for settings, cache, and user data
 */

const Storage = {
    // Storage keys
    KEYS: {
        DEVICES: 'flixpicks_devices',
        ACTIVE_DEVICE: 'flixpicks_active_device',
        SESSION_ID: 'flixpicks_session_id',
        WATCHLIST: 'flixpicks_watchlist',
        RATINGS: 'flixpicks_ratings',
        WATCH_HISTORY: 'flixpicks_watch_history',
        SETTINGS: 'flixpicks_settings',
        BROWSE_FILTERS: 'flixpicks_browse_filters',
        CONTENT_CACHE: 'flixpicks_content_cache',
        LAST_VIEW: 'flixpicks_last_view'
    },

    // Default settings
    DEFAULT_SETTINGS: {
        autoConnect: true,
        defaultMediaType: 'movie',
        defaultSort: 'popularity',
        cacheExpiry: 3600000, // 1 hour in ms
        animationsEnabled: true
    },

    /**
     * Get item from storage
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            return JSON.parse(item);
        } catch (e) {
            console.error('Storage.get error:', e);
            return defaultValue;
        }
    },

    /**
     * Set item in storage
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage.set error:', e);
            return false;
        }
    },

    /**
     * Remove item from storage
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage.remove error:', e);
            return false;
        }
    },

    /**
     * Clear all FlixPicks storage
     */
    clear() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },

    // ==========================================
    // DEVICE MANAGEMENT
    // ==========================================

    /**
     * Get all saved devices
     */
    getDevices() {
        return this.get(this.KEYS.DEVICES, []);
    },

    /**
     * Add or update a device
     */
    saveDevice(device) {
        const devices = this.getDevices();
        const index = devices.findIndex(d => d.id === device.id);
        
        if (index >= 0) {
            devices[index] = { ...devices[index], ...device, updatedAt: Date.now() };
        } else {
            devices.push({
                ...device,
                id: device.id || Utils.generateId(),
                createdAt: Date.now(),
                updatedAt: Date.now()
            });
        }
        
        this.set(this.KEYS.DEVICES, devices);
        return devices;
    },

    /**
     * Remove a device
     */
    removeDevice(deviceId) {
        const devices = this.getDevices().filter(d => d.id !== deviceId);
        this.set(this.KEYS.DEVICES, devices);
        
        // If this was the active device, clear it
        if (this.getActiveDeviceId() === deviceId) {
            this.setActiveDevice(null);
        }
        
        return devices;
    },

    /**
     * Get active device ID
     */
    getActiveDeviceId() {
        return this.get(this.KEYS.ACTIVE_DEVICE, null);
    },

    /**
     * Set active device
     */
    setActiveDevice(deviceId) {
        if (deviceId) {
            this.set(this.KEYS.ACTIVE_DEVICE, deviceId);
        } else {
            this.remove(this.KEYS.ACTIVE_DEVICE);
        }
    },

    /**
     * Get active device details
     */
    getActiveDevice() {
        const deviceId = this.getActiveDeviceId();
        if (!deviceId) return null;
        
        const devices = this.getDevices();
        return devices.find(d => d.id === deviceId) || null;
    },

    // ==========================================
    // WATCHLIST MANAGEMENT
    // ==========================================

    /**
     * Get watchlist
     */
    getWatchlist() {
        return this.get(this.KEYS.WATCHLIST, []);
    },

    /**
     * Add item to watchlist
     */
    addToWatchlist(item) {
        const watchlist = this.getWatchlist();
        const exists = watchlist.find(w => 
            w.tmdb_id === item.tmdb_id && w.media_type === item.media_type
        );
        
        if (!exists) {
            watchlist.unshift({
                tmdb_id: item.tmdb_id,
                media_type: item.media_type || 'movie',
                title: item.title,
                poster_url: item.poster_url || Utils.getPosterUrl(item),
                vote_average: item.vote_average,
                release_date: item.release_date,
                addedAt: Date.now()
            });
            this.set(this.KEYS.WATCHLIST, watchlist);
        }
        
        return watchlist;
    },

    /**
     * Remove item from watchlist
     */
    removeFromWatchlist(tmdbId, mediaType = 'movie') {
        const watchlist = this.getWatchlist().filter(w => 
            !(w.tmdb_id === tmdbId && w.media_type === mediaType)
        );
        this.set(this.KEYS.WATCHLIST, watchlist);
        return watchlist;
    },

    /**
     * Check if item is in watchlist
     */
    isInWatchlist(tmdbId, mediaType = 'movie') {
        const watchlist = this.getWatchlist();
        return watchlist.some(w => 
            w.tmdb_id === tmdbId && w.media_type === mediaType
        );
    },

    // ==========================================
    // RATINGS MANAGEMENT
    // ==========================================

    /**
     * Get all ratings
     */
    getRatings() {
        return this.get(this.KEYS.RATINGS, {});
    },

    /**
     * Set rating for an item
     */
    setRating(tmdbId, rating, mediaType = 'movie') {
        const ratings = this.getRatings();
        const key = `${mediaType}_${tmdbId}`;
        ratings[key] = {
            rating,
            mediaType,
            tmdbId,
            updatedAt: Date.now()
        };
        this.set(this.KEYS.RATINGS, ratings);
        return ratings;
    },

    /**
     * Get rating for an item
     */
    getRating(tmdbId, mediaType = 'movie') {
        const ratings = this.getRatings();
        const key = `${mediaType}_${tmdbId}`;
        return ratings[key]?.rating || null;
    },

    // ==========================================
    // SETTINGS MANAGEMENT
    // ==========================================

    /**
     * Get all settings
     */
    getSettings() {
        return { ...this.DEFAULT_SETTINGS, ...this.get(this.KEYS.SETTINGS, {}) };
    },

    /**
     * Update settings
     */
    updateSettings(updates) {
        const settings = this.getSettings();
        const newSettings = { ...settings, ...updates };
        this.set(this.KEYS.SETTINGS, newSettings);
        return newSettings;
    },

    /**
     * Get a specific setting
     */
    getSetting(key) {
        const settings = this.getSettings();
        return settings[key];
    },

    // ==========================================
    // BROWSE FILTERS
    // ==========================================

    /**
     * Get browse filters
     */
    getBrowseFilters() {
        return this.get(this.KEYS.BROWSE_FILTERS, {
            mediaType: 'movie',
            genre: null,
            sort: 'popularity',
            sortOrder: 'desc',
            page: 1
        });
    },

    /**
     * Save browse filters
     */
    saveBrowseFilters(filters) {
        this.set(this.KEYS.BROWSE_FILTERS, filters);
    },

    // ==========================================
    // CONTENT CACHE
    // ==========================================

    /**
     * Get cached content
     */
    getCached(key) {
        const cache = this.get(this.KEYS.CONTENT_CACHE, {});
        const item = cache[key];
        
        if (!item) return null;
        
        // Check expiry
        const settings = this.getSettings();
        if (Date.now() - item.cachedAt > settings.cacheExpiry) {
            this.removeCached(key);
            return null;
        }
        
        return item.data;
    },

    /**
     * Set cached content
     */
    setCached(key, data) {
        const cache = this.get(this.KEYS.CONTENT_CACHE, {});
        cache[key] = {
            data,
            cachedAt: Date.now()
        };
        
        // Limit cache size (keep last 100 items)
        const keys = Object.keys(cache);
        if (keys.length > 100) {
            const sortedKeys = keys.sort((a, b) => cache[a].cachedAt - cache[b].cachedAt);
            sortedKeys.slice(0, keys.length - 100).forEach(k => delete cache[k]);
        }
        
        this.set(this.KEYS.CONTENT_CACHE, cache);
    },

    /**
     * Remove cached item
     */
    removeCached(key) {
        const cache = this.get(this.KEYS.CONTENT_CACHE, {});
        delete cache[key];
        this.set(this.KEYS.CONTENT_CACHE, cache);
    },

    /**
     * Clear all cache
     */
    clearCache() {
        this.remove(this.KEYS.CONTENT_CACHE);
    },

    // ==========================================
    // LAST VIEW STATE
    // ==========================================

    /**
     * Save last view state
     */
    saveLastView(viewName, state = {}) {
        this.set(this.KEYS.LAST_VIEW, {
            view: viewName,
            state,
            savedAt: Date.now()
        });
    },

    /**
     * Get last view state
     */
    getLastView() {
        return this.get(this.KEYS.LAST_VIEW, { view: 'home', state: {} });
    },

    // ==========================================
    // WATCH HISTORY
    // ==========================================

    /**
     * Get watch history
     */
    getWatchHistory() {
        return this.get(this.KEYS.WATCH_HISTORY, []);
    },

    /**
     * Update watch progress
     */
    updateWatchProgress(item, progress, position = 0) {
        const history = this.getWatchHistory();
        const index = history.findIndex(h => 
            h.tmdb_id === item.tmdb_id && h.media_type === item.media_type
        );
        
        const entry = {
            tmdb_id: item.tmdb_id,
            media_type: item.media_type || 'movie',
            title: item.title,
            poster_url: item.poster_url || Utils.getPosterUrl(item),
            progress: Math.round(progress),
            position,
            season: item.season,
            episode: item.episode,
            updatedAt: Date.now()
        };
        
        if (index >= 0) {
            history[index] = { ...history[index], ...entry };
        } else {
            history.unshift(entry);
        }
        
        // Keep only last 50 items
        if (history.length > 50) {
            history.length = 50;
        }
        
        // Sort by most recent
        history.sort((a, b) => b.updatedAt - a.updatedAt);
        
        this.set(this.KEYS.WATCH_HISTORY, history);
        return history;
    },

    /**
     * Remove from watch history
     */
    removeFromWatchHistory(tmdbId, mediaType = 'movie') {
        const history = this.getWatchHistory().filter(h => 
            !(h.tmdb_id === tmdbId && h.media_type === mediaType)
        );
        this.set(this.KEYS.WATCH_HISTORY, history);
        return history;
    },

    /**
     * Get watch progress for an item
     */
    getWatchProgress(tmdbId, mediaType = 'movie') {
        const history = this.getWatchHistory();
        const item = history.find(h => 
            h.tmdb_id === tmdbId && h.media_type === mediaType
        );
        return item || null;
    }
};

// Export for use in other modules
window.Storage = Storage;

