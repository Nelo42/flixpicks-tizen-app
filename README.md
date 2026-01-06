# FlixPicks TV App

Samsung Tizen web app for browsing movies and TV shows from FlixPicks.net and controlling the FlixPicks MediaOS streaming box.

## Features

- **Browse Content**: Browse movies and TV shows with genre, decade, and language filters
- **Search**: Search for movies and TV shows with fuzzy matching
- **Content Details**: View full details including cast, streaming providers, and trailers
- **Watchlist**: Save content to watch later
- **Device Control**: Connect to and control FlixPicks MediaOS box
- **Playback Control**: Play, pause, stop, seek from the TV remote

## Project Structure

```
tizen-app/
├── index.html          # Main HTML entry point
├── config.xml          # Tizen app configuration
├── css/
│   ├── variables.css   # CSS custom properties (design tokens)
│   ├── base.css        # Reset and foundational styles
│   ├── components.css  # Reusable UI components
│   ├── screens.css     # Screen-specific styles
│   └── animations.css  # Transitions and animations
├── js/
│   ├── app.js          # Main application entry point
│   ├── utils.js        # Utility functions
│   ├── storage.js      # Local storage management
│   ├── navigation.js   # D-pad navigation system
│   ├── api.js          # FlixPicks.net API client
│   ├── device.js       # MediaOS device control
│   └── views.js        # View/screen management
└── assets/
    ├── images/         # App icons and placeholders
    └── fonts/          # Custom fonts (if any)
```

## Development

### Prerequisites

- Tizen Studio (for deployment to TV)
- Samsung TV in Developer Mode (for testing)
- Node.js (optional, for local development server)

### Local Development

The app can be tested in any modern web browser:

1. Start a local server in the `tizen-app` directory:
   ```bash
   python3 -m http.server 8080
   # or
   npx serve .
   ```

2. Open `http://localhost:8080` in Chrome or Firefox

3. Use keyboard arrows to simulate D-pad navigation:
   - Arrow keys: Navigate
   - Enter: Select
   - Backspace/Escape: Go back

### Testing on Samsung TV

1. Install Tizen Studio
2. Enable Developer Mode on your Samsung TV
3. Create a Samsung developer certificate
4. Connect to your TV in Device Manager
5. Right-click project → Run As → Tizen Web Application

### Building for Distribution

1. Create a Samsung Seller Office account
2. Generate a distributor certificate
3. Build the `.wgt` package in Tizen Studio
4. Upload to Samsung Galaxy Store

## API Integration

The app communicates with the FlixPicks.net backend:

- **Base URL**: `https://flixpicks.net/api/v1`
- **Authentication**: Session-based (anonymous) or JWT (logged in)
- **Key Endpoints**:
  - `/browse` - Browse content with filters
  - `/trending` - Get trending content
  - `/search` - Search movies/TV
  - `/content/{id}` - Get content details
  - `/watchlist` - Manage watchlist

## Device Control

The app connects to FlixPicks MediaOS boxes via WebSocket:

- **Protocol**: WebSocket (`ws://`)
- **Default Port**: 9999
- **Commands**: play, pause, resume, stop, seek, volume

### Message Format

```json
{
  "type": "play",
  "payload": {
    "type": "movie",
    "tmdb_id": 550,
    "title": "Fight Club"
  }
}
```

## TV Remote Keys

| Key | Action |
|-----|--------|
| ← → ↑ ↓ | Navigate between elements |
| Enter/OK | Select focused element |
| Back | Go back / Close overlay |
| Play | Resume playback |
| Pause | Pause playback |
| Stop | Stop playback |
| Rewind | Seek back 10 seconds |
| Fast Forward | Seek forward 10 seconds |

## Design System

The app uses CSS custom properties for theming:

```css
--bg-primary: #0a0a14;
--accent-primary: #3B82F6;
--accent-gold: #FFD700;
--text-primary: #ffffff;
--focus-ring: #3B82F6;
```

Typography is scaled for 10-foot viewing distance (TV).

## Browser Compatibility

- Samsung Tizen 5.0+ (2019+ TVs)
- Chrome 80+ (development)
- Firefox 75+ (development)

## License

Proprietary - FlixPicks

