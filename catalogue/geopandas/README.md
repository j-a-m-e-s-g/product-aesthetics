# GeoPandas

Map data as tables. GeoPandas reads shapefiles, GeoPackages and GeoJSON into something like a spreadsheet with a shape in every row, so joining figures to places, filtering, measuring areas and changing projection are ordinary table operations. Drawing a choropleth is then one line through matplotlib, and the result can be saved as a high-resolution PNG or a vector PDF for a report, or exported as GeoJSON or TopoJSON for [D3](../d3) or a web map. It's built on Shapely (geometry) and pyproj (projections), which do the hard maths.

<img src="preview.png" width="600" alt="A choropleth map of Europe west of Russia, each country shaded by people per square kilometre on a blue log scale, the Low Countries darkest and the Nordic countries palest, with a title, legend and source note">

| | |
|---|---|
| **By** | The GeoPandas developers |
| **Source** | [geopandas/geopandas](https://github.com/geopandas/geopandas) |
| **Licence** | BSD-3-Clause; Shapely BSD-3-Clause; pyproj MIT. Apps you run, so the maps you make are yours. **Map data has its own licence** (see Notes). Read on 2026-10-16 at 1.2.0 |
| **Needs** | Python 3.10+. Wheels include GDAL, PROJ and GEOS, so nothing else to install |

## Install

```bash
pip install geopandas matplotlib      # or: uv add geopandas matplotlib
```

## Use it as it comes

The core of the preview: Europe by population density, from [Natural Earth](https://www.naturalearthdata.com)'s public-domain countries, in an equal-area projection. (The preview also leaves out Russia and overseas territories, sets the view, and adds a legend.)

```python
import geopandas as gpd, matplotlib.pyplot as plt
from matplotlib.colors import LogNorm

world = gpd.read_file("ne_50m_admin_0_countries.shp")
eu = world[world.CONTINENT == "Europe"].to_crs(3035)          # ETRS89 / LAEA Europe: areas stay true
eu["density"] = eu.POP_EST / (eu.area / 1e6)                     # people per km², area from the projection
ax = eu.plot(column="density", cmap="Blues", norm=LogNorm(10, 600), edgecolor="white", linewidth=0.35)
ax.set_axis_off(); plt.savefig("europe.png", dpi=200, bbox_inches="tight")
```

What it makes easy: `to_crs` to change projection (use an equal-area one for any map coloured by a rate), `.area` and `.length` in real units once projected, `sjoin` to put points in areas, `dissolve` to merge areas into regions, and `to_file("x.geojson", driver="GeoJSON")` for the web.

## Use it in your brand

There's nothing to map automatically. Pass your colours as a matplotlib colormap (`ListedColormap([...])` from your palette) and set your font in matplotlib's `rcParams["font.family"]`. Sequential data needs one hue from light to dark; diverging data needs two hues either side of a neutral middle.

## Notes

- **Boundary data usually needs credit.** Natural Earth is public domain, but most detailed boundaries aren't. UK government boundaries (ONS, Ordnance Survey) are under the Open Government Licence, which needs a source line ("Contains OS data © Crown copyright"), and OpenStreetMap data needs "© OpenStreetMap contributors" visible on the map. That's normal for maps; just don't leave it off.
- Natural Earth's `POP_EST` figures are mostly 2019 estimates; for anything current, join your own figures.
- Calculate areas only after reprojecting to an equal-area projection. Areas in latitude and longitude are meaningless.
