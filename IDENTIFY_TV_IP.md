# How to Identify Which Samsung Device is Your TV

## The Problem

You have two Samsung devices on your network:
- **192.168.1.71**
- **192.168.1.125**

One is your TV, one is your soundbar. Both show as "Samsung" in device list.

---

## Method 1: Check TV's Network Status (Easiest & Most Reliable)

**On your Samsung S90 TV:**

1. Press **Home** button
2. **Settings** → **General** → **Network** → **Network Status**
3. Look at the **IP Address** displayed
4. **This is definitely your TV's IP** ✅

This is the most reliable method - the TV will show its own IP address.

---

## Method 2: Test Developer Mode Port

From your Mac terminal, test which device accepts connections on port 26101:

```bash
# Test 192.168.1.71
nc -zv 192.168.1.71 26101 2>&1

# Test 192.168.1.125
nc -zv 192.168.1.125 26101 2>&1
```

**The one that accepts connection on port 26101 is your TV** (soundbars don't have Developer Mode).

**If `nc` command not found:**
```bash
# Install netcat
brew install netcat

# Or use telnet
telnet 192.168.1.71 26101
telnet 192.168.1.125 26101
```

---

## Method 3: Try Connecting to Both

Try connecting to each IP address:

```bash
# Try 192.168.1.71
~/tizen-studio/tools/sdb connect 192.168.1.71:26101
~/tizen-studio/tools/sdb devices

# If that fails, try 192.168.1.125
~/tizen-studio/tools/sdb kill-server
~/tizen-studio/tools/sdb connect 192.168.1.125:26101
~/tizen-studio/tools/sdb devices
```

**The one that shows a device connection is your TV.**

---

## Method 4: Check Router Device List

In your router's admin panel:

1. Look for **device names** or **MAC addresses**
2. TV might show as:
   - "Samsung TV"
   - "Samsung S90"
   - Model number like "QN85S90C"
3. Soundbar might show as:
   - "Samsung Soundbar"
   - "HW-QXXX" (model number)
   - "Samsung Audio"

---

## Method 5: Ping Both and Check Response

```bash
# Ping both devices
ping -c 3 192.168.1.71
ping -c 3 192.168.1.125
```

Both should respond, but this doesn't tell you which is which.

---

## Recommended Approach

**Best method:** Check TV's Network Status menu (Method 1)
- Most reliable
- TV shows its own IP
- No guessing needed

**If that's not accessible:** Try Method 2 or 3
- Test which device accepts Developer Mode port
- Or try connecting to both

---

## Once You Identify TV IP

Update your commands:

**If TV is 192.168.1.71:**
```bash
~/tizen-studio/tools/sdb connect 192.168.1.71:26101
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.71:26101
```

**If TV is 192.168.1.125:**
```bash
~/tizen-studio/tools/sdb connect 192.168.1.125:26101
tizen install -n ~/Downloads/FlixPicks.wgt -t 192.168.1.125:26101
```

**Mac IP stays the same:** 192.168.1.15 (enter this in TV's Developer Mode settings)
