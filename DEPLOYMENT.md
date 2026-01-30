# Deployment Guide - Scorer App

This guide will help you deploy the scorer-app to Vercel and prepare it for GitHub.

## 📋 Pre-Deployment Checklist

- [x] All dependencies installed (`npm install`)
- [x] Build succeeds (`npm run build`)
- [x] Type checking passes (`npm run type-check`)
- [x] Linting passes (`npm run lint`)
- [x] Environment variables documented (`.env.example`)
- [x] `.gitignore` configured properly
- [x] `README.md` created

## 🚀 GitHub Setup

### 1. Initialize Git Repository (if not already done)

```bash
cd scorer-app
git init
```

### 2. Add Files to Git

```bash
# Check what will be added
git status

# Add all files (respects .gitignore)
git add .

# Commit
git commit -m "Initial commit: Scorer app ready for deployment"
```

### 3. Create GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `scorer-app` (or your preferred name)
3. **Do NOT** initialize with README, .gitignore, or license (we already have these)
4. Copy the repository URL

### 4. Push to GitHub

```bash
# Add remote (replace with your GitHub URL)
git remote add origin https://github.com/yourusername/scorer-app.git

# Push to main branch
git branch -M main
git push -u origin main
```

## 🌐 Vercel Deployment

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Select your GitHub repository (`scorer-app`)
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `scorer-app` (if repo is in monorepo) or leave blank if repo root is scorer-app
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

4. **Environment Variables**
   Click "Environment Variables" and add:
   ```
   NEXT_PUBLIC_API_URL=https://api.scorenews.net
   NEXT_PUBLIC_WS_URL=wss://api.scorenews.net
   NODE_ENV=production
   ```
   
   **Important**: 
   - Replace `https://api.scorenews.net` with your actual backend API URL
   - Use `wss://` (secure WebSocket) for production, not `ws://`
   - Add these for all environments (Production, Preview, Development)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://scorer-app.vercel.app` (or your custom domain)

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd scorer-app
   vercel
   ```

4. **Follow Prompts**
   - Link to existing project or create new
   - Set environment variables when prompted

5. **Production Deploy**
   ```bash
   vercel --prod
   ```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `https://api.scorenews.net` |
| `NEXT_PUBLIC_WS_URL` | WebSocket server URL | `wss://api.scorenews.net` |

### Setting in Vercel

1. Go to Project Settings → Environment Variables
2. Add each variable for:
   - **Production**: Live site
   - **Preview**: Pull request previews
   - **Development**: Local development

### Important Notes

- **WebSocket Protocol**: 
  - Use `ws://` for HTTP (development)
  - Use `wss://` for HTTPS (production)
- **CORS**: Ensure your backend allows requests from your Vercel domain
- **API URL**: Must be publicly accessible (no localhost in production)

## 🔍 Post-Deployment Verification

1. **Check Build Logs**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Verify build succeeded

2. **Test the App**
   - Visit your Vercel URL
   - Test login/registration
   - Verify API connection
   - Test WebSocket connection (if applicable)

3. **Check Console for Errors**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab for failed API calls

## 🐛 Troubleshooting

### Build Fails

**Error**: `Module not found` or `Cannot find module`
- **Solution**: Ensure all dependencies are in `package.json` and run `npm install` locally first

**Error**: `TypeScript errors`
- **Solution**: Run `npm run type-check` locally and fix all errors

### API Connection Issues

**Error**: `CORS error` or `Network error`
- **Solution**: 
  1. Check `NEXT_PUBLIC_API_URL` is correct
  2. Verify backend CORS allows your Vercel domain
  3. Check backend is running and accessible

### WebSocket Issues

**Error**: `WebSocket connection failed`
- **Solution**:
  1. Verify `NEXT_PUBLIC_WS_URL` uses `wss://` (not `ws://`) for HTTPS
  2. Check backend WebSocket server is running
  3. Verify WebSocket server allows connections from your domain

### Environment Variables Not Working

**Issue**: Variables not accessible in app
- **Solution**: 
  1. Ensure variables start with `NEXT_PUBLIC_` for client-side access
  2. Redeploy after adding variables (they're injected at build time)
  3. Check variable names match exactly (case-sensitive)

## 📝 Custom Domain (Optional)

1. Go to Vercel Dashboard → Project Settings → Domains
2. Add your custom domain (e.g., `scorer.scorenews.net`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take up to 48 hours)

## 🔄 Continuous Deployment

Vercel automatically deploys:
- **Production**: On push to `main` branch
- **Preview**: On every pull request

To disable auto-deploy:
- Go to Project Settings → Git
- Uncheck "Automatically deploy"

## 📊 Monitoring

- **Analytics**: Vercel provides built-in analytics
- **Logs**: View real-time logs in Vercel Dashboard
- **Performance**: Check Web Vitals in Vercel Analytics

## 🔐 Security Checklist

- [ ] Environment variables are set (not hardcoded)
- [ ] API keys are secure (not in code)
- [ ] CORS is properly configured on backend
- [ ] HTTPS is enabled (automatic on Vercel)
- [ ] WebSocket uses WSS in production

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Check browser console for errors
3. Verify backend is accessible
4. Review environment variables

---

**Ready to deploy?** Follow the steps above and your scorer app will be live in minutes! 🚀

