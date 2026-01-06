# Launching FlixPicks App - Troubleshooting Guide

## Current Status
✅ Connected to TV: `192.168.1.71:26101`
✅ App installed: `FlixPicks.wgt`
❌ App launch not working

## Issue: `tizen` Command Not Found

The `tizen` CLI tool requires the full path or needs to be added to PATH.

### Solution 1: Use Full Path
```bash
# Add to PATH (for current session)
export PATH=$PATH:~/tizen-studio/tools/ide/bin

# Then use tizen commands
tizen run -p net.flixpicks.tv -t 192.168.1.71:26101
```

### Solution 2: Use Full Path Directly
```bash
~/tizen-studio/tools/ide/bin/tizen run -p net.flixpicks.tv -t 192.168.1.71:26101
```

**Note:** The `tizen` CLI may not recognize devices connected via `sdb connect`. This is a known limitation.

## Verify App Installation

First, verify the app is actually installed:

```bash
# List all installed apps
~/tizen-studio/tools/sdb shell 0 "pkgcmd -l"

# Should show: net.flixpicks.tv
```

## Launch Methods

### Method 1: Using SDB app_launcher (Recommended)
```bash
# Launch the app
~/tizen-studio/tools/sdb shell 0 "app_launcher -s net.flixpicks.tv"

# Check if it's running
~/tizen-studio/tools/sdb shell 0 "app_launcher -l"
```

### Method 2: Using launch_app (Alternative)
```bash
~/tizen-studio/tools/sdb shell 0 "launch_app net.flixpicks.tv"
```

### Method 3: Using Tizen CLI (if device recognized)
```bash
# First add to PATH
export PATH=$PATH:~/tizen-studio/tools/ide/bin

# Then run
tizen run -p net.flixpicks.tv -t 192.168.1.71:26101
```

### Method 4: Using Tizen CLI with Full Path
```bash
~/tizen-studio/tools/ide/bin/tizen run -p net.flixpicks.tv -t 192.168.1.71:26101
```

## Check if App is Running

```bash
# List running apps
~/tizen-studio/tools/sdb shell 0 "app_launcher -l"

# Check process
~/tizen-studio/tools/sdb shell 0 "ps aux | grep flixpicks"
```

## View Logs

The app may have launched but you're not seeing it. Check logs:

```bash
# View all logs
~/tizen-studio/tools/sdb logcat

# Filter for FlixPicks
~/tizen-studio/tools/sdb logcat | grep -i flixpicks

# View in real-time (press Ctrl+C to stop)
~/tizen-studio/tools/sdb logcat | grep -i "flixpicks\|wgt-launcher"
```

## Debug the App

If the app launches but shows a black screen or errors:

```bash
# Connect debugger (opens Chrome DevTools)
export PATH=$PATH:~/tizen-studio/tools/ide/bin
tizen debug -p net.flixpicks.tv -t 192.168.1.71:26101
```

## Common Issues

### Issue: `app_launcher` returns no output
**Solution:** This is normal. The command may succeed silently. Check:
1. Look at your TV screen - the app may have launched
2. Check logs: `~/tizen-studio/tools/sdb logcat | grep -i flixpicks`
3. Verify it's running: `~/tizen-studio/tools/sdb shell 0 "app_launcher -l"`

### Issue: App not found
**Solution:** Verify installation:
```bash
~/tizen-studio/tools/sdb shell 0 "pkgcmd -l | grep flixpicks"
```

If not found, reinstall:
```bash
~/tizen-studio/tools/sdb install ~/Downloads/FlixPicks.wgt
```

### Issue: App launches but crashes immediately
**Solution:** Check logs for errors:
```bash
~/tizen-studio/tools/sdb logcat | grep -i "error\|exception\|crash"
```

### Issue: Black screen
**Solution:** 
1. Check JavaScript console via debugger
2. Verify API endpoints are accessible
3. Check network connectivity on TV

## Quick Command Reference

```bash
# Verify connection
~/tizen-studio/tools/sdb devices

# Verify app installed
~/tizen-studio/tools/sdb shell 0 "pkgcmd -l | grep flixpicks"

# Launch app
~/tizen-studio/tools/sdb shell 0 "app_launcher -s net.flixpicks.tv"

# Check if running
~/tizen-studio/tools/sdb shell 0 "app_launcher -l"

# View logs
~/tizen-studio/tools/sdb logcat | grep -i flixpicks

# Debug (opens DevTools)
export PATH=$PATH:~/tizen-studio/tools/ide/bin
tizen debug -p net.flixpicks.tv -t 192.168.1.71:26101
```

## Next Steps

1. **Verify installation:**
   ```bash
   ~/tizen-studio/tools/sdb shell 0 "pkgcmd -l | grep flixpicks"
   ```

2. **Try launching:**
   ```bash
   ~/tizen-studio/tools/sdb shell 0 "app_launcher -s net.flixpicks.tv"
   ```

3. **Check TV screen** - the app should appear

4. **If not visible, check logs:**
   ```bash
   ~/tizen-studio/tools/sdb logcat | grep -i flixpicks
   ```

5. **If errors in logs, debug:**
   ```bash
   export PATH=$PATH:~/tizen-studio/tools/ide/bin
   tizen debug -p net.flixpicks.tv -t 192.168.1.71:26101
   ```


