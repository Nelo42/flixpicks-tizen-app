# FlixPicks Tizen TV App - Feature Comparison & Analysis

## Overview
This document provides a comprehensive comparison between the FlixPicks.net web app and the Tizen TV app, identifying all feature gaps, navigation issues, and required fixes.

---

## Feature Comparison Matrix

| Feature | Web App | Tizen App | Status | Notes |
|---------|---------|-----------|--------|-------|
| **Authentication** |
| Google Sign-In | ✅ OAuth redirect | ✅ Device Flow | IMPLEMENTED | Uses TV-optimized device code flow |
| Apple Sign-In | ✅ | ❌ | NOT PLANNED | Complex on TV, low priority |
| Email/Password | ✅ | ❌ | NOT PLANNED | Difficult input on TV |
| Guest Mode | ✅ | ✅ | DONE | Local storage for watchlist |
| Token Refresh | ✅ | ✅ | IMPLEMENTED | Auto-refresh on 401 |
| **Navigation** |
| Browse Movies | ✅ | ✅ | DONE | Grid layout |
| Browse TV Shows | ✅ | ✅ | DONE | Grid layout |
| Ask Flick (AI) | ✅ | ✅ | DONE | Text + voice input |
| Flix Picks (Recommendations) | ✅ | ✅ | DONE | Mood-based |
| In Progress | ✅ | ✅ | DONE | Continue watching |
| Watchlist | ✅ | ✅ | DONE | Syncs when signed in |
| Devices | ✅ | ✅ | DONE | Kodi/CoreELEC control |
| **Content Display** |
| Hero Carousel | ✅ | ✅ | IMPLEMENTED | Auto-rotating trending |
| Content Grid | ✅ | ✅ | DONE | Poster cards |
| Detail Page | ✅ | ✅ | DONE | Full info + providers |
| TV Seasons/Episodes | ✅ | ✅ | DONE | Season tabs |
| Cast/Crew | ✅ | ✅ | DONE | Photos + names |
| **Filters** |
| Genre Filter | ✅ | ✅ | DONE | |
| Decade Filter | ✅ | ✅ | DONE | |
| Language Filter | ✅ | ✅ | DONE | |
| Rating Filter | ✅ | ✅ | DONE | |
| Sort Options | ✅ | ✅ | DONE | |
| **User Actions** |
| Star Rating | ✅ | ✅ | DONE | 1-5 stars |
| Like/Heart | ✅ | ✅ | DONE | |
| Skip/Not Interested | ✅ | ✅ | DONE | |
| Add to Watchlist | ✅ | ✅ | DONE | |
| **Streaming Providers** |
| Show Availability | ✅ | ✅ | DONE | Logos displayed |
| Launch Streaming App | ❌ N/A | ✅ | IMPLEMENTED | Netflix, Disney+, etc. |
| **Playback Control** |
| Play on Kodi Device | ✅ | ✅ | DONE | Via FlixPicks daemon |
| Remote Control | ❌ | ✅ | DONE | Play/pause/seek |
| Now Playing Bar | ❌ | ✅ | DONE | Shows current playback |
| **Voice Features** |
| Voice Search | ❌ | ✅ | IMPLEMENTED | Tizen Voice API |
| Voice Commands | ❌ | ✅ | IMPLEMENTED | Play, pause, etc. |
| **TV-Specific** |
| D-pad Navigation | N/A | ✅ | FIXED | Grid-aware navigation |
| Focus Management | N/A | ✅ | DONE | Visual focus ring |
| Input Switching | N/A | ✅ | IMPLEMENTED | User preference + reminder |
| 10-foot UI | N/A | ✅ | DONE | Large text, high contrast |

---

## Navigation Issues - FIXED

### Grid Navigation (FIXED)
**Problem:** Pressing RIGHT on the last item in a row sometimes went up/down instead of wrapping to the next row.

**Solution:** Implemented grid-aware navigation in `navigation.js`:
- Detects grid context automatically
- RIGHT on last item → first item of next row
- LEFT on first item → last item of previous row
- UP/DOWN moves to same column position
- Falls back to spatial navigation for non-grid elements

### Viewport Fitting (FIXED)
**Problem:** Content might overflow TV viewport.

**Solution:** 
- Body fixed to 1920x1080
- Main content has max-height calculation
- Views constrained to viewport
- Vertical scrolling enabled within views

---

## Streaming App Launch - IMPLEMENTED

