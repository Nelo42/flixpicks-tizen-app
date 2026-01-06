/**
 * FlixPicks TV App - Main Application
 * Entry point and initialization
 */

const FlixPicksApp = {
    // App state
    initialized: false,
    
    /**
     * Initialize the application
     */
    async init() {
        if (this.initialized) return;
        
        Utils.log('FlixPicks TV App starting...');
        
        try {
            // Initialize modules
            API.init();
            Navigation.init();
            Device.init();
            Voice.init();
            Streaming.init();
            InputSwitcher.init();
            await Auth.init();
            await Views.init();
            
            // Bind global events
            this.bindEvents();
            
            // Hide loading screen
            this.hideLoading();
            
            // Show app
            document.getElementById('app').style.display = 'block';
            
            // Load initial view
            const lastView = Storage.getLastView();
            await Views.showView(lastView.view || 'home', false);
            
            this.initialized = true;
            Utils.log('FlixPicks TV App initialized');
            
        } catch (error) {
            Utils.log('Initialization error:', error);
            this.showError('Failed to initialize app. Please reload.');
        }
    },

    /**
     * Bind global events
     */
    bindEvents() {
        // Device connection events
        Device.on('onConnect', (data) => {
            Utils.showToast(`Connected to ${data.device.name}`, 'success');
        });
        
        Device.on('onDisconnect', () => {
            Utils.showToast('Disconnected from device', 'info');
        });
        
        Device.on('onError', (data) => {
            Utils.showToast(data.message || 'Device error', 'error');
        });
        
        // Navigation events for media keys
        document.addEventListener('navigation:play', () => {
            if (Device.isConnected()) {
                Device.resume();
            }
        });
        
        document.addEventListener('navigation:pause', () => {
            if (Device.isConnected()) {
                Device.pause();
            }
        });
        
        document.addEventListener('navigation:stop', () => {
            if (Device.isConnected()) {
                Device.stop();
            }
        });
        
        document.addEventListener('navigation:rewind', () => {
            if (Device.isConnected()) {
                Device.seekRelative(-10);
            }
        });
        
        document.addEventListener('navigation:fastforward', () => {
            if (Device.isConnected()) {
                Device.seekRelative(10);
            }
        });
        
        // Handle visibility change (app goes to background)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                Utils.log('App went to background');
            } else {
                Utils.log('App came to foreground');
                // Refresh connection status
                if (Device.currentDevice) {
                    Device.send({ type: 'get_status' });
                }
            }
        });
        
        // Handle Tizen app lifecycle
        if (window.tizen) {
            try {
                // Handle app exit
                window.addEventListener('tizenhwkey', (e) => {
                    if (e.keyName === 'back') {
                        // Let navigation handle it first
                        const handled = Views.handleBack();
                        if (!handled && Views.currentView === 'home') {
                            // Exit app if on home and can't go back
                            tizen.application.getCurrentApplication().exit();
                        }
                    }
                });
            } catch (e) {
                Utils.log('Tizen lifecycle setup error:', e);
            }
        }
        
        // Keyboard shortcut for development
        document.addEventListener('keydown', (e) => {
            // Ctrl+D to toggle debug mode
            if (e.ctrlKey && e.key === 'd') {
                this.toggleDebug();
            }
        });
    },

    /**
     * Hide loading screen
     */
    hideLoading() {
        Utils.log('hideLoading called');
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('fade-out');
            loadingScreen.style.opacity = '0';
            loadingScreen.style.pointerEvents = 'none';
            loadingScreen.style.display = 'none';
            Utils.log('Loading screen hidden');
        }
        
        // Make sure app is visible
        const app = document.getElementById('app');
        if (app) {
            app.style.display = 'block';
            app.style.opacity = '1';
            Utils.log('App container shown');
        }
    },

    /**
     * Show error screen
     */
    showError(message) {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.querySelector('.loading-spinner').style.display = 'none';
            loadingScreen.querySelector('.loading-text').textContent = message;
            loadingScreen.querySelector('.loading-text').style.color = '#E53935';
        }
    },

    /**
     * Toggle debug mode
     */
    toggleDebug() {
        document.body.classList.toggle('debug-mode');
        Utils.log('Debug mode:', document.body.classList.contains('debug-mode'));
    },

    /**
     * Get app version
     */
    getVersion() {
        return '1.0.0';
    },

    /**
     * Get platform info
     */
    getPlatformInfo() {
        const info = {
            platform: 'unknown',
            version: 'unknown',
            model: 'unknown'
        };
        
        try {
            if (window.tizen && tizen.systeminfo) {
                tizen.systeminfo.getPropertyValue('BUILD', (build) => {
                    info.platform = 'Tizen';
                    info.version = build.model;
                });
            } else {
                info.platform = 'Browser';
                info.version = navigator.userAgent;
            }
        } catch (e) {
            Utils.log('Platform info error:', e);
        }
        
        return info;
    }
};

// Start app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    FlixPicksApp.init();
});

// Export for debugging
window.FlixPicksApp = FlixPicksApp;

