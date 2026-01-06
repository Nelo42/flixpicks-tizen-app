# FlixPicks Tizen App - Installation Problems & TizenBrew Solution

## Summary of Installation Problems

### Problem 1: Error 118/-4 "Load archive info fail"
- **Issue**: App installation failed with Error 118/-4 on Samsung S90C (2023 model)
- **Root Cause**: 
  - API version too high (`required_version="5.0"` in config.xml)
  - Certificate/DUID mismatch for 2023+ Samsung TVs
  - Tizen 7.0/8.0 requires Samsung account-linked certificates with registered DUIDs
- **Solution Applied**: Lowered `required_version` to `2.3` in config.xml

### Problem 2: Certificate Issues
- **Issue**: Generic Tizen certificates don't work on 2023+ Samsung TVs
- **Root Cause**: 
  - Samsung Knox security requires Samsung account-linked certificates
  - TV's DUID must be registered in distributor certificate
  - Cannot add DUIDs to existing certificates (must create new ones)
- **Solution Attempted**: Created Samsung certificate with DUID registration

### Problem 3: Tizen CLI Not Recognizing Devices
- **Issue**: `tizen install` and `tizen run` commands failed with "There is no target"
- **Root Cause**: Tizen CLI doesn't recognize devices connected via `sdb connect`
- **Workaround**: Used `sdb install` and `sdb shell` commands directly

### Problem 4: App Installed But Not Launching
- **Issue**: App installed successfully via `sdb install` but nothing appeared on TV screen
- **Root Cause**: Unknown - may be certificate signing issue or app launch failure
- **Status**: Unresolved - app installs but doesn't launch

### Problem 5: Developer Mode Limitations
- **Issue**: Many SDB commands blocked on consumer firmware
- **Root Cause**: Samsung restricts root access and system commands on retail devices
- **Impact**: Limited debugging capabilities

## Current Approach: TizenBrew Installation

### Why TizenBrew?
1. **Automatic Certificate Handling**: TizenBrew handles certificate signing automatically
2. **Bypasses Certificate Issues**: Works on 2023+ TVs without manual DUID registration
3. **Easy Updates**: Push to GitHub, update via TizenBrew
4. **No Manual Building**: TizenBrew builds from source automatically
5. **Community Proven**: High success rate on 2023 Samsung OLED models

### Setup Complete

**Files Created:**
1. `appinfo.json` - TizenBrew metadata file
2. `TIZENBREW_SETUP.md` - Complete setup guide

**Configuration Changes:**
- `config.xml`: Changed `required_version` from `5.0` to `2.3`

### Next Steps

1. **Create GitHub Repository:**
   ```bash
   cd /srv/www/Flixpicks_OS/tizen-app
   git init
   git add .
   git commit -m "Initial commit - FlixPicks Tizen app"
   git remote add origin https://github.com/YOUR_USERNAME/flixpicks-tizen-app.git
   git push -u origin main
   ```

2. **Install TizenBrew on TV** (if not already installed):
   - Follow: https://github.com/reisxd/TizenBrew
   - Use USB installation method (most reliable)

3. **Install App via TizenBrew:**
   - Open TizenBrew on TV
   - Navigate to "Install from GitHub"
   - Enter repository URL: `YOUR_USERNAME/flixpicks-tizen-app`

## Technical Details

### App Configuration
- **App ID**: `net.flixpicks.tv`
- **Package**: `FlixPicksTV`
- **Type**: Web app
- **Entry Point**: `index.html`
- **Icon**: `icon.png`
- **API Version**: `2.3` (minimum for compatibility)

### Certificate Information
- **Location**: `/Users/nelol/SamsungCertificate/FlixPicksTV/`
- **Type**: Samsung certificate (not generic Tizen)
- **Status**: Created with DUID registration
- **Note**: TizenBrew will use its own certificate for signing

### Build Process
- **Server Build**: Available at `/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt`
- **Local Build**: Available at `~/tizen-app/.buildResult/FlixPicks.wgt`
- **TizenBrew**: Will build from source automatically

## Known Issues & Limitations

1. **Direct SDB Installation**: App installs but doesn't launch (certificate/signing issue)
2. **Tizen CLI**: Doesn't work with `sdb connect` devices
3. **Developer Mode**: Limited shell access on consumer firmware
4. **Certificate Management**: Complex for 2023+ TVs requiring DUID registration

## Recommended Workflow

**For Development:**
- Use TizenBrew for installation (most reliable)
- Push changes to GitHub
- Update via TizenBrew on TV

**For Distribution:**
- Share GitHub repository URL
- Users install via TizenBrew
- Automatic updates when you push to GitHub

## Files Modified

1. `config.xml` - Changed `required_version="5.0"` to `required_version="2.3"`
2. `appinfo.json` - Created for TizenBrew (NEW)
3. `TIZENBREW_SETUP.md` - Setup guide (NEW)
4. `INSTALLATION_SUMMARY.md` - This file (NEW)

## References

- TizenBrew GitHub: https://github.com/reisxd/TizenBrew
- Error 118/-4 Solutions: Community research on 2023 Samsung OLED sideloading
- Samsung Developer: https://developer.samsung.com/
- Tizen Studio: https://developer.tizen.org/tizen-studio/download

