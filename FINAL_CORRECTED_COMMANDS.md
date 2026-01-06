# Final Corrected Deployment Commands

## Network Configuration (Confirmed):

- **Mac IP:** 192.168.1.15
- **TV IP:** 192.168.1.71 ✅
- **Server:** poedev2

---

## Step 1: Verify TV Settings

**On your Samsung S90 TV:**

1. **Settings** → **General** → **Network** → **Network Status**
   - Verify IP shows: **192.168.1.71** ✅

2. **Settings** → **General** → **External Device Manager** → **Device Connection Manager**
   - Developer Mode: **Enabled** ✅
   - Server IP: **192.168.1.15** (your Mac's IP) ✅
   - TV was **rebooted** after entering Mac IP ✅

---

## Step 2: Download WGT File (if not done)

From your Mac terminal:
```bash
scp admin@poedev2:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/
```

---

## Step 3: Connect to TV

```bash
# Kill any existing SDB connections
~/tizen-studio/tools/sdb kill-server

# Connect to TV
~/tizen-studio/tools/sdb connect 192.168.1.71:26101
```

**Verify connection:**
```bash
~/tizen-studio/tools/sdb devices
# Should show: 192.168.1.71:26101    device    <model>
```

---

## Step 4: Install App

```bash
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.71:26101
```

---

## Step 5: Launch App

```bash
tizen run -p net.flixpicks.tv -t 192.168.1.71:26101
```

---

## If Connection Still Fails

1. **Double-check TV Network Status:**
   - Settings → Network → Network Status
   - Confirm IP is actually 192.168.1.71

2. **Verify Developer Mode:**
   - Settings → External Device Manager → Device Connection Manager
   - Server IP must be: **192.168.1.15**
   - Developer Mode must be **Enabled**
   - TV must be **rebooted**

3. **Test connectivity:**
   ```bash
   ping 192.168.1.71
   ```

4. **Try alternative port:**
   ```bash
   ~/tizen-studio/tools/sdb connect 192.168.1.71:26102
   ```

---

## Quick Command Reference

```bash
# Download
scp admin@poedev2:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/

# Connect
~/tizen-studio/tools/sdb kill-server
~/tizen-studio/tools/sdb connect 192.168.1.71:26101

# Verify
~/tizen-studio/tools/sdb devices

# Install
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.71:26101

# Run
tizen run -p net.flixpicks.tv -t 192.168.1.71:26101
```
