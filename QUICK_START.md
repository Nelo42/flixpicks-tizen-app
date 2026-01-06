# FlixPicks Tizen TV App - Quick Start Guide

Get the app running on your Samsung TV in 3 steps!

---

## Step 1: Set Up Certificate (One-Time)

```bash
cd /srv/www/Flixpicks_OS/tizen-app
./setup-certificate.sh
```

**Or manually:**
1. Open Certificate Manager: `~/tizen-studio/tools/certificate-manager/certificate-manager`
2. Create new profile: **FlixPicksTV**
3. Platform: **TV**
4. Certificate: **Samsung** (sign in with Samsung Developer account)
5. Privilege: **Partner** (for testing)

---

## Step 2: Enable Developer Mode on TV

**On your Samsung TV:**

1. Go to **Apps** menu
2. Press: `1` `2` `3` `4` `5` (in sequence)
3. **Developer Mode** menu appears
4. Toggle **ON**
5. Enter your **PC's IP address** (find with: `hostname -I`)
6. **Reboot TV**

**Find TV IP:**
- Settings → General → External Device Manager → Device Connection Manager
- Or check your router's device list

---

## Step 3: Build and Deploy

```bash
# Build the app
./build.sh

# Deploy to TV (replace with your TV's IP)
./deploy.sh 192.168.1.50
```

That's it! The app should launch on your TV.

---

## Troubleshooting

### "Certificate profile not found"
→ Run `./setup-certificate.sh` first

### "Connection refused"
→ TV not in Developer Mode, or wrong IP address

### "Installation failed"
→ Uninstall old app first:
```bash
~/tizen-studio/tools/sdb shell 0 "pkgcmd -u -n net.flixpicks.tv"
```

### View logs
```bash
~/tizen-studio/tools/sdb logcat
```

### Debug with Chrome DevTools
```bash
tizen debug -p net.flixpicks.tv -t <TV_IP>:26101
```

---

## Full Documentation

See `DEPLOYMENT.md` for complete details.

---

**Need help?** Check the troubleshooting section in `DEPLOYMENT.md`