### Supported Apps
| App | App ID | Deep Link Format | Status |
|-----|--------|------------------|--------|
| Netflix | 3201907018807 | netflix://title/{id} | ✅ |
| Prime Video | 3201910019365 | amzn://aiv/watch?gti={id} | ✅ |
| Disney+ | 3201901017640 | disneyplus://detail/{id} | ✅ |
| Hulu | 3201601007625 | hulu://watch/{id} | ✅ |
| Max (HBO) | 3201601007230 | hbomax://feature/{id} | ✅ |
| Apple TV+ | 3201807016597 | videos://open?id={id} | ✅ |
| Paramount+ | 3201908019041 | paramountplus://video/{id} | ✅ |
| Peacock | 3201909019411 | peacocktv://watch/{id} | ✅ |
| YouTube | 111299001912 | https://youtube.com/watch?v={id} | ✅ |
| Tubi | 3201504001965 | tubi://video/{id} | ✅ |
| Pluto TV | 3201512006963 | pluto://details/{id} | ✅ |

### Implementation Notes
- Uses `tizen.application.launchAppControl()` API
- Falls back to launching app without deep link if deep link fails
- Provider logos in detail view are NOT focusable/clickable (as requested)
- Separate "Watch on..." modal shows launchable options

---

## Input Switching - IMPLEMENTED

### Limitations
Samsung Tizen does **NOT** allow third-party apps to change TV input source programmatically. This is a platform security restriction.

### Our Solution
1. **User Preference Storage**: Users can configure which HDMI input each device is connected to
2. **Visual Reminder**: When playing on device, show a modal with instructions to switch input
3. **Auto-dismiss**: Modal auto-closes after 5 seconds
4. **Settings Panel**: Configure input mappings in Devices view

### Available Inputs
- HDMI 1-4
- Component
- AV/Composite
- USB

---

## Authentication - IMPLEMENTED

### Google OAuth Device Flow
This is the recommended approach for TV/limited-input devices:

1. User clicks "Sign In"
2. App displays a code (e.g., "ABCD-1234") and URL (google.com/device)
3. User enters code on phone/computer
4. App polls server until authorization complete
5. Tokens received and stored

### Implementation Details
- Uses FlixPicks server as OAuth intermediary
- Server handles Google OAuth client secret securely
- Tokens stored in local storage
- Auto-refresh on expiry
- Watchlist syncs after sign-in

---

## Files Modified/Created

### New Files
- `js/auth.js` - Google OAuth Device Flow authentication
- `js/streaming.js` - External streaming app launching
- `js/input-switcher.js` - HDMI input preference management
- `FEATURE_COMPARISON.md` - This document

### Modified Files
- `index.html` - Added carousel, sign-in modal, user menu
- `js/navigation.js` - Grid-aware navigation algorithm
- `js/views.js` - Carousel functionality
- `js/app.js` - Initialize new modules
- `css/base.css` - Viewport constraints
- `css/screens.css` - Carousel styles
- `css/components.css` - Sign-in modal, streaming options, input switcher styles
- `config.xml` - Added app launch privileges, Google OAuth access

---

## Remaining Items

### Critical (Before Build)
- [x] Grid navigation fix
- [x] Viewport fitting
- [x] Google Sign-In
- [x] Streaming app launch
- [x] Provider logos non-clickable

### Nice to Have
- [ ] Trakt integration (requires OAuth)
- [ ] Watch history sync
- [ ] Multiple user profiles
- [ ] Parental controls

### Known Limitations
1. **Input Switching**: Cannot be automated due to platform restrictions
2. **Apple Sign-In**: Too complex for TV, requires web view
3. **Deep Links**: Some streaming apps may not support deep links to specific content
4. **CEC Control**: Not exposed to third-party apps

---

## Testing Checklist

### Navigation
- [ ] Arrow keys work in all grids
- [ ] RIGHT on last item wraps to next row
- [ ] LEFT on first item wraps to previous row
- [ ] UP/DOWN maintains column position
- [ ] Back button returns to previous view
- [ ] Focus visible on all interactive elements

### Authentication
- [ ] Sign-in modal displays correctly
- [ ] Device code is readable
- [ ] QR code generates
- [ ] Polling detects authorization
- [ ] Tokens persist across app restart
- [ ] Sign-out clears all data

### Streaming Apps
- [ ] Provider logos display in detail view
- [ ] "Watch on..." shows available options
- [ ] Netflix launches correctly
- [ ] Other apps launch correctly
- [ ] Fallback works when app not installed

### Content
- [ ] Carousel rotates automatically
- [ ] All views load content
- [ ] Images load correctly
- [ ] Text is readable at 10-foot distance
- [ ] Filters work correctly

---

*Last Updated: January 5, 2026*

