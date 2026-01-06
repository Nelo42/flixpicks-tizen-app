# TizenBrew "Unknown Module" Error - Troubleshooting

## Symptoms
- "Unknown module" error in TizenBrew
- No "Install" button appears, only "Done"
- Nothing happens after entering repository URL

## Possible Causes & Solutions

### 1. Repository Format
**Try these formats in TizenBrew:**
- `gh/Nelo42/flixpicks-tizen-app` (with gh/ prefix)
- `Nelo42/flixpicks-tizen-app` (without prefix)
- `https://github.com/Nelo42/flixpicks-tizen-app` (full URL)

### 2. Verify Files Are Accessible
Check that these files are at the repository root:
- ✅ `appinfo.json` - https://raw.githubusercontent.com/Nelo42/flixpicks-tizen-app/main/appinfo.json
- ✅ `config.xml` - https://raw.githubusercontent.com/Nelo42/flixpicks-tizen-app/main/config.xml
- ✅ `index.html` - https://raw.githubusercontent.com/Nelo42/flixpicks-tizen-app/main/index.html
- ✅ `icon.png` - https://raw.githubusercontent.com/Nelo42/flixpicks-tizen-app/main/icon.png

### 3. Clear TizenBrew Cache
On your TV:
1. Go to Settings → Apps → TizenBrew
2. Clear cache
3. Clear data (if available)
4. Restart TizenBrew
5. Try installing again

### 4. Check TizenBrew Version
- Ensure TizenBrew is up to date
- Older versions might not support GitHub installation
- Update TizenBrew if possible

### 5. Verify appinfo.json Format
The current format should be:
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
  "website": "https://flixpicks.net",
  "package": "FlixPicksTV"
}
```

### 6. Check Repository Visibility
- Ensure repository is **public** (or TizenBrew has access if private)
- Verify repository exists: https://github.com/Nelo42/flixpicks-tizen-app

### 7. Alternative: Install from WGT File
If GitHub installation continues to fail:
1. Build WGT file locally
2. Transfer to USB drive
3. Install via TizenBrew's "Install from USB" option

### 8. Check TizenBrew Logs
If TizenBrew has a logs/debug section:
- Check for specific error messages
- Look for network errors
- Check for parsing errors

### 9. Try Different Branch
If you have other branches:
- Try specifying branch: `gh/Nelo42/flixpicks-tizen-app@branch-name`
- Default is `main` branch

### 10. Verify Network Connection
- Ensure TV has internet connection
- Check if TV can access GitHub
- Try accessing https://github.com/Nelo42/flixpicks-tizen-app in TV browser

## Next Steps

1. **Try the updated appinfo.json** (just pushed with `package` field)
2. **Clear TizenBrew cache** on TV
3. **Try different repository format** (`gh/Nelo42/flixpicks-tizen-app`)
4. **Check TizenBrew version** and update if needed

## If Still Not Working

Consider:
- Installing TizenBrew from a different source/version
- Using USB installation method instead
- Checking TizenBrew GitHub issues: https://github.com/reisxd/TizenBrew/issues
- Asking in TizenBrew community/discord

