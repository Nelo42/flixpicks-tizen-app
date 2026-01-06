/**
 * FlixPicks TV App - Voice Input Module
 * Handles voice recognition for Tizen TVs and web fallback
 */

const Voice = {
    // Voice recognition state
    isListening: false,
    isSupported: false,
    recognitionType: null, // 'tizen-vc', 'tizen-vi', 'web-speech'
    
    // Callbacks
    onResult: null,
    onError: null,
    onStateChange: null,
    
    // Recognition instances
    webSpeechRecognition: null,
    
    /**
     * Initialize voice module
     */
    init() {
        this.detectCapabilities();
        Utils.log('Voice initialized, type:', this.recognitionType, 'supported:', this.isSupported);
    },
    
    /**
     * Detect available voice recognition capabilities
     */
    detectCapabilities() {
        // Check Tizen VoiceInteraction API (advanced, free-form dictation)
        if (typeof tizen !== 'undefined' && tizen.voiceinteraction) {
            this.isSupported = true;
            this.recognitionType = 'tizen-vi';
            Utils.log('Voice: Tizen VoiceInteraction API available');
            return;
        }
        
        // Check Tizen Voice Control API (predefined commands)
        if (typeof tizen !== 'undefined' && tizen.voicecontrol) {
            this.isSupported = true;
            this.recognitionType = 'tizen-vc';
            Utils.log('Voice: Tizen Voice Control API available');
            return;
        }
        
        // Check Web Speech API (browser fallback)
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.isSupported = true;
            this.recognitionType = 'web-speech';
            this.webSpeechRecognition = new SpeechRecognition();
            this.setupWebSpeech();
            Utils.log('Voice: Web Speech API available');
            return;
        }
        
        this.isSupported = false;
        this.recognitionType = null;
        Utils.log('Voice: No voice recognition available');
    },
    
    /**
     * Setup Web Speech API
     */
    setupWebSpeech() {
        if (!this.webSpeechRecognition) return;
        
        const recognition = this.webSpeechRecognition;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
            this.isListening = true;
            this.notifyStateChange('listening');
        };
        
        recognition.onend = () => {
            this.isListening = false;
            this.notifyStateChange('idle');
        };
        
        recognition.onresult = (event) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }
            
            if (finalTranscript) {
                this.notifyResult(finalTranscript, true);
            } else if (interimTranscript) {
                this.notifyResult(interimTranscript, false);
            }
        };
        
        recognition.onerror = (event) => {
            Utils.log('Voice error:', event.error);
            this.isListening = false;
            this.notifyStateChange('error');
            this.notifyError(event.error);
        };
    },
    
    /**
     * Start listening for voice input
     */
    startListening(callbacks = {}) {
        if (!this.isSupported) {
            Utils.log('Voice: Not supported');
            return false;
        }
        
        if (this.isListening) {
            Utils.log('Voice: Already listening');
            return true;
        }
        
        // Set callbacks
        this.onResult = callbacks.onResult || null;
        this.onError = callbacks.onError || null;
        this.onStateChange = callbacks.onStateChange || null;
        
        switch (this.recognitionType) {
            case 'tizen-vi':
                return this.startTizenVoiceInteraction();
            case 'tizen-vc':
                return this.startTizenVoiceControl();
            case 'web-speech':
                return this.startWebSpeech();
            default:
                return false;
        }
    },
    
    /**
     * Stop listening
     */
    stopListening() {
        if (!this.isListening) return;
        
        switch (this.recognitionType) {
            case 'tizen-vi':
                this.stopTizenVoiceInteraction();
                break;
            case 'tizen-vc':
                this.stopTizenVoiceControl();
                break;
            case 'web-speech':
                this.stopWebSpeech();
                break;
        }
        
        this.isListening = false;
        this.notifyStateChange('idle');
    },
    
    /**
     * Start Tizen VoiceInteraction API
     */
    startTizenVoiceInteraction() {
        try {
            tizen.voiceinteraction.setVoiceInteractionListener({
                onresult: (result) => {
                    Utils.log('Tizen VI result:', result);
                    this.notifyResult(result.text, result.isFinal);
                    if (result.isFinal) {
                        this.isListening = false;
                        this.notifyStateChange('idle');
                    }
                },
                onerror: (error) => {
                    Utils.log('Tizen VI error:', error);
                    this.isListening = false;
                    this.notifyStateChange('error');
                    this.notifyError(error);
                }
            });
            
            tizen.voiceinteraction.start('DICTATION');
            this.isListening = true;
            this.notifyStateChange('listening');
            return true;
        } catch (e) {
            Utils.log('Tizen VI start error:', e);
            return false;
        }
    },
    
    /**
     * Stop Tizen VoiceInteraction
     */
    stopTizenVoiceInteraction() {
        try {
            tizen.voiceinteraction.cancel();
        } catch (e) {
            Utils.log('Tizen VI stop error:', e);
        }
    },
    
    /**
     * Start Tizen Voice Control API
     * Note: This is for predefined commands, less ideal for free-form search
     */
    startTizenVoiceControl() {
        try {
            // For Voice Control, we need to use the system's voice command
            // This is less flexible but works on more TVs
            tizen.voicecontrol.setCurrentLanguage('en_US');
            
            const commands = [
                { command: 'search', type: 'FOREGROUND' }
            ];
            
            tizen.voicecontrol.addVoiceControlResultListener((result) => {
                Utils.log('Tizen VC result:', result);
                if (result.type === 'VC_RESULT_TYPE_SUCCESS') {
                    this.notifyResult(result.command, true);
                }
                this.isListening = false;
                this.notifyStateChange('idle');
            });
            
            tizen.voicecontrol.setCommandList(commands, 'FOREGROUND');
            this.isListening = true;
            this.notifyStateChange('listening');
            return true;
        } catch (e) {
            Utils.log('Tizen VC start error:', e);
            return false;
        }
    },
    
    /**
     * Stop Tizen Voice Control
     */
    stopTizenVoiceControl() {
        try {
            tizen.voicecontrol.unsetCommandList('FOREGROUND');
        } catch (e) {
            Utils.log('Tizen VC stop error:', e);
        }
    },
    
    /**
     * Start Web Speech API
     */
    startWebSpeech() {
        if (!this.webSpeechRecognition) return false;
        
        try {
            this.webSpeechRecognition.start();
            return true;
        } catch (e) {
            Utils.log('Web Speech start error:', e);
            return false;
        }
    },
    
    /**
     * Stop Web Speech API
     */
    stopWebSpeech() {
        if (!this.webSpeechRecognition) return;
        
        try {
            this.webSpeechRecognition.stop();
        } catch (e) {
            Utils.log('Web Speech stop error:', e);
        }
    },
    
    /**
     * Toggle listening state
     */
    toggle(callbacks = {}) {
        if (this.isListening) {
            this.stopListening();
            return false;
        } else {
            return this.startListening(callbacks);
        }
    },
    
    /**
     * Notify result callback
     */
    notifyResult(text, isFinal) {
        if (this.onResult) {
            this.onResult(text, isFinal);
        }
    },
    
    /**
     * Notify error callback
     */
    notifyError(error) {
        if (this.onError) {
            this.onError(error);
        }
    },
    
    /**
     * Notify state change callback
     */
    notifyStateChange(state) {
        if (this.onStateChange) {
            this.onStateChange(state);
        }
    },
    
    /**
     * Get current state info
     */
    getState() {
        return {
            isSupported: this.isSupported,
            isListening: this.isListening,
            recognitionType: this.recognitionType
        };
    }
};

// Export for use in other modules
window.Voice = Voice;

