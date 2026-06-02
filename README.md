# KABAW Space Mission Control 🌍📡

Welcome to the KABAW Air & Crop Monitoring System. This is a full-stack application that leverages Next.js on the frontend and FastAPI on the backend to communicate directly with Google Earth Engine for real-time satellite telemetry (NDVI / Crop Health).

## 🚀 Deployment Guide

You mentioned wanting to push this to **GitHub** and then deploy to **Vercel**. Since this project has two distinct parts (a React frontend and a Python backend), here is the standard production workflow:

### 1. Push to GitHub
First, push this entire root directory to a single GitHub repository.

### 2. Deploy the Backend (FastAPI) to Render / Railway
Vercel is optimized for Next.js. For a heavy Python data-science backend like FastAPI + Earth Engine, a platform like [Render.com](https://render.com) or [Railway.app](https://railway.app) is the best free option.

1. Create an account on Render.com and select **New Web Service**.
2. Connect your GitHub repo and set the Root Directory to `backend`.
3. Set the Start Command to: `uvicorn main:app --host 0.0.0.0 --port 10000`
4. **CRITICAL (Earth Engine Auth):** In Render's Environment Variables, create a variable named `GOOGLE_CREDENTIALS_JSON`. Open your `service-account.json.json` file, copy the *entire text*, and paste it as the value for this variable.
5. Deploy! Render will give you a public URL (e.g., `https://kabaw-backend.onrender.com`).

### 3. Deploy the Frontend (Next.js) to Vercel
Now that your backend is running in the cloud, let's deploy the frontend dashboard.

1. Log into [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Edit the **Root Directory** and set it to `frontend`.
4. In the **Environment Variables** section, add:
   * **Name:** `NEXT_PUBLIC_API_URL`
   * **Value:** The URL of your deployed backend (e.g., `https://kabaw-backend.onrender.com`)
5. Click **Deploy**. Vercel will build the Tailwind + Next.js dashboard!

---

## 💻 Local Development

If you want to continue running the app locally on your machine:

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# Runs on http://localhost:8000
```

*Note: The frontend will automatically fall back to `http://localhost:8000` for the backend if the `NEXT_PUBLIC_API_URL` environment variable is not set locally.*
