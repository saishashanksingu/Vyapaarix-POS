# Supermarket SaaS - Deployment Instructions

## 🚀 Quick Start Deployment on Free Platforms

This document provides step-by-step instructions to deploy your Supermarket SaaS application on completely free platforms.

### Deployment Stack
- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free $5/month credit)
- **Database**: MongoDB Atlas (Free tier)

---

## 📋 Prerequisites

Before you begin, ensure you have:
- [ ] GitHub account
- [ ] MongoDB Atlas account
- [ ] Railway account
- [ ] Vercel account

All platforms offer free signups with no credit card required initially.

---

## Step 1: MongoDB Atlas Setup (Database)

### 1.1 Create a MongoDB Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Sign Up** (or login if you have an account)
3. Create a new organization and project
4. Click **Create a Deployment**
5. Select **M0 (Free)** tier
6. Choose a region closest to you
7. Click **Create Deployment** and wait for it to initialize

### 1.2 Create Database User

1. In the left sidebar, click **Database Access**
2. Click **Add New Database User**
3. Enter username: `supermarket-admin`
4. Enter password: (generate a strong password)
5. Click **Add User**

### 1.3 Get Connection String

1. In the left sidebar, click **Database**
2. Find your cluster and click **Connect**
3. Select **Drivers** tab
4. Choose Node.js as your driver
5. Copy the connection string (should look like):
   ```
   mongodb+srv://supermarket-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password
7. Replace `/?` with `/supermarket?` to specify database name

**Example:**
```
mongodb+srv://supermarket-admin:MyPassword123@cluster0.abc123.mongodb.net/supermarket?retryWrites=true&w=majority
```

✅ Save this connection string - you'll need it for Railway!

---

## Step 2: Push Code to GitHub

### 2.1 Initialize Git (if not done)

```bash
cd c:\Users\Sai Shashank Singu\Desktop\Supermarket-saas
git init
git add .
git commit -m "Initial commit"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub.com](https://github.com/new)
2. Create a new repository named `supermarket-saas`
3. DO NOT initialize with README
4. Click **Create repository**

### 2.3 Push Code to GitHub

```bash
git remote add origin https://github.com/YOUR-USERNAME/supermarket-saas.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend on Railway

### 3.1 Create Railway Project

1. Go to [Railway.app](https://railway.app)
2. Click **Login** and choose **Login with GitHub**
3. Authorize the connection
4. Click **New Project**
5. Select **Deploy from GitHub repo**
6. Click **Connect GitHub** and select your `supermarket-saas` repo
7. Select **main** branch
8. Click **Deploy**

### 3.2 Configure Environment Variables

1. After deployment, go to your project
2. Click on the **backend** service
3. Go to **Variables** tab
4. Click **Add Variable** and add:

| Key | Value |
|-----|-------|
| `MONGODB_URI` | Your MongoDB connection string from Step 1.3 |
| `PORT` | `5000` |
| `NODE_ENV` | `production` |

5. Click **Save Variables**
6. Railway will redeploy automatically

### 3.3 Get Backend URL

1. In the Railway dashboard, go to **backend** service
2. Scroll to **Deployments**
3. Find the green checkmark deployment
4. Copy the **Public URL** (e.g., `https://supermarket-backend-production.up.railway.app`)

✅ Save this URL - you'll need it for Vercel!

---

## Step 4: Deploy Frontend on Vercel

### 4.1 Connect Vercel

1. Go to [Vercel.com](https://vercel.com)
2. Click **Sign Up** and choose **Continue with GitHub**
3. Authorize and sign in
4. Click **Add New...** → **Project**
5. Select your `supermarket-saas` repository
6. Click **Import**

### 4.2 Configure Build Settings

On the **Configure Project** page:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `./frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

### 4.3 Add Environment Variable

1. Scroll down to **Environment Variables**
2. Add a new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: Your Railway backend URL with `/api` appended
   - Example: `https://supermarket-backend-production.up.railway.app/api`

3. Click **Add**
4. Click **Deploy**

### 4.4 Get Frontend URL

After deployment completes:
1. Vercel shows your live URL (e.g., `https://supermarket-saas.vercel.app`)
2. Click the URL to visit your live app!

✅ Save this URL - it's your live application!

---

## Step 5: Final Configuration

### 5.1 Update Backend CORS (Optional)

If Vercel deployment URL doesn't work, update [backend/server.js](backend/server.js):

1. Edit the CORS configuration to include your Vercel domain:
```javascript
if (origin && origin.includes('vercel.app')) return cb(null, true);
```

2. Commit and push to GitHub:
```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push
```

3. Railway will auto-redeploy

### 5.2 Test Your Deployment

1. Visit your Vercel URL
2. Try to register a new account
3. Login
4. Add a product
5. Try a sales transaction
6. Check analytics

---

## 🧪 Troubleshooting

### Frontend shows "Network Error"
- ✅ Check `VITE_API_BASE_URL` in Vercel environment variables
- ✅ Verify Railway backend is running (check Railway dashboard)
- ✅ Check browser console for exact error

### "Cannot connect to database"
- ✅ Verify `MONGODB_URI` is correct
- ✅ Check MongoDB Atlas IP whitelist (should be 0.0.0.0/0 for free tier)
- ✅ Verify database user credentials

### Authentication not working
- ✅ Check cookies are enabled in browser
- ✅ Check browser's Application tab → Cookies → localStorage
- ✅ Verify JWT secret is consistent

### 502 Bad Gateway Error
- ✅ Railway backend might be starting up (wait 30 seconds)
- ✅ Check Railway logs for errors
- ✅ Verify MONGODB_URI variable is set

---

## 📊 Monitor Your Deployment

### Railway Monitoring
1. Visit [Railway dashboard](https://railway.app/dashboard)
2. Select your project
3. Monitor:
   - CPU usage
   - Memory usage
   - Logs
   - Deployments

### Vercel Monitoring
1. Visit [Vercel dashboard](https://vercel.com/dashboard)
2. Select your project
3. Monitor:
   - Deployments
   - Analytics
   - Performance
   - Error logs

### MongoDB Atlas Monitoring
1. Visit [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Go to your cluster
3. Monitor:
   - Database size
   - Operations
   - Performance

---

## 💡 Tips & Best Practices

### Scaling (When Free Tier is Not Enough)

1. **Database**: 
   - Upgrade MongoDB Atlas to paid tier (starts at ~$57/month)
   - Or migrate to another provider

2. **Backend**:
   - Railway: $5/month credit runs out
   - Upgrade to paid Railway ($5+ per month)
   - Alternative: AWS, Google Cloud, Azure

3. **Frontend**:
   - Vercel free tier is quite generous
   - Pro plan costs $20/month if needed

### Security Best Practices

- ✅ Change default database password
- ✅ Use strong JWT secret
- ✅ Keep dependencies updated: `npm audit`
- ✅ Use HTTPS everywhere (provided by platforms)
- ✅ Monitor logs regularly

### Performance Optimization

1. **Frontend**:
   - Enable Vercel analytics
   - Optimize images
   - Use lazy loading

2. **Backend**:
   - Add database indexes
   - Cache frequently accessed data
   - Monitor slow queries

3. **Database**:
   - Regular backups (MongoDB Atlas auto-backs up)
   - Monitor connection pools
   - Archive old data

---

## 🔗 Useful Links

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Railway Docs](https://docs.railway.app/)
- [Vercel Docs](https://vercel.com/docs)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/nodejs-best-practices/)

---

## 📞 Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review platform logs:
   - Railway: Dashboard → Logs
   - Vercel: Dashboard → Deployments → View Logs
   - MongoDB: Atlas → Performance

3. Search error messages on:
   - Stack Overflow
   - Platform documentation
   - GitHub issues

---

## ✅ Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Connection string saved
- [ ] Code pushed to GitHub
- [ ] Railway backend deployed
- [ ] Backend environment variables configured
- [ ] Vercel frontend deployed
- [ ] Frontend environment variables configured
- [ ] CORS configured (if needed)
- [ ] Frontend can connect to backend
- [ ] Registration works
- [ ] Login works
- [ ] Products can be added
- [ ] Sales transactions work
- [ ] Analytics page works

---

## 🎉 Congratulations!

Your Supermarket SaaS is now live and ready to use! 

**Your Live URLs:**
- Frontend: `https://your-vercel-domain.vercel.app`
- Backend: `https://your-railway-domain.up.railway.app`

Share these with your users or add a custom domain for a professional touch!

