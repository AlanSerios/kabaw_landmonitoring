# KABAW Land Monitoring System 🌍🛰️

Welcome to the **KABAW Land Monitoring System**, an advanced, full-stack satellite telemetry dashboard designed for real-time agricultural and environmental analysis.

## 🎯 The Mission
The mission of **KABAW** is to empower farmers, environmental researchers, and local governments with accessible, high-grade satellite analytics. By leveraging data directly from orbit, KABAW helps users monitor crop health, detect drought conditions, and identify potential flooding across their lands without needing expensive physical sensors on the ground.

## ⚙️ How It Works
KABAW connects directly to **Google Earth Engine** and processes multispectral imagery from the **Sentinel-2** orbital satellite. When a user selects a location on the dashboard map, the backend engine immediately performs complex orbital mathematics on the raw light wavelengths reflecting off the Earth's surface to calculate two critical indices simultaneously:

### 🌱 1. NDVI (Normalized Difference Vegetation Index)
* **What it is:** A measure of live green vegetation.
* **How it works:** Healthy plants absorb red light for photosynthesis but strongly reflect near-infrared light. KABAW calculates the difference between these two bands.
* **The Result:** A high NDVI score indicates dense, healthy, and thriving crops or forests. A low or negative score indicates bare soil, dead crops, or urban infrastructure.

### 💧 2. NDWI (Normalized Difference Water Index)
* **What it is:** A measure of liquid water and soil moisture.
* **How it works:** KABAW measures the absorption of near-infrared and short-wave infrared light by water molecules.
* **The Result:** A high NDWI score reveals standing water, flooding, or extremely saturated soil. A low score indicates dry land, helping to detect early drought conditions before plants begin to suffer.

---

## 💻 Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS, Framer Motion, Leaflet Maps
* **Backend:** Python, FastAPI, Uvicorn
* **Data Engine:** Google Earth Engine API
* **Geolocation:** OpenStreetMap Nominatim API

---

## 🚀 Deployment Guide
Since this project has two distinct parts, here is the standard production workflow:

### 1. Deploy the Backend (FastAPI) to Render / Railway
Vercel is optimized for Next.js. For a heavy Python data-science backend like FastAPI + Earth Engine, a platform like [Render.com](https://render.com) or [Railway.app](https://railway.app) is the best free option.
1. Connect your GitHub repo and set the Root Directory to `backend`.
2. Set the Start Command to: `uvicorn main:app --host 0.0.0.0 --port 10000`
3. **CRITICAL (Earth Engine Auth):** Create an environment variable named `GOOGLE_CREDENTIALS_JSON` and paste the entire contents of your Google Service Account JSON file as the value.

### 2. Deploy the Frontend (Next.js) to Vercel
1. Log into [Vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Edit the **Root Directory** and set it to `frontend`.
4. In the **Environment Variables** section, add:
   * `NEXT_PUBLIC_API_URL` = The URL of your deployed backend (e.g., `https://kabaw-backend.onrender.com`)
5. Click **Deploy**.

## 🛠️ Local Development
### Frontend
```bash
cd frontend
npm install
npm run dev # Runs on http://localhost:3000
```
### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload # Runs on http://localhost:8000
```
