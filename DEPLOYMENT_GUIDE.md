# Supermarket SaaS - Free Deployment Guide

This guide covers deploying your application to free platforms.

## Prerequisites
- GitHub account
- MongoDB Atlas account (free)
- Vercel account (free)
- Railway account (free)

---

## Step 1: Setup MongoDB Atlas (Database)

### Create Free MongoDB Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login
3. Create a new cluster (free tier available)
4. Click "Connect" → "Drivers"
5. Copy the connection string
6. Create a database user with username/password
7. Whitelist all IPs (0.0.0.0/0) for free tier

### Connection String Format
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/supermarket?retryWrites=true&w=majority
```

Save this for later use in Railway.

---

## Step 2: Deploy Backend on Railway

### Setup Railway Account
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Create a new project

### Deploy Backend
1. Click "New" → "GitHub Repo"
2. Connect your GitHub repository
3. Select this repository
4. Click "Deploy"
5. Configure environment variables:
   - Go to Project Settings → Variables
   - Add these variables:
     ```
     MONGODB_URI = [Your MongoDB Atlas connection string]
     PORT = 5000
     NODE_ENV = production
     ```
6. Railway will automatically detect `server.js` and run `npm start`
7. Note your deployed backend URL (e.g., `https://supermarket-backend-production.up.railway.app`)

---

## Step 3: Deploy Frontend on Vercel

### Setup Frontend Configuration
1. Update frontend/.env.production with your Railway backend URL:
   ```
   VITE_API_BASE_URL=https://your-railway-backend-url/api
   ```

2. Update [frontend/src/services/api.js](frontend/src/services/api.js):
   ```javascript
   const API = axios.create({
       baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api"
   });
   ```

### Deploy on Vercel
1. Go to [Vercel.com](https://vercel.com)
2. Click "New Project"
3. Connect your GitHub repository
4. Select this repository
5. Configure build settings:
   - Framework: Vite
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
   - Root Directory: (leave empty)
6. Add environment variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://your-railway-backend-url/api`
7. Click "Deploy"
8. Your frontend will be live at the Vercel URL

---

## Step 4: Update Backend CORS

Update [backend/server.js](backend/server.js) to accept your Vercel domain:

```javascript
app.use(cors({
  origin: (origin, cb) => {
    // Allow same-origin/non-browser tools
    if (!origin) return cb(null, true);
    
    // Allow local dev
    if (/^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true);
    if (/^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) return cb(null, true);
    
    // Allow Vercel domain (add your Vercel URL)
    if (origin.includes('vercel.app')) return cb(null, true);
    
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
```

---

## Quick Deployment Checklist

- [ ] Push project to GitHub
- [ ] Create MongoDB Atlas cluster
- [ ] Save MongoDB connection string
- [ ] Deploy backend on Railway
- [ ] Get Railway backend URL
- [ ] Update CORS in server.js with Vercel domain
- [ ] Update frontend API config with Railway URL
- [ ] Deploy frontend on Vercel
- [ ] Test authentication flow
- [ ] Test product management
- [ ] Test sales operations

---

## Troubleshooting

### Backend won't start
- Check `MONGODB_URI` format
- Ensure MongoDB IP whitelist includes 0.0.0.0/0
- Check Railway logs for errors

### Frontend can't connect to backend
- Verify `VITE_API_BASE_URL` is correct
- Check CORS settings on backend
- Verify authentication tokens in browser DevTools

### Slow database queries
- Check MongoDB connection on Atlas
- Monitor database usage in Atlas dashboard
- Optimize database indexes

---

## Free Tier Limits

**MongoDB Atlas Free Tier:**
- 512 MB storage
- Shared cluster
- 100 connections
- Basic monitoring

**Railway Free Tier:**
- $5/month credit
- Sufficient for small deployments
- Auto-sleep after 7 days of no usage

**Vercel Free Tier:**
- Unlimited projects
- Unlimited deployments
- 100 GB bandwidth/month
- Automatic SSL

---

## Next Steps (Optional)

1. **Add custom domain** on Vercel
2. **Setup email notifications** for alerts
3. **Monitor usage** on Railway dashboard
4. **Scale backend** if needed (upgrade from free tier)
5. **Add CDN** for faster image delivery

---

## Support Resources

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com)

