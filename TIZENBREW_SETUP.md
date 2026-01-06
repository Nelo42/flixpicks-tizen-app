# TizenBrew Installation Guide for FlixPicks

This guide explains how to set up FlixPicks for installation via TizenBrew on Samsung Smart TVs.

## Prerequisites

1. **TizenBrew installed on your TV**
   - If not installed, follow: https://github.com/reisxd/TizenBrew
   - Install via USB method (most reliable for 2023+ TVs)

2. **GitHub repository** (public or private with access)

3. **Built WGT file** (optional - TizenBrew can build from source)

## Step 1: Create GitHub Repository

1. Create a new repository on GitHub (e.g., `flixpicks-tizen-app`)
2. Make it public (or ensure TizenBrew has access if private)

## Step 2: Prepare Repository Structure

Your repository should have this structure:

```
flixpicks-tizen-app/
├── appinfo.json          # Required - TizenBrew metadata
├── config.xml            # Tizen app configuration
├── index.html            # Main entry point
├── icon.png              # App icon (80x80 minimum)
├── css/                  # Stylesheets
├── js/                   # JavaScript files
├── assets/               # Images and other assets
└── README.md             # Optional
```

## Step 3: Push to GitHub

```bash
# Initialize git repo (if not already)
cd /srv/www/Flixpicks_OS/tizen-app
git init
git add .
git commit -m "Initial commit - FlixPicks Tizen app"

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/flixpicks-tizen-app.git
git branch -M main
git push -u origin main
```

## Step 4: Install via TizenBrew on TV

1. **On your Samsung TV:**
   - Open TizenBrew app
   - Navigate to "Install from GitHub"
   - Enter your repository URL:
     ```
     https://github.com/YOUR_USERNAME/flixpicks-tizen-app
     ```
   - Or use the short format:
     ```
     YOUR_USERNAME/flixpicks-tizen-app
     ```

2. **TizenBrew will:**
   - Download the repository
   - Read `appinfo.json`
   - Build and package the app
   - Install it on your TV

## Step 5: Launch the App

After installation:
- The app should appear in your TV's Apps menu
- Or launch via TizenBrew's "Installed Apps" section

## appinfo.json Format

The `appinfo.json` file contains:

```json
{
  "id": "net.flixpicks.tv",
  "title": "FlixPicks",
  "main": "index.html",
  "icon": "icon.png",
  "type": "web",
  "version": "1.0.0",
  "description": "Browse movies and TV shows, control your MediaOS streaming box",
  "author": "FlixPicks",
  "authorEmail": "support@flixpicks.net",
  "website": "https://flixpicks.net"
}
```

### Required Fields:
- `id`: App identifier (matches config.xml)
- `title`: Display name
- `main`: Entry point HTML file
- `icon`: Icon file path
- `type`: "web" for web apps

### Optional Fields:
- `version`: App version
- `description`: App description
- `author`: Author name
- `authorEmail`: Contact email
- `website`: Website URL

## Updating the App

1. **Make changes** to your code
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Update app"
   git push
   ```
3. **On TV:** Use TizenBrew's "Update" feature or reinstall from GitHub

## Troubleshooting

### App doesn't appear after installation
- Check TizenBrew logs
- Verify `appinfo.json` format is correct
- Ensure all required files are in the repository

### Build fails
- Check that `config.xml` is valid
- Verify `icon.png` exists and is valid
- Check TizenBrew error messages

### Certificate issues
- TizenBrew handles certificate signing automatically
- If issues persist, ensure your TV's DUID is registered (for 2023+ TVs)

## Advantages of TizenBrew

1. **No manual certificate management** - TizenBrew handles signing
2. **Easy updates** - Just push to GitHub and update via TizenBrew
3. **Distribution** - Share your GitHub repo URL for others to install
4. **Automatic building** - No need to build WGT files manually

## Notes

- TizenBrew works best with public repositories
- For private repos, ensure TizenBrew has access credentials
- The app will be signed with TizenBrew's certificate automatically
- This method bypasses many certificate issues on 2023+ TVs

