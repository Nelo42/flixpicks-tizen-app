# Push to GitHub - Authentication Required

The repository is configured but needs authentication to push.

## Option 1: Personal Access Token (Recommended)

1. **Create a GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `FlixPicks Tizen App Push`
   - Expiration: Your choice (90 days recommended)
   - Scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Push using the token:**
   ```bash
   cd /srv/www/Flixpicks_OS/tizen-app
   git push https://YOUR_TOKEN@github.com/flixpicks/flixpicks-tizen-app.git main
   ```
   
   Replace `YOUR_TOKEN` with your personal access token.

3. **Or configure credential helper (one-time setup):**
   ```bash
   git config --global credential.helper store
   git push -u origin main
   # When prompted:
   # Username: flixpicks (or your GitHub username)
   # Password: [paste your personal access token]
   ```

## Option 2: SSH Key Setup

1. **Generate SSH key (if you don't have one):**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   # Press Enter to accept default location
   # Enter passphrase (optional but recommended)
   ```

2. **Add SSH key to GitHub:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   # Copy the output
   ```
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste the key and save

3. **Switch to SSH and push:**
   ```bash
   cd /srv/www/Flixpicks_OS/tizen-app
   git remote set-url origin git@github.com:flixpicks/flixpicks-tizen-app.git
   git push -u origin main
   ```

## Option 3: GitHub CLI

If you have GitHub CLI installed:
```bash
gh auth login
cd /srv/www/Flixpicks_OS/tizen-app
git push -u origin main
```

## Quick Push (Once Authenticated)

After setting up authentication, you can simply run:
```bash
cd /srv/www/Flixpicks_OS/tizen-app
git push -u origin main
```

## Verify Repository

Make sure the repository exists and is accessible:
- Check: https://github.com/flixpicks/flixpicks-tizen-app
- Ensure you have push access to the `flixpicks` organization

## After Successful Push

Once pushed, install on your Samsung S90C TV:
1. Open TizenBrew
2. Go to "Install from GitHub"
3. Enter: `flixpicks/flixpicks-tizen-app`

