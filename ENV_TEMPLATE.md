# Supermarket SaaS - Environment Variables

## Backend (.env)
```
# Database
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/supermarket?retryWrites=true&w=majority

# Server
PORT=5000
NODE_ENV=production

# CORS (optional - comma-separated domains)
ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://yourdomain.com
```

## Frontend (.env.production)
```
VITE_API_BASE_URL=https://your-railway-backend-url/api
```

## Get Your URLs:
- **MongoDB URI**: MongoDB Atlas → Cluster → Connect → Drivers
- **Railway Backend URL**: Railway → Project → Deployments → Copy deployment URL
- **Vercel Frontend URL**: Vercel → Project → Visit → Copy URL

