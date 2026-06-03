import ee
from datetime import datetime, timedelta
ee.Initialize()

lat, lng, radius = 14.5995, 120.9842, 25
point = ee.Geometry.Point([lng, lat])
region = point.buffer(radius).bounds()

# Make 12 months periods
now = datetime.now()
periods = []
for m in range(1, 13):
    start = f"{now.year}-{m:02d}-01"
    end = f"{now.year}-{m:02d}-28" # roughly
    periods.append({'start': start, 'end': end})

ee_periods = ee.List(periods)

def process_period(p):
    p = ee.Dictionary(p)
    start_date = p.getString('start')
    end_date = p.getString('end')
    
    col = (ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
           .filterBounds(region)
           .filterDate(start_date, end_date)
           .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 30)))
           
    def add_indices(img):
        ndvi = img.normalizedDifference(['B8', 'B4']).rename('NDVI')
        ndwi = img.normalizedDifference(['B3', 'B8']).rename('NDWI')
        return img.addBands([ndvi, ndwi])
        
    col_with_indices = col.map(add_indices)
    
    # Dummy image with bands NDVI and NDWI but fully masked
    dummy = ee.Image.constant(-9999).rename('NDVI').addBands(ee.Image.constant(-9999).rename('NDWI')).updateMask(0)
    
    # We mosaic the dummy with the mean image. If col is empty, mean() has no bands, but we can't mosaic images with different bands easily if one has 0 bands.
    # Wait, instead of mosaicing, let's just use ee.Algorithms.If properly:
    # We can evaluate stats inside a mapped function!
    # Or just use ImageCollection([dummy, col_with_indices.select(['NDVI', 'NDWI']).mean()]).mosaic() ?
    # Let's try:
    
    mean_img = col_with_indices.select(['NDVI', 'NDWI']).mean()
    count = col_with_indices.size()
    
    return ee.Feature(ee.Algorithms.If(
        count.gt(0),
        ee.Feature(None, {
            'date': start_date,
            'stats': mean_img.reduceRegion(
                reducer=ee.Reducer.mean(),
                geometry=region,
                scale=20,
                maxPixels=1e9
            )
        }),
        ee.Feature(None, {
            'date': start_date,
            'stats': ee.Dictionary({'NDVI': None, 'NDWI': None})
        })
    ))

print("Evaluating mapped EE...")
import time
t0 = time.time()
res = ee.FeatureCollection(ee_periods.map(process_period)).getInfo()
print(f"Done in {time.time()-t0:.2f}s")
print(res)
