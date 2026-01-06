# FlixPicks Tizen TV App - Deployment Guide

Complete guide for building and deploying the FlixPicks TV app to Samsung Smart TVs.

---

## Prerequisites

1. **Tizen Studio Installed**
   - Download: https://developer.tizen.org/tizen-studio/download
   - Install TV Extension and Emulator packages
   - Verify: `tizen version` should work

2. **Samsung Developer Account** (Free)
   - Sign up: https://developer.samsung.com/
   - Required for generating certificates

3. **Samsung TV in Developer Mode**
   - See "Enable Developer Mode" section below

---

## Quick Start

### 1. Set Up Certificate (One-time)

```bash
cd /srv/www/Flixpicks_OS/tizen-app
chmod +x setup-certificate.sh
./setup-certificate.sh
```

Follow the on-screen instructions to create a certificate profile named `FlixPicksTV`.

**Alternative (Manual):**
```bash
# Launch Certificate Manager
~/tizen-studio/tools/certificate-manager/certificate-manager
```

Create a certificate profile:
- Name: `FlixPicksTV`
- Platform: TV
- Certificate Type: Samsung
- Privilege: Partner (for testing)

### 2. Build the App

```bash
chmod +x build.sh
./build.sh
```

This will:
- Clean previous builds
- Build the web app
- Package as `.wgt` file
- Output: `.buildResult/net.flixpicks.tv.wgt`

### 3. Deploy to TV

```bash
chmod +x deploy.sh
./deploy.sh <TV_IP_ADDRESS>
```

Example:
```bash
./deploy.sh 192.168.1.50
```

---

## Detailed Steps

### Enable Developer Mode on Samsung TV

1. **On your Samsung TV remote:**
   - Go to **Apps** menu
   - Press buttons in sequence: `1` `2` `3` `4` `5`
   - Developer Mode menu should appear

2. **Alternative method:**
   - Settings → General → System Manager → Developer Mode
   - Toggle **ON**

3. **Enter Host PC IP:**
   - Enter your development machine's IP address
   - Find your IP: `hostname -I` or `ip addr`

4. **Reboot TV:**
   - Required for changes to take effect

5. **Verify Developer Mode:**
   - After reboot, Developer Mode should show as enabled
   - Note the TV's IP address (shown in Developer Mode settings)

### Find Your TV's IP Address

**On TV:**
- Settings → General → External Device Manager → Device Connection Manager
- Or: Settings → Network → Network Status

**On Router:**
- Check connected devices list
- Look for device named "Samsung TV" or similar

### Connect to TV

```bash
# Connect via SDB (Smart Development Bridge)
~/tizen-studio/tools/sdb connect <TV_IP>:26101

# Verify connection
~/tizen-studio/tools/sdb devices
# Should show: <TV_IP>:26101    device    <model>
```

### Build Process

#### Manual Build

```bash
cd /srv/www/Flixpicks_OS/tizen-app

# Build web app
tizen build-web -out .buildResult

# Package with certificate
tizen package -t wgt -s FlixPicksTV -- .buildResult

# Find the WGT file
ls -lh .buildResult/*.wgt
```

#### Using Build Script

```bash
./build.sh
```

The script will:
- Check Tizen installation
- Create icon if missing
- Clean previous builds
- Build and package the app
- Show the WGT file location

### Install on TV

#### Using Deploy Script

```bash
./deploy.sh <TV_IP>
```

#### Manual Installation

```bash
# Install
tizen install -n .buildResult/net.flixpicks.tv.wgt -t <TV_IP>:26101

# Run
tizen run -p net.flixpicks.tv -t <TV_IP>:26101
```

#### Using SDB Directly

```bash
# Connect first
~/tizen-studio/tools/sdb connect <TV_IP>:26101

# Install
~/tizen-studio/tools/sdb install .buildResult/net.flixpicks.tv.wgt

# Launch
~/tizen-studio/tools/sdb shell 0 "app_launcher -s net.flixpicks.tv"
```

---

## Debugging

### Enable Remote Debugging

The app has `context-menu="enable"` in `config.xml`, which allows remote debugging.

```bash
# Connect debugger
tizen debug -p net.flixpicks.tv -t <TV_IP>:26101
```

This opens Chrome DevTools connected to the TV app.

### View Logs

```bash
# Real-time logs
~/tizen-studio/tools/sdb logcat

# Filter for app logs
~/tizen-studio/tools/sdb logcat | grep -i flixpicks
```

### Common Debug Commands

