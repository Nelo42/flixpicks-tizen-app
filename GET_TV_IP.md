# How to Find Your Samsung TV's IP Address

## Method 1: TV Settings Menu (Recommended)

**On your Samsung S90 TV:**

1. Press **Home** button on remote
2. Navigate to **Settings** (gear icon)
3. Go to **General**
4. Select **Network**
5. Select **Network Status**
6. Look for **IP Address** - this is your TV's IP
   - Example: `172.31.0.117` or `192.168.1.50`

## Method 2: Developer Mode Settings

1. **Settings** → **General** → **External Device Manager** → **Device Connection Manager**
2. The TV's IP address is usually displayed in this menu
3. Also shows Developer Mode status and server IP setting

## Method 3: Router Admin Panel

1. Access your router's admin panel (usually `192.168.1.1` or `192.168.0.1`)
2. Look for "Connected Devices" or "DHCP Client List"
3. Find your Samsung TV in the list
4. Note the IP address assigned to it

## Method 4: Network Scan (Advanced)

From your Mac terminal (if TV is on same network):

```bash
# Install nmap if needed: brew install nmap
# Then scan your network
nmap -sn 192.168.1.0/24 | grep -B 2 -i "samsung"
```

## What You Already Know

Based on our conversation, your TV's IP is: **172.31.0.117**

You can verify this by checking the TV's Network Status menu.

## After Finding TV IP

Use it in these commands:

```bash
# Connect to TV
~/tizen-studio/tools/sdb connect 172.31.0.117:26101

# Install app
tizen install -n ~/Downloads/FlixPicks.wgt -t 172.31.0.117:26101

# Run app
tizen run -p net.flixpicks.tv -t 172.31.0.117:26101
```
