# Troubleshooting TV Connection Issues

## Error: "failed to connect to remote target '172.31.0.117'"

### Quick Checks:

1. **Ping the TV from your Mac:**
   ```bash
   ping 172.31.0.117
   ```
   If ping fails, TV is unreachable (network issue).

2. **Verify Developer Mode:**
   - TV Settings → General → External Device Manager → Device Connection Manager
   - Developer Mode must show as **Enabled**
   - **Important:** The "Server IP" in TV settings should be your **Mac's IP** (192.168.1.x), NOT poedev2

3. **Find Your Mac's IP:**
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Or
   ipconfig getifaddr en0
   ```
   This is the IP you need to enter in TV's Developer Mode settings.

4. **Reboot TV:**
   After enabling Developer Mode, TV MUST be rebooted for changes to take effect.

5. **Try SDB Commands:**
   ```bash
   # Kill existing SDB server
   ~/tizen-studio/tools/sdb kill-server
   
   # Try connecting again
   ~/tizen-studio/tools/sdb connect 172.31.0.117:26101
   
   # Check devices
   ~/tizen-studio/tools/sdb devices
   ```

### Common Issues:

**Issue:** TV and Mac on different networks
- **Solution:** Ensure both are on same network (192.168.1.x)

**Issue:** Wrong IP in TV Developer Mode
- **Solution:** Enter your Mac's IP (192.168.1.x), not server IP

**Issue:** Developer Mode not enabled
- **Solution:** Enable in TV settings and reboot

**Issue:** Firewall blocking port 26101
- **Solution:** Check Mac firewall settings, allow Tizen Studio

### Alternative: USB Sideload

If network connection continues to fail, use USB sideload:
1. Download WGT file: `scp admin@poedev2:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/`
2. Copy to USB drive
3. Install via TV's USB installer
