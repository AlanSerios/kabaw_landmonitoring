# KABAW Space: Orbital Crop Intelligence
## Project Specification & 2-Week Sprint Plan

**Team:** AntiGravity  
**Project:** KABAW Space  
**Timeline:** 14 Days (Pre-Mid-Year Sprint)  

---

### 🚀 1. Project Overview
Small-scale farmers cannot afford expensive on-the-ground IoT soil sensors to monitor crop health, drought stress, or nitrogen deficiencies. **KABAW Space** eliminates the need for hardware by leveraging free, multi-spectral satellite imagery (Sentinel-2) to compute the **Normalized Difference Vegetation Index (NDVI)** of any given plot of land.

**The Goal:** Provide a localized web application where a user drops a pin on a field, and the app translates satellite NDVI math into a simple, actionable crop health score in Bisaya.

---

### 🛠️ 2. Tech Stack Architecture
Leveraging the web architecture workflows established during the UniFab development, the stack will be decoupled into a dedicated frontend and backend:

*   **Frontend (The Dashboard):** Next.js / React
    *   **Mapping:** `react-leaflet` or Mapbox API
    *   **Styling:** Space-themed UI (Void Black `#0B0C10`, Neon Thruster Cyan `#66FCF1`, Space Grotesk/Monospace font).
*   **Backend (Mission Control):** Python / FastAPI
    *   **Engine:** `earthengine-api` (Google Earth Engine)
    *   **Math Processing:** `numpy` / `pandas`
*   **Deployment:** Vercel (Frontend) & Render/Railway (Backend)

---

### 🗓️ 3. The 14-Day Sprint Roadmap

#### Phase 1: Ground Control & Infrastructure (Days 1–3)
*   [ ] **Action:** Register for a **Google Earth Engine (GEE)** developer account immediately (requires approval time).
*   [ ] **Action:** Initialize the joint GitHub repository under the AntiGravity organization.
*   [ ] **Action:** Scaffold a basic Python FastAPI server.
*   [ ] **Action:** Create a dummy POST endpoint `/api/analyze` that accepts `{ "lat": 8.4772, "lng": 124.6459 }` (CDO test coordinates) and returns a mock JSON response.

#### Phase 2: The Orbital Math & GEE Integration (Days 4–7)
*   [ ] **Action:** Authenticate the Python backend with the Google Earth Engine API using a Service Account.
*   [ ] **Action:** Write the Earth Engine query to pull the most recent image from the `COPERNICUS/S2_SR` (Sentinel-2) dataset.
*   [ ] **Critical Logic:** Implement a cloud-masking filter (`CLOUDY_PIXEL_PERCENTAGE < 10`) to ensure the satellite isn't just looking at clouds over Mindanao.
*   [ ] **The Math:** Apply the NDVI formula: `(NIR - Red) / (NIR + Red)`.
*   [ ] **Output Formatting:** Reduce the pixel data into a single average float value (between -1.0 and 1.0) for a small radius around the target coordinate and return it via the FastAPI endpoint.

#### Phase 3: The Spacecraft Dashboard (Days 8–11)
*   [ ] **Action:** Initialize the Next.js frontend and implement the UI/Brand guidelines.
*   [ ] **Action:** Integrate the interactive map. Allow the user to drop a pin to capture latitude/longitude.
*   [ ] **Action:** Build the analysis loading state (e.g., "Uplinking to Satellite..." or a scanning radar animation).
*   [ ] **Action:** Build the results card. Translate the float value into localized actionable insights:
    *   *NDVI > 0.6:* 🟢 "Himsog ang tanom" (Healthy)
    *   *NDVI 0.3 - 0.6:* 🟡 "Bantayan ang tubig" (Monitor water)
    *   *NDVI < 0.3:* 🔴 "Kailangan ug tubig o abono" (Needs intervention / Stressed)

#### Phase 4: Integration & Launch (Days 12–14)
*   [ ] **Action:** Connect the Next.js frontend to the live FastAPI backend.
*   [ ] **Action:** Test heavily on local coordinates (e.g., known agricultural spots in Bukidnon or rural CDO).
*   [ ] **Action:** Record a 2-minute prototype demonstration video for the startup portfolio.

---

### ⚠️ 4. Engineering Pro-Tips & Bottleneck Warnings
1.  **Scope Creep on the Map:** For this 2-week MVP, **do not** try to overlay the colored NDVI image tiles directly onto the frontend map. Generating and serving map tiles is complex. Stick to returning a **numerical average score** for the pinned location first.
2.  **API Limits:** Earth Engine is powerful but rate-limits heavily if queried inefficiently. Keep the geometry radius small (e.g., a 50x50 meter box around the dropped pin).
3.  **Authentication Security:** Keep the GEE service account JSON key strictly out of version control (add it to `.gitignore` immediately).

---
*System Online. Ready for Initialization.*
