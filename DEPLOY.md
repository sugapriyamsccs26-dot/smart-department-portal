# 🚀 Production Deployment Guide

This guide outlines exactly how to push your existing Smart Department Portal to live cloud infrastructure successfully.

## 🟢 1. Railway Deployment (Backend API)
Railway is an excellent host for Node.js backends and perfectly supports Supabase integrations.

### Steps:
1. Create a [Railway.app](https://railway.app/) account and log in.
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository. 
   *(Note: Ensure your `.env` files are NOT pushed to GitHub - we've already set up the `.gitignore` blocks for this!)*
4. Once Railway analyzes the repository, it will detect the backend and `railway.json` / `Procfile`.
5. Go into your Railway project dashboard, click on your service, and navigate to the **Variables** section.
6. Add the following environment variables (from your `backend/.env` file):
   - `PORT=5000` Let railway handle this, but you can set if needed.
   - `JWT_SECRET=...`
   - `SUPABASE_URL=...`
   - `SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
7. In the settings, ensure the **Root Directory** is set to `/backend` (if you are deploying from a monorepo).
8. Railway will auto-build using `npm install` and start using the `Procfile` (`node server.js`).
9. Wait for the deployment to finish and grab your public **Railway URL** (e.g., `https://my-backend.up.railway.app`).

---

## 🔵 2. Vercel Deployment (Frontend React/Vite)
Vercel is fully tuned to handle fast Vite single-page applications.

### Steps:
1. Create a [Vercel.com](https://vercel.com/) account and log in.
2. Click **Add New** → **Project**
3. Import your GitHub repository.
4. Framework Preset: **Vite** will be auto-detected because of `vercel.json` and `vite.config.js`.
5. Root Directory: **frontend**.
6. Expand **Environment Variables** and add the following:
   - `VITE_API_BASE_URL`: **YOUR RAILWAY URL WITH /api ENPOINT** (e.g., `https://my-backend.up.railway.app/api`)
   - `VITE_SUPABASE_URL`: `https://syllayzsriruprtuucpt.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1Ni...`
7. Click **Deploy**.
8. Vercel will build (`npm run build`) and output to `/dist`, rewriting traffic using `vercel.json` perfectly for React Router.

You're done! Your portal is fully running on the cloud. 🎉
