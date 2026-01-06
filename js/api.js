/**
 * FlixPicks TV App - API Client
 * Communicates with FlixPicks.net backend
 */

const API = {
    // Base URL for API - detect environment
    BASE_URL: null,
    
    // Request timeout in ms
    TIMEOUT: 15000,
    
    // Session ID for anonymous users
    sessionId: null,

    /**
     * Initialize API client
     */
    init() {
        // Detect environment and set API URL
        const hostname = window.location.hostname;
        if (hostname === 'flixpicks.net' || hostname.endsWith('.flixpicks.net')) {
            // Production - relative path (same domain, no CORS)
            this.BASE_URL = '/api/v1';
        } else {
            // Development or Tizen emulator - use full URL
            this.BASE_URL = 'https://flixpicks.net/api/v1';
        }
        
        this.sessionId = Utils.getSessionId();
        Utils.log('API initialized with session:', this.sessionId);
        Utils.log('API base URL:', this.BASE_URL);
    },

    /**
     * Make API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        
        const config = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }
        
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            throw error;
        }
    },

    // ==========================================
    // CONTENT BROWSING
    // ==========================================

    /**
     * Browse content with filters
     */
    async browse(options = {}) {
        const params = new URLSearchParams({
            type: options.type || 'movie',
            page: options.page || 1,
            per_page: options.perPage || 24,
            sort: options.sort || 'popularity',
            order: options.order || 'desc'
        });
        
        if (options.genre) params.append('genre', options.genre);
        if (options.decade) params.append('decade', options.decade);
        if (options.language) params.append('language', options.language);
        if (options.ratingMin) params.append('rating_min', options.ratingMin);
        if (options.ratingMax) params.append('rating_max', options.ratingMax);
        if (options.provider) params.append('provider', options.provider);
        
        const cacheKey = `browse_${params.toString()}`;
        const cached = Storage.getCached(cacheKey);
        if (cached) return cached;
        
        const result = await this.request(`/browse?${params}`);
        Storage.setCached(cacheKey, result);
        return result;
    },

    /**
     * Get trending content
     */
    async getTrending(options = {}) {
        const params = new URLSearchParams({
            media_type: options.type || 'all',
            window: options.window || 'week',
            country: options.country || 'US'
        });
        
        const cacheKey = `trending_${params.toString()}`;
        const cached = Storage.getCached(cacheKey);
        if (cached) return cached;
        
        const result = await this.request(`/trending?${params}`);
        Storage.setCached(cacheKey, result);
        return result;
    },

    /**
     * Get personalized recommendations
     */
    async getRecommendations(options = {}) {
        const params = new URLSearchParams({
            session_id: this.sessionId,
            type: options.type || 'movie',
            page: options.page || 1,
            per_page: options.perPage || 24
        });
        
        if (options.genre) params.append('genre', options.genre);
        if (options.exclude) params.append('exclude', options.exclude);
        
        return await this.request(`/recommendations?${params}`);
    },

    /**
     * Search content
     */
    async search(query, options = {}) {
        if (!query || query.length < 2) return { results: [], count: 0 };
        
        const params = new URLSearchParams({
            q: query,
            limit: options.limit || 20
        });
        
        return await this.request(`/search?${params}`);
    },

    /**
     * AI-powered search
     */
    async aiSearch(description, options = {}) {
        return await this.request('/ai-search', {
            method: 'POST',
            body: {
                description,
                type: options.type || 'movie',
                mode: options.mode || 'search'
            }
        });
    },

    // ==========================================
    // CONTENT DETAILS
    // ==========================================

    /**
     * Get content details
     */
    async getContent(tmdbId, type = 'movie') {
        const cacheKey = `content_${type}_${tmdbId}`;
        const cached = Storage.getCached(cacheKey);
        if (cached) return cached;
        
        const result = await this.request(`/content/${tmdbId}?type=${type}`);
        Storage.setCached(cacheKey, result);
        return result;
    },

    /**
     * Get streaming providers for content
     */
    async getProviders(tmdbId, type = 'movie', country = 'US') {
        const cacheKey = `providers_${type}_${tmdbId}_${country}`;
        const cached = Storage.getCached(cacheKey);
        if (cached) return cached;
        
        const result = await this.request(`/content/${tmdbId}/providers?type=${type}&country=${country}`);
        Storage.setCached(cacheKey, result);
        return result;
    },

    /**
     * Get extended content info (Wikipedia, OMDB)
     */
    async getExtendedContent(tmdbId, type = 'movie') {
        return await this.request(`/content/${tmdbId}/extended?type=${type}`);
    },

    /**
     * Get TV show seasons
     */
    async getTVSeasons(tvId) {
        const cacheKey = `seasons_${tvId}`;
        const cached = Storage.getCached(cacheKey);
        if (cached) return cached;
        
        const result = await this.request(`/tv/${tvId}/seasons`);
        Storage.setCached(cacheKey, result);
        return result;
    },

    /**
     * Get TV season episodes
     */
    async getTVEpisodes(tvId, seasonNumber) {
        const cacheKey = `episodes_${tvId}_${seasonNumber}`;
        const cached = Storage.getCached(cacheKey);
        if (cached) return cached;
        
        const result = await this.request(`/tv/${tvId}/season/${seasonNumber}`);
        Storage.setCached(cacheKey, result);
        return result;
    },

    /**
     * Get person details
     */
    async getPerson(personId) {
        const cacheKey = `person_${personId}`;
        const cached = Storage.getCached(cacheKey);
        if (cached) return cached;
        
        const result = await this.request(`/person/${personId}`);
        Storage.setCached(cacheKey, result);
        return result;
    },

    // ==========================================
    // GENRES
    // ==========================================

    /**
     * Get genres list
     */
    async getGenres(type = 'movie', includeSubgenres = false) {
        const cacheKey = `genres_${type}_${includeSubgenres}`;
        const cached = Storage.getCached(cacheKey);
        if (cached) return cached;
        
        const params = new URLSearchParams({
            type,
            include_subgenres: includeSubgenres
        });
        
        const result = await this.request(`/genres?${params}`);
        Storage.setCached(cacheKey, result);
        return result;
    },

    // ==========================================
    // USER ACTIONS
    // ==========================================

    /**
     * Record user action (rating, watchlist, etc.)
     */
    async recordAction(contentId, action, options = {}) {
        return await this.request('/action', {
            method: 'POST',
            body: {
                session_id: this.sessionId,
                content_id: contentId,
                content_type: options.contentType || 'movie',
                action,
                rating: options.rating
            }
        });
    },

    /**
     * Get user's watchlist
     */
    async getWatchlist() {
        return await this.request(`/watchlist?session_id=${this.sessionId}`);
    },

    /**
     * Add to watchlist
     */
    async addToWatchlist(contentId, contentType = 'movie') {
        return await this.recordAction(contentId, 'watchlist', { contentType });
    },

    /**
     * Remove from watchlist
     */
    async removeFromWatchlist(contentId, contentType = 'movie') {
        return await this.request(`/watchlist/${contentId}?session_id=${this.sessionId}&content_type=${contentType}`, {
            method: 'DELETE'
        });
    },

    /**
     * Rate content
     * Uses /rate endpoint when authenticated, /action for anonymous (matching web app)
     */
    async rateContent(contentId, rating, contentType = 'movie') {
        // Check if user is authenticated
        const accessToken = Auth.getAccessToken();
        
        if (accessToken) {
            // Use /rate endpoint for authenticated users (matching web app)
            return await this.request('/rate', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                },
                body: {
                    content_id: contentId,
                    content_type: contentType === 'tv' ? 'tv_show' : 'movie',
                    rating: rating
                }
            });
        } else {
            // Use /action endpoint for anonymous users
            return await this.recordAction(contentId, 'rating', { contentType, rating });
        }
    },

    /**
     * Get session ratings
     */
    async getSessionRatings() {
        return await this.request(`/session-ratings?session_id=${this.sessionId}`);
    },

    // ==========================================
    // STATISTICS
    // ==========================================

    /**
     * Get database stats
     */
    async getStats() {
        return await this.request('/stats');
    },

    /**
     * Get random backdrop
     */
    async getRandomBackdrop() {
        return await this.request('/random-backdrop');
    }
};

// Export for use in other modules
window.API = API;

