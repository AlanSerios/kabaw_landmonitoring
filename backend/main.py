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
            print("Satellite connection established via ENV JSON!")
        elif os.path.exists(KEY_PATH):
            os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = KEY_PATH
            credentials = service_account.Credentials.from_service_account_file(
                KEY_PATH, scopes=['https://www.googleapis.com/auth/earthengine']
            )
            ee.Initialize(credentials)
            print("Satellite connection established via local file!")
        else:
            # Try default authentication
            ee.Initialize()
            print("Satellite connection established with default credentials!")
    except Exception as e:
        print(f"Satellite not authenticated yet. Running in DUMMY MODE for testing. Error: {e}")
        USE_DUMMY_DATA = True

# Run the connection when the server starts
initialize_satellite()

# Define what data the frontend will send us
class Coordinates(BaseModel):
    lat: float
    lng: float
    radius: int = 25
    index_type: str = "NDVI"
    timeframe: str = "days"

@app.get("/")
def read_root():
    return {"status": "Mission Control Online"}

# 3. The Orbital Math Endpoint
@app.post("/api/analyze")
def analyze_crop_health(coords: Coordinates):
    global USE_DUMMY_DATA
    
    if USE_DUMMY_DATA:
        import random
        import time
        from datetime import datetime, timedelta
        time.sleep(2) # simulate satellite delay
        fake_ndvi = random.uniform(0.1, 0.9)
        fake_ndwi = random.uniform(-0.5, 0.5)
        
        # generate 12 fake historical points
        history = []
        base_date = datetime.now() - timedelta(days=120)
        for i in range(12):
            d = base_date + timedelta(days=i*10)
            history.append({
                "date": d.strftime("%Y-%m-%d"),
                "ndvi": round(fake_ndvi + random.uniform(-0.1, 0.1), 3),
                "ndwi": round(fake_ndwi + random.uniform(-0.1, 0.1), 3)
            })
            
        return {
            "lat": coords.lat,
            "lng": coords.lng,
            "ndvi_score": round(history[-1]["ndvi"], 3),
            "ndwi_score": round(history[-1]["ndwi"], 3),
            "history": history,
            "status": "success",
            "message": "Simulated satellite data (Authentication required for real data)."
        }

    try:
        # Step A: Target the Location
        point = ee.Geometry.Point([coords.lng, coords.lat])
        
        # Step B: Draw a Box (NxNm)
        region = point.buffer(coords.radius).bounds()
        
        # Step C: Search the Archives
        from datetime import datetime, timedelta
        import calendar
        
        periods = []
        now = datetime.now()
        
        # Months (Last 12 rolling months)
        for i in range(12):
            month_val = now.month - (11 - i)
            year_val = now.year
            while month_val <= 0:
                month_val += 12
                year_val -= 1
                
            start_date = f"{year_val}-{month_val:02d}-01"
            _, last_day = calendar.monthrange(year_val, month_val)
            end_date = f"{year_val}-{month_val:02d}-{last_day}"
            periods.append({ 'tf': 'months', 'start': start_date, 'end': end_date })
            
        # Years (last 12 years)
        for i in range(12):
            y_i = now.year - 11 + i
            periods.append({ 'tf': 'years', 'start': f"{y_i}-01-01", 'end': f"{y_i}-12-31" })

        ee_periods = ee.List(periods)
        
        def process_period(p):
            p = ee.Dictionary(p)
            tf = p.getString('tf')
            start_date = p.getString('start')
            end_date = p.getString('end')
            
            # Switched from SR to TOA (S2_HARMONIZED) for data coverage back to 2015
            col = (ee.ImageCollection("COPERNICUS/S2_HARMONIZED")
                   .filterBounds(region)
                   .filterDate(start_date, end_date)
                   .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)))
                   
            def add_indices(img):
                ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI')
                ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI')
                return img.addBands([ndvi, ndwi])
                
            col_with_indices = col.map(add_indices)
            count = col_with_indices.size()
            
            # Avoid Dictionary.get() key errors by returning the raw dictionary
            return ee.Feature(ee.Algorithms.If(
                count.gt(0),
                ee.Feature(None, {
                    'tf': tf,
                    'date': start_date,
                    'stats': col_with_indices.select(['NDVI', 'NDWI']).mean().reduceRegion(
                        reducer=ee.Reducer.mean(),
                        geometry=region,
                        scale=20,
                        maxPixels=1e9
                    )
                }),
                ee.Feature(None, {
                    'tf': tf,
                    'date': start_date,
                    'stats': ee.Dictionary({})
                })
            ))
            
        # Days (Last 12 valid satellite passes)
        days_col = (ee.ImageCollection("COPERNICUS/S2_HARMONIZED")
               .filterBounds(region)
               .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30))
               .sort('system:time_start', False)
               .limit(12))
               
        def extract_img_stats(img):
            img = ee.Image(img)
            date = ee.Date(img.get('system:time_start')).format('YYYY-MM-dd')
            ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI')
            ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI')
            img_with_indices = img.addBands([ndvi, ndwi])
            
            stats = img_with_indices.select(['NDVI', 'NDWI']).reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=20,
                maxPixels=1e9
            )
            return ee.Feature(None, {
                'tf': 'days',
                'date': date,
                'stats': stats
            })
            
        days_features = days_col.map(extract_img_stats)
        period_features = ee.FeatureCollection(ee_periods.map(process_period))
        
        # Merge both collections so we execute everything in a single fast request
        history_features = days_features.merge(period_features).getInfo()
        
        history = { 'days': [], 'months': [], 'years': [] }
        if history_features and 'features' in history_features:
            for feat in history_features['features']:
                props = feat.get('properties', {})
                tf = props.get('tf')
                date = props.get('date')
                stats = props.get('stats', {})
                
                n_val = stats.get('NDVI')
                w_val = stats.get('NDWI')
                
                if tf in history:
                    history[tf].append({
                        'date': date,
                        'ndvi': round(n_val, 3) if n_val is not None else None,
                        'ndwi': round(w_val, 3) if w_val is not None else None
                    })
                    
        # 'days' are appended in descending order from the image collection limit, 
        # so reverse it to display chronologically (left to right)
        history['days'].reverse()
                
        # The latest score is the last VALID item in the 'months' or 'days' history
        valid_history = [h for h in history['days'] if h['ndvi'] is not None]
        if not valid_history:
            valid_history = [h for h in history['months'] if h['ndvi'] is not None]
        if not valid_history:
            valid_history = [h for h in history['years'] if h['ndvi'] is not None]
        
        if not valid_history:
            raise HTTPException(status_code=404, detail="Could not calculate scores for this location in the given timeframe.")
            
        latest = valid_history[-1]
        
        # Step G: Send the result back to the frontend!
        return {
            "lat": coords.lat,
            "lng": coords.lng,
            "ndvi_score": latest["ndvi"],
            "ndwi_score": latest["ndwi"],
            "history": history,
            "status": "success",
            "message": "Real satellite data retrieved successfully."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
