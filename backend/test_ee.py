import ee
from datetime import datetime, timedelta

ee.Initialize()

coords = type('obj', (object,), {'lat': 14.5995, 'lng': 120.9842, 'radius': 25, 'timeframe': 'days'})()
point = ee.Geometry.Point([coords.lng, coords.lat])
region = point.buffer(coords.radius).bounds()

periods = []
now = datetime.now()

if coords.timeframe == 'days':
    for i in range(12):
        d = now - timedelta(days=11-i)
        periods.append({
            'start': d.strftime('%Y-%m-%d'),
            'end': (d + timedelta(days=1)).strftime('%Y-%m-%d')
        })

history = []
for p in periods:
    start_date = p['start']
    end_date = p['end']
    print("Processing", start_date, "to", end_date)
    
    col = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
           .filterBounds(region)
           .filterDate(start_date, end_date)
           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)))
           
    count = col.size().getInfo()
    print("Count:", count)
    if count == 0:
        history.append({
            'date': start_date,
            'ndvi': None,
            'ndwi': None
        })
        continue
        
    def add_indices(img):
        ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI')
        ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI')
        return img.addBands([ndvi, ndwi])
        
    col_with_indices = col.map(add_indices)
    mean_img = col_with_indices.select(['NDVI', 'NDWI']).mean()
    
    stats = mean_img.reduceRegion(
        reducer=ee.Reducer.mean(),
        geometry=region,
        scale=20,
        maxPixels=1e9
    ).getInfo()
    
    print("Stats:", stats)
    n_val = stats.get('NDVI')
    w_val = stats.get('NDWI')
    
    history.append({
        'date': start_date,
        'ndvi': round(n_val, 3) if n_val is not None else None,
        'ndwi': round(w_val, 3) if w_val is not None else None
    })

print("Done. History length:", len(history))
