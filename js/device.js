/**
 * FlixPicks TV App - Device Control Module
 * WebSocket communication with MediaOS box
 */

const Device = {
    // WebSocket connection
    ws: null,
    
    // Connection state
    connected: false,
    connecting: false,
    
    // Current device info
    currentDevice: null,
    
    // Playback state
    playbackState: {
        playing: false,
        paused: false,
        position: 0,
        duration: 0,
        title: '',
        posterUrl: '',
        mediaType: 'movie'
    },
    
    // Reconnection settings
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    reconnectDelay: 3000,
    reconnectTimer: null,
    
    // Ping/pong for connection health
    pingInterval: null,
    pongTimeout: null,
    
    // Event callbacks
    callbacks: {
        onConnect: [],
        onDisconnect: [],
        onPlaybackUpdate: [],
        onError: [],
        onMessage: []
    },

    /**
     * Initialize device module
     */
    init() {
        // Try to connect to saved device on startup
        const savedDevice = Storage.getActiveDevice();
        if (savedDevice && Storage.getSetting('autoConnect')) {
            this.connect(savedDevice);
        }
        
        Utils.log('Device module initialized');
    },

    /**
     * Connect to a device
     */
    async connect(device) {
        if (this.connecting || (this.connected && this.currentDevice?.id === device.id)) {
            return;
        }
        
        // Disconnect from current device first
        if (this.connected) {
            this.disconnect();
        }
        
        this.connecting = true;
        this.currentDevice = device;
        this.updateConnectionStatus('connecting');
        
        try {
            const wsUrl = `ws://${device.ip}:${device.port || 9999}`;
            Utils.log('Connecting to:', wsUrl);
            
            this.ws = new WebSocket(wsUrl);
            
            this.ws.onopen = () => this.handleOpen();
            this.ws.onclose = (event) => this.handleClose(event);
            this.ws.onerror = (error) => this.handleError(error);
            this.ws.onmessage = (event) => this.handleMessage(event);
            
            // Set connection timeout
            setTimeout(() => {
                if (this.connecting && !this.connected) {
                    Utils.log('Connection timeout');
                    this.disconnect();
                    this.trigger('onError', { message: 'Connection timeout' });
                }
            }, 10000);
            
        } catch (error) {
            Utils.log('Connection error:', error);
            this.connecting = false;
            this.trigger('onError', { message: error.message });
        }
    },

    /**
     * Disconnect from device
     */
    disconnect() {
        this.stopPing();
        this.clearReconnect();
        
        if (this.ws) {
            this.ws.onclose = null; // Prevent reconnection
            this.ws.close();
            this.ws = null;
        }
        
        this.connected = false;
        this.connecting = false;
        this.updateConnectionStatus('disconnected');
        this.trigger('onDisconnect', {});
    },

    /**
     * Handle WebSocket open
     */
    handleOpen() {
        Utils.log('WebSocket connected');
        this.connected = true;
        this.connecting = false;
        this.reconnectAttempts = 0;
        
        // Save as active device
        Storage.setActiveDevice(this.currentDevice.id);
        
        this.updateConnectionStatus('connected');
        this.startPing();
        
        // Request current playback state
        this.send({ type: 'get_status' });
        
        this.trigger('onConnect', { device: this.currentDevice });
    },

    /**
     * Handle WebSocket close
     */
    handleClose(event) {
        Utils.log('WebSocket closed:', event.code, event.reason);
        this.connected = false;
        this.connecting = false;
        this.stopPing();
        
        this.updateConnectionStatus('disconnected');
        
        // Attempt reconnection if not intentional disconnect
        if (event.code !== 1000 && this.currentDevice) {
            this.scheduleReconnect();
        }
        
        this.trigger('onDisconnect', { code: event.code, reason: event.reason });
    },

    /**
     * Handle WebSocket error
     */
    handleError(error) {
        Utils.log('WebSocket error:', error);
        this.trigger('onError', { message: 'Connection error' });
    },

    /**
     * Handle incoming message
     */
    handleMessage(event) {
        try {
            const message = JSON.parse(event.data);
            Utils.log('Received:', message.type);
            
            switch (message.type) {
                case 'pong':
                    this.handlePong();
                    break;
                    
                case 'status':
                case 'playback_update':
                    this.handlePlaybackUpdate(message.payload);
                    break;
                    
                case 'error':
                    this.trigger('onError', { message: message.payload?.message || 'Unknown error' });
                    break;
                    
                default:
                    this.trigger('onMessage', message);
            }
        } catch (error) {
            Utils.log('Message parse error:', error);
        }
    },

    /**
     * Handle playback state update
     */
    handlePlaybackUpdate(payload) {
        this.playbackState = {
            playing: payload.state === 'playing',
            paused: payload.state === 'paused',
            position: payload.position || 0,
            duration: payload.duration || 0,
            title: payload.title || '',
            posterUrl: payload.poster_url || '',
            mediaType: payload.media_type || 'movie',
            tmdbId: payload.tmdb_id
        };
        
        this.updateNowPlayingUI();
        this.trigger('onPlaybackUpdate', this.playbackState);
    },

    /**
     * Send message to device
     */
    send(message) {
        if (!this.connected || !this.ws) {
            Utils.log('Cannot send: not connected');
            return false;
        }
        
        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (error) {
            Utils.log('Send error:', error);
            return false;
        }
    },

    // ==========================================
    // PLAYBACK CONTROLS
    // ==========================================

    /**
     * Play content on device
     */
    play(item) {
        const payload = {
            type: item.media_type || 'movie',
            tmdb_id: item.tmdb_id,
            title: item.title,
            poster_url: Utils.getPosterUrl(item)
        };
        
        // For TV episodes
        if (item.season_number !== undefined) {
            payload.season = item.season_number;
            payload.episode = item.episode_number;
        }
        
        return this.send({
            type: 'play',
            payload
        });
    },

    /**
     * Pause playback
     */
    pause() {
        return this.send({ type: 'pause' });
    },

    /**
     * Resume playback
     */
    resume() {
        return this.send({ type: 'resume' });
    },

    /**
     * Toggle play/pause
     */
    togglePlayPause() {
        if (this.playbackState.playing) {
            return this.pause();
        } else {
            return this.resume();
        }
    },

    /**
     * Stop playback
     */
    stop() {
        return this.send({ type: 'stop' });
    },

    /**
     * Seek to position
     */
    seek(position) {
        return this.send({
            type: 'seek',
            payload: { position }
        });
    },

    /**
     * Seek relative
     */
    seekRelative(seconds) {
        const newPosition = Math.max(0, this.playbackState.position + seconds);
        return this.seek(newPosition);
    },

    /**
     * Set volume
     */
    setVolume(volume) {
        return this.send({
            type: 'volume',
            payload: { volume: Math.max(0, Math.min(100, volume)) }
        });
    },

    /**
     * Play next episode (for TV)
     */
    playNext() {
        return this.send({ type: 'next' });
    },

    /**
     * Play previous episode (for TV)
     */
    playPrevious() {
        return this.send({ type: 'previous' });
    },

    // ==========================================
    // CONNECTION MANAGEMENT
    // ==========================================

    /**
     * Start ping interval
     */
    startPing() {
        this.stopPing();
        
        this.pingInterval = setInterval(() => {
            if (this.connected) {
                this.send({ type: 'ping' });
                
                // Set pong timeout
                this.pongTimeout = setTimeout(() => {
                    Utils.log('Pong timeout - connection may be dead');
                    this.disconnect();
                }, 5000);
            }
        }, 30000);
    },

    /**
     * Stop ping interval
     */
    stopPing() {
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
        if (this.pongTimeout) {
            clearTimeout(this.pongTimeout);
            this.pongTimeout = null;
        }
    },

    /**
     * Handle pong response
     */
    handlePong() {
        if (this.pongTimeout) {
            clearTimeout(this.pongTimeout);
            this.pongTimeout = null;
        }
    },

    /**
     * Schedule reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            Utils.log('Max reconnection attempts reached');
            Utils.showToast('Could not reconnect to device', 'error');
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        
        Utils.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        
        this.reconnectTimer = setTimeout(() => {
            if (this.currentDevice && !this.connected) {
                this.connect(this.currentDevice);
            }
        }, delay);
    },

    /**
     * Clear reconnection timer
     */
    clearReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        this.reconnectAttempts = 0;
    },

    // ==========================================
    // UI UPDATES
    // ==========================================

    /**
     * Update connection status in UI
     */
    updateConnectionStatus(status) {
        const statusEl = document.getElementById('connectionStatus');
        if (!statusEl) return;
        
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('.status-text');
        
        dot.className = 'status-dot';
        
        switch (status) {
            case 'connected':
                dot.classList.add('connected');
                text.textContent = this.currentDevice?.name || 'Connected';
                break;
            case 'connecting':
                dot.classList.add('connecting');
                text.textContent = 'Connecting...';
                break;
            case 'disconnected':
            default:
                dot.classList.add('disconnected');
                text.textContent = 'Not Connected';
        }
    },

    /**
     * Update now playing bar
     */
    updateNowPlayingUI() {
        const bar = document.getElementById('nowPlayingBar');
        if (!bar) return;
        
        const hasContent = this.playbackState.title && 
                          (this.playbackState.playing || this.playbackState.paused);
        
        bar.style.display = hasContent ? 'flex' : 'none';
        
        if (hasContent) {
            document.getElementById('nowPlayingTitle').textContent = this.playbackState.title;
            document.getElementById('nowPlayingStatus').textContent = 
                this.playbackState.paused ? 'Paused' : 'Playing';
            
            if (this.playbackState.posterUrl) {
                document.getElementById('nowPlayingPoster').src = this.playbackState.posterUrl;
            }
            
            document.getElementById('nowPlayingTime').textContent = 
                Utils.formatTime(this.playbackState.position);
            document.getElementById('nowPlayingDuration').textContent = 
                Utils.formatTime(this.playbackState.duration);
            
            const progress = this.playbackState.duration > 0 
                ? (this.playbackState.position / this.playbackState.duration) * 100 
                : 0;
            document.getElementById('nowPlayingProgress').style.width = `${progress}%`;
            
            // Update play/pause button
            const playPauseBtn = document.getElementById('controlPlayPause');
            if (playPauseBtn) {
                playPauseBtn.textContent = this.playbackState.paused ? '▶' : '⏸';
            }
        }
    },

    // ==========================================
    // EVENT HANDLING
    // ==========================================

    /**
     * Register event callback
     */
    on(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event].push(callback);
        }
    },

    /**
     * Remove event callback
     */
    off(event, callback) {
        if (this.callbacks[event]) {
            this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
        }
    },

    /**
     * Trigger event callbacks
     */
    trigger(event, data) {
        if (this.callbacks[event]) {
            this.callbacks[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    Utils.log('Callback error:', error);
                }
            });
        }
    },

    // ==========================================
    // HELPERS
    // ==========================================

    /**
     * Check if connected
     */
    isConnected() {
        return this.connected;
    },

    /**
     * Get current playback state
     */
    getPlaybackState() {
        return { ...this.playbackState };
    },

    /**
     * Get current device
     */
    getCurrentDevice() {
        return this.currentDevice;
    },

    /**
     * Test connection to a device
     */
    async testConnection(ip, port = 9999) {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(`ws://${ip}:${port}`);
                const timeout = setTimeout(() => {
                    ws.close();
                    resolve(false);
                }, 5000);
                
                ws.onopen = () => {
                    clearTimeout(timeout);
                    ws.close();
                    resolve(true);
                };
                
                ws.onerror = () => {
                    clearTimeout(timeout);
                    resolve(false);
                };
            } catch (error) {
                resolve(false);
            }
        });
    }
};

// Export for use in other modules
window.Device = Device;

