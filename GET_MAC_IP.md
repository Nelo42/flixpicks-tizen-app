# How to Get Your Mac's IP Address

## Quick Command (Recommended)

```bash
ipconfig getifaddr en0
```

This will show your Mac's IP address on your local network (e.g., `192.168.1.50`)

## Alternative Commands

### Show all IP addresses:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Show just the IP (no labels):
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1
```

### For Ethernet connection:
```bash
ipconfig getifaddr en1
```

## What to Look For

You want the IP address that starts with `192.168.1.` (or `192.168.0.` or `10.0.0.`)

**Example output:**
```
192.168.1.50
```

This is the IP you need to enter in your TV's Developer Mode settings.

## After Getting Your IP

1. Copy the IP address (e.g., `192.168.1.50`)
2. On your TV: Settings → General → External Device Manager → Device Connection Manager
3. Enter your Mac's IP in the "Server IP" field
4. Save and reboot TV
5. Then try connecting: `~/tizen-studio/tools/sdb connect 172.31.0.117:26101`
