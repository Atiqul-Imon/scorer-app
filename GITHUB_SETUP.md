# GitHub Setup Guide - Scorer App

Quick guide to prepare and push the scorer-app to GitHub.

## ✅ Pre-Flight Checklist

Before pushing to GitHub, ensure:

- [x] Build succeeds: `npm run build` ✅
- [x] Type checking passes: `npm run type-check`
- [x] All sensitive data is in `.gitignore`
- [x] `.env.example` exists (template for environment variables)
- [x] `README.md` is complete
- [x] No hardcoded API keys or secrets

## 🚀 Quick Setup

### 1. Initialize Git (if not already done)

```bash
cd scorer-app
git init
```

### 2. Check What Will Be Committed

```bash
git status
```

**Expected output**: Should show all files except those in `.gitignore` (node_modules, .next, .env files, etc.)

### 3. Add All Files

```bash
git add .
```

### 4. Create Initial Commit

```bash
git commit -m "Initial commit: Scorer app ready for deployment

- Mobile-first Next.js 16 app
- React 19 with TypeScript
- Authentication and match management
- WebSocket real-time updates
- Ready for Vercel deployment"
```

### 5. Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click "New repository"
3. Repository name: `scorer-app` (or your preferred name)
4. Description: "Mobile-first scorer web app for hyper-local cricket matches"
5. **Visibility**: Private (recommended) or Public
6. **DO NOT** check:
   - ❌ Add a README file (we already have one)
   - ❌ Add .gitignore (we already have one)
   - ❌ Choose a license (unless you want one)
7. Click "Create repository"

### 6. Connect and Push

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/scorer-app.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### 7. Verify on GitHub

- Go to your repository on GitHub
- Verify all files are present
- Check that `.env` files are NOT visible (they should be ignored)
- Verify `README.md` displays correctly

## 📁 What Gets Pushed

### ✅ Included (Tracked)
- Source code (`src/`)
- Configuration files (`next.config.mjs`, `tailwind.config.ts`, `tsconfig.json`)
- `package.json` and `package-lock.json`
- `README.md`, `DEPLOYMENT.md`, `.env.example`
- `.gitignore`
- Public assets (`public/`)

### ❌ Excluded (Ignored)
- `node_modules/` (dependencies)
- `.next/` (build output)
- `.env*` files (environment variables)
- `.vercel/` (Vercel config)
- IDE files (`.vscode/`, `.idea/`)
- Log files
- OS files (`.DS_Store`, `Thumbs.db`)

## 🔐 Security Reminders

**NEVER commit:**
- `.env` files
- API keys or secrets
- Private keys (`.pem` files)
- Database credentials
- Any sensitive configuration

**Always use:**
- `.env.example` for templates
- Environment variables in Vercel
- Secrets management for sensitive data

## 🔄 Future Updates

After making changes:

```bash
# Check what changed
git status

# Add changes
git add .

# Commit with descriptive message
git commit -m "Description of changes"

# Push to GitHub
git push
```

## 🌐 Next Steps: Deploy to Vercel

After pushing to GitHub:

1. Go to [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Configure environment variables
4. Deploy!

See `DEPLOYMENT.md` for detailed Vercel deployment instructions.

## 🐛 Troubleshooting

### "Repository not found"
- Check repository URL is correct
- Verify you have access to the repository
- Try using SSH instead: `git@github.com:USERNAME/scorer-app.git`

### "Permission denied"
- Check your GitHub credentials
- Use Personal Access Token if 2FA is enabled
- Or use SSH keys

### "Large file" error
- Check `.gitignore` includes `node_modules`
- Remove large files: `git rm --cached large-file`
- Use Git LFS for large assets if needed

### Build fails on GitHub Actions
- Check `.github/workflows/ci.yml` exists
- Verify environment variables are set in GitHub Secrets
- Check build logs for specific errors

## 📝 Commit Message Best Practices

Use clear, descriptive commit messages:

**Good:**
```
Add WebSocket real-time score updates
Fix authentication redirect loop
Update UI components for mobile responsiveness
```

**Bad:**
```
fix
update
changes
```

## ✅ Ready to Push?

Run these commands:

```bash
cd scorer-app
git status          # Verify what will be committed
git add .           # Stage all files
git commit -m "Initial commit: Scorer app ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/scorer-app.git
git branch -M main
git push -u origin main
```

**That's it!** Your scorer app is now on GitHub and ready for Vercel deployment! 🚀

