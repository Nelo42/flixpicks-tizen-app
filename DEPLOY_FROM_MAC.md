# Deploy FlixPicks TV App from Your Mac

Complete instructions for downloading and deploying the app from your local Mac to your Samsung S90 TV.

---

## Step 1: Download the WGT File

### Option A: Using SCP (Recommended)

From your Mac terminal:

```bash
# Replace 'admin' with your server username if different
scp admin@172.31.0.117:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/FlixPicks.wgt
```

**If you need to specify SSH key:**
```bash
scp -i ~/.ssh/your-key.pem admin@172.31.0.117:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/FlixPicks.wgt
```

### Option B: Using SFTP Client

1. Connect to server: `sftp://admin@172.31.0.117`
2. Navigate to: `/srv/www/Flixpicks_OS/tizen-app/.buildResult/`
3. Download: `FlixPicks.wgt`
4. Save to: `~/Downloads/FlixPicks.wgt`

---

## Step 2: Find Your TV's IP Address

On your Samsung S90 TV:

1. **Settings** → **General** → **Network** → **Network Status**
2. Note the **IP Address** (should be 192.168.1.XXX)
3. Also verify **Developer Mode** is enabled:
   - Settings → General → External Device Manager → Device Connection Manager
   - Developer Mode should show as **Enabled**

**Example TV IP:** `192.168.1.50` (yours will be different)

---

## Step 3: Connect to TV from Mac

Open Terminal on your Mac and run:

```bash
# Connect to TV (replace with your TV's actual IP)
~/tizen-studio/tools/sdb connect 192.168.1.XXX:26101
```

**If Tizen Studio is in a different location:**
```bash
# Find Tizen Studio location
find ~ -name "sdb" -type f 2>/dev/null | grep tizen-studio

# Then use the full path, e.g.:
/Users/yourname/tizen-studio/tools/sdb connect 192.168.1.XXX:26101
```

**Verify connection:**
```bash
~/tizen-studio/tools/sdb devices
# Should show: 192.168.1.XXX:26101    device    <model>
```

---

## Step 4: Install the App

Once connected:

```bash
# Install the app (replace with your TV IP and correct path)
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.XXX:26101
```

**If `tizen` command not found:**
```bash
# Add to PATH or use full path
export PATH=$PATH:~/tizen-studio/tools/ide/bin
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.XXX:26101
```

---

## Step 5: Launch the App

```bash
# Run the app
tizen run -p net.flixpicks.tv -t 192.168.1.XXX:26101
```

**Or using SDB:**
```bash
~/tizen-studio/tools/sdb shell 0 "app_launcher -s net.flixpicks.tv"
```

---

## Troubleshooting

### "Connection refused"
- Verify Developer Mode is enabled on TV
- Ensure TV was rebooted after enabling Developer Mode
- Check TV IP address is correct
- Try: `ping 192.168.1.XXX` to verify TV is reachable

### "tizen command not found"
```bash
# Add Tizen to PATH
export PATH=$PATH:~/tizen-studio/tools/ide/bin

# Or use full path
~/tizen-studio/tools/ide/bin/tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.XXX:26101
```

### "Installation failed"
```bash
# Uninstall old app first
~/tizen-studio/tools/sdb shell 0 "pkgcmd -u -n net.flixpicks.tv"

# Then try installing again
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.XXX:26101
```

### "Certificate error"
The app is built with certificates. If installation fails due to certificate:
- The WGT file should work as-is
- If issues persist, you may need to rebuild with different certificate settings

### View logs
```bash
# View TV logs
~/tizen-studio/tools/sdb logcat

# Filter for app logs
~/tizen-studio/tools/sdb logcat | grep -i flixpicks
```

### Debug with Chrome DevTools
```bash
tizen debug -p net.flixpicks.tv -t 192.168.1.XXX:26101
```

---

## Quick Reference

**Download:**
```bash
scp admin@172.31.0.117:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/
```

**Connect:**
```bash
~/tizen-studio/tools/sdb connect 192.168.1.XXX:26101
```

**Install:**
```bash
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.XXX:26101
```

**Run:**
```bash
tizen run -p net.flixpicks.tv -t 192.168.1.XXX:26101
```

---

## File Information

- **File:** `FlixPicks.wgt`
- **Size:** ~118KB
- **Location on server:** `/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt`
- **App ID:** `net.flixpicks.tv`
- **Certificate:** Signed with FlixPicksTV profile

---

**Good luck!** Once installed, the app should appear in your TV's Apps menu and launch automatically.


