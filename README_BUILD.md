# FlixPicks Tizen TV App - Build & Deployment

Quick reference for building and deploying to Samsung TV.

---

## 🚀 Quick Start

```bash
# 1. Verify setup
./verify-setup.sh

# 2. Set up certificate (one-time)
./setup-certificate.sh

# 3. Build
./build.sh

# 4. Deploy to TV
./deploy.sh <TV_IP>
```

---

## 📋 Prerequisites Checklist

- [ ] Tizen Studio installed
- [ ] TV Extension package installed
- [ ] Samsung Developer account created
- [ ] Certificate profile created (FlixPicksTV)
- [ ] TV in Developer Mode
- [ ] TV and PC on same network

---

## 🔧 Build Process

### Automatic (Recommended)

```bash
./build.sh
```

This script:
- Checks Tizen installation
- Creates icon.png if missing
- Cleans previous builds
- Builds web app
- Packages as .wgt file

**Output:** `.buildResult/net.flixpicks.tv.wgt`

### Manual Build

```bash
# Build
tizen build-web -out .buildResult

# Package
tizen package -t wgt -s FlixPicksTV -- .buildResult
```

---

## 📱 Deploy to TV

### Automatic (Recommended)

```bash
./deploy.sh 192.168.1.50
```

This script:
- Connects to TV via SDB
- Uninstalls old app (if present)
- Installs new app
- Launches app

### Manual Deploy

```bash
# Connect
~/tizen-studio/tools/sdb connect <TV_IP>:26101

# Install
tizen install -n .buildResult/net.flixpicks.tv.wgt -t <TV_IP>:26101

# Run
tizen run -p net.flixpicks.tv -t <TV_IP>:26101
```

---

## 🐛 Debugging

### View Logs
```bash
~/tizen-studio/tools/sdb logcat
```

### Remote Debugging
```bash
tizen debug -p net.flixpicks.tv -t <TV_IP>:26101
```
Opens Chrome DevTools connected to TV.

### Common Commands
```bash
# List installed apps
sdb shell 0 "pkgcmd -l"

# Uninstall app
sdb shell 0 "pkgcmd -u -n net.flixpicks.tv"

# Check connection
sdb devices
```

---

## 📁 Build Output

```
.buildResult/
├── net.flixpicks.tv.wgt    # Packaged app (install this)
└── build.log                # Build log
```

---

## ⚙️ Configuration

### Certificate Profile
Edit `build.sh`:
```bash
CERT_PROFILE="FlixPicksTV"  # Change if needed
```

### App ID
Defined in `config.xml`:
```xml
<tizen:application id="net.flixpicks.tv" ... />
```

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| Build fails | Check `build.log` for errors |
| Certificate error | Run `./setup-certificate.sh` |
| Can't connect to TV | Verify Developer Mode enabled |
| Installation fails | Uninstall old app first |
| App won't launch | Check logs: `sdb logcat` |

---

## 📚 Full Documentation

- **Quick Start**: `QUICK_START.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Consistency Review**: `CONSISTENCY_REVIEW.md`

---

**Ready to build?** Run `./verify-setup.sh` first!

