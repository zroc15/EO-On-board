# Deployment Guide - EliteOps Onboarding System

## ⚠️ IMPORTANT: This is a Full-Stack App

**Netlify can only host the FRONTEND (static files).** Your backend API and database need separate hosting.

---

## 🎯 Deployment Strategy

### Architecture Overview:
```
┌─────────────┐      ┌──────────────┐      ┌────────────┐
│   Frontend  │ ───> │   Backend    │ ───> │ PostgreSQL │
│  (Netlify)  │      │ (Render/etc) │      │ (Database) │
└─────────────┘      └──────────────┘      └────────────┘
```

You need **THREE** separate deployments:
1. **Frontend** → Netlify (React app) ✅
2. **Backend** → Render/Railway/Heroku (Node.js API)
3. **Database** → Managed PostgreSQL service

---

## 📦 Option 1: Quick Deploy (Recommended)

### Deploy Everything to **Render.com** (Free Tier Available)

**Why Render?** It can host BOTH your frontend and backend, plus database.

#### Step 1: Deploy Backend + Database
1. Go to https://render.com
2. Sign up with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your `EO-On-board` repository
5. Configure:
   - **Name:** `eliteops-onboarding-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build --workspace=backend`
   - **Start Command:** `npm run start --workspace=backend`
   - **Root Directory:** Leave blank or set to `/`

6. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3001
   DB_HOST=<from render database>
   DB_PORT=5432
   DB_NAME=eliteops_onboarding
   DB_USER=<from render database>
   DB_PASSWORD=<from render database>
   ```

7. Click **"New +"** → **"PostgreSQL"**
   - Name: `eliteops-db`
   - Copy connection details to backend env vars above

8. Deploy! You'll get a URL like: `https://eliteops-onboarding-api.onrender.com`

#### Step 2: Deploy Frontend
1. Click **"New +"** → **"Static Site"**
2. Connect same repository
3. Configure:
   - **Name:** `eliteops-onboarding`
   - **Build Command:** `npm install && npm run build --workspace=frontend`
   - **Publish Directory:** `frontend/dist`
   - **Root Directory:** `/`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://eliteops-onboarding-api.onrender.com
   ```

5. Deploy! You'll get: `https://eliteops-onboarding.onrender.com`

#### Step 3: Update Frontend API URL
You need to update the frontend to use the deployed backend URL instead of localhost.

---

## 📦 Option 2: Netlify (Frontend) + Separate Backend

If you want to use Netlify for the frontend:

### Deploy Backend First

**Option A: Railway.app** (Recommended for beginners)
1. Go to https://railway.app
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your `EO-On-board` repository
5. Add PostgreSQL database (Railway provides one-click)
6. Set environment variables (same as above)
7. Railway auto-detects Node.js and builds
8. You'll get: `https://your-app.railway.app`

**Option B: Heroku**
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. From your repo:
   ```bash
   heroku create eliteops-onboarding-api
   heroku addons:create heroku-postgresql:mini
   git push heroku main
   ```

**Option C: Fly.io**
1. Install flyctl: https://fly.io/docs/hands-on/install-flyctl/
2. From backend directory:
   ```bash
   fly launch
   fly postgres create
   fly deploy
   ```

### Deploy Frontend to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to GitHub → Select `EO-On-board`
4. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
5. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.com
   ```
6. Deploy!

---

## 🔧 Update Frontend to Use Environment Variable

You need to update the API base URL. Edit `frontend/src/services/api.ts`:

**Before:**
```typescript
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

**After:**
```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});
```

Then create `frontend/.env.production`:
```
VITE_API_URL=https://your-backend-api-url.com/api
```

---

## 🗄️ Database Migration on Production

After deploying your backend, run migrations:

**If using Render:**
1. Go to your web service dashboard
2. Click **"Shell"** tab
3. Run: `npm run migrate --workspace=backend`

**If using Railway:**
1. Click on your service
2. Open **"Deployments"** → **"..."** → **"View Logs"**
3. Or use Railway CLI: `railway run npm run migrate --workspace=backend`

**If using Heroku:**
```bash
heroku run npm run migrate --workspace=backend
```

---

## ✅ What's Already Fixed for Netlify

I've already fixed the TypeScript build errors:
- ✅ Removed unused imports that were causing build failures
- ✅ Frontend now builds successfully with `npm run build`
- ✅ All TypeScript strict mode checks pass

---

## 🚨 Common Deployment Issues

### Issue: "API calls failing"
**Solution:** Make sure CORS is configured in backend. In `backend/src/server.ts`:
```typescript
app.use(cors({
  origin: ['https://your-netlify-url.netlify.app', 'https://your-custom-domain.com'],
  credentials: true
}));
```

### Issue: "Database connection refused"
**Solution:** Check your DATABASE_URL environment variable is set correctly on your backend host.

### Issue: "404 on page refresh"
**Solution:** Add `frontend/public/_redirects` file:
```
/*    /index.html   200
```

---

## 💰 Cost Estimate

### Free Tier Options:
- **Render:** Free for hobby projects (backend + database + frontend)
  - Spins down after inactivity (takes 30s to wake up)

- **Railway:** $5/month credit free (good for 1 backend + DB)

- **Netlify:** 100GB bandwidth/month free (frontend only)

### Recommended Free Setup:
- Frontend: Netlify (free)
- Backend + Database: Render (free tier)
- **Total Cost: $0/month** for MVP testing

### Production Setup (~$20-30/month):
- Frontend: Netlify Pro ($19/month) or Vercel
- Backend: Render Standard ($7/month)
- Database: Render PostgreSQL ($7/month)

---

## 🎯 Quick Start: Deploy to Render (All-in-One)

The fastest way to get your app online:

1. **Go to Render.com** and sign up
2. **Create PostgreSQL database** first
3. **Deploy backend** as Web Service (use database connection string)
4. **Deploy frontend** as Static Site (set API URL to backend)
5. **Run migrations** via Render Shell
6. **Done!** Your app is live

Your Netlify build will now succeed, but remember you still need to deploy the backend separately! 🚀
