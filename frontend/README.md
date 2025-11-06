# Agricultural Hex Query Frontend

Simple HTML/JS frontend for visualizing and querying agricultural H3 hex data.

## Features

- 🗺️ **Interactive 3D Map** - Visualize 17,580+ hexagons with Deck.gl
- 💬 **Natural Language Chat** - Ask questions in plain English
- 🎨 **Dynamic Highlighting** - Query results highlight on the map
- 📊 **Hover Tooltips** - See detailed hex data on hover
- ⚡ **Fast & Responsive** - No build step, runs directly in browser

## Getting Started

### 1. Prerequisites

Make sure your backend is running:
```bash
cd ../backend
source venv/bin/activate
python main.py
```

Backend should be running on `http://localhost:8000`

### 2. Start Frontend

You can serve the frontend with any HTTP server:

**Option 1: Python HTTP server**
```bash
cd frontend
python3 -m http.server 8080
```

**Option 2: Node.js http-server**
```bash
npx http-server frontend -p 8080
```

**Option 3: VS Code Live Server**
- Install Live Server extension
- Right-click `index.html` → "Open with Live Server"

### 3. Open in Browser

Navigate to: `http://localhost:8080`

## How to Use

### Example Questions

Try asking:
- "Show me hexes with low phosphorus"
- "What's the average yield target?"
- "Find hexes that need more than 100 units of nitrogen"
- "Show hexes with high yield targets and low potassium"
- "How many hexes need potassium application?"
- "What's the total nitrogen needed for the entire field?"

### Map Controls

- **Pan**: Click and drag
- **Zoom**: Scroll wheel or pinch
- **Rotate**: Right-click and drag (or Cmd+drag on Mac)
- **Tilt**: Ctrl+drag up/down
- **Hover**: See detailed hex information

### Color Coding

- 🔵 **Blue hexes**: Default (not selected)
- 🔴 **Red hexes**: Matching your query
- 🟠 **Orange hex**: Currently hovered

### Chat Features

- **Send button**: Click to send query
- **Enter key**: Press Enter to send query
- **Clear History**: Reset conversation and map highlights
- **SQL Display**: See the generated SQL for transparency

## Configuration

Edit `config.js` to customize:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8000',  // Backend URL
    GEOJSON_PATH: '../north-of-road-high-res.geojson',  // Data path

    // Map view
    INITIAL_VIEW_STATE: {
        longitude: -86.685,
        latitude: 32.433,
        zoom: 13,
        pitch: 45,
        bearing: 0
    },

    // Colors (RGBA)
    COLORS: {
        DEFAULT: [100, 150, 255, 180],
        HIGHLIGHTED: [255, 100, 100, 220],
        HOVER: [255, 200, 100, 220]
    }
};
```

## File Structure

```
frontend/
├── index.html          # Main HTML file
├── style.css           # Styles
├── config.js           # Configuration
├── api.js              # Backend communication
├── map.js              # Deck.gl map visualization
├── chat.js             # Chat interface
├── app.js              # Main application logic
└── README.md           # This file
```

## Architecture

```
┌─────────────────────────────────────┐
│         index.html                  │
│  ┌─────────────┐  ┌──────────────┐ │
│  │  Map View   │  │  Chat Panel  │ │
│  │  (Deck.gl)  │  │              │ │
│  └─────────────┘  └──────────────┘ │
└─────────────────────────────────────┘
           │                 │
           └────────┬────────┘
                    │
                app.js (coordinator)
                    │
        ┌──────────┬┴────────┬──────────┐
        │          │         │          │
     map.js    chat.js   api.js    config.js
        │          │         │
        └──────────┴─────────┘
                   │
        Backend API (localhost:8000)
```

## Troubleshooting

### Map not loading
- Check console for errors
- Ensure GeoJSON path is correct in `config.js`
- Verify backend is running

### Queries failing
- Check backend is running on port 8000
- Look at browser console for API errors
- Verify CORS is enabled in backend

### Port already in use
```bash
# Find what's using the port
lsof -i :8080

# Use a different port
python3 -m http.server 8081
```

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

WebGL 2.0 required for Deck.gl visualization.

## Performance

- Loads ~18K hexagons smoothly
- Real-time highlighting and interaction
- Optimized for modern browsers
- No build step or dependencies to install

## Next Steps

Possible enhancements:
- Add filters for yield targets, nutrient levels
- Export query results to CSV
- Save favorite queries
- Multiple field support
- Compare different scenarios
- Time-series visualization
