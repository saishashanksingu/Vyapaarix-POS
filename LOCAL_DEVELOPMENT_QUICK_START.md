# 🚀 Quick Start - Local Development with MongoDB Compass

**Time: ~5 minutes to start developing locally**

---

## 1️⃣ Prerequisites

Check you have:
```bash
node --version          # Should be v18+
npm --version           # Should be v8+
mongod --version        # Should show version (if not installed, see step 2)
```

---

## 2️⃣ Install MongoDB (If Needed)

If `mongod --version` fails:

**Download & Install:**
1. Go to: https://www.mongodb.com/try/download/community
2. Download for Windows (64-bit)
3. Run installer → Choose "Complete" → Finish
4. MongoDB will run as a Windows Service automatically

**Or use Docker:**
```bash
docker-compose up
```

---

## 3️⃣ Create .env File

**Create `backend/.env`:**
```
MONGODB_URI=mongodb://localhost:27017/supermarket
PORT=5000
NODE_ENV=development
JWT_SECRET=dev-secret-key-12345
```

**Create `frontend/.env.local`:**
```
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 4️⃣ Start Everything

### Terminal 1: Start Backend
```bash
cd backend
npm start
```

You should see:
```
Server running on port 5000
MongoDB successfully connected
```

### Terminal 2: Start Frontend
```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

### Terminal 3: Open MongoDB Compass

1. Launch MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Click "Connect"
4. Navigate to `supermarket` database
5. Watch data appear as you use the app!

---

## 5️⃣ Open Your App

Visit: **http://localhost:5173**

You should see the login page! ✅

---

## 6️⃣ Test the App

1. **Register**: Create a test account
2. **Login**: Use your credentials
3. **Add Product**: Go to Products → Add New
4. **Make Sale**: Go to POS → Add items
5. **View Analytics**: See dashboard
6. **Watch Compass**: See database updates in real-time!

---

## 📊 What You'll See in Compass

### Database Structure:
```
supermarket/
├── users          (login accounts)
├── products       (inventory)
└── sales          (transactions)
```

### Example Product Document:
```json
{
  "_id": "...",
  "name": "Test Product",
  "price": 10.99,
  "quantity": 100,
  "category": "Electronics"
}
```

---

## 🛑 Stop Development

```bash
# Kill all three terminals or press Ctrl+C in each
```

MongoDB will stay running (Windows Service). To stop:
1. Open Services (Windows)
2. Find "MongoDB Server"
3. Right-click → Stop

---

## 🔄 Next Time You Develop

Just run:
```bash
# Terminal 1
cd backend && npm start

# Terminal 2
cd frontend && npm run dev

# Terminal 3
Open MongoDB Compass
```

---

## 🚀 When Ready for Production

1. Create MongoDB Atlas cluster (free)
2. Get connection string
3. Update deployment (see FULL_DEPLOYMENT_GUIDE.md)
4. Deploy to Railway & Vercel

---

## ✅ Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
# Windows: Check Services for "MongoDB Server"
# Or: mongod (in PowerShell)

# Or use Docker:
docker-compose up
```

### Frontend won't load
```bash
# Kill and restart:
# Terminal 2: Ctrl+C and npm run dev again
```

### Can't see data in Compass
```bash
# Make sure you're connected
# Compass → mongodb://localhost:27017
# Switch database: supermarket
# Click refresh
```

### Port already in use
```bash
# If ports 5000/5173 are in use:
# Edit backend/server.js or frontend/vite.config.js
# Change PORT=5001 or similar
```

---

## 📝 Typical Development Session

```
Morning:
1. Open 3 terminals
2. Terminal 1: cd backend && npm start
3. Terminal 2: cd frontend && npm run dev
4. Terminal 3: Open MongoDB Compass
5. Open http://localhost:5173 in browser
6. Start developing!

Development:
- Edit code
- Browser auto-refreshes (frontend)
- Backend auto-restarts (npm start watches)
- Compass shows live database

End of Day:
- Ctrl+C in all 3 terminals
- Commit your changes
- Git push
```

---

## 🎯 You're Ready!

Everything is set up for local development with MongoDB Compass.

**Start now:**
```bash
cd backend && npm start
```

Happy coding! 🚀

