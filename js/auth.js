/**
 * FlixPicks TV App - Authentication Module
 * Handles user authentication using Google OAuth Device Flow
 * Designed for TV/limited input devices
 */

const Auth = {
    // Auth state
    user: null,
    accessToken: null,
    refreshToken: null,
    
    // Device flow state
    deviceFlowPending: false,
    pollInterval: null,
    
    // Google OAuth config (Device Flow for TVs)
    // These would typically come from environment/config
    GOOGLE_CLIENT_ID: '', // Set from config or API
    GOOGLE_CLIENT_SECRET: '', // Set from config or API
    
    // FlixPicks API endpoints
    API_BASE: 'https://flixpicks.net',
    
    // Device flow endpoints
    DEVICE_AUTH_ENDPOINT: 'https://oauth2.googleapis.com/device/code',
    TOKEN_ENDPOINT: 'https://oauth2.googleapis.com/token',
    
    /**
     * Initialize auth module
     */
    async init() {
        Utils.log('Auth: Initializing...');
        
        // Load saved tokens
        this.loadTokens();
        
        // Bind UI events
        this.bindEvents();
        
        // Check if user is logged in
        if (this.accessToken) {
            await this.validateAndRefreshToken();
        }
        
        // Fetch OAuth config from server
        await this.fetchOAuthConfig();
        
        this.updateUI();
        Utils.log('Auth: Initialized');
    },
    
    /**
     * Fetch OAuth configuration from FlixPicks API
     */
    async fetchOAuthConfig() {
        try {
            const response = await fetch(`${this.API_BASE}/api/v1/auth/tv-config`);
            if (response.ok) {
                const config = await response.json();
                this.GOOGLE_CLIENT_ID = config.google_client_id;
                // Note: Client secret should be handled server-side for security
            }
        } catch (error) {
            Utils.log('Auth: Failed to fetch OAuth config:', error);
        }
    },
    
    /**
     * Load tokens from storage
     */
    loadTokens() {
        this.accessToken = Storage.get('access_token');
        this.refreshToken = Storage.get('refresh_token');
        const userData = Storage.get('user_data');
        if (userData) {
            try {
                this.user = JSON.parse(userData);
            } catch (e) {
                this.user = null;
            }
        }
    },
    
    /**
     * Save tokens to storage
     */
    saveTokens() {
        if (this.accessToken) {
            Storage.set('access_token', this.accessToken);
        } else {
            Storage.remove('access_token');
        }
        
        if (this.refreshToken) {
            Storage.set('refresh_token', this.refreshToken);
        } else {
            Storage.remove('refresh_token');
        }
        
        if (this.user) {
            Storage.set('user_data', JSON.stringify(this.user));
        } else {
            Storage.remove('user_data');
        }
    },
    
    /**
     * Bind UI events
     */
    bindEvents() {
        // Sign in button
        document.getElementById('signInBtn')?.addEventListener('click', () => this.startSignIn());
        
        // Sign out button
        document.getElementById('signOutBtn')?.addEventListener('click', () => this.signOut());
        
        // Cancel sign in
        document.getElementById('cancelSignInBtn')?.addEventListener('click', () => this.cancelSignIn());
    },
    
    /**
     * Check if user is signed in
     */
    isSignedIn() {
        return !!(this.accessToken && this.user);
    },
    
    /**
     * Get current user
     */
    getUser() {
        return this.user;
    },
    
    /**
     * Get access token for API calls
     */
    getAccessToken() {
        return this.accessToken;
    },
    
    /**
     * Validate token and refresh if needed
     */
    async validateAndRefreshToken() {
        try {
            const response = await fetch(`${this.API_BASE}/auth/me`, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            
            if (response.ok) {
                const userData = await response.json();
                this.user = userData;
                this.saveTokens();
                return true;
            } else if (response.status === 401 || response.status === 422) {
                // Token expired, try refresh
                return await this.refreshAccessToken();
            }
        } catch (error) {
            Utils.log('Auth: Token validation failed:', error);
        }
        return false;
    },
    
    /**
     * Refresh access token
     */
    async refreshAccessToken() {
        if (!this.refreshToken) return false;
        
        try {
            const response = await fetch(`${this.API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${this.refreshToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.accessToken = data.access_token;
                if (data.refresh_token) {
                    this.refreshToken = data.refresh_token;
                }
                this.saveTokens();
                
                // Re-validate to get user info
                return await this.validateAndRefreshToken();
            }
        } catch (error) {
            Utils.log('Auth: Token refresh failed:', error);
        }
        
        // Refresh failed, clear tokens
        this.signOut();
        return false;
    },
    
    /**
     * Start Google OAuth Device Flow sign-in
     */
    async startSignIn() {
        if (this.deviceFlowPending) return;
        
        Utils.log('Auth: Starting Device Flow sign-in...');
        
        // Show sign-in modal
        this.showSignInModal();
        
        try {
            // Request device code from FlixPicks server
            // The server handles the Google OAuth interaction
            const response = await fetch(`${this.API_BASE}/auth/device/code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    client_type: 'tv_app'
                })
            });
            
            if (!response.ok) {
                throw new Error('Failed to get device code');
            }
            
            const data = await response.json();
            
            // Display the code and URL to user
            this.displayDeviceCode(data);
            
            // Start polling for authorization
            this.deviceFlowPending = true;
            this.startPolling(data.device_code, data.interval || 5);
            
        } catch (error) {
            Utils.log('Auth: Device flow error:', error);
            this.showSignInError('Failed to start sign-in. Please try again.');
        }
    },
    
    /**
     * Display device code to user
     */
    displayDeviceCode(data) {
        const codeDisplay = document.getElementById('deviceCode');
        const urlDisplay = document.getElementById('signInUrl');
        const qrCode = document.getElementById('signInQR');
        
        if (codeDisplay) {
            codeDisplay.textContent = data.user_code;
        }
        
        if (urlDisplay) {
            urlDisplay.textContent = data.verification_uri || 'google.com/device';
            urlDisplay.href = data.verification_uri_complete || data.verification_uri;
        }
        
        // Generate QR code if available
        if (qrCode && data.verification_uri_complete) {
            // Simple QR code using external service
            qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data.verification_uri_complete)}`;
            qrCode.style.display = 'block';
        }
        
        // Update status
        this.updateSignInStatus('waiting', 'Enter the code on your phone or computer');
    },
    
    /**
     * Start polling for authorization
     */
    startPolling(deviceCode, interval) {
        // Clear any existing poll
        this.stopPolling();
        
        const pollFn = async () => {
            try {
                const response = await fetch(`${this.API_BASE}/auth/device/token`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        device_code: deviceCode,
                        client_type: 'tv_app'
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.access_token) {
                    // Success! User authorized
                    this.handleSignInSuccess(data);
                } else if (data.error === 'authorization_pending') {
                    // Still waiting, continue polling
                    Utils.log('Auth: Still waiting for authorization...');
                } else if (data.error === 'slow_down') {
                    // Increase interval
                    this.stopPolling();
                    this.pollInterval = setInterval(pollFn, (interval + 5) * 1000);
                } else if (data.error === 'expired_token') {
                    // Code expired
                    this.showSignInError('Code expired. Please try again.');
                    this.stopPolling();
                } else if (data.error === 'access_denied') {
                    // User denied
                    this.showSignInError('Access denied. Please try again.');
                    this.stopPolling();
                } else {
                    // Unknown error
                    Utils.log('Auth: Poll error:', data);
                }
            } catch (error) {
                Utils.log('Auth: Poll request failed:', error);
            }
        };
        
        // Start polling
        this.pollInterval = setInterval(pollFn, interval * 1000);
        
        // Initial poll after a short delay
        setTimeout(pollFn, 2000);
    },
    
    /**
     * Stop polling
     */
    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        this.deviceFlowPending = false;
    },
    
    /**
     * Handle successful sign-in
     */
    handleSignInSuccess(data) {
        Utils.log('Auth: Sign-in successful!');
        
        this.stopPolling();
        
        // Store tokens
        this.accessToken = data.access_token;
        this.refreshToken = data.refresh_token;
        this.user = data.user;
        this.saveTokens();
        
        // Update UI
        this.updateSignInStatus('success', 'Signed in successfully!');
        
        // Close modal after delay
        setTimeout(() => {
            this.hideSignInModal();
            this.updateUI();
            
            // Sync watchlist and other data
            this.syncUserData();
            
            Utils.showToast(`Welcome, ${this.user.display_name || this.user.email}!`, 'success');
        }, 1500);
    },
    
    /**
     * Cancel sign-in process
     */
    cancelSignIn() {
        this.stopPolling();
        this.hideSignInModal();
    },
    
    /**
     * Sign out user
     */
    signOut() {
        Utils.log('Auth: Signing out...');
        
        // Clear tokens
        this.accessToken = null;
        this.refreshToken = null;
        this.user = null;
        this.saveTokens();
        
        // Update UI
        this.updateUI();
        
        Utils.showToast('Signed out', 'info');
    },
    
    /**
     * Show sign-in modal
     */
    showSignInModal() {
        const modal = document.getElementById('signInModal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('active');
            
            // Focus the cancel button
            const cancelBtn = document.getElementById('cancelSignInBtn');
            if (cancelBtn) {
                Navigation.setFocus(cancelBtn);
            }
        }
    },
    
    /**
     * Hide sign-in modal
     */
    hideSignInModal() {
        const modal = document.getElementById('signInModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('active');
        }
        
        // Reset modal state
        this.updateSignInStatus('idle', '');
    },
    
    /**
     * Update sign-in status display
     */
    updateSignInStatus(status, message) {
        const statusEl = document.getElementById('signInStatus');
        const messageEl = document.getElementById('signInMessage');
        const spinnerEl = document.getElementById('signInSpinner');
        
        if (statusEl) {
            statusEl.className = `sign-in-status status-${status}`;
        }
        
        if (messageEl) {
            messageEl.textContent = message;
        }
        
        if (spinnerEl) {
            spinnerEl.style.display = status === 'waiting' ? 'block' : 'none';
        }
    },
    
    /**
     * Show sign-in error
     */
    showSignInError(message) {
        this.updateSignInStatus('error', message);
        this.deviceFlowPending = false;
    },
    
    /**
     * Update UI based on auth state
     */
    updateUI() {
        const signInBtn = document.getElementById('signInBtn');
        const signOutBtn = document.getElementById('signOutBtn');
        const userInfo = document.getElementById('userInfo');
        const userName = document.getElementById('headerUserName');
        const guestLabel = document.getElementById('guestLabel');
        
        if (this.isSignedIn()) {
            // User is signed in
            if (signInBtn) signInBtn.style.display = 'none';
            if (signOutBtn) signOutBtn.style.display = 'flex';
            if (userInfo) userInfo.style.display = 'flex';
            if (guestLabel) guestLabel.style.display = 'none';
            
            if (userName) {
                userName.textContent = this.user.display_name || this.user.email?.split('@')[0] || 'User';
            }
        } else {
            // User is not signed in
            if (signInBtn) signInBtn.style.display = 'flex';
            if (signOutBtn) signOutBtn.style.display = 'none';
            if (userInfo) userInfo.style.display = 'none';
            if (guestLabel) guestLabel.style.display = 'flex';
            
            if (userName) {
                userName.textContent = 'Guest';
            }
        }
        
        // Update nav items that require auth
        document.querySelectorAll('[data-requires-auth]').forEach(el => {
            el.style.display = this.isSignedIn() ? '' : 'none';
        });
    },
    
    /**
     * Sync user data after sign-in
     */
    async syncUserData() {
        if (!this.isSignedIn()) return;
        
        try {
            // Sync watchlist from server
            const response = await fetch(`${this.API_BASE}/api/v1/watchlist`, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Merge server watchlist with local
                if (data.items) {
                    data.items.forEach(item => {
                        Storage.addToWatchlist(item);
                    });
                }
            }
            
            // Sync ratings
            const ratingsResponse = await fetch(`${this.API_BASE}/api/v1/ratings`, {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            
            if (ratingsResponse.ok) {
                const ratingsData = await ratingsResponse.json();
                if (ratingsData.ratings) {
                    Storage.set('user_ratings', JSON.stringify(ratingsData.ratings));
                }
            }
            
        } catch (error) {
            Utils.log('Auth: Failed to sync user data:', error);
        }
    },
    
    /**
     * Make authenticated API request
     */
    async authenticatedFetch(url, options = {}) {
        if (!this.accessToken) {
            throw new Error('Not authenticated');
        }
        
        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${this.accessToken}`
        };
        
        let response = await fetch(url, { ...options, headers });
        
        // If unauthorized, try to refresh token
        if (response.status === 401) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
                headers['Authorization'] = `Bearer ${this.accessToken}`;
                response = await fetch(url, { ...options, headers });
            }
        }
        
        return response;
    }
};

// Export for use in other modules
window.Auth = Auth;
