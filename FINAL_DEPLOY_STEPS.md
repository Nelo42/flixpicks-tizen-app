# Final Deployment Steps

## Your Network Configuration:

- **Mac IP:** 192.168.1.15
- **TV IP:** 192.168.1.71
- **Server:** poedev2

## Step 1: Configure TV Developer Mode

On your Samsung S90 TV:

1. **Settings** → **General** → **External Device Manager** → **Device Connection Manager**
2. Verify **Developer Mode** is **Enabled**
3. In the **"Server IP"** or **"Host PC IP"** field, enter: **192.168.1.15**
4. **Save/Confirm** the settings
5. **Reboot TV** (unplug for 30 seconds or use Settings → Support → Reset)

## Step 2: Download WGT File (if not already done)

From your Mac terminal:
```bash
scp admin@poedev2:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/
```

## Step 3: Connect to TV

After TV reboots, from your Mac:
```bash
~/tizen-studio/tools/sdb connect 192.168.1.71:26101
```

**Verify connection:**
```bash
~/tizen-studio/tools/sdb devices
# Should show: 192.168.1.71:26101    device    <model>
```

## Step 4: Install App

```bash
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.71:26101
```

## Step 5: Launch App

```bash
tizen run -p net.flixpicks.tv -t 192.168.1.71:26101
```

## Troubleshooting

**If connection still fails:**
1. Verify TV was rebooted after entering Mac IP
2. Check Developer Mode is still enabled
3. Try: `~/tizen-studio/tools/sdb kill-server` then reconnect
4. Ping TV: `ping 192.168.1.71` (should work if on same network)

**If tizen command not found:**
```bash
export PATH=$PATH:~/tizen-studio/tools/ide/bin
```

## Quick Command Reference

```bash
# Download
scp admin@poedev2:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/

# Connect
~/tizen-studio/tools/sdb connect 192.168.1.71:26101

# Install
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.71:26101

# Run
tizen run -p net.flixpicks.tv -t 192.168.1.71:26101
```
