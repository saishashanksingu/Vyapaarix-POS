# Supermarket SaaS - Automated Deployment Scripts

This directory contains automated deployment helpers for your Supermarket SaaS application.

## Quick Start

### Option 1: Interactive Setup (Recommended)

```bash
npm run setup-deploy
```

This script will:
1. ✅ Validate your environment
2. ✅ Create environment configuration files
3. ✅ Guide you through Railway deployment
4. ✅ Guide you through Vercel deployment  
5. ✅ Connect frontend to backend automatically
6. ✅ Generate deployment summary

### Option 2: Manual Deployment (See Guides)

- **FULL_DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
- **DEPLOYMENT_INSTRUCTIONS.md** - Detailed platform-specific steps
- **PLATFORM_COMPARISON.md** - Understanding the platforms

## What Gets Automated

### Environment Setup
- ✅ Backend .env file creation
- ✅ Frontend .env configuration
- ✅ Local testing configuration

### Validation
- ✅ Git repository check
- ✅ Node.js/npm verification
- ✅ Dependency installation

### Deployment Guidance
- ✅ Railway instructions
- ✅ Vercel instructions
- ✅ URL collection and configuration
- ✅ Inter-service connection setup

### Post-Deployment
- ✅ Deployment summary generation
- ✅ Configuration verification
- ✅ Testing instructions

## File Structure

```
supermarket-saas/
├── setup-deployment.js          # Main automation script
├── FULL_DEPLOYMENT_GUIDE.md     # Complete guide
├── DEPLOYMENT_INSTRUCTIONS.md   # Step-by-step
├── PLATFORM_COMPARISON.md       # Platform comparison
└── package.json                 # Updated with setup-deploy script
```

## Add to package.json

Add this line to scripts section in package.json:

```json
"scripts": {
  "setup-deploy": "node setup-deployment.js"
}
```

## After Running

You'll get:
- ✅ Configured .env files
- ✅ Connected services
- ✅ Live deployment URLs
- ✅ DEPLOYMENT_SUMMARY.md with your URLs
- ✅ Testing instructions

## Troubleshooting

### "Not a git repository"
```bash
git init
git remote add origin https://github.com/your-username/supermarket-saas.git
```

### "Node.js not installed"
Download from: https://nodejs.org/

### "Cannot connect to database"
- Verify MongoDB URI is correct
- Check MongoDB Atlas IP whitelist
- Test connection locally first

### "Deployment failed on Railway"
- Check Railway logs in dashboard
- Verify MONGODB_URI environment variable
- Ensure NODE_ENV=production is set

## Support

For detailed information:
1. Read FULL_DEPLOYMENT_GUIDE.md
2. Check platform documentation
3. Review troubleshooting sections

## Next Steps

1. Run `npm run setup-deploy`
2. Follow the interactive prompts
3. Deploy to Railway and Vercel
4. Visit your live application!

Happy deploying! 🚀
