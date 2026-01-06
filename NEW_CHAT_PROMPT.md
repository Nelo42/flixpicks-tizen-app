# FlixPicks Tizen App - New Chat Thread Prompt

Copy this prompt when starting a new chat thread about the FlixPicks Tizen TV app:

---

## Context: FlixPicks Tizen TV App Installation

I'm working on installing the FlixPicks Tizen TV app on a Samsung S90C (2023 model, Tizen 7.0/8.0). We've encountered several installation issues and are now using TizenBrew as the installation method.

### Current Status

**App Location**: `/srv/www/Flixpicks_OS/tizen-app/`

**Configuration:**
- App ID: `net.flixpicks.tv`
- Package: `FlixPicksTV`
- Type: Web app
- Entry Point: `index.html`
- API Version: `2.3` (lowered from 5.0 for 2023+ TV compatibility)
- Icon: `icon.png`

**Files Created:**
- `appinfo.json` - TizenBrew metadata file (ready for GitHub)
- `config.xml` - Tizen app configuration (updated with `required_version="2.3"`)
- `TIZENBREW_SETUP.md` - Setup guide
- `INSTALLATION_SUMMARY.md` - Complete problem summary

### Problems Encountered

1. **Error 118/-4**: Fixed by lowering API version to 2.3
2. **Certificate Issues**: 2023+ TVs require Samsung account-linked certificates with DUID registration
3. **Tizen CLI Issues**: Doesn't recognize devices connected via `sdb connect`
4. **App Launch Failure**: App installs via `sdb install` but doesn't launch (certificate/signing issue)
5. **Developer Mode Limitations**: Limited shell access on consumer firmware

### Current Approach: TizenBrew

We're using TizenBrew to install the app because:
- Automatic certificate handling
- Bypasses certificate/DUID issues on 2023+ TVs
- Easy updates via GitHub
- High success rate on 2023 Samsung OLED models

**Setup Complete:**
- ✅ `appinfo.json` created
- ✅ `config.xml` updated (API version 2.3)
- ✅ TizenBrew setup guide created
- ⏳ GitHub repository needs to be created and pushed

### Next Steps Needed

1. Create GitHub repository for the app
2. Push code to GitHub
3. Install via TizenBrew on TV using "Install from GitHub" feature
4. Test app functionality

### Key Files

- **App Source**: `/srv/www/Flixpicks_OS/tizen-app/`
- **Build Output**: `.buildResult/FlixPicks.wgt` (149KB)
- **Certificate**: `/Users/nelol/SamsungCertificate/FlixPicksTV/` (on Mac)
- **TV IP**: `192.168.1.71:26101`
- **Mac IP**: `192.168.1.15`

### Technical Details

- **TV Model**: Samsung S90C (QN65S90CAFXZA)
- **Tizen Version**: 7.0 (potentially upgraded to 8.0)
- **Developer Mode**: Enabled
- **Network**: Local network (192.168.1.x)
- **Tizen Studio**: Installed on Mac at `~/tizen-studio/`
- **SDB**: Available at `~/tizen-studio/tools/sdb`

### What I Need Help With

[Describe your current issue or task here]

---

**Reference Documents:**
- `TIZENBREW_SETUP.md` - Complete TizenBrew setup guide
- `INSTALLATION_SUMMARY.md` - Detailed problem summary and solutions
- `DEPLOYMENT.md` - Original deployment documentation
- `LAUNCH_TROUBLESHOOTING.md` - Troubleshooting guide

