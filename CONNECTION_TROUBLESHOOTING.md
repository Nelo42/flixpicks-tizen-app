# Connection Troubleshooting Guide

## Error: "failed to connect to remote target '192.168.1.71'"

### Step 1: Verify Network Connectivity

From your Mac terminal:
```bash
# Test if TV is reachable
ping 192.168.1.71
```

**If ping fails:**
- TV might be on different network
- TV IP might be wrong
- Check TV's actual IP in Settings → Network → Network Status

**If ping works:**
- Network is fine, issue is with Developer Mode or SDB

---

### Step 2: Verify Developer Mode Configuration

On your Samsung S90 TV:

1. **Settings** → **General** → **External Device Manager** → **Device Connection Manager**

2. **Check these settings:**
   - ✅ Developer Mode: **Enabled**
   - ✅ Server IP: **192.168.1.15** (your Mac's IP)
   - ✅ TV was **rebooted** after entering Mac IP

3. **If Server IP is wrong:**
   - Change it to: **192.168.1.15**
   - **Save/Confirm**
   - **Reboot TV** (unplug for 30 seconds)

---

### Step 3: Reset SDB Connection

From your Mac:
```bash
# Kill existing SDB server
~/tizen-studio/tools/sdb kill-server

# Wait a moment
sleep 2

# Try connecting again
~/tizen-studio/tools/sdb connect 192.168.1.71:26101

# Check if connected
~/tizen-studio/tools/sdb devices
```

**Expected output if connected:**
```
192.168.1.71:26101    device    <model>
```

---

### Step 4: Check Mac Firewall

1. **System Settings** → **Network** → **Firewall**
2. Make sure firewall allows Tizen Studio
3. Or temporarily disable firewall to test

---

### Step 5: Verify TV's Developer Mode Port

Some TVs use different ports. Try:
```bash
# Try port 26101 (standard)
~/tizen-studio/tools/sdb connect 192.168.1.71:26101

# Or try port 26102 (alternative)
~/tizen-studio/tools/sdb connect 192.168.1.71:26102
```

---

### Step 6: Check TV's Developer Mode Status

On TV, verify:
- Developer Mode shows as **Enabled** (not just toggled on)
- TV was fully rebooted after enabling
- No error messages in Developer Mode settings

---

### Step 7: Alternative - USB Sideload

If network connection continues to fail:

1. **Download WGT file:**
   ```bash
   scp admin@poedev2:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/
   ```

2. **Copy to USB drive** (FAT32 or exFAT format)

3. **Install on TV:**
   - Insert USB into TV
   - Settings → General → External Device Manager
   - Look for "Install from USB" or "Developer Apps"
   - Select FlixPicks.wgt
   - Install

---

## Quick Checklist

- [ ] TV is pingable: `ping 192.168.1.71` works
- [ ] Developer Mode is **Enabled** on TV
- [ ] Server IP in TV is **192.168.1.15** (Mac's IP)
- [ ] TV was **rebooted** after entering Mac IP
- [ ] SDB server restarted: `sdb kill-server` then reconnect
- [ ] Mac firewall allows Tizen Studio
- [ ] Tried both ports: 26101 and 26102

---

## Still Not Working?

If all above fails:
1. Double-check TV's actual IP in Settings → Network → Network Status
2. Verify Mac and TV are on same network (both 192.168.1.x)
3. Try USB sideload method (no network needed)
4. Check if TV model supports Developer Mode (some older models don't)
