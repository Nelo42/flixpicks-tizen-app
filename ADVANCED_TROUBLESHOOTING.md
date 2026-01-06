# Advanced Troubleshooting - Developer Mode Enabled

## Situation:
- ✅ TV IP: 192.168.1.71 (confirmed)
- ✅ Developer Mode: Enabled
- ✅ Mac IP (192.168.1.15) set as host in TV
- ❌ Connection still fails

---

## Solution 1: Try Different Ports

Samsung TVs sometimes use different ports for Developer Mode:

```bash
# Standard port
~/tizen-studio/tools/sdb connect 192.168.1.71:26101

# Alternative port
~/tizen-studio/tools/sdb connect 192.168.1.71:26102

# Try without port (uses default)
~/tizen-studio/tools/sdb connect 192.168.1.71
```

---

## Solution 2: Complete SDB Reset

```bash
# Kill SDB server
~/tizen-studio/tools/sdb kill-server

# Remove SDB cache (if exists)
rm -rf ~/.tizen-studio-data/sdb 2>/dev/null

# Wait a moment
sleep 2

# Try connecting
~/tizen-studio/tools/sdb connect 192.168.1.71:26101

# Check devices
~/tizen-studio/tools/sdb devices
```

---

## Solution 3: Test Port Connectivity

From your Mac, test if TV accepts connections:

```bash
# Install netcat if needed
brew install netcat

# Test port 26101
nc -zv 192.168.1.71 26101

# Test port 26102
nc -zv 192.168.1.71 26102
```

**If connection succeeds:**
- Port is open, issue is with SDB
- Try Solution 2 (reset SDB)

**If connection fails:**
- Port might be blocked by firewall
- Or TV not listening on that port
- Check TV's Developer Mode settings again

---

## Solution 4: Check Mac Firewall

1. **System Settings** → **Network** → **Firewall**
2. **Options** → Check if Tizen Studio is blocked
3. **Temporarily disable firewall** to test
4. Try connecting again

---

## Solution 5: Verify TV Developer Mode Status

On TV, double-check:

1. **Settings** → **General** → **External Device Manager** → **Device Connection Manager**
2. Verify:
   - Developer Mode shows **"Enabled"** (not just toggled)
   - Server IP shows: **192.168.1.15**
   - No error messages
   - Status shows "Ready" or "Connected"

3. **Try disabling and re-enabling Developer Mode:**
   - Toggle OFF
   - Reboot TV
   - Toggle ON
   - Enter Mac IP: **192.168.1.15**
   - Reboot TV again

---

## Solution 6: Check TV Software Version

Some older TV software versions have Developer Mode bugs:

1. **Settings** → **Support** → **Software Update**
2. Check if TV software is up to date
3. Update if available
4. Re-enable Developer Mode after update

---

## Solution 7: Alternative Connection Method

Try using Tizen Studio IDE instead of command line:

1. Open Tizen Studio on Mac
2. **Tools** → **Device Manager**
3. Click **"+"** to add device
4. Enter: **192.168.1.71:26101**
5. Click **Connect**

---

## Solution 8: USB Sideload (Bypass Network)

If network connection continues to fail:

1. **Download WGT:**
   ```bash
   scp admin@poedev2:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/
   ```

2. **Copy to USB drive** (FAT32/exFAT)

3. **Install on TV:**
   - Insert USB
   - Settings → General → External Device Manager
   - Look for "Install from USB" or "Developer Apps"
   - Select FlixPicks.wgt
   - Install

---

## Most Likely Solutions (Try These First):

1. **Try port 26102:**
   ```bash
   ~/tizen-studio/tools/sdb connect 192.168.1.71:26102
   ```

2. **Reset SDB completely:**
   ```bash
   ~/tizen-studio/tools/sdb kill-server
   rm -rf ~/.tizen-studio-data/sdb 2>/dev/null
   ~/tizen-studio/tools/sdb connect 192.168.1.71:26101
   ```

3. **Check Mac firewall** - temporarily disable to test

4. **Re-enable Developer Mode** on TV (toggle off, reboot, toggle on, enter IP, reboot)

---

## Still Not Working?

If all solutions fail, the issue might be:
- TV model/software version compatibility
- Network router blocking port 26101
- TV's Developer Mode implementation bug

**Best alternative:** Use USB sideload method (Solution 8) - no network needed!
