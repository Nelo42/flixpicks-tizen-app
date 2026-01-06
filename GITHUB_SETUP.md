# GitHub Setup for TizenBrew Installation

Quick guide to set up the FlixPicks Tizen app on GitHub for TizenBrew installation.

## ✅ Pre-Flight Check

Your app is configured with:
- ✅ `appinfo.json` - TizenBrew metadata
- ✅ `config.xml` - API version 2.3 (compatible with Samsung S90C 2023)
- ✅ `.gitignore` - Excludes certificates and build artifacts
- ✅ All required files present

## 🚀 Quick Setup

### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
cd /srv/www/Flixpicks_OS/tizen-app
./setup-github.sh
```

This will:
- Initialize git repository (if needed)
- Verify required files
- Create initial commit
- Show you the next steps

### Option 2: Manual Setup

```bash
cd /srv/www/Flixpicks_OS/tizen-app

# Initialize git (if not already)
git init

# Add all files (certificates are excluded by .gitignore)
git add .

# Create initial commit
git commit -m "Initial commit - FlixPicks Tizen app for TizenBrew"
```

## 📤 Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `flixpicks-tizen-app` (or your preferred name)
   - Make it **public** (or ensure TizenBrew has access if private)
   - **Don't** initialize with README, .gitignore, or license

2. **Add remote and push:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/flixpicks-tizen-app.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your GitHub username.

## 📱 Install on Samsung TV via TizenBrew

1. **On your Samsung S90C TV:**
   - Open the TizenBrew app
   - Navigate to **"Install from GitHub"**

2. **Enter repository URL:**
   - Full URL: `https://github.com/YOUR_USERNAME/flixpicks-tizen-app`
   - Or short format: `YOUR_USERNAME/flixpicks-tizen-app`

3. **TizenBrew will:**
   - Download the repository
   - Read `appinfo.json`
   - Build and package the app automatically
   - Sign with TizenBrew's certificate (no manual certificate needed!)
   - Install on your TV

4. **Launch the app:**
   - App appears in TV's Apps menu
   - Or launch via TizenBrew's "Installed Apps" section

## 🔄 Updating the App

When you make changes:

```bash
cd /srv/www/Flixpicks_OS/tizen-app
git add .
git commit -m "Update: [describe your changes]"
git push
```

Then on your TV:
- Use TizenBrew's "Update" feature for the installed app
- Or reinstall from GitHub

## 📋 Repository Structure

Your GitHub repo should have:

```
flixpicks-tizen-app/
├── appinfo.json          # ✅ Required - TizenBrew metadata
├── config.xml            # ✅ Required - Tizen config (API 2.3)
├── index.html            # ✅ Required - Main entry point
├── icon.png              # ✅ Required - App icon
├── css/                  # ✅ Stylesheets
├── js/                   # ✅ JavaScript files
├── assets/               # ✅ Images and assets
├── views/                # ✅ View templates
├── .gitignore            # ✅ Excludes certificates
└── README.md             # Optional
```

**Excluded from Git:**
- `*.csr`, `*.pri` - Certificate files (sensitive)
- `device-profile.xml` - Device profile (sensitive)
- `*.wgt` - Build artifacts
- `.buildResult/` - Build output

## ✅ Verification Checklist

Before pushing to GitHub, verify:

- [ ] `appinfo.json` exists and is valid JSON
- [ ] `config.xml` has `required_version="2.3"`
- [ ] `icon.png` exists (80x80 minimum)
- [ ] `index.html` exists
- [ ] Certificate files (`*.csr`, `*.pri`) are NOT in git (check with `git status`)
- [ ] `.gitignore` excludes sensitive files

## 🐛 Troubleshooting

### Certificate files appear in git status
- Check `.gitignore` includes `*.csr` and `*.pri`
- Remove from git: `git rm --cached *.csr *.pri`

### TizenBrew can't find appinfo.json
- Ensure `appinfo.json` is in the root directory
- Check JSON syntax is valid
- Verify file is committed to GitHub

### Build fails on TV
- Check `config.xml` is valid XML
- Verify `icon.png` exists and is valid image
- Check TizenBrew logs on TV

### App installs but doesn't launch
- TizenBrew handles certificates automatically
- If issues persist, check TV's DUID is registered (for 2023+ TVs)
- Verify API version compatibility (2.3 for S90C 2023)

## 📚 Additional Resources

- TizenBrew GitHub: https://github.com/reisxd/TizenBrew
- TizenBrew Setup Guide: See `TIZENBREW_SETUP.md`
- FlixPicks App Docs: See `README.md`

## 🎯 Next Steps After GitHub Setup

1. ✅ Push to GitHub (see above)
2. ✅ Install via TizenBrew on TV
3. ✅ Test app functionality
4. ✅ Share repo URL for distribution (if desired)

---

**Note:** TizenBrew automatically handles certificate signing, so you don't need to worry about the certificate issues that occur with `sdb install`. This is the recommended method for 2023+ Samsung TVs.

