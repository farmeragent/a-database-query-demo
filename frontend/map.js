// Map Visualization
class HexMap {
    constructor(containerId, config) {
        this.containerId = containerId;
        this.config = config;
        this.geoJsonData = null;
        this.highlightedHexes = new Set();
        this.hoveredHex = null;
        this.deck = null;
        this.tooltip = document.getElementById('tooltip');
    }

    async initialize() {
        // Load GeoJSON data
        try {
            const response = await fetch(this.config.GEOJSON_PATH);
            this.geoJsonData = await response.json();
            console.log(`Loaded ${this.geoJsonData.features.length} hexes`);
        } catch (error) {
            console.error('Failed to load GeoJSON:', error);
            throw error;
        }

        // Initialize deck.gl with satellite imagery
        // Use Mapbox satellite if token is provided, otherwise use standard map
        const mapStyle = this.config.MAPBOX_TOKEN
            ? 'mapbox://styles/mapbox/satellite-streets-v12'
            : 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

        this.deck = new deck.DeckGL({
            container: this.containerId,
            mapStyle: mapStyle,
            mapboxApiAccessToken: this.config.MAPBOX_TOKEN || undefined,
            initialViewState: this.config.INITIAL_VIEW_STATE,
            controller: true,
            layers: [],
            onHover: this.onHover.bind(this)
        });

        this.updateLayers();
    }

    updateLayers() {
        const layer = new deck.GeoJsonLayer({
            id: 'hex-layer',
            data: this.geoJsonData,
            pickable: true,
            stroked: true,
            filled: true,
            extruded: false,  // Disable 3D elevation
            wireframe: false,
            getElevation: 0,  // Flat hexes
            elevationScale: 0,
            getFillColor: this.getFillColor.bind(this),
            getLineColor: [80, 80, 80],
            getLineWidth: 1,
            lineWidthMinPixels: 1,
            updateTriggers: {
                getFillColor: [this.highlightedHexes, this.hoveredHex]
            }
        });

        this.deck.setProps({ layers: [layer] });
    }

    getFillColor(feature) {
        const h3Index = feature.properties.h3_index;

        // Hover state (highest priority)
        if (this.hoveredHex === h3Index) {
            return this.config.COLORS.HOVER;
        }

        // Highlighted state
        if (this.highlightedHexes.has(h3Index)) {
            return this.config.COLORS.HIGHLIGHTED;
        }

        // Default state
        return this.config.COLORS.DEFAULT;
    }

    highlightHexes(hexIds) {
        this.highlightedHexes = new Set(hexIds);
        this.updateLayers();
    }

    clearHighlights() {
        this.highlightedHexes.clear();
        this.updateLayers();
    }

    onHover(info) {
        if (info.object) {
            const props = info.object.properties;
            this.hoveredHex = props.h3_index;

            // Show tooltip
            this.tooltip.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 8px;">Hex: ${props.h3_index.substring(0, 12)}...</div>
                <div class="tooltip-row">
                    <span class="tooltip-label">Yield Target:</span>
                    <span>${props.yield_target}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">P in Soil:</span>
                    <span>${props.P_in_soil.toFixed(2)}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">K in Soil:</span>
                    <span>${props.K_in_soil.toFixed(2)}</span>
                </div>
                <div class="tooltip-row">
                    <span class="tooltip-label">N in Soil:</span>
                    <span>${props.N_in_soil.toFixed(2)}</span>
                </div>
                <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
                    <div class="tooltip-row">
                        <span class="tooltip-label">N to Apply:</span>
                        <span>${props.N_to_apply.toFixed(2)}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">P to Apply:</span>
                        <span>${props.P_to_apply.toFixed(2)}</span>
                    </div>
                    <div class="tooltip-row">
                        <span class="tooltip-label">K to Apply:</span>
                        <span>${props.K_to_apply.toFixed(2)}</span>
                    </div>
                </div>
            `;
            this.tooltip.style.left = info.x + 'px';
            this.tooltip.style.top = info.y + 'px';
            this.tooltip.classList.add('show');

            this.updateLayers();
        } else {
            this.hoveredHex = null;
            this.tooltip.classList.remove('show');
            this.updateLayers();
        }
    }

    zoomToHexes(hexIds) {
        if (!hexIds || hexIds.length === 0) return;

        // Find the features that match the hex IDs
        const features = this.geoJsonData.features.filter(
            f => hexIds.includes(f.properties.h3_index)
        );

        if (features.length === 0) return;

        // Calculate bounding box
        let minLng = Infinity, maxLng = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;

        features.forEach(feature => {
            feature.geometry.coordinates[0].forEach(coord => {
                minLng = Math.min(minLng, coord[0]);
                maxLng = Math.max(maxLng, coord[0]);
                minLat = Math.min(minLat, coord[1]);
                maxLat = Math.max(maxLat, coord[1]);
            });
        });

        // Zoom to bounding box
        const centerLng = (minLng + maxLng) / 2;
        const centerLat = (minLat + maxLat) / 2;

        this.deck.setProps({
            initialViewState: {
                longitude: centerLng,
                latitude: centerLat,
                zoom: 18,
                pitch: 0,  // Keep top-down when zooming
                bearing: 0,
                transitionDuration: 1000
            }
        });
    }
}
