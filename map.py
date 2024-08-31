import pandas as pd
import geopandas as gpd

# Load the pickle file
pkl_file_path = r"C:\Users\cjhoo\OneDrive\Desktop\GIS\Seoul Subway\Seoul_subway_lines.pkl"
data = pd.read_pickle(pkl_file_path)

# Check if the data is already in a geospatial format
if isinstance(data, gpd.GeoDataFrame):
    gdf = data
else:
    # Assuming the DataFrame has 'geometry' column in a compatible format
    gdf = gpd.GeoDataFrame(data, geometry='geometry')

# Set the coordinate reference system (CRS) if not already set
if gdf.crs is None:
    # Assuming WGS84 latitude/longitude
    gdf.set_crs(epsg=4326, inplace=True)

# Convert to GeoJSON and save
geojson_file_path = r"C:\Users\cjhoo\OneDrive\Desktop\GIS\Seoul Subway\Seoul_subway_lines.geojson"
gdf.to_file(geojson_file_path, driver='GeoJSON')

print(f"GeoJSON file saved to: {geojson_file_path}")
