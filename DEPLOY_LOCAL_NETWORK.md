# Deploying to TV on Local Network (192.168.1.x)

Since your server is on a different network (172.31.0.117) and your TV is on 192.168.1.x, you need to deploy from a machine on your local network.

## Option 1: Download WGT and Deploy Locally

### Step 1: Download WGT file to your local machine

From your Mac (on 192.168.1.x network):
```bash
scp user@172.31.0.117:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/FlixPicks.wgt
```

### Step 2: Install Tizen Studio on your Mac (if not already)

Download from: https://developer.tizen.org/development/tizen-studio/download

### Step 3: Connect to TV from your Mac

```bash
# Connect to TV (replace with actual TV IP on 192.168.1.x)
~/tizen-studio/tools/sdb connect 192.168.1.XXX:26101

# Install app
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.XXX:26101

# Run app
tizen run -p net.flixpicks.tv -t 192.168.1.XXX:26101
```

## Option 2: USB Sideload (No Network Needed)

### Step 1: Download WGT file
```bash
scp user@172.31.0.117:/srv/www/Flixpicks_OS/tizen-app/.buildResult/FlixPicks.wgt ~/Downloads/
```

### Step 2: Copy to USB drive
- Copy FlixPicks.wgt to USB drive
- Format: FAT32 or exFAT

### Step 3: Install on TV
1. Insert USB drive into TV
2. On TV: Settings → General → External Device Manager
3. Look for "Install from USB" or "Developer Apps"
4. Select FlixPicks.wgt
5. Install

## Option 3: Build on Local Machine

If you have Tizen Studio on your Mac:
1. Copy entire tizen-app directory to your Mac
2. Build locally: `./build.sh`
3. Deploy: `./deploy.sh 192.168.1.XXX`