```bash
# List installed apps
~/tizen-studio/tools/sdb shell 0 "pkgcmd -l"

# Uninstall app
~/tizen-studio/tools/sdb shell 0 "pkgcmd -u -n net.flixpicks.tv"

# Check app status
~/tizen-studio/tools/sdb shell 0 "app_launcher -l"

# Kill app
~/tizen-studio/tools/sdb shell 0 "killall wgt-launcher"
```

---

## Troubleshooting

### Build Issues

| Issue | Solution |
|-------|----------|
| "Certificate profile not found" | Run `setup-certificate.sh` or create profile manually |
| "Java not found" | Install Java 8 or 11: `sudo apt install openjdk-11-jdk` |
| "Tizen CLI not found" | Add to PATH: `export PATH=$PATH:~/tizen-studio/tools/ide/bin` |
| "Icon file missing" | Create `icon.png` (80x80 PNG) or run build script (auto-creates) |

### Deployment Issues

| Issue | Solution |
|-------|----------|
| "Connection refused" | TV not in Developer Mode, or wrong IP address |
| "Certificate mismatch" | Uninstall old app: `sdb shell 0 "pkgcmd -u -n net.flixpicks.tv"` |
| "Installation failed" | Check certificate profile name matches in `build.sh` |
| "App won't launch" | Check logs: `sdb logcat` |
| "Black screen" | Check JavaScript console in debugger |

### Network Issues

| Issue | Solution |
|-------|----------|
| API calls fail | Check `config.xml` access policies |
| WebSocket fails | Verify device IP and port (default: 9999) |
| CORS errors | Ensure `flixpicks.net` is in access origins |
| Images don't load | Check `image.tmdb.org` is in access origins |

### Certificate Issues

| Issue | Solution |
|-------|----------|
| "Invalid certificate" | Regenerate certificate in Certificate Manager |
| "Certificate expired" | Create new certificate (valid for 1 year) |
| "Privilege denied" | Ensure "Partner" privilege level selected |

---

## Testing Checklist

After deployment, test:

- [ ] App launches successfully
- [ ] Loading screen appears
- [ ] Home view loads with content
- [ ] D-pad navigation works (arrow keys)
- [ ] Content rows scroll horizontally
- [ ] Browse view loads content
- [ ] Filters work (genre, decade, language, rating)
- [ ] Search works
- [ ] Details view shows correctly
- [ ] Provider logos display (non-clickable)
- [ ] User actions work (rating, like, skip, watchlist)
- [ ] Device connection works
- [ ] Playback commands work
- [ ] Back button navigates correctly
- [ ] Authentication flow works
- [ ] Voice input works (if supported)

---

## File Structure

```
tizen-app/
├── build.sh              # Build script
├── deploy.sh             # Deployment script
├── setup-certificate.sh  # Certificate setup helper
├── config.xml            # Tizen app configuration
├── index.html            # Main entry point
├── .buildResult/         # Build output (created by build)
│   └── *.wgt            # Packaged app file
└── ...
```

---

## Build Configuration

### Certificate Profile Name

Default: `FlixPicksTV`

To change, edit `build.sh`:
```bash
CERT_PROFILE="YourProfileName"
```

### App ID

Defined in `config.xml`:
```xml
<tizen:application id="net.flixpicks.tv" ... />
```

### Version

Update in `config.xml`:
```xml
<widget ... version="1.0.0" ...>
```

---

## Production Build

For production/Galaxy Store submission:

1. **Update version** in `config.xml`
2. **Remove debug flags** (if any)
3. **Verify API URLs** are production
4. **Create distributor certificate** (not just partner)
5. **Build with distributor certificate**:
   ```bash
   tizen package -t wgt -s FlixPicksTV_Distributor -- .buildResult
   ```

---

## Quick Reference

### Essential Commands

```bash
# Build
./build.sh

# Deploy
./deploy.sh <TV_IP>

# Connect to TV
~/tizen-studio/tools/sdb connect <TV_IP>:26101

# View devices
~/tizen-studio/tools/sdb devices

# Debug
tizen debug -p net.flixpicks.tv -t <TV_IP>:26101

# Logs
~/tizen-studio/tools/sdb logcat

# Uninstall
~/tizen-studio/tools/sdb shell 0 "pkgcmd -u -n net.flixpicks.tv"
```

### TV IP Examples

- Local network: `192.168.1.50`
- Emulator: `emulator-26101`
- Localhost (if testing): `127.0.0.1:26101`

---

## Next Steps

After successful deployment:

1. **Test all features** using the checklist above
2. **Fix any issues** found during testing
3. **Iterate** on improvements
4. **Prepare for Galaxy Store** (optional, see P9-010)

---

**Last Updated:** January 2026

