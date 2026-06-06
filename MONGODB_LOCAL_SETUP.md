# MongoDB Compass Local Setup Guide

## 🎯 Setup: Local Development + Cloud Production

You'll have:
- **Local Development**: MongoDB running locally + Compass GUI
- **Production**: MongoDB Atlas (cloud)

---

## 1️⃣ Install MongoDB Community Server

### On Windows:

1. Download from: https://www.mongodb.com/try/download/community
2. Choose your Windows version (64-bit recommended)
3. Run the installer
4. Choose "Complete" installation
5. Choose "Run as a Service" during setup
6. Installation completes

### Verify Installation

Open PowerShell and run:
```bash
mongod --version
```

You should see the version number.

---

## 2️⃣ MongoDB Compass (You Already Have This!)

Compass is the GUI tool for MongoDB. Here's how to use it:

### Connect to Local MongoDB

1. Open MongoDB Compass
2. Click "New Connection"
3. Use default connection: `mongodb://localhost:27017`
4. Click "Connect"
5. You should see databases on the left

### Create Local Database

1. In Compass, click "Create Database"
2. Database Name: `supermarket`
3. Collection Name: `users`
4. Click "Create"

---

## 3️⃣ Environment Configuration

### For Local Development (.env)

Create `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/supermarket
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-here
```

### For Production (MongoDB Atlas)

When deploying to Railway:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/supermarket
PORT=5000
NODE_ENV=production
```

---

## 4️⃣ Start Local Development

### Option A: Direct Node.js

```bash
cd backend
npm start
```

Backend will connect to: `mongodb://localhost:27017/supermarket`

### Option B: Docker Compose (Includes MongoDB)

```bash
docker-compose up
```

This starts:
- MongoDB container
- Backend container
- Frontend container

---

## 5️⃣ Using MongoDB Compass

### View Collections

1. Compass → supermarket database → click collections
2. See all your data

### Query Data

1. Click on a collection
2. See documents
3. Filter/search using query syntax

### Insert Test Data

1. Click "Insert Document"
2. Add sample product:
```json
{
  "name": "Test Product",
  "price": 10.99,
  "quantity": 100,
  "category": "Test"
}
```

---

## ✅ Development Workflow

```
1. Start MongoDB Server
   - Windows: Runs as service automatically
   - Or: mongod (in terminal)

2. Open MongoDB Compass
   - Connect to localhost:27017
   - View/manage data

3. Run Backend
   cd backend && npm start

4. Run Frontend
   cd frontend && npm run dev

5. Test in Browser
   http://localhost:5173

6. Monitor in Compass
   Watch data appear in real-time
```

---

## 🚀 When Ready to Deploy

### For Production:

1. Create MongoDB Atlas cluster (free tier)
2. Get connection string
3. Update Railway environment:
   ```
   MONGODB_URI=<your-atlas-connection-string>
   ```
4. Deploy to Railway
5. Vercel automatically uses Railway backend

---

## 🔧 Troubleshooting

### "MongoDB connection refused"
```bash
# Check if MongoDB is running
# Windows: Check Services
# Or restart: mongod

# Or use Docker instead
docker-compose up
```

### "Cannot connect to localhost:27017"
```bash
# Install MongoDB if not done
# Download from mongodb.com/try/download/community
```

### "Compass can't connect"
```bash
1. Ensure MongoDB is running
2. Try connection: mongodb://localhost:27017
3. Check Windows Firewall (should allow MongoDB)
```

---

## 📊 Compass Features

- ✅ View databases and collections
- ✅ Query documents
- ✅ Insert/update/delete data
- ✅ Create indexes
- ✅ Export/import data
- ✅ Performance monitoring

---

## 🎯 Quick Start Commands

```bash
# 1. Start MongoDB (Windows service does this automatically)
# Or: mongod

# 2. Open MongoDB Compass and connect to mongodb://localhost:27017

# 3. Start Backend
cd backend && npm start

# 4. Start Frontend
cd frontend && npm run dev

# 5. Visit http://localhost:5173
```

---

## 📝 Configuration Files

### .env (for local development)
```
MONGODB_URI=mongodb://localhost:27017/supermarket
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-12345
```

### .env.production (for Railway)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/supermarket
PORT=5000
NODE_ENV=production
JWT_SECRET=strong-production-secret-key
```

---

## ✨ Your Setup is Complete!

You now have:
- ✅ MongoDB running locally
- ✅ MongoDB Compass for management
- ✅ Backend connected to local MongoDB
- ✅ Frontend ready to test
- ✅ Production setup ready (when you deploy)

**Start developing now!** 🚀

