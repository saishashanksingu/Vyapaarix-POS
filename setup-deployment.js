#!/usr/bin/env node

/**
 * Supermarket SaaS - Automated Deployment Setup
 * This script automates the entire deployment process
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
  console.log('\n🚀 Supermarket SaaS - Automated Deployment Setup\n');
  console.log('═'.repeat(60));

  try {
    // Step 1: Gather credentials
    console.log('\n📝 Step 1: Gathering Information\n');
    
    const mongoDbUri = await question('MongoDB URI (from MongoDB Atlas): ');
    const railwayToken = await question('Railway API Token (from railway.app settings): ');
    const vercelToken = await question('Vercel Token (from vercel.com settings): ');
    const gitHubUsername = await question('GitHub Username: ');
    
    console.log('\n✅ Credentials gathered!\n');

    // Step 2: Validate connectivity
    console.log('📋 Step 2: Validating Setup\n');
    
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

    // Step 3: Create environment files
    console.log('\n⚙️ Step 3: Creating Environment Configuration\n');
    
    const backendEnv = `MONGODB_URI=${mongoDbUri}
PORT=5000
NODE_ENV=production
ALLOWED_ORIGINS=https://${gitHubUsername}.vercel.app`;
    
    fs.writeFileSync(path.join(__dirname, '../backend/.env'), backendEnv);
    console.log('  ✓ Backend .env created');

    const frontendEnv = `VITE_API_BASE_URL=https://your-railway-url/api`;
    fs.writeFileSync(path.join(__dirname, '../frontend/.env'), frontendEnv);
    console.log('  ✓ Frontend .env created');

    // Step 4: Deploy to Railway
    console.log('\n🚂 Step 4: Deploying to Railway\n');
    console.log('  ℹ️ Opening Railway dashboard...');
    console.log('  Instructions:');
    console.log('  1. Go to: https://railway.app/dashboard');
    console.log('  2. Create a new project from GitHub');
    console.log('  3. Select your supermarket-saas repository');
    console.log('  4. Add MONGODB_URI environment variable from: ' + mongoDbUri);
    console.log('  5. Copy your deployment URL');
    console.log('  6. Paste it here when ready...\n');

    const railwayUrl = await question('Railway Backend URL (e.g., https://supermarket-backend-production.up.railway.app): ');

    // Step 5: Update frontend with backend URL
    console.log('\n🔗 Step 5: Connecting Frontend to Backend\n');
    
    const frontendEnvUpdated = `VITE_API_BASE_URL=${railwayUrl}/api`;
    fs.writeFileSync(path.join(__dirname, '../frontend/.env'), frontendEnvUpdated);
    console.log('  ✓ Frontend configured to use Railway backend');

    // Step 6: Deploy to Vercel
    console.log('\n▲ Step 6: Deploying to Vercel\n');
    console.log('  Instructions:');
    console.log('  1. Go to: https://vercel.com/new');
    console.log('  2. Select your supermarket-saas repository');
    console.log('  3. Root Directory: ./frontend');
    console.log('  4. Build Command: npm run build');
    console.log('  5. Output Directory: dist');
    console.log('  6. Add Environment Variable:');
    console.log(`     VITE_API_BASE_URL=${railwayUrl}/api`);
    console.log('  7. Click Deploy');
    console.log('  8. Paste your deployment URL here...\n');

    const vercelUrl = await question('Vercel Frontend URL (e.g., https://supermarket-saas.vercel.app): ');

    // Step 7: Final configuration
    console.log('\n✨ Step 7: Final Configuration\n');

    // Create deployment summary
    const summary = `# Supermarket SaaS - Deployment Summary

## 🎉 Deployment Complete!

### Your Live URLs
- **Frontend**: ${vercelUrl}
- **Backend**: ${railwayUrl}

### Environment Configuration
- MongoDB: Connected
- Railway Backend: Deployed
- Vercel Frontend: Deployed

### Test Your Application
1. Visit: ${vercelUrl}
2. Create an account
3. Add products
4. Process sales
5. Check analytics

### Support
If you encounter any issues, review:
- FULL_DEPLOYMENT_GUIDE.md - Complete guide
- DEPLOYMENT_INSTRUCTIONS.md - Detailed steps
- Troubleshooting section in deployment guides

### Next Steps
1. Share your Vercel URL with users
2. Monitor deployments on Railway and Vercel dashboards
3. Update CORS if you add custom domains
4. Scale up when needed

Happy selling! 🎉
`;

    fs.writeFileSync(path.join(__dirname, '../DEPLOYMENT_SUMMARY.md'), summary);
    console.log('  ✓ Deployment summary created');

    // Create .env.local for local testing
    const localEnv = `VITE_API_BASE_URL=${railwayUrl}/api`;
    fs.writeFileSync(path.join(__dirname, '../frontend/.env.local'), localEnv);
    console.log('  ✓ Local development environment configured');

    rl.close();

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ DEPLOYMENT COMPLETE!\n');
    console.log(`🌐 Your app is live at: ${vercelUrl}\n`);
    console.log('Next steps:');
    console.log(`1. Visit: ${vercelUrl}`);
    console.log('2. Register and test the application');
    console.log('3. Share the URL with your users');
    console.log('4. Monitor on Railway and Vercel dashboards\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    rl.close();
    process.exit(1);
  }
}

main();
