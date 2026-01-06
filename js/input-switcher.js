/**
 * FlixPicks TV App - Input Switcher Module
 * Handles automatic HDMI input switching when playing on external devices
 * 
 * NOTE: Samsung Tizen does not provide direct API access to change TV inputs
 * for third-party apps. This module provides:
 * 1. User preference storage for their device input
 * 2. Visual instructions for manual switching
 * 3. CEC command support where available (limited)
 */

const InputSwitcher = {
    // User's configured input preferences
    preferences: {
        enabled: false,
        deviceInputs: {} // deviceId -> input name mapping
    },
    
    // Available input types
    INPUT_TYPES: [
        { id: 'hdmi1', label: 'HDMI 1' },
        { id: 'hdmi2', label: 'HDMI 2' },
        { id: 'hdmi3', label: 'HDMI 3' },
        { id: 'hdmi4', label: 'HDMI 4' },
        { id: 'component', label: 'Component' },
        { id: 'composite', label: 'AV / Composite' },
        { id: 'usb', label: 'USB' }
    ],
    
    /**
     * Initialize input switcher
     */
    init() {
        this.loadPreferences();
        Utils.log('InputSwitcher: Initialized');
    },
    
    /**
     * Load preferences from storage
     */
    loadPreferences() {
        const saved = Storage.get('input_preferences');
        if (saved) {
            try {
                this.preferences = JSON.parse(saved);
            } catch (e) {
                Utils.log('InputSwitcher: Failed to parse preferences');
            }
        }
    },
    
    /**
     * Save preferences to storage
     */
    savePreferences() {
        Storage.set('input_preferences', JSON.stringify(this.preferences));
    },
    
    /**
     * Check if auto-switch is enabled
     */
    isEnabled() {
        return this.preferences.enabled;
    },
    
    /**
     * Enable/disable auto-switch
     */
    setEnabled(enabled) {
        this.preferences.enabled = enabled;
        this.savePreferences();
    },
    
    /**
     * Get configured input for a device
     */
    getDeviceInput(deviceId) {
        return this.preferences.deviceInputs[deviceId] || null;
    },
    
    /**
     * Set input for a device
     */
    setDeviceInput(deviceId, inputId) {
        this.preferences.deviceInputs[deviceId] = inputId;
        this.savePreferences();
    },
    
    /**
     * Remove input configuration for a device
     */
    removeDeviceInput(deviceId) {
        delete this.preferences.deviceInputs[deviceId];
        this.savePreferences();
    },
    
    /**
     * Get input label by ID
     */
    getInputLabel(inputId) {
        const input = this.INPUT_TYPES.find(i => i.id === inputId);
        return input ? input.label : inputId;
    },
    
    /**
     * Attempt to switch input when playing on device
     * This will show instructions since direct switching is not available
     */
    async switchToDevice(deviceId, deviceName) {
        const inputId = this.getDeviceInput(deviceId);
        
        if (!inputId) {
            // No input configured for this device
            Utils.log(`InputSwitcher: No input configured for device ${deviceId}`);
            return { success: false, reason: 'not_configured' };
        }
        
        if (!this.preferences.enabled) {
            Utils.log('InputSwitcher: Auto-switch disabled');
            return { success: false, reason: 'disabled' };
        }
        
        const inputLabel = this.getInputLabel(inputId);
        
        // Try CEC if available (very limited on Tizen)
        const cecResult = await this.tryCECSwitch(inputId);
        
        if (cecResult) {
            Utils.showToast(`Switching to ${inputLabel}...`, 'success');
            return { success: true, method: 'cec' };
        }
        
        // Show manual switch instructions
        this.showSwitchInstructions(inputLabel, deviceName);
        return { success: false, reason: 'manual_required', input: inputLabel };
    },
    
    /**
     * Try to use CEC to switch input
     * Note: This is very limited on Tizen and may not work
     */
    async tryCECSwitch(inputId) {
        try {
            // Tizen doesn't expose CEC control to web apps
            // This is a placeholder for potential future support
            // or for native app integration
            
            if (window.tizen && tizen.tvinputdevice) {
                // Check if we have any CEC capabilities
                // Currently not available for third-party apps
                Utils.log('InputSwitcher: CEC not available for third-party apps');
            }
            
            return false;
        } catch (error) {
            Utils.log('InputSwitcher: CEC error:', error);
            return false;
        }
    },
    
    /**
     * Show manual switch instructions
     */
    showSwitchInstructions(inputLabel, deviceName) {
        const modal = document.createElement('div');
        modal.className = 'input-switch-modal';
        modal.innerHTML = `
            <div class="input-switch-content">
                <div class="input-switch-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="64" height="64">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                        <line x1="8" y1="21" x2="16" y2="21"/>
                        <line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                </div>
                <h3>Switch to ${inputLabel}</h3>
                <p>Playing on <strong>${deviceName}</strong></p>
                <div class="input-switch-instructions">
                    <p>Press the <strong>Source</strong> or <strong>Input</strong> button on your remote</p>
                    <p>Then select <strong>${inputLabel}</strong></p>
                </div>
                <div class="input-switch-remote">
                    <div class="remote-button">SOURCE</div>
                </div>
                <button class="btn btn-primary focusable" id="inputSwitchDismiss" data-focus-row="input-switch">
                    Got it
                </button>
            </div>
        `;
        
        Views.showModal({
            content: modal,
            className: 'input-switch-overlay',
            onClose: () => {}
        });
        
        // Auto-dismiss after 5 seconds
        const autoDismiss = setTimeout(() => {
            Views.hideModal();
        }, 5000);
        
        // Manual dismiss
        modal.querySelector('#inputSwitchDismiss').addEventListener('click', () => {
            clearTimeout(autoDismiss);
            Views.hideModal();
        });
        
        // Focus dismiss button
        Navigation.setFocus(modal.querySelector('#inputSwitchDismiss'));
    },
    
    /**
     * Show input configuration modal for a device
     */
    showConfigModal(deviceId, deviceName) {
        const currentInput = this.getDeviceInput(deviceId);
        
        const modal = document.createElement('div');
        modal.className = 'input-config-modal';
        modal.innerHTML = `
            <h3>Configure Input for ${deviceName}</h3>
            <p>Select which TV input this device is connected to</p>
            <div class="input-options">
                <button class="input-option focusable ${!currentInput ? 'selected' : ''}" 
                        data-input="" 
                        data-focus-row="input-options">
                    <span class="input-label">None (Don't switch)</span>
                </button>
                ${this.INPUT_TYPES.map(input => `
                    <button class="input-option focusable ${currentInput === input.id ? 'selected' : ''}" 
                            data-input="${input.id}"
                            data-focus-row="input-options">
                        <span class="input-label">${input.label}</span>
                    </button>
                `).join('')}
            </div>
            <div class="input-config-actions">
                <button class="btn btn-secondary focusable" id="inputConfigCancel" data-focus-row="input-actions">
                    Cancel
                </button>
                <button class="btn btn-primary focusable" id="inputConfigSave" data-focus-row="input-actions">
                    Save
                </button>
            </div>
        `;
        
        let selectedInput = currentInput || '';
        
        Views.showModal({
            content: modal,
            className: 'input-config-overlay',
            onClose: () => {}
        });
        
        // Handle option selection
        modal.querySelectorAll('.input-option').forEach(btn => {
            btn.addEventListener('click', () => {
                modal.querySelectorAll('.input-option').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedInput = btn.dataset.input;
            });
        });
        
        // Cancel
        modal.querySelector('#inputConfigCancel').addEventListener('click', () => {
            Views.hideModal();
        });
        
        // Save
        modal.querySelector('#inputConfigSave').addEventListener('click', () => {
            if (selectedInput) {
                this.setDeviceInput(deviceId, selectedInput);
                Utils.showToast(`${deviceName} configured for ${this.getInputLabel(selectedInput)}`, 'success');
            } else {
                this.removeDeviceInput(deviceId);
                Utils.showToast(`Input switching disabled for ${deviceName}`, 'info');
            }
            Views.hideModal();
        });
        
        // Focus first option
        const firstOption = modal.querySelector('.input-option');
        if (firstOption) {
            Navigation.setFocus(firstOption);
        }
    },
    
    /**
     * Render settings panel for input switching
     */
    renderSettingsPanel() {
        return `
            <div class="settings-section">
                <h4>Input Switching</h4>
                <p class="settings-description">
                    When you play content on a connected device (like Kodi), 
                    FlixPicks can remind you to switch to the correct TV input.
                </p>
                <div class="settings-option">
                    <label class="toggle-label">
                        <span>Enable input switch reminders</span>
                        <input type="checkbox" 
                               id="inputSwitchEnabled" 
                               ${this.preferences.enabled ? 'checked' : ''}>
                        <span class="toggle-slider"></span>
                    </label>
                </div>
                <div class="settings-devices" id="inputDevicesList">
                    <!-- Device input mappings will be rendered here -->
                </div>
            </div>
        `;
    }
};

// Export for use in other modules
window.InputSwitcher = InputSwitcher;

