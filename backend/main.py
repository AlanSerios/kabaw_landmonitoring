import os
import ee
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

# 1. Initialize the App
app = FastAPI(title="KABAW Space Mission Control")

# Allow the frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Authenticate with Google Earth Engine
# We point to the JSON key you just downloaded so the satellite knows who we are.
KEY_PATH = r"c:\Users\Alan Serios\OneDrive - Department of Education\Desktop\Kabaw_AirMonitoring_System\service-account.json.json"

USE_DUMMY_DATA = False

def initialize_satellite():
    global USE_DUMMY_DATA
    from google.oauth2 import service_account
    try:
            if os.environ.get("GOOGLE_CREDENTIALS_JSON"):
                import json
                creds_dict = json.loads(os.environ.get("GOOGLE_CREDENTIALS_JSON"))
                credentials = service_account.Credentials.from_service_account_info(
                    creds_dict, scopes=['https://www.googleapis.com/auth/earthengine']
                )
                ee.Initialize(credentials)
                print("🌍 Satellite connection established via ENV JSON!")
            elif os.path.exists(KEY_PATH):
                os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = KEY_PATH
                credentials = service_account.Credentials.from_service_account_file(
                    KEY_PATH, scopes=['https://www.googleapis.com/auth/earthengine']
                )
                ee.Initialize(credentials)
                print("🌍 Satellite connection established via local file!")
        else:
            # Try default authentication
            ee.Initialize()
            print("🌍 Satellite connection established with default credentials!")
    except Exception as e:
        print(f"⚠️ Satellite not authenticated yet. Running in DUMMY MODE for testing. Error: {e}")
        USE_DUMMY_DATA = True

# Run the connection when the server starts
initialize_satellite()

# Define what data the frontend will send us
class Coordinates(BaseModel):
    lat: float
    lng: float
    radius: int = 25

@app.get("/")
def read_root():
    return {"status": "Mission Control Online"}

# 3. The Orbital Math Endpoint
@app.post("/api/analyze")
def analyze_crop_health(coords: Coordinates):
    global USE_DUMMY_DATA
    
    # If we are in Dummy mode, return a fake score so the frontend works!
    if USE_DUMMY_DATA:
        import random
        import time
        time.sleep(2) # simulate satellite delay
        fake_ndvi = random.uniform(0.1, 0.9)
        return {
            "lat": coords.lat,
            "lng": coords.lng,
            "ndvi_score": round(fake_ndvi, 2),
            "status": "success",
            "message": "Simulated satellite data (Authentication required for real data)."
        }

    try:
        # Step A: Target the Location
        point = ee.Geometry.Point([coords.lng, coords.lat])
        
        # Step B: Draw a Box (NxNm)
        region = point.buffer(coords.radius).bounds()
        
        # Step C: Search the Archives
        collection = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
                      .filterBounds(region)
                      .filterDate('2024-01-01', '2025-12-31')
                      .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 10))
                      .sort('system:time_start', False))
        
        if collection.size().getInfo() == 0:
            raise HTTPException(status_code=404, detail="No clear satellite imagery found recently due to clouds.")
            
        # Step D: Grab the Picture
        image = collection.first()
        
        # Step E: The Orbital Math (NDVI)
        ndvi = image.normalizedDifference(['B8', 'B4']).rename('NDVI')
        
        # Step F: Get the Average Score
        mean_ndvi = ndvi.reduceRegion(
            reducer=ee.Reducer.mean(),
            geometry=region,
            scale=10,
            maxPixels=1e9
        ).get('NDVI').getInfo()
        
        if mean_ndvi is None:
            raise HTTPException(status_code=404, detail="Could not calculate score for this location.")
            
        # Step G: Send the result back to the frontend!
        return {
            "lat": coords.lat,
            "lng": coords.lng,
            "ndvi_score": round(mean_ndvi, 2),
            "status": "success",
            "message": "Real satellite data retrieved successfully."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
