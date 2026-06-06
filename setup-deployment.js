#!/usr/bin/env node

/**
 * Supermarket SaaS - Automated Deployment Setup
 * Supports both local MongoDB development and cloud deployment
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => {
  rl.question(prompt, resolve);
});

async function main() {
  console.log('\n🚀 Supermarket SaaS - Setup & Deployment\n');
  console.log('═'.repeat(60));

  try {
    // Step 0: Ask deployment mode
    console.log('\n🎯 Step 0: Choose Your Setup\n');
    console.log('1. Local Development (MongoDB locally + Compass)');
    console.log('2. Production Deployment (Cloud MongoDB + Railway + Vercel)');
    console.log('3. Both (Local dev + Production deploy)\n');
    
    const mode = await question('Enter choice (1-3): ');

    // Step 1: Validate connectivity
    console.log('\n📋 Validating Environment\n');
    
    try {
      execSync('git status', { stdio: 'ignore' });
      console.log('  ✓ Git repository ready');
    } catch {
      throw new Error('Not a git repository');
    }

    try {
      execSync('node --version', { stdio: 'ignore' });
      execSync('npm --version', { stdio: 'ignore' });
      console.log('  ✓ Node.js and npm installed');
    } catch {
      throw new Error('Node.js or npm not installed');
    }

    // LOCAL DEVELOPMENT SETUP
    if (mode === '1' || mode === '3') {
      console.log('\n⚙️ Step 1: Setting Up Local Development\n');
      
      // Check if MongoDB is installed
      try {
        execSync('mongod --version', { stdio: 'ignore' });
        console.log('  ✓ MongoDB installed locally');
      } catch {
        console.log('  ⚠️ MongoDB not found. Installation options:');
        console.log('     1. Download from: https://www.mongodb.com/try/download/community');
        console.log('     2. Or use Docker: docker-compose up');
        console.log('  See MONGODB_LOCAL_SETUP.md for details');
      }

      // Create backend .env for local development
      const backendEnvLocal = `MONGODB_URI=mongodb://localhost:27017/supermarket
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-12345`;
      
      fs.writeFileSync(path.join(__dirname, 'backend/.env'), backendEnvLocal);
      console.log('  ✓ Backend .env created (local MongoDB)');

      // Create frontend .env for local development
      const frontendEnvLocal = `VITE_API_BASE_URL=http://localhost:5000/api`;
      fs.writeFileSync(path.join(__dirname, 'frontend/.env.local'), frontendEnvLocal);
      console.log('  ✓ Frontend .env.local created');

      console.log('\n✅ Local Development Ready!\n');
      console.log('Start development:');
      console.log('  Terminal 1: cd backend && npm start');
      console.log('  Terminal 2: cd frontend && npm run dev');
      console.log('  Terminal 3: Open MongoDB Compass (mongodb://localhost:27017)\n');
      console.log('Visit: http://localhost:5173\n');

      if (mode === '1') {
        // Local only - done
        console.log('See: LOCAL_DEVELOPMENT_QUICK_START.md for details');
        rl.close();
        process.exit(0);
      }
    }

    // PRODUCTION DEPLOYMENT SETUP
    if (mode === '2' || mode === '3') {
      console.log('\n🌐 Step 2: Setting Up Production Deployment\n');
      
      const mongoDbUri = await question('MongoDB Atlas URI (from MongoDB Atlas → Connect → Drivers): ');
      const railwayToken = await question('Railway API Token (from railway.app → Account → API Tokens): ');
      const vercelToken = await question('Vercel Token (from vercel.com → Settings → Tokens): ');
      const gitHubUsername = await question('GitHub Username: ');
      
      console.log('\n✅ Production Credentials Collected!\n');

      // Create backend .env.production
      const backendEnvProd = `MONGODB_URI=${mongoDbUri}
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://*.vercel.app`;
      
      fs.writeFileSync(path.join(__dirname, 'backend/.env.production'), backendEnvProd);
      console.log('  ✓ Backend .env.production created');

      // Create frontend .env for production
      console.log('\n  ℹ️ Open Railway dashboard...');
      console.log('  Instructions:');
      console.log('  1. Go to: https://railway.app/dashboard');
      console.log('  2. Create a new project from GitHub');
      console.log('  3. Select your supermarket-saas repository');
      console.log('  4. Add MONGODB_URI environment variable');
      console.log('  5. Complete deployment and copy your URL\n');

      const railwayUrl = await question('Railway Backend URL (e.g., https://supermarket-backend.up.railway.app): ');

      const frontendEnvProd = `VITE_API_BASE_URL=${railwayUrl}/api`;
      fs.writeFileSync(path.join(__dirname, 'frontend/.env.production'), frontendEnvProd);
      console.log('  ✓ Frontend .env.production created');

      // Deployment summary
      const summary = `# Supermarket SaaS - Deployment Summary

## 🎉 Deployment Configuration Ready!

### Your URLs
- **Frontend**: Vercel (will be assigned after deployment)
- **Backend**: ${railwayUrl}
- **Database**: MongoDB Atlas

### Environment Configuration
- MongoDB: Configured (Atlas)
- Railway: Backend deployed
- Vercel: Ready for frontend

### Next Steps
1. Deploy frontend on Vercel
2. Add VITE_API_BASE_URL: ${railwayUrl}/api
3. Test your live application
4. Monitor on Railway and Vercel dashboards

### Credentials Saved
- Railway URL: ${railwayUrl}
- MongoDB: Connected via Atlas

See FULL_DEPLOYMENT_GUIDE.md for detailed instructions.
`;

      fs.writeFileSync(path.join(__dirname, 'DEPLOYMENT_SUMMARY.md'), summary);
      console.log('\n✅ Production Setup Complete!\n');
      console.log('Deployment Summary saved to: DEPLOYMENT_SUMMARY.md\n');
      
      console.log('Next steps:');
      console.log('1. Deploy frontend on Vercel: https://vercel.com/new');
      console.log('2. Select your supermarket-saas repository');
      console.log('3. Set environment variable: VITE_API_BASE_URL=' + railwayUrl + '/api');
      console.log('4. Deploy and get your live URL\n');
    }

    rl.close();

    console.log('═'.repeat(60));
    console.log('\n✅ SETUP COMPLETE!\n');
    console.log('Documentation:');
    console.log('  • LOCAL_DEVELOPMENT_QUICK_START.md - Quick start guide');
    console.log('  • MONGODB_LOCAL_SETUP.md - Local MongoDB setup');
    console.log('  • FULL_DEPLOYMENT_GUIDE.md - Production deployment');
    console.log('  • README.md - Overview\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    rl.close();
    process.exit(1);
  }
}

main();
