# Integrating Tizen App with Main FlixPicks Repository

This guide explains how to add the Tizen app to your existing FlixPicks repository.

## Understanding TizenBrew Requirements

TizenBrew's "Install from GitHub" feature expects:
- `appinfo.json` at the **root** of the repository
- All app files (config.xml, index.html, etc.) accessible from root

## Option 1: Separate Repository (Recommended) ✅

**Best for:** Clean separation, easier TizenBrew installation

**Pros:**
- ✅ TizenBrew works immediately (appinfo.json at root)
- ✅ Clean repository structure
- ✅ Independent versioning
- ✅ Easier to share just the TV app

**Cons:**
- ⚠️ Two repositories to manage

**Setup:**
```bash
# Your tizen-app is already set up as a separate repo
cd /srv/www/Flixpicks_OS/tizen-app
git remote add origin https://github.com/YOUR_USERNAME/flixpicks-tizen-app.git
git push -u origin main
```

**TizenBrew Installation:**
- Enter: `YOUR_USERNAME/flixpicks-tizen-app`

---

## Option 2: Subdirectory in Main Repo (If TizenBrew Supports Paths)

**Best for:** Single repository, unified project

**Note:** TizenBrew may not support subdirectory paths. This requires testing.

**Structure:**
```
flixpicks-mediaos/
├── coreelec-packages/
├── docs/
├── tizen-app/          # Tizen app here
│   ├── appinfo.json
│   ├── config.xml
│   └── ...
└── README.md
```

**If TizenBrew supports paths:**
- Try: `YOUR_USERNAME/flixpicks-mediaos/tizen-app`
- Or: `YOUR_USERNAME/flixpicks-mediaos?path=tizen-app`

**Setup:**
```bash
# If main repo exists
cd /srv/www/Flixpicks_OS

# Initialize main repo if needed
git init
git remote add origin https://github.com/YOUR_USERNAME/flixpicks-mediaos.git

# Add tizen-app (remove its .git first)
cd tizen-app
rm -rf .git
cd ..

# Add everything
git add .
git commit -m "Add Tizen TV app"
git push -u origin main
```

---

## Option 3: Root-Level App Files (Not Recommended)

**Best for:** Only if you want everything at root

**Structure:**
```
flixpicks-mediaos/
├── appinfo.json        # Tizen app files at root
├── config.xml
├── index.html
├── coreelec-packages/
└── ...
```

**Pros:**
- ✅ TizenBrew works immediately

**Cons:**
- ❌ Clutters main repo root
- ❌ Mixes TV app with MediaOS code
- ❌ Harder to maintain

---

## Option 4: GitHub Subtree or Submodule

**Best for:** Keeping repos separate but linked

### Subtree (Recommended for this use case)
```bash
cd /srv/www/Flixpicks_OS

# Add tizen-app as subtree
git subtree add --prefix=tizen-app \
  https://github.com/YOUR_USERNAME/flixpicks-tizen-app.git main \
  --squash

# To update later
git subtree pull --prefix=tizen-app \
  https://github.com/YOUR_USERNAME/flixpicks-tizen-app.git main \
  --squash
```

**TizenBrew:** Still use separate repo: `YOUR_USERNAME/flixpicks-tizen-app`

---

## Recommended Approach

**For TizenBrew installation, use Option 1 (Separate Repository):**

1. **Keep tizen-app as separate repo** (already done ✅)
2. **Push to GitHub:**
   ```bash
   cd /srv/www/Flixpicks_OS/tizen-app
   git remote add origin https://github.com/YOUR_USERNAME/flixpicks-tizen-app.git
   git push -u origin main
   ```

3. **Link in main repo (optional):**
   - Add reference in main repo's README
   - Or use git subtree/submodule if you want them linked

4. **Install via TizenBrew:**
   - Use: `YOUR_USERNAME/flixpicks-tizen-app`
   - This works immediately because appinfo.json is at root

---

## Testing TizenBrew with Subdirectory

If you want to try Option 2, test if TizenBrew supports paths:

1. Push main repo with tizen-app subdirectory
2. On TV, try these formats in TizenBrew:
   - `YOUR_USERNAME/flixpicks-mediaos/tizen-app`
   - `YOUR_USERNAME/flixpicks-mediaos?path=tizen-app`
   - `YOUR_USERNAME/flixpicks-mediaos` (may fail - no appinfo.json at root)

If none work, fall back to Option 1.

---

## Current Status

✅ **Your tizen-app is ready:**
- Git repository initialized
- All files committed
- Certificate files excluded
- appinfo.json configured
- Ready to push to GitHub

**Next step:** Tell me your GitHub repository URL and I'll configure it!

