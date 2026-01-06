/**
 * FlixPicks TV App - Navigation System
 * D-pad navigation and focus management for TV remote control
 */

const Navigation = {
    // Current focused element
    currentFocus: null,
    
    // Focus history for back navigation
    focusHistory: [],
    
    // Navigation enabled flag
    enabled: true,
    
    // Key codes for TV remote
    KEYS: {
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        ENTER: 13,
        BACK: 10009,      // Samsung TV back button
        BACK_ALT: 8,      // Backspace as alternative
        ESCAPE: 27,       // ESC key
        PLAY: 415,
        PAUSE: 19,
        STOP: 413,
        PLAY_PAUSE: 10252,
        REWIND: 412,
        FAST_FORWARD: 417,
        RED: 403,
        GREEN: 404,
        YELLOW: 405,
        BLUE: 406
    },
    
    // Direction vectors for navigation
    DIRECTIONS: {
        LEFT: { x: -1, y: 0 },
        RIGHT: { x: 1, y: 0 },
        UP: { x: 0, y: -1 },
        DOWN: { x: 0, y: 1 }
    },

    /**
     * Initialize navigation system
     */
    init() {
        this.bindKeyEvents();
        this.registerTizenKeys();
        Utils.log('Navigation initialized');
    },

    /**
     * Register Tizen TV remote keys
     */
    registerTizenKeys() {
        try {
            if (window.tizen && tizen.tvinputdevice) {
                const keys = [
                    'MediaPlay', 'MediaPause', 'MediaStop',
                    'MediaPlayPause', 'MediaRewind', 'MediaFastForward',
                    'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue'
                ];
                keys.forEach(key => {
                    try {
                        tizen.tvinputdevice.registerKey(key);
                    } catch (e) {
                        // Key may not be available
                    }
                });
                Utils.log('Tizen keys registered');
            }
        } catch (e) {
            Utils.log('Tizen API not available (running in browser)');
        }
    },

    /**
     * Bind keyboard/remote events
     */
    bindKeyEvents() {
        document.addEventListener('keydown', (e) => {
            if (!this.enabled) return;
            
            const keyCode = e.keyCode;
            let handled = false;
            
            switch (keyCode) {
                case this.KEYS.LEFT:
                    handled = this.navigate('LEFT');
                    break;
                case this.KEYS.RIGHT:
                    handled = this.navigate('RIGHT');
                    break;
                case this.KEYS.UP:
                    handled = this.navigate('UP');
                    break;
                case this.KEYS.DOWN:
                    handled = this.navigate('DOWN');
                    break;
                case this.KEYS.ENTER:
                    handled = this.select();
                    break;
                case this.KEYS.BACK:
                case this.KEYS.BACK_ALT:
                case this.KEYS.ESCAPE:
                    handled = this.goBack();
                    break;
                case this.KEYS.PLAY:
                case this.KEYS.PLAY_PAUSE:
                    this.triggerEvent('play');
                    handled = true;
                    break;
                case this.KEYS.PAUSE:
                    this.triggerEvent('pause');
                    handled = true;
                    break;
                case this.KEYS.STOP:
                    this.triggerEvent('stop');
                    handled = true;
                    break;
                case this.KEYS.REWIND:
                    this.triggerEvent('rewind');
                    handled = true;
                    break;
                case this.KEYS.FAST_FORWARD:
                    this.triggerEvent('fastforward');
                    handled = true;
                    break;
            }
            
            if (handled) {
                e.preventDefault();
                e.stopPropagation();
            }
        });
    },

    /**
     * Navigate in a direction
     */
    navigate(direction) {
        const current = this.currentFocus;
        if (!current) {
            this.focusFirst();
            return true;
        }
        
        const next = this.findNextFocusable(current, direction);
        if (next) {
            this.setFocus(next);
            return true;
        }
        
        // Check for scroll behavior
        if (this.handleScroll(current, direction)) {
            return true;
        }
        
        return false;
    },

    /**
     * Find next focusable element in direction
     * Uses grid-aware navigation for consistent left-to-right, top-to-bottom behavior
     */
    findNextFocusable(current, direction) {
        const focusables = this.getFocusableElements();
        if (focusables.length === 0) return null;
        
        // Check if we're in a horizontal content row (home view sliders)
        const contentRow = current.closest('.row-items');
        if (contentRow) {
            return this.findNextInHorizontalRow(current, direction, contentRow, focusables);
        }
        
        // Check if we're in a grid context
        const grid = current.closest('.content-grid, .mood-grid, .browse-grid, #browseGrid, #recGrid, #watchlistGrid, #inprogressGrid, #askFlickResults .content-grid');
        
        if (grid) {
            return this.findNextInGrid(current, direction, grid, focusables);
        }
        
        // For non-grid elements, use spatial navigation
        return this.findNextSpatial(current, direction, focusables);
    },
    
    /**
     * Navigation within horizontal content rows (like home view sliders)
     */
    findNextInHorizontalRow(current, direction, rowContainer, allFocusables) {
        const rowItems = Array.from(rowContainer.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
        const currentIndex = rowItems.indexOf(current);
        
        if (direction === 'LEFT') {
            // Move left within the row
            if (currentIndex > 0) {
                return rowItems[currentIndex - 1];
            }
            // At start of row, wrap to last item of previous row
            const currentRowEl = rowContainer.closest('.content-row');
            if (currentRowEl && currentRowEl.previousElementSibling) {
                const prevRow = currentRowEl.previousElementSibling.querySelector('.row-items');
                if (prevRow) {
                    const prevItems = Array.from(prevRow.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
                    if (prevItems.length > 0) {
                        return prevItems[prevItems.length - 1]; // Last item of previous row
                    }
                }
            }
            // No previous row, stay here
            return null;
        }
        
        if (direction === 'RIGHT') {
            // Move right within the row
            if (currentIndex < rowItems.length - 1) {
                return rowItems[currentIndex + 1];
            }
            // At end of row, wrap to first item of next row
            const currentRowEl = rowContainer.closest('.content-row');
            if (currentRowEl && currentRowEl.nextElementSibling) {
                const nextRow = currentRowEl.nextElementSibling.querySelector('.row-items');
                if (nextRow) {
                    const nextItems = Array.from(nextRow.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
                    if (nextItems.length > 0) {
                        return nextItems[0]; // First item of next row
                    }
                }
            }
            // No next row, stay here
            return null;
        }
        
        if (direction === 'UP' || direction === 'DOWN') {
            // Moving between rows - find the next row
            const currentRowEl = rowContainer.closest('.content-row');
            const homeRows = document.getElementById('homeRows');
            const carouselActions = document.querySelector('.carousel-actions');
            
            if (direction === 'UP') {
                // Try to find previous row
                if (currentRowEl && currentRowEl.previousElementSibling) {
                    const prevRow = currentRowEl.previousElementSibling.querySelector('.row-items');
                    if (prevRow) {
                        const prevItems = Array.from(prevRow.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
                        if (prevItems.length > 0) {
                            // Try to maintain column position
                            const targetIndex = Math.min(currentIndex, prevItems.length - 1);
                            return prevItems[targetIndex];
                        }
                    }
                }
                // No previous row, try carousel buttons
                if (carouselActions) {
                    const carouselBtns = Array.from(carouselActions.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
                    if (carouselBtns.length > 0) {
                        return carouselBtns[0];
                    }
                }
                // Fall back to spatial
                return this.findNextSpatial(current, direction, allFocusables);
            }
            
            if (direction === 'DOWN') {
                // Try to find next row
                if (currentRowEl && currentRowEl.nextElementSibling) {
                    const nextRow = currentRowEl.nextElementSibling.querySelector('.row-items');
                    if (nextRow) {
                        const nextItems = Array.from(nextRow.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
                        if (nextItems.length > 0) {
                            // Try to maintain column position
                            const targetIndex = Math.min(currentIndex, nextItems.length - 1);
                            return nextItems[targetIndex];
                        }
                    }
                }
                // No next row, stay here
                return null;
            }
        }
        
        return this.findNextSpatial(current, direction, allFocusables);
    },
    
    /**
     * Grid-aware navigation - ensures consistent left-to-right, top-to-bottom
     */
    findNextInGrid(current, direction, grid, allFocusables) {
        // Get all focusable items in this grid
        const gridItems = Array.from(grid.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
        if (gridItems.length === 0) return null;
        
        const currentIndex = gridItems.indexOf(current);
        if (currentIndex === -1) return this.findNextSpatial(current, direction, allFocusables);
        
        // Calculate grid dimensions based on actual positions
        const itemRects = gridItems.map(el => el.getBoundingClientRect());
        const currentRect = itemRects[currentIndex];
        
        // Determine items per row by counting items on same Y level
        const tolerance = 20; // Pixels tolerance for same row
        let itemsPerRow = 0;
        const firstItemY = itemRects[0].top;
        for (let i = 0; i < itemRects.length; i++) {
            if (Math.abs(itemRects[i].top - firstItemY) < tolerance) {
                itemsPerRow++;
            } else {
                break;
            }
        }
        if (itemsPerRow === 0) itemsPerRow = 1;
        
        const currentRow = Math.floor(currentIndex / itemsPerRow);
        const currentCol = currentIndex % itemsPerRow;
        const totalRows = Math.ceil(gridItems.length / itemsPerRow);
        
        let nextIndex = -1;
        
        switch (direction) {
            case 'RIGHT':
                if (currentCol < itemsPerRow - 1 && currentIndex + 1 < gridItems.length) {
                    // Move right within row
                    nextIndex = currentIndex + 1;
                } else if (currentRow < totalRows - 1) {
                    // Wrap to first item of next row
                    nextIndex = (currentRow + 1) * itemsPerRow;
                    if (nextIndex >= gridItems.length) {
                        // If next row doesn't have enough items, go to first item of next row
                        nextIndex = Math.min(nextIndex, gridItems.length - 1);
                    }
                }
                break;
                
            case 'LEFT':
                if (currentCol > 0) {
                    // Move left within row
                    nextIndex = currentIndex - 1;
                } else if (currentRow > 0) {
                    // Wrap to last item of previous row
                    const prevRowStart = (currentRow - 1) * itemsPerRow;
                    const prevRowEnd = Math.min(prevRowStart + itemsPerRow - 1, gridItems.length - 1);
                    nextIndex = prevRowEnd;
                }
                break;
                
            case 'DOWN':
                // Move to same column in next row
                const nextRowIndex = currentIndex + itemsPerRow;
                if (nextRowIndex < gridItems.length) {
                    nextIndex = nextRowIndex;
                } else if (currentRow < totalRows - 1) {
                    // Go to last item if next row is shorter
                    nextIndex = gridItems.length - 1;
                }
                break;
                
            case 'UP':
                // Move to same column in previous row
                const prevRowIndex = currentIndex - itemsPerRow;
                if (prevRowIndex >= 0) {
                    nextIndex = prevRowIndex;
                }
                break;
        }
        
        if (nextIndex >= 0 && nextIndex < gridItems.length) {
            return gridItems[nextIndex];
        }
        
        // If no valid grid navigation, fall back to spatial for moving out of grid
        return this.findNextSpatial(current, direction, allFocusables);
    },
    
    /**
     * Spatial navigation for non-grid elements
     */
    findNextSpatial(current, direction, focusables) {
        // Special case: from carousel buttons going DOWN, jump to first content row
        if (direction === 'DOWN') {
            const carouselActions = current.closest('.carousel-actions');
            const carouselNav = current.closest('.carousel-nav');
            
            if (carouselActions || carouselNav) {
                const homeRows = document.getElementById('homeRows');
                if (homeRows) {
                    const firstRow = homeRows.querySelector('.content-row .row-items');
                    if (firstRow) {
                        const firstItems = Array.from(firstRow.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
                        if (firstItems.length > 0) {
                            return firstItems[0];
                        }
                    }
                }
            }
        }
        
        // Special case: from header going DOWN, jump to carousel buttons or first content row
        if (direction === 'DOWN') {
            const header = current.closest('#header, .header');
            if (header) {
                // Try carousel buttons first
                const carouselBtns = document.querySelectorAll('.carousel-actions .focusable');
                const visibleBtns = Array.from(carouselBtns).filter(el => this.isVisible(el));
                if (visibleBtns.length > 0) {
                    return visibleBtns[0];
                }
                
                // Fall back to first content row
                const homeRows = document.getElementById('homeRows');
                if (homeRows) {
                    const firstRow = homeRows.querySelector('.content-row .row-items');
                    if (firstRow) {
                        const firstItems = Array.from(firstRow.querySelectorAll('.focusable')).filter(el => this.isVisible(el));
                        if (firstItems.length > 0) {
                            return firstItems[0];
                        }
                    }
                }
            }
        }
        
        // Special case: from content row going UP to carousel
        if (direction === 'UP') {
            const contentRow = current.closest('.content-row');
            if (contentRow) {
                const homeRows = document.getElementById('homeRows');
                // Check if this is the first row
                if (homeRows && contentRow === homeRows.firstElementChild) {
                    // Go to carousel buttons
                    const carouselBtns = document.querySelectorAll('.carousel-actions .focusable');
                    const visibleBtns = Array.from(carouselBtns).filter(el => this.isVisible(el));
                    if (visibleBtns.length > 0) {
                        return visibleBtns[0];
                    }
                }
            }
        }
        
        const currentRect = current.getBoundingClientRect();
        const currentCenter = {
            x: currentRect.left + currentRect.width / 2,
            y: currentRect.top + currentRect.height / 2
        };
        
        const dir = this.DIRECTIONS[direction];
        let bestCandidate = null;
        let bestScore = Infinity;
        
        // Check for same-row navigation first (for horizontal lists)
        const currentRow = current.getAttribute('data-focus-row');
        
        focusables.forEach(el => {
            if (el === current) return;
            if (!this.isVisible(el)) return;
            
            const rect = el.getBoundingClientRect();
            const center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
            };
            
            // Calculate direction vector to candidate
            const dx = center.x - currentCenter.x;
            const dy = center.y - currentCenter.y;
            
            // Check if candidate is in the right direction
            const dotProduct = dx * dir.x + dy * dir.y;
            if (dotProduct <= 0) return; // Wrong direction
            
            // Calculate perpendicular distance (how far off-axis)
            const perpDist = Math.abs(dx * dir.y - dy * dir.x);
            
            // Calculate forward distance
            const forwardDist = Math.abs(dotProduct);
            
            // Prefer same row for left/right navigation
            const elRow = el.getAttribute('data-focus-row');
            const sameRow = currentRow && elRow && currentRow === elRow;
            
            // Score: lower is better
            // Weight perpendicular distance more heavily for same-row items
            let score;
            if (direction === 'LEFT' || direction === 'RIGHT') {
                if (sameRow) {
                    score = forwardDist + perpDist * 0.1;
                } else {
                    score = forwardDist + perpDist * 3;
                }
            } else {
                score = forwardDist + perpDist * 0.5;
            }
            
            if (score < bestScore) {
                bestScore = score;
                bestCandidate = el;
            }
        });
        
        return bestCandidate;
    },

    /**
     * Handle scrolling when at edge
     */
    handleScroll(element, direction) {
        const scrollContainer = this.findScrollContainer(element);
        if (!scrollContainer) return false;
        
        const scrollAmount = 200;
        
        switch (direction) {
            case 'LEFT':
                if (scrollContainer.scrollLeft > 0) {
                    scrollContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
                    return true;
                }
                break;
            case 'RIGHT':
                if (scrollContainer.scrollLeft < scrollContainer.scrollWidth - scrollContainer.clientWidth) {
                    scrollContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
                    return true;
                }
                break;
            case 'UP':
                if (scrollContainer.scrollTop > 0) {
                    scrollContainer.scrollBy({ top: -scrollAmount, behavior: 'smooth' });
                    return true;
                }
                break;
            case 'DOWN':
                if (scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight) {
                    scrollContainer.scrollBy({ top: scrollAmount, behavior: 'smooth' });
                    return true;
                }
                break;
        }
        
        return false;
    },

    /**
     * Find scroll container for element
     */
    findScrollContainer(element) {
        let parent = element.parentElement;
        while (parent) {
            const style = window.getComputedStyle(parent);
            const overflowX = style.overflowX;
            const overflowY = style.overflowY;
            
            if (overflowX === 'auto' || overflowX === 'scroll' ||
                overflowY === 'auto' || overflowY === 'scroll') {
                return parent;
            }
            parent = parent.parentElement;
        }
        return null;
    },

    /**
     * Select current focused element
     */
    select() {
        if (!this.currentFocus) return false;
        
        // Trigger click event
        this.currentFocus.click();
        
        // Add ripple effect
        this.currentFocus.classList.add('ripple', 'active');
        setTimeout(() => {
            this.currentFocus?.classList.remove('active');
        }, 600);
        
        return true;
    },

    /**
     * Go back (handle back button)
     */
    goBack() {
        // Trigger custom back event
        const event = new CustomEvent('navigation:back');
        document.dispatchEvent(event);
        return true;
    },

    /**
     * Set focus to element
     */
    setFocus(element, saveHistory = true) {
        if (!element) return;
        
        // Remove focus from current
        if (this.currentFocus) {
            this.currentFocus.classList.remove('focused');
            this.currentFocus.blur();
            
            if (saveHistory) {
                this.focusHistory.push(this.currentFocus);
                // Limit history size
                if (this.focusHistory.length > 50) {
                    this.focusHistory.shift();
                }
            }
        }
        
        // Set new focus
        this.currentFocus = element;
        element.classList.add('focused');
        element.focus({ preventScroll: true });
        
        // Scroll element into view
        this.scrollIntoView(element);
        
        // Trigger focus event
        const event = new CustomEvent('navigation:focus', { detail: { element } });
        document.dispatchEvent(event);
    },

    /**
     * Scroll element into view smoothly
     */
    scrollIntoView(element) {
        const rect = element.getBoundingClientRect();
        const container = this.findScrollContainer(element);
        
        if (container) {
            const containerRect = container.getBoundingClientRect();
            const padding = 100; // Extra padding from edges
            
            // Horizontal scroll
            if (rect.left < containerRect.left + padding) {
                container.scrollBy({
                    left: rect.left - containerRect.left - padding,
                    behavior: 'smooth'
                });
            } else if (rect.right > containerRect.right - padding) {
                container.scrollBy({
                    left: rect.right - containerRect.right + padding,
                    behavior: 'smooth'
                });
            }
            
            // Vertical scroll
            if (rect.top < containerRect.top + padding) {
                container.scrollBy({
                    top: rect.top - containerRect.top - padding,
                    behavior: 'smooth'
                });
            } else if (rect.bottom > containerRect.bottom - padding) {
                container.scrollBy({
                    top: rect.bottom - containerRect.bottom + padding,
                    behavior: 'smooth'
                });
            }
        } else {
            // Fallback to native scrollIntoView
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        }
    },

    /**
     * Focus first focusable element
     */
    focusFirst() {
        const focusables = this.getFocusableElements();
        if (focusables.length > 0) {
            this.setFocus(focusables[0], false);
        }
    },

    /**
     * Focus element by selector
     */
    focusElement(selector) {
        const element = document.querySelector(selector);
        if (element && element.classList.contains('focusable')) {
            this.setFocus(element);
            return true;
        }
        return false;
    },

    /**
     * Focus previous element from history
     */
    focusPrevious() {
        if (this.focusHistory.length > 0) {
            const previous = this.focusHistory.pop();
            if (previous && this.isVisible(previous)) {
                this.setFocus(previous, false);
                return true;
            }
        }
        return false;
    },

    /**
     * Get all focusable elements in current view
     */
    getFocusableElements() {
        const activeView = document.querySelector('.view.active');
        const container = activeView || document;
        
        // Also include header navigation
        const header = document.getElementById('header');
        const modal = document.querySelector('.modal-container:not([style*="display: none"])');
        const nowPlaying = document.getElementById('nowPlayingBar');
        
        let elements = [];
        
        // If modal is open, only focus within modal
        if (modal) {
            elements = Array.from(modal.querySelectorAll('.focusable:not([disabled])'));
        } else {
            // Include header, active view, and now playing bar
            if (header) {
                elements = elements.concat(Array.from(header.querySelectorAll('.focusable:not([disabled])')));
            }
            elements = elements.concat(Array.from(container.querySelectorAll('.focusable:not([disabled])')));
            if (nowPlaying && nowPlaying.style.display !== 'none') {
                elements = elements.concat(Array.from(nowPlaying.querySelectorAll('.focusable:not([disabled])')));
            }
        }
        
        return elements.filter(el => this.isVisible(el));
    },

    /**
     * Check if element is visible
     */
    isVisible(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
            return false;
        }
        
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
    },

    /**
     * Trigger custom navigation event
     */
    triggerEvent(eventName, data = {}) {
        const event = new CustomEvent(`navigation:${eventName}`, { detail: data });
        document.dispatchEvent(event);
    },

    /**
     * Enable navigation
     */
    enable() {
        this.enabled = true;
    },

    /**
     * Disable navigation
     */
    disable() {
        this.enabled = false;
    },

    /**
     * Clear focus history
     */
    clearHistory() {
        this.focusHistory = [];
    },

    /**
     * Save current focus state
     */
    saveFocusState() {
        return {
            element: this.currentFocus,
            history: [...this.focusHistory]
        };
    },

    /**
     * Restore focus state
     */
    restoreFocusState(state) {
        if (state.element && this.isVisible(state.element)) {
            this.setFocus(state.element, false);
        }
        this.focusHistory = state.history || [];
    }
};

// Export for use in other modules
window.Navigation = Navigation;

