/**
 * FlixPicks TV App - Views Module
 * Manages different screens/views in the app
 */

const Views = {
    // Current active view
    currentView: 'home',
    
    // View history for back navigation
    viewHistory: [],
    
    // Cached data for views
    cache: {
        homeData: null,
        browseData: null,
        genres: null,
        heroItem: null,
        currentDetails: null,
        carouselItems: [],
        carouselIndex: 0
    },
    
    // Carousel auto-advance timer
    carouselTimer: null,
    CAROUSEL_INTERVAL: 8000, // 8 seconds
    
    // Browse state with advanced filters
    browseState: {
        type: 'movie',
        genre: null,
        decade: null,
        language: null,
        ratingMin: null,
        sort: 'popularity',
        page: 1,
        loading: false,
        hasMore: true
    },
    
    // Search state
    searchState: {
        query: '',
        results: [],
        loading: false
    },
    
    // Ask Flick state
    askFlickState: {
        messages: [],
        results: [],
        loading: false
    },
    
    // Recommendations state
    recommendationsState: {
        mood: null,
        results: [],
        page: 1,
        loading: false
    },
    
    // In Progress state
    inProgressState: {
        mode: 'inprogress',
        items: []
    },
    
    // User ratings state
    ratingsState: {
        currentRating: 0,
        isLiked: false,
        isSkipped: false
    },
    
    // Filter options
    filterOptions: {
        decades: [
            { value: null, label: 'All Time' },
            { value: '2020s', label: '2020s' },
            { value: '2010s', label: '2010s' },
            { value: '2000s', label: '2000s' },
            { value: '1990s', label: '1990s' },
            { value: '1980s', label: '1980s' },
            { value: '1970s', label: '1970s' },
            { value: 'classic', label: 'Classic (Pre-1970)' }
        ],
        languages: [
            { value: null, label: 'All Languages' },
            { value: 'en', label: 'English' },
            { value: 'es', label: 'Spanish' },
            { value: 'fr', label: 'French' },
            { value: 'de', label: 'German' },
            { value: 'ja', label: 'Japanese' },
            { value: 'ko', label: 'Korean' },
            { value: 'zh', label: 'Chinese' },
            { value: 'hi', label: 'Hindi' },
            { value: 'it', label: 'Italian' }
        ],
        ratings: [
            { value: null, label: 'Any Rating' },
            { value: 9, label: '9+ Exceptional' },
            { value: 8, label: '8+ Great' },
            { value: 7, label: '7+ Good' },
            { value: 6, label: '6+ Decent' },
            { value: 5, label: '5+ Watchable' }
        ],
        sortOptions: [
            { value: 'popularity', label: 'Popular' },
            { value: 'rating', label: 'Top Rated' },
            { value: 'release_date', label: 'Newest' },
            { value: 'title', label: 'A-Z' }
        ]
    },

    /**
     * Initialize views
     */
    async init() {
        this.bindEvents();
        await this.loadGenres();
        Utils.log('Views initialized');
    },

    /**
     * Bind view-related events
     */
    bindEvents() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.getAttribute('data-view');
                this.showView(view);
            });
        });
        
        // Hero buttons
        document.getElementById('heroPlayBtn')?.addEventListener('click', () => {
            this.playHeroContent();
        });
        
        document.getElementById('heroDetailsBtn')?.addEventListener('click', () => {
            this.showHeroDetails();
        });
        
        // Browse filters - Type toggle
        document.querySelectorAll('.type-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setMediaType(btn.getAttribute('data-value'));
            });
        });
        
        // Advanced filter buttons
        document.getElementById('genreFilterBtn')?.addEventListener('click', () => {
            this.showFilterModal('genre');
        });
        
        document.getElementById('decadeFilterBtn')?.addEventListener('click', () => {
            this.showFilterModal('decade');
        });
        
        document.getElementById('languageFilterBtn')?.addEventListener('click', () => {
            this.showFilterModal('language');
        });
        
        document.getElementById('ratingFilterBtn')?.addEventListener('click', () => {
            this.showFilterModal('rating');
        });
        
        document.getElementById('sortFilterBtn')?.addEventListener('click', () => {
            this.showFilterModal('sort');
        });
        
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            this.clearAllFilters();
        });
        
        document.getElementById('loadMoreBtn')?.addEventListener('click', () => {
            this.loadMoreBrowse();
        });
        
        // Search
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', Utils.debounce(() => {
                this.handleSearch(searchInput.value);
            }, 500));
            
            searchInput.addEventListener('focus', () => {
                // Could show on-screen keyboard here for Tizen
            });
        }
        
        document.getElementById('searchClear')?.addEventListener('click', () => {
            document.getElementById('searchInput').value = '';
            this.handleSearch('');
        });
        
        // Ask Flick
        this.bindAskFlickEvents();
        
        // Recommendations
        this.bindRecommendationsEvents();
        
        // In Progress
        this.bindInProgressEvents();
        
        // Ratings
        this.bindRatingsEvents();
        
        // Trailer
        this.bindTrailerEvents();
        
        // Details view
        document.getElementById('detailsPlayBtn')?.addEventListener('click', () => {
            this.playCurrentDetails();
        });
        
        document.getElementById('detailsWatchlistBtn')?.addEventListener('click', () => {
            this.toggleWatchlistDetails();
        });
        
        document.getElementById('detailsCloseBtn')?.addEventListener('click', () => {
            this.hideDetails();
        });
        
        // Devices
        document.getElementById('addDeviceBtn')?.addEventListener('click', () => {
            this.showAddDeviceModal();
        });
        
        // Playback controls
        document.getElementById('controlPlayPause')?.addEventListener('click', () => {
            Device.togglePlayPause();
        });
        
        document.getElementById('controlStop')?.addEventListener('click', () => {
            Device.stop();
        });
        
        document.getElementById('controlPrev')?.addEventListener('click', () => {
            Device.seekRelative(-30);
        });
        
        document.getElementById('controlNext')?.addEventListener('click', () => {
            Device.seekRelative(30);
        });
        
        // Back button handling
        document.addEventListener('navigation:back', () => {
            this.handleBack();
        });
    },

    /**
     * Show a view
     */
    async showView(viewName, saveHistory = true) {
        Utils.log(`showView: "${viewName}" (current: "${this.currentView}")`);
        
        // Skip if already on this view (but not on first load)
        if (viewName === this.currentView && this.viewHistory.length > 0) {
            Utils.log('showView: Already on this view, skipping');
            return;
        }
        
        // Hide details if showing
        this.hideDetails();
        
        // Save to history
        if (saveHistory && this.currentView) {
            this.viewHistory.push(this.currentView);
        }
        
        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-view') === viewName);
        });
        
        // Hide current view
        const currentViewEl = document.getElementById(`${this.currentView}View`);
        if (currentViewEl) {
            currentViewEl.classList.remove('active');
        }
        
        // Show new view
        const newViewEl = document.getElementById(`${viewName}View`);
        if (newViewEl) {
            newViewEl.classList.add('active');
            this.currentView = viewName;
            
            // Load view data
            await this.loadViewData(viewName);
            
            // Focus first content element (not header nav)
            setTimeout(() => {
                // Try to focus first card or button in the view content
                const view = document.getElementById(`${viewName}View`);
                if (view) {
                    const firstFocusable = view.querySelector('.focusable');
                    if (firstFocusable) {
                        Navigation.setFocus(firstFocusable, false);
                    }
                }
            }, 200);
        }
        
        Storage.saveLastView(viewName);
    },

    /**
     * Load data for a view
     */
    async loadViewData(viewName) {
        switch (viewName) {
            case 'home':
                await this.loadHome();
                break;
            case 'browse':
                await this.loadBrowse();
                break;
            case 'watchlist':
                await this.loadWatchlist();
                break;
            case 'devices':
                await this.loadDevices();
                break;
            case 'search':
                // Focus search input
                document.getElementById('searchInput')?.focus();
                break;
            case 'askFlick':
                await this.loadAskFlick();
                break;
            case 'recommendations':
                await this.loadRecommendations();
                break;
            case 'inProgress':
                await this.loadInProgress();
                break;
        }
    },

    /**
     * Handle back navigation
     */
    handleBack() {
        // If details view is open, close it
        const detailsView = document.getElementById('detailsView');
        if (detailsView?.classList.contains('active')) {
            this.hideDetails();
            return;
        }
        
        // If modal is open, close it
        const modal = document.getElementById('modalContainer');
        if (modal?.style.display !== 'none') {
            this.hideModal();
            return;
        }
        
        // Go to previous view
        if (this.viewHistory.length > 0) {
            const previousView = this.viewHistory.pop();
            this.showView(previousView, false);
        } else if (this.currentView !== 'home') {
            this.showView('home', false);
        }
    },

    // ==========================================
    // HOME VIEW
    // ==========================================

    /**
     * Load home view data
     */
    async loadHome() {
        Utils.log('loadHome: Starting...');
        try {
            // Load trending for carousel
            Utils.log('loadHome: Fetching trending for carousel...');
            const trendingMovies = await API.getTrending({ type: 'movie', window: 'week' });
            const trendingTV = await API.getTrending({ type: 'tv', window: 'week' });
            
            // Combine and take top 10 for carousel
            const carouselItems = [];
            const movies = trendingMovies.results || [];
            const tvShows = trendingTV.results || [];
            
            // Interleave movies and TV shows
            for (let i = 0; i < 5; i++) {
                if (movies[i]) carouselItems.push({ ...movies[i], media_type: 'movie' });
                if (tvShows[i]) carouselItems.push({ ...tvShows[i], media_type: 'tv' });
            }
            
            if (carouselItems.length > 0) {
                this.cache.carouselItems = carouselItems.slice(0, 10);
                this.cache.carouselIndex = 0;
                this.initCarousel();
            } else {
                Utils.log('loadHome: No trending results for carousel');
            }
            
            // Load content rows
            Utils.log('loadHome: Loading content rows...');
            await this.loadHomeRows();
            Utils.log('loadHome: Complete');
            
        } catch (error) {
            Utils.log('Error loading home:', error);
            console.error('loadHome error:', error);
            Utils.showToast('Failed to load content', 'error');
        }
    },

    /**
     * Initialize the hero carousel
     */
    initCarousel() {
        const items = this.cache.carouselItems;
        if (!items || items.length === 0) return;
        
        // Render dots
        const dotsContainer = document.getElementById('carouselDots');
        if (dotsContainer) {
            dotsContainer.innerHTML = items.map((_, i) => 
                `<span class="carousel-dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`
            ).join('');
            
            // Dot click handlers
            dotsContainer.querySelectorAll('.carousel-dot').forEach(dot => {
                dot.addEventListener('click', () => {
                    this.goToCarouselItem(parseInt(dot.dataset.index));
                });
            });
        }
        
        // Navigation button handlers
        document.getElementById('carouselPrev')?.addEventListener('click', () => this.prevCarouselItem());
        document.getElementById('carouselNext')?.addEventListener('click', () => this.nextCarouselItem());
        document.getElementById('carouselPlayBtn')?.addEventListener('click', () => this.playCarouselItem());
        document.getElementById('carouselDetailsBtn')?.addEventListener('click', () => this.showCarouselDetails());
        
        // Show first item
        this.renderCarouselItem(0);
        
        // Start auto-advance
        this.startCarouselTimer();
    },
    
    /**
     * Render a carousel item
     */
    renderCarouselItem(index) {
        const items = this.cache.carouselItems;
        if (!items || index < 0 || index >= items.length) return;
        
        const item = items[index];
        this.cache.carouselIndex = index;
        this.cache.heroItem = item;
        
        // Update content
        const title = item.title || item.name;
        document.getElementById('carouselTitle').textContent = title;
        document.getElementById('carouselOverview').textContent = item.overview || '';
        
        const meta = [];
        const year = item.release_date || item.first_air_date;
        if (year) meta.push(Utils.formatYear(year));
        if (item.vote_average) meta.push(`⭐ ${Utils.formatRating(item.vote_average)}`);
        meta.push(item.media_type === 'tv' ? 'TV Show' : 'Movie');
        
        document.getElementById('carouselMeta').innerHTML = meta
            .map(m => `<span class="carousel-meta-item">${m}</span>`)
            .join('');
        
        // Update backdrop
        const backdrop = document.getElementById('carouselBackdrop');
        const backdropUrl = Utils.getBackdropUrl(item, 'original');
        if (backdropUrl && backdrop) {
            backdrop.classList.remove('loaded');
            Utils.preloadImage(backdropUrl).then(() => {
                backdrop.style.backgroundImage = `url(${backdropUrl})`;
                backdrop.classList.add('loaded');
            });
        }
        
        // Update dots
        document.querySelectorAll('.carousel-dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    },
    
    /**
     * Go to specific carousel item
     */
    goToCarouselItem(index) {
        this.renderCarouselItem(index);
        this.resetCarouselTimer();
    },
    
    /**
     * Go to next carousel item
     */
    nextCarouselItem() {
        const items = this.cache.carouselItems;
        if (!items || items.length === 0) return;
        const nextIndex = (this.cache.carouselIndex + 1) % items.length;
        this.goToCarouselItem(nextIndex);
    },
    
    /**
     * Go to previous carousel item
     */
    prevCarouselItem() {
        const items = this.cache.carouselItems;
        if (!items || items.length === 0) return;
        const prevIndex = (this.cache.carouselIndex - 1 + items.length) % items.length;
        this.goToCarouselItem(prevIndex);
    },
    
    /**
     * Start carousel auto-advance timer
     */
    startCarouselTimer() {
        this.stopCarouselTimer();
        this.carouselTimer = setInterval(() => this.nextCarouselItem(), this.CAROUSEL_INTERVAL);
    },
    
    /**
     * Stop carousel timer
     */
    stopCarouselTimer() {
        if (this.carouselTimer) {
            clearInterval(this.carouselTimer);
            this.carouselTimer = null;
        }
    },
    
    /**
     * Reset carousel timer (restart after user interaction)
     */
    resetCarouselTimer() {
        this.startCarouselTimer();
    },
    
    /**
     * Play current carousel item on device
     */
    playCarouselItem() {
        const item = this.cache.heroItem;
        if (item) {
            this.playOnDevice(item);
        }
    },
    
    /**
     * Show details for current carousel item
     */
    showCarouselDetails() {
        const item = this.cache.heroItem;
        if (item) {
            // Ensure tmdb_id is set (carousel items may have 'id' instead)
            const detailsItem = {
                ...item,
                tmdb_id: item.tmdb_id || item.id,
                media_type: item.media_type || 'movie'
            };
            this.showDetails(detailsItem);
        }
    },

    /**
     * Render hero banner (legacy support)
     */
    renderHero(item) {
        const heroTitle = document.getElementById('heroTitle');
        const heroOverview = document.getElementById('heroOverview');
        const heroMeta = document.getElementById('heroMeta');
        const backdrop = document.getElementById('heroBackdrop');
        
        if (heroTitle) heroTitle.textContent = item.title || item.name;
        if (heroOverview) heroOverview.textContent = item.overview;
        
        const meta = [];
        const year = item.release_date || item.first_air_date;
        if (year) meta.push(Utils.formatYear(year));
        if (item.vote_average) meta.push(`⭐ ${Utils.formatRating(item.vote_average)}`);
        if (item.runtime) meta.push(Utils.formatRuntime(item.runtime));
        
        if (heroMeta) {
            heroMeta.innerHTML = meta
                .map(m => `<span class="hero-meta-item">${m}</span>`)
                .join('');
        }
        
        const backdropUrl = Utils.getBackdropUrl(item, 'original');
        if (backdropUrl && backdrop) {
            Utils.preloadImage(backdropUrl).then(() => {
                backdrop.style.backgroundImage = `url(${backdropUrl})`;
                backdrop.classList.add('loaded');
            });
        }
    },

    /**
     * Load home content rows
     */
    async loadHomeRows() {
        Utils.log('loadHomeRows: Starting...');
        const rowsContainer = document.getElementById('homeRows');
        rowsContainer.innerHTML = '';
        
        const rows = [
            { title: 'Trending Movies', type: 'movie', window: 'week' },
            { title: 'Trending TV Shows', type: 'tv', window: 'week' },
            { title: 'Popular Movies', type: 'movie', sort: 'popularity' },
            { title: 'Top Rated', type: 'movie', sort: 'rating' }
        ];
        
        for (const row of rows) {
            try {
                Utils.log(`loadHomeRows: Loading "${row.title}"...`);
                let data;
                if (row.window) {
                    data = await API.getTrending({ type: row.type, window: row.window });
                } else {
                    data = await API.browse({ type: row.type, sort: row.sort, perPage: 12 });
                }
                
                Utils.log(`loadHomeRows: "${row.title}" got ${data.results?.length || 0} results`);
                
                if (data.results?.length > 0) {
                    this.renderContentRow(rowsContainer, row.title, data.results, row.type);
                }
            } catch (error) {
                Utils.log(`Error loading row ${row.title}:`, error);
                console.error(`Row error ${row.title}:`, error);
            }
        }
        Utils.log('loadHomeRows: Complete');
    },

    /**
     * Render a content row
     */
    renderContentRow(container, title, items, mediaType) {
        Utils.log(`renderContentRow: "${title}" with ${items.length} items`);
        
        const rowIndex = container.children.length;
        const rowId = `home-row-${rowIndex}`;
        
        const rowEl = document.createElement('div');
        rowEl.className = 'content-row';
        rowEl.id = rowId;
        
        const headerEl = document.createElement('div');
        headerEl.className = 'row-header';
        
        const titleEl = document.createElement('h3');
        titleEl.className = 'row-title';
        titleEl.textContent = title;
        headerEl.appendChild(titleEl);
        
        const itemsEl = document.createElement('div');
        itemsEl.className = 'row-items';
        
        items.slice(0, 10).forEach((item, index) => {
            const card = this.createCard(item, mediaType);
            // Use unique row identifier for each content row
            card.setAttribute('data-focus-row', rowId);
            card.setAttribute('data-row-index', rowIndex);
            card.setAttribute('data-col-index', index);
            itemsEl.appendChild(card);
        });
        
        rowEl.appendChild(headerEl);
        rowEl.appendChild(itemsEl);
        container.appendChild(rowEl);
        
        Utils.log(`renderContentRow: Row "${title}" added with id ${rowId}`);
    },

    /**
     * Play hero content
     */
    playHeroContent() {
        if (this.cache.heroItem && Device.isConnected()) {
            Device.play(this.cache.heroItem);
            Utils.showToast('Playing on device...', 'success');
        } else if (!Device.isConnected()) {
            Utils.showToast('Connect to a device first', 'warning');
            this.showView('devices');
        }
    },

    /**
     * Show hero details
     */
    showHeroDetails() {
        if (this.cache.heroItem) {
            this.showDetails(this.cache.heroItem);
        }
    },

    // ==========================================
    // BROWSE VIEW
    // ==========================================

    /**
     * Load browse view
     */
    async loadBrowse(reset = true) {
        if (this.browseState.loading) return;
        
        if (reset) {
            this.browseState.page = 1;
            this.browseState.hasMore = true;
            document.getElementById('browseGrid').innerHTML = '';
        }
        
        this.browseState.loading = true;
        
        try {
            const data = await API.browse({
                type: this.browseState.type,
                genre: this.browseState.genre,
                sort: this.browseState.sort,
                page: this.browseState.page,
                perPage: 24
            });
            
            this.renderBrowseGrid(data.results, !reset);
            this.browseState.hasMore = data.page < data.total_pages;
            
            document.getElementById('loadMoreBtn').style.display = 
                this.browseState.hasMore ? 'block' : 'none';
                
        } catch (error) {
            Utils.log('Error loading browse:', error);
            Utils.showToast('Failed to load content', 'error');
        }
        
        this.browseState.loading = false;
    },

    /**
     * Render browse grid
     */
    renderBrowseGrid(items, append = false) {
        const grid = document.getElementById('browseGrid');
        
        if (!append) {
            grid.innerHTML = '';
        }
        
        items.forEach((item, index) => {
            const card = this.createCard(item, this.browseState.type);
            card.setAttribute('data-focus-row', 'browse-grid');
            grid.appendChild(card);
        });
    },

    /**
     * Load more browse content
     */
    async loadMoreBrowse() {
        this.browseState.page++;
        await this.loadBrowse(false);
    },

    /**
     * Set media type filter
     */
    setMediaType(type) {
        this.browseState.type = type;
        
        document.querySelectorAll('#typeFilter .filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-value') === type);
        });
        
        this.loadBrowse();
    },

    /**
     * Load genres
     */
    async loadGenres() {
        try {
            const data = await API.getGenres(this.browseState.type);
            this.cache.genres = data.genres;
        } catch (error) {
            Utils.log('Error loading genres:', error);
        }
    },

    /**
     * Show genre selector modal
     */
    showGenreSelector() {
        const genres = [{ id: null, name: 'All Genres' }, ...(this.cache.genres || [])];
        
        const content = Utils.createElement('div', { className: 'selection-modal' }, [
            Utils.createElement('h2', { className: 'selection-title', textContent: 'Select Genre' }),
            Utils.createElement('div', { className: 'selection-grid' })
        ]);
        
        const grid = content.querySelector('.selection-grid');
        
        genres.forEach(genre => {
            const btn = Utils.createElement('button', {
                className: `selection-item focusable ${genre.name === (this.browseState.genre || 'All Genres') ? 'selected' : ''}`,
                textContent: genre.name,
                'data-focus-row': 'modal'
            });
            
            btn.addEventListener('click', () => {
                this.browseState.genre = genre.id ? genre.name : null;
                document.getElementById('genreSelect').innerHTML = 
                    `${genre.name} <span class="select-arrow">▼</span>`;
                this.hideModal();
                this.loadBrowse();
            });
            
            grid.appendChild(btn);
        });
        
        this.showModal(content);
    },

    /**
     * Show sort selector modal
     */
    showSortSelector() {
        const sortOptions = [
            { value: 'popularity', label: 'Popularity' },
            { value: 'rating', label: 'Rating' },
            { value: 'release_date', label: 'Release Date' },
            { value: 'title', label: 'Title' }
        ];
        
        const content = Utils.createElement('div', { className: 'selection-modal' }, [
            Utils.createElement('h2', { className: 'selection-title', textContent: 'Sort By' }),
            Utils.createElement('div', { className: 'selection-grid' })
        ]);
        
        const grid = content.querySelector('.selection-grid');
        
        sortOptions.forEach(option => {
            const btn = Utils.createElement('button', {
                className: `selection-item focusable ${option.value === this.browseState.sort ? 'selected' : ''}`,
                textContent: option.label,
                'data-focus-row': 'modal'
            });
            
            btn.addEventListener('click', () => {
                this.browseState.sort = option.value;
                document.getElementById('sortSelect').innerHTML = 
                    `${option.label} <span class="select-arrow">▼</span>`;
                this.hideModal();
                this.loadBrowse();
            });
            
            grid.appendChild(btn);
        });
        
        this.showModal(content);
    },

    // ==========================================
    // SEARCH VIEW
    // ==========================================

    /**
     * Handle search input
     */
    async handleSearch(query) {
        this.searchState.query = query;
        
        const resultsEl = document.getElementById('searchResults');
        
        if (!query || query.length < 2) {
            resultsEl.innerHTML = '<p class="search-placeholder">Enter a search term to find movies and TV shows</p>';
            return;
        }
        
        resultsEl.innerHTML = '<p class="search-placeholder">Searching...</p>';
        
        try {
            const data = await API.search(query);
            this.searchState.results = data.results;
            
            if (data.results.length === 0) {
                resultsEl.innerHTML = '<p class="search-placeholder">No results found</p>';
                return;
            }
            
            resultsEl.innerHTML = '';
            const grid = Utils.createElement('div', { className: 'content-grid' });
            
            data.results.forEach(item => {
                const card = this.createCard(item, item.media_type);
                card.setAttribute('data-focus-row', 'search-results');
                grid.appendChild(card);
            });
            
            resultsEl.appendChild(grid);
            
        } catch (error) {
            Utils.log('Search error:', error);
            resultsEl.innerHTML = '<p class="search-placeholder">Search failed. Please try again.</p>';
        }
    },

    // ==========================================
    // WATCHLIST VIEW
    // ==========================================

    /**
     * Load watchlist
     */
    async loadWatchlist() {
        const grid = document.getElementById('watchlistGrid');
        const watchlist = Storage.getWatchlist();
        
        if (watchlist.length === 0) {
            grid.innerHTML = '<p class="empty-state">Your watchlist is empty. Browse content and add items to your watchlist.</p>';
            return;
        }
        
        grid.innerHTML = '';
        
        watchlist.forEach(item => {
            const card = this.createCard(item, item.media_type);
            card.setAttribute('data-focus-row', 'watchlist');
            grid.appendChild(card);
        });
    },

    // ==========================================
    // DEVICES VIEW
    // ==========================================

    /**
     * Load devices list
     */
    loadDevices() {
        const deviceList = document.getElementById('deviceList');
        const devices = Storage.getDevices();
        const activeDeviceId = Storage.getActiveDeviceId();
        
        if (devices.length === 0) {
            deviceList.innerHTML = '<p class="empty-state">No devices configured. Add a device to start streaming.</p>';
            return;
        }
        
        deviceList.innerHTML = '';
        
        devices.forEach(device => {
            const isActive = device.id === activeDeviceId;
            const isConnected = Device.isConnected() && Device.getCurrentDevice()?.id === device.id;
            
            const deviceEl = Utils.createElement('div', {
                className: 'device-item focusable',
                'data-focus-row': 'devices'
            }, [
                Utils.createElement('div', { className: 'device-icon', textContent: '📺' }),
                Utils.createElement('div', { className: 'device-info' }, [
                    Utils.createElement('div', { className: 'device-name', textContent: device.name }),
                    Utils.createElement('div', { className: 'device-address', textContent: `${device.ip}:${device.port || 9999}` })
                ]),
                Utils.createElement('div', {
                    className: `device-status ${isConnected ? 'connected' : 'disconnected'}`,
                    innerHTML: isConnected 
                        ? '<span class="status-dot connected"></span> Connected'
                        : '<span class="status-dot"></span> Disconnected'
                })
            ]);
            
            deviceEl.addEventListener('click', () => {
                if (isConnected) {
                    Device.disconnect();
                } else {
                    Device.connect(device);
                }
                setTimeout(() => this.loadDevices(), 1000);
            });
            
            deviceList.appendChild(deviceEl);
        });
    },

    /**
     * Show add device modal
     */
    showAddDeviceModal() {
        const content = Utils.createElement('div', { className: 'add-device-modal' }, [
            Utils.createElement('h2', { className: 'modal-title', textContent: 'Add Device' }),
            Utils.createElement('div', { className: 'form-group' }, [
                Utils.createElement('label', { textContent: 'Device Name' }),
                Utils.createElement('input', {
                    type: 'text',
                    id: 'deviceNameInput',
                    className: 'focusable',
                    placeholder: 'My FlixPicks Box',
                    'data-focus-row': 'modal'
                })
            ]),
            Utils.createElement('div', { className: 'form-group' }, [
                Utils.createElement('label', { textContent: 'IP Address' }),
                Utils.createElement('input', {
                    type: 'text',
                    id: 'deviceIpInput',
                    className: 'focusable',
                    placeholder: '192.168.1.100',
                    'data-focus-row': 'modal'
                })
            ]),
            Utils.createElement('div', { className: 'form-actions' }, [
                Utils.createElement('button', {
                    className: 'btn btn-secondary focusable',
                    textContent: 'Cancel',
                    'data-focus-row': 'modal',
                    onclick: () => this.hideModal()
                }),
                Utils.createElement('button', {
                    className: 'btn btn-primary focusable',
                    textContent: 'Add Device',
                    'data-focus-row': 'modal',
                    onclick: () => this.addDevice()
                })
            ])
        ]);
        
        this.showModal(content);
    },

    /**
     * Add device from modal
     */
    async addDevice() {
        const name = document.getElementById('deviceNameInput').value.trim();
        const ip = document.getElementById('deviceIpInput').value.trim();
        
        if (!name || !ip) {
            Utils.showToast('Please fill in all fields', 'warning');
            return;
        }
        
        if (!Utils.isValidIP(ip)) {
            Utils.showToast('Invalid IP address', 'error');
            return;
        }
        
        // Test connection
        Utils.showToast('Testing connection...', 'info');
        const success = await Device.testConnection(ip);
        
        if (!success) {
            Utils.showToast('Could not connect to device', 'error');
            return;
        }
        
        // Save device
        const device = {
            id: Utils.generateId(),
            name,
            ip,
            port: 9999
        };
        
        Storage.saveDevice(device);
        Utils.showToast('Device added successfully', 'success');
        
        this.hideModal();
        this.loadDevices();
        
        // Connect to new device
        Device.connect(device);
    },

    // ==========================================
    // DETAILS VIEW
    // ==========================================

    /**
     * Show content details
     */
    async showDetails(item) {
        this.cache.currentDetails = item;
        
        const detailsView = document.getElementById('detailsView');
        detailsView.classList.add('active');
        
        // Reset ratings state
        this.ratingsState.currentRating = 0;
        this.ratingsState.isLiked = false;
        this.ratingsState.isSkipped = false;
        this.updateStarRating(0);
        this.updateLikeButton();
        
        // Set basic info
        document.getElementById('detailsTitle').textContent = item.title;
        document.getElementById('detailsOverview').textContent = item.overview || '';
        
        // Set poster
        const posterUrl = Utils.getPosterUrl(item);
        document.getElementById('detailsPoster').src = posterUrl;
        
        // Set backdrop
        const backdrop = document.getElementById('detailsBackdrop');
        const backdropUrl = Utils.getBackdropUrl(item, 'original');
        if (backdropUrl) {
            Utils.preloadImage(backdropUrl).then(() => {
                backdrop.style.backgroundImage = `url(${backdropUrl})`;
                backdrop.classList.add('loaded');
            });
        }
        
        // Build meta info
        const meta = [];
        if (item.release_date) meta.push(Utils.formatYear(item.release_date));
        if (item.vote_average) meta.push(`⭐ ${Utils.formatRating(item.vote_average)}`);
        if (item.imdb_rating) meta.push(`IMDb ${Utils.formatRating(item.imdb_rating)}`);
        if (item.runtime) meta.push(Utils.formatRuntime(item.runtime));
        
        document.getElementById('detailsMeta').innerHTML = meta
            .map(m => `<span class="details-meta-item">${m}</span>`)
            .join('');
        
        // Update watchlist button
        this.updateWatchlistButton();
        
        // Hide seasons section initially
        document.getElementById('seasonsSection')?.classList.add('hidden');
        
        // Load full details
        try {
            const fullDetails = await API.getContent(item.tmdb_id, item.media_type || 'movie');
            this.cache.currentDetails = { ...item, ...fullDetails };
            
            // Update with full details
            if (fullDetails.overview) {
                document.getElementById('detailsOverview').textContent = fullDetails.overview;
            }
            
            // Render providers
            this.renderProviders(fullDetails.watch_providers);
            
            // Render cast
            this.renderCast(fullDetails.credits?.cast);
            
            // Load TV seasons if it's a TV show
            if (item.media_type === 'tv') {
                await this.loadTVSeasons(item.tmdb_id);
            }
            
        } catch (error) {
            Utils.log('Error loading details:', error);
        }
        
        // Focus first action button
        setTimeout(() => {
            Navigation.focusElement('#detailsPlayBtn');
        }, 100);
    },

    /**
     * Hide details view
     */
    hideDetails() {
        const detailsView = document.getElementById('detailsView');
        detailsView.classList.remove('active');
        
        // Clear backdrop
        const backdrop = document.getElementById('detailsBackdrop');
        backdrop.classList.remove('loaded');
        backdrop.style.backgroundImage = '';
        
        this.cache.currentDetails = null;
        
        // Restore focus
        Navigation.focusPrevious();
    },

    /**
     * Render streaming providers
     * Categorizes into Stream, Rent, Buy (matching web app)
     * Provider logos are NOT clickable - just show availability
     */
    renderProviders(watchProviders) {
        const container = document.getElementById('providerList');
        const providersSection = document.getElementById('detailsProviders');
        
        if (!watchProviders?.providers?.length) {
            container.innerHTML = '<p class="text-muted">No streaming options available</p>';
            return;
        }
        
        // Categorize providers like web app
        const stream = watchProviders.providers.filter(p => 
            ['flatrate', 'free', 'ads'].includes(p.availability_type)
        );
        const rent = watchProviders.providers.filter(p => 
            p.availability_type === 'rent'
        );
        const buy = watchProviders.providers.filter(p => 
            p.availability_type === 'buy'
        );
        
        container.innerHTML = '';
        
        // Stream category
        if (stream.length > 0) {
            const streamSection = Utils.createElement('div', { className: 'provider-category' }, [
                Utils.createElement('h4', { className: 'provider-category-title', textContent: 'Stream' }),
                Utils.createElement('div', { className: 'provider-items' })
            ]);
            const streamItems = streamSection.querySelector('.provider-items');
            stream.forEach(provider => {
                const providerEl = Utils.createElement('div', { 
                    className: 'provider-item',
                    title: `Available on ${provider.provider_name}`
                }, [
                    Utils.createElement('img', {
                        src: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
                        alt: provider.provider_name
                    })
                ]);
                streamItems.appendChild(providerEl);
            });
            container.appendChild(streamSection);
        }
        
        // Rent category
        if (rent.length > 0) {
            const rentSection = Utils.createElement('div', { className: 'provider-category' }, [
                Utils.createElement('h4', { className: 'provider-category-title', textContent: 'Rent' }),
                Utils.createElement('div', { className: 'provider-items' })
            ]);
            const rentItems = rentSection.querySelector('.provider-items');
            rent.forEach(provider => {
                const providerEl = Utils.createElement('div', { 
                    className: 'provider-item',
                    title: `Rent on ${provider.provider_name}`
                }, [
                    Utils.createElement('img', {
                        src: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
                        alt: provider.provider_name
                    })
                ]);
                rentItems.appendChild(providerEl);
            });
            container.appendChild(rentSection);
        }
        
        // Buy category
        if (buy.length > 0) {
            const buySection = Utils.createElement('div', { className: 'provider-category' }, [
                Utils.createElement('h4', { className: 'provider-category-title', textContent: 'Buy' }),
                Utils.createElement('div', { className: 'provider-items' })
            ]);
            const buyItems = buySection.querySelector('.provider-items');
            buy.forEach(provider => {
                const providerEl = Utils.createElement('div', { 
                    className: 'provider-item',
                    title: `Buy on ${provider.provider_name}`
                }, [
                    Utils.createElement('img', {
                        src: `https://image.tmdb.org/t/p/w92${provider.logo_path}`,
                        alt: provider.provider_name
                    })
                ]);
                buyItems.appendChild(providerEl);
            });
            container.appendChild(buySection);
        }
        
        // Hide section if no providers at all
        if (stream.length === 0 && rent.length === 0 && buy.length === 0) {
            if (providersSection) {
                providersSection.style.display = 'none';
            }
        } else {
            if (providersSection) {
                providersSection.style.display = 'block';
            }
        }
    },

    /**
     * Render cast list
     */
    renderCast(cast) {
        const container = document.getElementById('castList');
        container.innerHTML = '';
        
        if (!cast?.length) {
            container.innerHTML = '<p class="text-muted">Cast information not available</p>';
            return;
        }
        
        cast.slice(0, 10).forEach(person => {
            const photoUrl = person.profile_path 
                ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
                : 'assets/images/person-placeholder.svg';
            
            const castEl = Utils.createElement('div', { className: 'cast-item' }, [
                Utils.createElement('img', { className: 'cast-photo', src: photoUrl, alt: person.name }),
                Utils.createElement('div', { className: 'cast-name', textContent: person.name }),
                Utils.createElement('div', { className: 'cast-character', textContent: person.character || '' })
            ]);
            container.appendChild(castEl);
        });
    },

    /**
     * Play current details content
     */
    playCurrentDetails() {
        if (this.cache.currentDetails && Device.isConnected()) {
            Device.play(this.cache.currentDetails);
            Utils.showToast('Playing on device...', 'success');
        } else if (!Device.isConnected()) {
            Utils.showToast('Connect to a device first', 'warning');
        }
    },

    /**
     * Toggle watchlist for current details
     */
    toggleWatchlistDetails() {
        const item = this.cache.currentDetails;
        if (!item) return;
        
        const isInWatchlist = Storage.isInWatchlist(item.tmdb_id, item.media_type);
        
        if (isInWatchlist) {
            Storage.removeFromWatchlist(item.tmdb_id, item.media_type);
            Utils.showToast('Removed from watchlist', 'info');
        } else {
            Storage.addToWatchlist(item);
            Utils.showToast('Added to watchlist', 'success');
        }
        
        this.updateWatchlistButton();
    },

    /**
     * Update watchlist button state
     */
    updateWatchlistButton() {
        const btn = document.getElementById('detailsWatchlistBtn');
        if (!btn || !this.cache.currentDetails) return;
        
        const isInWatchlist = Storage.isInWatchlist(
            this.cache.currentDetails.tmdb_id, 
            this.cache.currentDetails.media_type
        );
        
        btn.innerHTML = isInWatchlist 
            ? '<span class="btn-icon">✓</span> In Watchlist'
            : '<span class="btn-icon">+</span> Add to Watchlist';
    },

    // ==========================================
    // MODAL
    // ==========================================

    /**
     * Show modal
     */
    showModal(content) {
        const container = document.getElementById('modalContainer');
        const contentEl = document.getElementById('modalContent');
        
        contentEl.innerHTML = '';
        contentEl.appendChild(content);
        container.style.display = 'flex';
        
        // Focus first focusable element in modal
        setTimeout(() => {
            const firstFocusable = contentEl.querySelector('.focusable');
            if (firstFocusable) {
                Navigation.setFocus(firstFocusable);
            }
        }, 100);
    },

    /**
     * Hide modal
     */
    hideModal() {
        const container = document.getElementById('modalContainer');
        container.classList.add('closing');
        
        setTimeout(() => {
            container.style.display = 'none';
            container.classList.remove('closing');
            Navigation.focusPrevious();
        }, 200);
    },

    // ==========================================
    // CARDS
    // ==========================================

    /**
     * Create content card
     */
    createCard(item, mediaType = 'movie') {
        const card = Utils.createElement('div', {
            className: 'card focusable',
            'data-tmdb-id': item.tmdb_id,
            'data-media-type': mediaType
        });
        
        const posterUrl = Utils.getPosterUrl(item);
        
        card.innerHTML = `
            <img class="card-poster" src="${posterUrl}" alt="${item.title}" loading="lazy">
            <div class="card-rating">
                <span class="card-rating-star">⭐</span>
                ${Utils.formatRating(item.vote_average || item.imdb_rating)}
            </div>
            <div class="card-overlay">
                <div class="card-title">${Utils.truncate(item.title, 30)}</div>
                <div class="card-meta">${Utils.formatYear(item.release_date)}</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.showDetails({ ...item, media_type: mediaType });
        });
        
        return card;
    },

    // ==========================================
    // ADVANCED FILTERS
    // ==========================================

    /**
     * Show filter modal
     */
    showFilterModal(filterType) {
        let options = [];
        let currentValue = null;
        let title = '';
        
        switch (filterType) {
            case 'genre':
                options = [{ id: null, name: 'All Genres' }, ...(this.cache.genres || [])];
                currentValue = this.browseState.genre;
                title = 'Select Genre';
                break;
            case 'decade':
                options = this.filterOptions.decades.map(d => ({ id: d.value, name: d.label }));
                currentValue = this.browseState.decade;
                title = 'Select Decade';
                break;
            case 'language':
                options = this.filterOptions.languages.map(l => ({ id: l.value, name: l.label }));
                currentValue = this.browseState.language;
                title = 'Select Language';
                break;
            case 'rating':
                options = this.filterOptions.ratings.map(r => ({ id: r.value, name: r.label }));
                currentValue = this.browseState.ratingMin;
                title = 'Minimum Rating';
                break;
            case 'sort':
                options = this.filterOptions.sortOptions.map(s => ({ id: s.value, name: s.label }));
                currentValue = this.browseState.sort;
                title = 'Sort By';
                break;
        }
        
        const content = Utils.createElement('div', { className: 'filter-modal' }, [
            Utils.createElement('h2', { className: 'filter-modal-title', textContent: title }),
            Utils.createElement('div', { className: 'filter-options-list' })
        ]);
        
        const list = content.querySelector('.filter-options-list');
        
        options.forEach(option => {
            const isSelected = option.id === currentValue || 
                (option.id === null && currentValue === null) ||
                (filterType === 'genre' && option.name === currentValue);
            
            const btn = Utils.createElement('button', {
                className: `filter-option focusable ${isSelected ? 'selected' : ''}`,
                textContent: option.name,
                'data-focus-row': 'modal'
            });
            
            btn.addEventListener('click', () => {
                this.applyFilter(filterType, option);
                this.hideModal();
            });
            
            list.appendChild(btn);
        });
        
        this.showModal(content);
    },

    /**
     * Apply filter
     */
    applyFilter(filterType, option) {
        switch (filterType) {
            case 'genre':
                this.browseState.genre = option.id ? option.name : null;
                document.getElementById('genreFilterValue').textContent = option.name;
                break;
            case 'decade':
                this.browseState.decade = option.id;
                document.getElementById('decadeFilterValue').textContent = option.name;
                break;
            case 'language':
                this.browseState.language = option.id;
                document.getElementById('languageFilterValue').textContent = option.name;
                break;
            case 'rating':
                this.browseState.ratingMin = option.id;
                document.getElementById('ratingFilterValue').textContent = option.name;
                break;
            case 'sort':
                this.browseState.sort = option.id;
                document.getElementById('sortFilterValue').textContent = option.name;
                break;
        }
        
        this.loadBrowse();
    },

    /**
     * Clear all filters
     */
    clearAllFilters() {
        this.browseState.genre = null;
        this.browseState.decade = null;
        this.browseState.language = null;
        this.browseState.ratingMin = null;
        this.browseState.sort = 'popularity';
        
        document.getElementById('genreFilterValue').textContent = 'All';
        document.getElementById('decadeFilterValue').textContent = 'All Time';
        document.getElementById('languageFilterValue').textContent = 'All';
        document.getElementById('ratingFilterValue').textContent = 'Any';
        document.getElementById('sortFilterValue').textContent = 'Popular';
        
        Utils.showToast('Filters cleared', 'info');
        this.loadBrowse();
    },

    // ==========================================
    // ASK FLICK (AI SEARCH)
    // ==========================================

    /**
     * Bind Ask Flick events
     */
    bindAskFlickEvents() {
        const input = document.getElementById('askFlickInput');
        const sendBtn = document.getElementById('askFlickSend');
        const voiceBtn = document.getElementById('voiceInputBtn');
        
        // Send on enter
        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.sendAskFlickQuery();
            }
        });
        
        // Send button
        sendBtn?.addEventListener('click', () => {
            this.sendAskFlickQuery();
        });
        
        // Voice button
        voiceBtn?.addEventListener('click', () => {
            this.toggleVoiceInput();
        });
        
        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', () => {
                const query = chip.getAttribute('data-query');
                document.getElementById('askFlickInput').value = query;
                this.sendAskFlickQuery();
            });
        });
        
        // Hide voice button if not supported
        if (!Voice.isSupported) {
            voiceBtn?.classList.add('hidden');
        }
    },

    /**
     * Load Ask Flick view
     */
    async loadAskFlick() {
        // Focus input
        setTimeout(() => {
            document.getElementById('askFlickInput')?.focus();
        }, 100);
    },

    /**
     * Toggle voice input
     */
    toggleVoiceInput() {
        const voiceBtn = document.getElementById('voiceInputBtn');
        const voiceLabel = document.getElementById('voiceLabel');
        
        if (Voice.isListening) {
            Voice.stopListening();
            voiceBtn.classList.remove('listening');
            voiceLabel.textContent = 'Speak';
        } else {
            Voice.startListening({
                onResult: (text, isFinal) => {
                    document.getElementById('askFlickInput').value = text;
                    if (isFinal) {
                        voiceBtn.classList.remove('listening');
                        voiceLabel.textContent = 'Speak';
                        this.sendAskFlickQuery();
                    }
                },
                onStateChange: (state) => {
                    if (state === 'listening') {
                        voiceBtn.classList.add('listening');
                        voiceLabel.textContent = 'Listening...';
                    } else {
                        voiceBtn.classList.remove('listening');
                        voiceLabel.textContent = 'Speak';
                    }
                },
                onError: (error) => {
                    Utils.showToast('Voice recognition failed', 'error');
                    voiceBtn.classList.remove('listening');
                }
            });
        }
    },

    /**
     * Send Ask Flick query
     */
    async sendAskFlickQuery() {
        const input = document.getElementById('askFlickInput');
        const query = input.value.trim();
        
        if (!query) return;
        
        // Add user message
        this.addFlickMessage(query, 'user');
        input.value = '';
        
        // Show typing indicator
        this.addFlickMessage('Thinking...', 'assistant typing');
        
        try {
            const response = await API.aiSearch(query, { type: this.browseState.type });
            
            // Remove typing indicator
            const chat = document.getElementById('askFlickChat');
            const typingMsg = chat.querySelector('.typing');
            if (typingMsg) typingMsg.remove();
            
            if (response.results?.length > 0) {
                this.addFlickMessage(response.explanation || `Found ${response.results.length} matches for you!`, 'assistant');
                this.renderAskFlickResults(response.results);
            } else {
                this.addFlickMessage("I couldn't find anything matching that description. Try being more specific or describing a different mood!", 'assistant');
            }
        } catch (error) {
            Utils.log('Ask Flick error:', error);
            const chat = document.getElementById('askFlickChat');
            const typingMsg = chat.querySelector('.typing');
            if (typingMsg) typingMsg.remove();
            
            this.addFlickMessage("Sorry, I had trouble searching. Please try again!", 'assistant');
        }
    },

    /**
     * Add message to Flick chat
     */
    addFlickMessage(text, type) {
        const chat = document.getElementById('askFlickChat');
        const msg = Utils.createElement('div', {
            className: `flick-message ${type}`
        }, [
            Utils.createElement('p', { textContent: text })
        ]);
        chat.appendChild(msg);
        chat.scrollTop = chat.scrollHeight;
    },

    /**
     * Render Ask Flick results
     */
    renderAskFlickResults(results) {
        const container = document.getElementById('askFlickResults');
        container.innerHTML = '';
        
        const grid = Utils.createElement('div', { className: 'content-grid' });
        
        results.forEach(item => {
            const card = this.createCard(item, item.media_type || this.browseState.type);
            card.setAttribute('data-focus-row', 'askflick-results');
            grid.appendChild(card);
        });
        
        container.appendChild(grid);
    },

    // ==========================================
    // RECOMMENDATIONS (FLIX PICKS)
    // ==========================================

    /**
     * Bind recommendations events
     */
    bindRecommendationsEvents() {
        // Mood buttons
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mood = btn.getAttribute('data-mood');
                this.selectMood(mood);
            });
        });
        
        // Back to moods
        document.getElementById('backToMoods')?.addEventListener('click', () => {
            this.showMoodPicker();
        });
        
        // Load more
        document.getElementById('recLoadMore')?.addEventListener('click', () => {
            this.loadMoreRecommendations();
        });
    },

    /**
     * Load recommendations view
     */
    async loadRecommendations() {
        // Show mood picker by default
        this.showMoodPicker();
    },

    /**
     * Show mood picker
     */
    showMoodPicker() {
        document.getElementById('moodPicker').classList.remove('hidden');
        document.getElementById('recommendationsResults').classList.add('hidden');
        this.recommendationsState.mood = null;
        this.recommendationsState.results = [];
        this.recommendationsState.page = 1;
    },

    /**
     * Select a mood
     */
    async selectMood(mood) {
        this.recommendationsState.mood = mood;
        this.recommendationsState.page = 1;
        
        document.getElementById('moodPicker').classList.add('hidden');
        document.getElementById('recommendationsResults').classList.remove('hidden');
        
        // Update title
        const moodLabels = {
            surprise: 'Surprise Picks',
            action: 'Action & Adventure',
            comedy: 'Comedy',
            drama: 'Drama',
            horror: 'Horror',
            romance: 'Romance',
            scifi: 'Sci-Fi & Fantasy',
            thriller: 'Thriller',
            documentary: 'Documentary',
            animation: 'Animation',
            family: 'Family Friendly',
            mystery: 'Mystery & Crime'
        };
        
        document.getElementById('recTitle').textContent = moodLabels[mood] || 'Picks For You';
        document.getElementById('recSubtitle').textContent = 'Personalized recommendations';
        
        await this.loadRecommendationResults();
    },

    /**
     * Load recommendation results
     */
    async loadRecommendationResults() {
        if (this.recommendationsState.loading) return;
        this.recommendationsState.loading = true;
        
        try {
            let genre = null;
            const mood = this.recommendationsState.mood;
            
            // Map mood to genre
            const moodToGenre = {
                action: 'Action',
                comedy: 'Comedy',
                drama: 'Drama',
                horror: 'Horror',
                romance: 'Romance',
                scifi: 'Science Fiction',
                thriller: 'Thriller',
                documentary: 'Documentary',
                animation: 'Animation',
                family: 'Family',
                mystery: 'Mystery'
            };
            
            if (mood !== 'surprise') {
                genre = moodToGenre[mood];
            }
            
            const data = await API.getRecommendations({
                type: this.browseState.type,
                genre,
                page: this.recommendationsState.page,
                perPage: 24
            });
            
            if (this.recommendationsState.page === 1) {
                this.recommendationsState.results = data.results || [];
            } else {
                this.recommendationsState.results.push(...(data.results || []));
            }
            
            this.renderRecommendationsGrid();
            
        } catch (error) {
            Utils.log('Recommendations error:', error);
            Utils.showToast('Failed to load recommendations', 'error');
        }
        
        this.recommendationsState.loading = false;
    },

    /**
     * Render recommendations grid
     */
    renderRecommendationsGrid() {
        const grid = document.getElementById('recGrid');
        grid.innerHTML = '';
        
        this.recommendationsState.results.forEach(item => {
            const card = this.createCard(item, item.media_type || this.browseState.type);
            card.setAttribute('data-focus-row', 'rec-grid');
            grid.appendChild(card);
        });
    },

    /**
     * Load more recommendations
     */
    async loadMoreRecommendations() {
        this.recommendationsState.page++;
        await this.loadRecommendationResults();
    },

    // ==========================================
    // IN PROGRESS
    // ==========================================

    /**
     * Bind in progress events
     */
    bindInProgressEvents() {
        // Toggle buttons
        document.querySelectorAll('#progressToggle .toggle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.setInProgressMode(mode);
            });
        });
        
        // Browse button in empty state
        document.getElementById('browseFromInProgress')?.addEventListener('click', () => {
            this.showView('browse');
        });
    },

    /**
     * Load in progress view
     */
    async loadInProgress() {
        const grid = document.getElementById('inprogressGrid');
        const loading = document.getElementById('inprogressLoading');
        const empty = document.getElementById('inprogressEmpty');
        
        grid.innerHTML = '';
        loading.classList.remove('hidden');
        empty.classList.add('hidden');
        
        try {
            // Get watch history from storage
            const history = Storage.getWatchHistory();
            
            if (history.length === 0) {
                loading.classList.add('hidden');
                empty.classList.remove('hidden');
                return;
            }
            
            this.inProgressState.items = history;
            this.renderInProgressGrid();
            loading.classList.add('hidden');
            
        } catch (error) {
            Utils.log('In progress error:', error);
            loading.classList.add('hidden');
            empty.classList.remove('hidden');
        }
    },

    /**
     * Set in progress mode
     */
    setInProgressMode(mode) {
        this.inProgressState.mode = mode;
        
        document.querySelectorAll('#progressToggle .toggle-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-mode') === mode);
        });
        
        this.renderInProgressGrid();
    },

    /**
     * Render in progress grid
     */
    renderInProgressGrid() {
        const grid = document.getElementById('inprogressGrid');
        grid.innerHTML = '';
        
        const items = this.inProgressState.items.filter(item => {
            if (this.inProgressState.mode === 'inprogress') {
                return item.progress && item.progress < 90;
            } else {
                return item.media_type === 'tv' && item.nextEpisode;
            }
        });
        
        if (items.length === 0) {
            document.getElementById('inprogressEmpty').classList.remove('hidden');
            return;
        }
        
        document.getElementById('inprogressEmpty').classList.add('hidden');
        
        items.forEach(item => {
            const card = this.createProgressCard(item);
            card.setAttribute('data-focus-row', 'inprogress-grid');
            grid.appendChild(card);
        });
    },

    /**
     * Create progress card
     */
    createProgressCard(item) {
        const card = Utils.createElement('div', {
            className: 'card progress-card focusable',
            'data-tmdb-id': item.tmdb_id,
            'data-media-type': item.media_type
        });
        
        const posterUrl = Utils.getPosterUrl(item);
        const progress = item.progress || 0;
        
        card.innerHTML = `
            <img class="card-poster" src="${posterUrl}" alt="${item.title}" loading="lazy">
            <div class="resume-icon">▶</div>
            <div class="card-progress">
                <div class="card-progress-fill" style="width: ${progress}%"></div>
            </div>
            <div class="card-overlay">
                <div class="card-title">${Utils.truncate(item.title, 30)}</div>
                <div class="card-meta">${progress}% watched</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            if (Device.isConnected()) {
                Device.play(item, { resume: true });
                Utils.showToast('Resuming playback...', 'success');
            } else {
                this.showDetails({ ...item, media_type: item.media_type });
            }
        });
        
        return card;
    },

    // ==========================================
    // RATINGS & ACTIONS
    // ==========================================

    /**
     * Bind ratings events
     */
    bindRatingsEvents() {
        // Star ratings
        document.querySelectorAll('#detailsStarRating .star').forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.getAttribute('data-rating'));
                this.rateContent(rating);
            });
        });
        
        // Like button
        document.getElementById('detailsLikeBtn')?.addEventListener('click', () => {
            this.toggleLike();
        });
        
        // Skip button
        document.getElementById('detailsSkipBtn')?.addEventListener('click', () => {
            this.skipContent();
        });
    },

    /**
     * Rate content
     */
    async rateContent(rating) {
        const item = this.cache.currentDetails;
        if (!item) return;
        
        this.ratingsState.currentRating = rating;
        this.updateStarRating(rating);
        
        try {
            await API.rateContent(item.tmdb_id, rating * 2, item.media_type);
            Utils.showToast(`Rated ${rating} stars`, 'success');
        } catch (error) {
            Utils.log('Rating error:', error);
        }
    },

    /**
     * Update star rating display
     */
    updateStarRating(rating) {
        document.querySelectorAll('#detailsStarRating .star').forEach(star => {
            const starRating = parseInt(star.getAttribute('data-rating'));
            star.classList.toggle('filled', starRating <= rating);
        });
    },

    /**
     * Toggle like
     */
    async toggleLike() {
        const item = this.cache.currentDetails;
        if (!item) return;
        
        this.ratingsState.isLiked = !this.ratingsState.isLiked;
        this.updateLikeButton();
        
        try {
            await API.recordAction(item.tmdb_id, this.ratingsState.isLiked ? 'like' : 'unlike', {
                contentType: item.media_type
            });
            Utils.showToast(this.ratingsState.isLiked ? 'Added to liked' : 'Removed from liked', 'success');
        } catch (error) {
            Utils.log('Like error:', error);
        }
    },

    /**
     * Update like button
     */
    updateLikeButton() {
        const btn = document.getElementById('detailsLikeBtn');
        if (btn) {
            btn.classList.toggle('active', this.ratingsState.isLiked);
            btn.querySelector('span').textContent = this.ratingsState.isLiked ? 'Liked' : 'Like';
        }
    },

    /**
     * Skip content
     */
    async skipContent() {
        const item = this.cache.currentDetails;
        if (!item) return;
        
        try {
            await API.recordAction(item.tmdb_id, 'skip', {
                contentType: item.media_type
            });
            Utils.showToast('Marked as not interested', 'info');
            this.hideDetails();
        } catch (error) {
            Utils.log('Skip error:', error);
        }
    },

    // ==========================================
    // TRAILER
    // ==========================================

    /**
     * Bind trailer events
     */
    bindTrailerEvents() {
        document.getElementById('detailsTrailerBtn')?.addEventListener('click', () => {
            this.showTrailer();
        });
        
        document.getElementById('trailerClose')?.addEventListener('click', () => {
            this.hideTrailer();
        });
        
        document.getElementById('trailerBackdrop')?.addEventListener('click', () => {
            this.hideTrailer();
        });
    },

    /**
     * Show trailer
     */
    async showTrailer() {
        const item = this.cache.currentDetails;
        if (!item) return;
        
        try {
            // Get trailer from extended content
            const extended = await API.getExtendedContent(item.tmdb_id, item.media_type);
            const trailer = extended.videos?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
            
            if (!trailer) {
                Utils.showToast('No trailer available', 'info');
                return;
            }
            
            const modal = document.getElementById('trailerModal');
            const player = document.getElementById('trailerPlayer');
            
            player.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
            
            modal.classList.remove('hidden');
            
            // Focus close button
            setTimeout(() => {
                Navigation.focusElement('#trailerClose');
            }, 100);
            
        } catch (error) {
            Utils.log('Trailer error:', error);
            Utils.showToast('Failed to load trailer', 'error');
        }
    },

    /**
     * Hide trailer
     */
    hideTrailer() {
        const modal = document.getElementById('trailerModal');
        const player = document.getElementById('trailerPlayer');
        
        player.innerHTML = '';
        modal.classList.add('hidden');
        
        Navigation.focusPrevious();
    },

    // ==========================================
    // TV SHOW SEASONS
    // ==========================================

    /**
     * Load TV seasons
     */
    async loadTVSeasons(tvId) {
        const section = document.getElementById('seasonsSection');
        const tabs = document.getElementById('seasonTabs');
        const list = document.getElementById('episodesList');
        
        try {
            const data = await API.getTVSeasons(tvId);
            
            if (!data.seasons?.length) {
                section.classList.add('hidden');
                return;
            }
            
            section.classList.remove('hidden');
            tabs.innerHTML = '';
            
            data.seasons.forEach((season, index) => {
                if (season.season_number === 0) return; // Skip specials
                
                const tab = Utils.createElement('button', {
                    className: `season-tab focusable ${index === 0 ? 'active' : ''}`,
                    textContent: `Season ${season.season_number}`,
                    'data-season': season.season_number,
                    'data-focus-row': 'season-tabs'
                });
                
                tab.addEventListener('click', () => {
                    this.selectSeason(tvId, season.season_number);
                    tabs.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
                    tab.classList.add('active');
                });
                
                tabs.appendChild(tab);
            });
            
            // Load first season
            if (data.seasons.length > 0) {
                const firstSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
                await this.selectSeason(tvId, firstSeason.season_number);
            }
            
        } catch (error) {
            Utils.log('TV seasons error:', error);
            section.classList.add('hidden');
        }
    },

    /**
     * Select a season
     */
    async selectSeason(tvId, seasonNumber) {
        const list = document.getElementById('episodesList');
        list.innerHTML = '<p class="text-muted">Loading episodes...</p>';
        
        try {
            const data = await API.getTVEpisodes(tvId, seasonNumber);
            
            list.innerHTML = '';
            
            data.episodes?.forEach(episode => {
                const episodeEl = this.createEpisodeItem(episode);
                list.appendChild(episodeEl);
            });
            
        } catch (error) {
            Utils.log('Episodes error:', error);
            list.innerHTML = '<p class="text-muted">Failed to load episodes</p>';
        }
    },

    /**
     * Create episode item
     */
    createEpisodeItem(episode) {
        const thumbUrl = episode.still_path 
            ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
            : 'assets/images/episode-placeholder.svg';
        
        const el = Utils.createElement('div', {
            className: 'episode-item focusable',
            'data-focus-row': 'episodes'
        });
        
        el.innerHTML = `
            <div class="episode-number">${episode.episode_number}</div>
            <img class="episode-thumb" src="${thumbUrl}" alt="">
            <div class="episode-info">
                <div class="episode-title">${episode.name}</div>
                <div class="episode-meta">${Utils.formatRuntime(episode.runtime)} • ${Utils.formatDate(episode.air_date)}</div>
                <div class="episode-overview">${episode.overview || ''}</div>
            </div>
            <button class="episode-play">▶</button>
        `;
        
        el.addEventListener('click', () => {
            if (Device.isConnected()) {
                Device.play({
                    ...this.cache.currentDetails,
                    season: episode.season_number,
                    episode: episode.episode_number
                });
                Utils.showToast(`Playing S${episode.season_number}E${episode.episode_number}`, 'success');
            } else {
                Utils.showToast('Connect to a device first', 'warning');
            }
        });
        
        return el;
    }
};

// Export for use in other modules
window.Views = Views;

