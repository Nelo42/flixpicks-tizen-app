/**
 * FlixPicks TV App - Streaming Apps Module
 * Handles launching external streaming applications on Samsung TV
 */

const Streaming = {
    // Known streaming app IDs for Samsung Tizen
    // These are the official app IDs from Samsung's app store
    APPS: {
        netflix: {
            id: 'Netflix',
            appId: '3201907018807',
            deepLinkFormat: 'netflix://title/{id}',
            webFallback: 'https://www.netflix.com/title/{id}'
        },
        amazon: {
            id: 'Prime Video',
            appId: '3201910019365',
            deepLinkFormat: 'amzn://aiv/watch?gti={id}',
            webFallback: 'https://www.amazon.com/gp/video/detail/{id}'
        },
        disney: {
            id: 'Disney+',
            appId: '3201901017640',
            deepLinkFormat: 'disneyplus://detail/{id}',
            webFallback: 'https://www.disneyplus.com/video/{id}'
        },
        hulu: {
            id: 'Hulu',
            appId: '3201601007625',
            deepLinkFormat: 'hulu://watch/{id}',
            webFallback: 'https://www.hulu.com/watch/{id}'
        },
        hbo: {
            id: 'Max',
            appId: '3201601007230',
            deepLinkFormat: 'hbomax://feature/{id}',
            webFallback: 'https://play.max.com/feature/{id}'
        },
        apple: {
            id: 'Apple TV+',
            appId: '3201807016597',
            deepLinkFormat: 'videos://open?id={id}',
            webFallback: 'https://tv.apple.com/show/{id}'
        },
        paramount: {
            id: 'Paramount+',
            appId: '3201908019041',
            deepLinkFormat: 'paramountplus://video/{id}',
            webFallback: 'https://www.paramountplus.com/movies/video/{id}'
        },
        peacock: {
            id: 'Peacock',
            appId: '3201909019411',
            deepLinkFormat: 'peacocktv://watch/{id}',
            webFallback: 'https://www.peacocktv.com/watch/asset/{id}'
        },
        youtube: {
            id: 'YouTube',
            appId: '111299001912',
            deepLinkFormat: 'https://www.youtube.com/watch?v={id}',
            webFallback: 'https://www.youtube.com/watch?v={id}'
        },
        tubi: {
            id: 'Tubi',
            appId: '3201504001965',
            deepLinkFormat: 'tubi://video/{id}',
            webFallback: 'https://tubitv.com/movies/{id}'
        },
        pluto: {
            id: 'Pluto TV',
            appId: '3201512006963',
            deepLinkFormat: 'pluto://details/{id}',
            webFallback: 'https://pluto.tv/on-demand/movies/{id}'
        }
    },
    
    // Provider name mappings from TMDB/JustWatch
    PROVIDER_MAPPINGS: {
        'Netflix': 'netflix',
        'Amazon Prime Video': 'amazon',
        'Disney Plus': 'disney',
        'Disney+': 'disney',
        'Hulu': 'hulu',
        'HBO Max': 'hbo',
        'Max': 'hbo',
        'Apple TV Plus': 'apple',
        'Apple TV+': 'apple',
        'Paramount Plus': 'paramount',
        'Paramount+': 'paramount',
        'Peacock': 'peacock',
        'Peacock Premium': 'peacock',
        'YouTube': 'youtube',
        'YouTube Premium': 'youtube',
        'Tubi': 'tubi',
        'Tubi TV': 'tubi',
        'Pluto TV': 'pluto'
    },
    
    /**
     * Initialize streaming module
     */
    init() {
        Utils.log('Streaming: Initialized');
    },
    
    /**
     * Get app info by provider name
     */
    getAppByProvider(providerName) {
        const key = this.PROVIDER_MAPPINGS[providerName];
        if (key) {
            return this.APPS[key];
        }
        return null;
    },
    
    /**
     * Check if a streaming app is available
     */
    async isAppAvailable(appKey) {
        const app = this.APPS[appKey];
        if (!app) return false;
        
        try {
            if (window.tizen && tizen.application) {
                return new Promise((resolve) => {
                    tizen.application.getAppInfo(app.appId, 
                        () => resolve(true),
                        () => resolve(false)
                    );
                });
            }
        } catch (error) {
            Utils.log('Streaming: Error checking app availability:', error);
        }
        
        return false;
    },
    
    /**
     * Launch streaming app with content
     * @param {string} providerName - Name of the streaming provider
     * @param {string} contentId - Provider-specific content ID
     * @param {object} options - Additional options
     */
    async launchApp(providerName, contentId, options = {}) {
        const app = this.getAppByProvider(providerName);
        
        if (!app) {
            Utils.log(`Streaming: Unknown provider: ${providerName}`);
            Utils.showToast(`${providerName} is not supported for direct launch`, 'warning');
            return false;
        }
        
        Utils.log(`Streaming: Launching ${app.id} with content ${contentId}`);
        
        try {
            if (window.tizen && tizen.application) {
                // Build deep link URL
                const deepLink = app.deepLinkFormat.replace('{id}', contentId);
                
                // Create app control
                const appControl = new tizen.ApplicationControl(
                    'http://tizen.org/appcontrol/operation/view',
                    deepLink,
                    null,
                    null,
                    null
                );
                
                // Try to launch with deep link
                return new Promise((resolve) => {
                    tizen.application.launchAppControl(
                        appControl,
                        app.appId,
                        () => {
                            Utils.log(`Streaming: Successfully launched ${app.id}`);
                            Utils.showToast(`Opening in ${app.id}...`, 'success');
                            resolve(true);
                        },
                        (error) => {
                            Utils.log(`Streaming: Failed to launch ${app.id}:`, error);
                            
                            // Try launching app without deep link
                            this.launchAppOnly(app.appId, app.id).then(resolve);
                        }
                    );
                });
            } else {
                // Not on Tizen, show web fallback
                Utils.log('Streaming: Not on Tizen, using web fallback');
                const webUrl = app.webFallback.replace('{id}', contentId);
                Utils.showToast(`Open ${webUrl} to watch`, 'info');
                return false;
            }
        } catch (error) {
            Utils.log('Streaming: Launch error:', error);
            Utils.showToast(`Failed to open ${app.id}`, 'error');
            return false;
        }
    },
    
    /**
     * Launch app without deep link (just open the app)
     */
    async launchAppOnly(appId, appName) {
        try {
            if (window.tizen && tizen.application) {
                return new Promise((resolve) => {
                    tizen.application.launch(
                        appId,
                        () => {
                            Utils.log(`Streaming: Launched ${appName} (no deep link)`);
                            Utils.showToast(`Opening ${appName}...`, 'success');
                            resolve(true);
                        },
                        (error) => {
                            Utils.log(`Streaming: Failed to launch ${appName}:`, error);
                            Utils.showToast(`${appName} may not be installed`, 'warning');
                            resolve(false);
                        }
                    );
                });
            }
        } catch (error) {
            Utils.log('Streaming: Launch error:', error);
        }
        return false;
    },
    
    /**
     * Get available streaming options for content
     * Filters providers to only those we can launch
     */
    getAvailableOptions(watchProviders) {
        if (!watchProviders?.providers) return [];
        
        return watchProviders.providers
            .map(provider => {
                const app = this.getAppByProvider(provider.provider_name);
                return {
                    ...provider,
                    canLaunch: !!app,
                    appInfo: app
                };
            })
            .sort((a, b) => {
                // Sort launchable apps first
                if (a.canLaunch && !b.canLaunch) return -1;
                if (!a.canLaunch && b.canLaunch) return 1;
                return 0;
            });
    },
    
    /**
     * Show streaming options modal
     */
    showStreamingOptions(content, watchProviders) {
        const options = this.getAvailableOptions(watchProviders);
        
        if (options.length === 0) {
            Utils.showToast('No streaming options available', 'info');
            return;
        }
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'streaming-options-modal';
        modalContent.innerHTML = `
            <h3>Where to Watch</h3>
            <p class="streaming-title">${content.title || content.name}</p>
            <div class="streaming-options-list">
                ${options.map((opt, index) => `
                    <button class="streaming-option focusable ${opt.canLaunch ? 'launchable' : ''}" 
                            data-provider="${opt.provider_name}"
                            data-focus-row="streaming-options"
                            ${opt.canLaunch ? `data-launch="true"` : ''}>
                        <img src="https://image.tmdb.org/t/p/w92${opt.logo_path}" 
                             alt="${opt.provider_name}" 
                             class="streaming-logo">
                        <span class="streaming-name">${opt.provider_name}</span>
                        ${opt.canLaunch ? '<span class="streaming-launch-icon">▶</span>' : ''}
                    </button>
                `).join('')}
            </div>
            <p class="streaming-note">
                ${options.some(o => o.canLaunch) 
                    ? 'Select a service to open the app' 
                    : 'These services are available but cannot be launched directly'}
            </p>
        `;
        
        Views.showModal({
            content: modalContent,
            onClose: () => {},
            className: 'streaming-modal'
        });
        
        // Bind click handlers
        modalContent.querySelectorAll('.streaming-option[data-launch="true"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const providerName = btn.dataset.provider;
                // Note: We'd need the provider-specific content ID here
                // This would come from the watch providers API response
                this.launchApp(providerName, content.id);
                Views.hideModal();
            });
        });
        
        // Focus first option
        const firstOption = modalContent.querySelector('.streaming-option');
        if (firstOption) {
            Navigation.setFocus(firstOption);
        }
    }
};

// Export for use in other modules
window.Streaming = Streaming;

