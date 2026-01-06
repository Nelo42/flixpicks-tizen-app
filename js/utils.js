/**
 * FlixPicks TV App - Utility Functions
 */

const Utils = {
    /**
     * Debounce function execution
     */
    debounce(fn, delay) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Throttle function execution
     */
    throttle(fn, limit) {
        let inThrottle;
        return function (...args) {
            if (!inThrottle) {
                fn.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Format runtime in minutes to "Xh Ym" format
     */
    formatRuntime(minutes) {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours === 0) return `${mins}m`;
        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    },

    /**
     * Format date to year only
     */
    formatYear(dateString) {
        if (!dateString) return '';
        return dateString.substring(0, 4);
    },

    /**
     * Format date to readable string
     */
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    /**
     * Format number with commas
     */
    formatNumber(num) {
        if (!num) return '0';
        return num.toLocaleString();
    },

    /**
     * Format rating to one decimal place
     */
    formatRating(rating) {
        if (!rating) return 'N/A';
        return parseFloat(rating).toFixed(1);
    },

    /**
     * Format time in seconds to "mm:ss" or "hh:mm:ss"
     */
    formatTime(seconds) {
        if (!seconds || seconds < 0) return '0:00';
        
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    },

    /**
     * Truncate text with ellipsis
     */
    truncate(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    /**
     * Decode HTML entities
     */
    decodeHtml(html) {
        if (!html) return '';
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    },

    /**
     * Generate unique ID
     */
    generateId() {
        return 'id_' + Math.random().toString(36).substr(2, 9);
    },

    /**
     * Check if value is empty
     */
    isEmpty(value) {
        if (value === null || value === undefined) return true;
        if (typeof value === 'string') return value.trim() === '';
        if (Array.isArray(value)) return value.length === 0;
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
    },

    /**
     * Deep clone object
     */
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Get TMDB image URL
     */
    getImageUrl(path, size = 'w342') {
        if (!path) return null;
        return `https://image.tmdb.org/t/p/${size}${path}`;
    },

    /**
     * Get poster URL with fallback
     */
    getPosterUrl(item) {
        if (item.poster_url) return item.poster_url;
        if (item.poster_path) return this.getImageUrl(item.poster_path, 'w342');
        return 'assets/images/poster-placeholder.svg';
    },

    /**
     * Get backdrop URL with fallback
     */
    getBackdropUrl(item, size = 'w1280') {
        if (item.backdrop_url) return item.backdrop_url;
        if (item.backdrop_path) return this.getImageUrl(item.backdrop_path, size);
        return null;
    },

    /**
     * Create element with attributes
     */
    createElement(tag, attributes = {}, children = []) {
        const el = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                el.className = value;
            } else if (key === 'innerHTML') {
                el.innerHTML = value;
            } else if (key === 'textContent') {
                el.textContent = value;
            } else if (key.startsWith('data-')) {
                el.setAttribute(key, value);
            } else if (key.startsWith('on') && typeof value === 'function') {
                el.addEventListener(key.substring(2).toLowerCase(), value);
            } else {
                el.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                el.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                el.appendChild(child);
            }
        });
        
        return el;
    },

    /**
     * Wait for specified milliseconds
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Preload image
     */
    preloadImage(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                resolve(null);
                return;
            }
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = url;
        });
    },

    /**
     * Get session ID (for anonymous users)
     */
    getSessionId() {
        let sessionId = localStorage.getItem('flixpicks_session_id');
        if (!sessionId) {
            sessionId = 'session_' + this.generateId() + '_' + Date.now();
            localStorage.setItem('flixpicks_session_id', sessionId);
        }
        return sessionId;
    },

    /**
     * Check if device is connected
     */
    isDeviceConnected() {
        return window.FlixPicksDevice && window.FlixPicksDevice.isConnected();
    },

    /**
     * Show toast notification
     */
    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = this.createElement('div', {
            className: `toast toast-${type}`
        }, [
            this.createElement('span', { className: 'toast-icon', textContent: icons[type] || icons.info }),
            this.createElement('span', { className: 'toast-message', textContent: message })
        ]);

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    /**
     * Log with timestamp (for debugging)
     */
    log(...args) {
        const timestamp = new Date().toISOString().substr(11, 12);
        console.log(`[${timestamp}]`, ...args);
    },

    /**
     * Validate IP address format
     */
    isValidIP(ip) {
        const pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
        return pattern.test(ip);
    },

    /**
     * Parse URL parameters
     */
    parseUrlParams(url) {
        const params = {};
        const searchParams = new URL(url).searchParams;
        for (const [key, value] of searchParams) {
            params[key] = value;
        }
        return params;
    }
};

// Export for use in other modules
window.Utils = Utils;

