// Configuration
const CONFIG = {
    // Backend API URL
    API_BASE_URL: 'http://localhost:8000',

    // GeoJSON data path (relative to this HTML file)
    GEOJSON_PATH: 'north-of-road-high-res.geojson',

    // Mapbox token (get free token at https://mapbox.com)
    // Leave empty to use basic map without satellite imagery
    MAPBOX_TOKEN: '',

    // Map initial view state
    INITIAL_VIEW_STATE: {
        longitude: -86.685,
        latitude: 32.433,
        zoom: 13,
        pitch: 0,  // Top-down view (0 = flat, 45 = angled)
        bearing: 0
    },

    // Hex colors
    COLORS: {
        DEFAULT: [100, 150, 255, 180],      // Blue
        HIGHLIGHTED: [255, 100, 100, 220],   // Red
        HOVER: [255, 200, 100, 220]          // Orange
    },

    // Map settings
    ELEVATION_SCALE: 20,
    ELEVATION_RANGE: [0, 300]
};
