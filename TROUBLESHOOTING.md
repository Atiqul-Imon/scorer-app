# Troubleshooting Guide - App Not Opening

## If App Shows "Redirecting..." Forever

### Step 1: Check Server is Running
```bash
cd scorer-app
npm run dev
```

You should see:
```
✓ Ready in XXXms
- Local: http://localhost:3001
```

### Step 2: Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or: Ctrl+Shift+Delete → Clear cache

### Step 3: Check Browser Console
Open DevTools → Console tab, look for:
- ❌ Red errors
- ⚠️ Yellow warnings
- 🔄 Infinite loop messages

### Step 4: Check Network Tab
Open DevTools → Network tab:
- Look for failed requests (red)
- Check if API calls are hanging
- Verify no infinite redirects

### Step 5: Try Direct URLs
Instead of `localhost:3001`, try:
- `http://localhost:3001/login` (direct)
- `http://localhost:3001/register` (direct)
- `http://localhost:3001/dashboard` (if you have token)

### Step 6: Clear LocalStorage
In Browser Console:
```javascript
localStorage.clear()
location.reload()
```

### Step 7: Check Backend
Make sure backend is running:
```bash
# Check if backend is on port 5000
curl http://localhost:5000/api/v1/health
```

### Step 8: Disable API Calls Temporarily
If API is causing issues, you can temporarily disable:
- Comment out `refreshUser()` call in AuthContext
- Test if app loads without API calls

## Common Issues & Solutions

### Issue: "Redirecting..." Forever
**Cause**: Redirect loop or API call hanging
**Fix**: 
- Clear localStorage
- Check API endpoint exists
- Disable API refresh temporarily

### Issue: White Screen
**Cause**: JavaScript error
**Fix**: Check browser console for errors

### Issue: High CPU Usage
**Cause**: Infinite loops
**Fix**: Already fixed in latest code

### Issue: Port 3001 Not Opening
**Cause**: Server not running or port in use
**Fix**: 
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Restart server
npm run dev
```

## Quick Test

1. **Start Server**:
   ```bash
   cd scorer-app
   npm run dev
   ```

2. **Open Browser**:
   - Go to `http://localhost:3001/login` (direct URL)
   - Should see login form immediately

3. **If Still Not Working**:
   - Check terminal for errors
   - Check browser console
   - Try incognito/private window

## Emergency Fix: Bypass Redirect

If redirect is stuck, you can temporarily bypass it:

Edit `src/app/page.tsx`:
```typescript
export default function HomePage() {
  // Temporarily redirect to login directly
  return null; // Or return <LoginPage />
}
```

Then access pages directly via URL.


