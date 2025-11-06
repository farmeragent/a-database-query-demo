// Main Application
class App {
    constructor() {
        this.api = new API(CONFIG.API_BASE_URL);
        this.map = new HexMap('map-container', CONFIG);
        this.chat = new Chat('chat-messages', 'chat-input', 'send-btn', 'clear-btn');
    }

    async initialize() {
        console.log('Initializing Agricultural Hex Query System...');

        try {
            // Check backend health
            const health = await this.api.health();
            console.log('Backend status:', health);

            // Get config (including Mapbox token)
            const config = await this.api.getConfig();
            if (config.mapbox_token) {
                CONFIG.MAPBOX_TOKEN = config.mapbox_token;
                console.log('✓ Mapbox token loaded');
            }

            // Initialize map
            await this.map.initialize();
            console.log('Map initialized');

            // Initialize chat
            this.chat.initialize();
            console.log('Chat initialized');

            // Set up event listeners
            this.setupEventListeners();

            console.log('✓ Application ready!');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.chat.addErrorMessage('Failed to initialize application. Make sure the backend is running.');
        }
    }

    setupEventListeners() {
        // Handle send message
        document.addEventListener('sendMessage', async (e) => {
            await this.handleQuery(e.detail.question);
        });

        // Handle clear history
        document.addEventListener('clearHistory', async () => {
            await this.handleClearHistory();
        });
    }

    async handleQuery(question) {
        // Add user message to chat
        this.chat.addUserMessage(question);
        this.chat.showLoading();

        try {
            // Query the backend
            const result = await this.api.query(question);

            // Hide loading
            this.chat.hideLoading();

            // Display response
            this.displayQueryResult(result);

            // Highlight hexes on map
            if (result.hex_ids && result.hex_ids.length > 0) {
                this.map.highlightHexes(result.hex_ids);

                // Optionally zoom to highlighted hexes
                // this.map.zoomToHexes(result.hex_ids);
            } else {
                // If no hex_ids, might be an aggregation query, clear highlights
                this.map.clearHighlights();
            }

        } catch (error) {
            this.chat.hideLoading();
            this.chat.addErrorMessage(error.message || 'Query failed. Please try again.');
            console.error('Query error:', error);
        }
    }

    displayQueryResult(result) {
        // Format the summary message
        let summary = result.summary;

        // Add metadata if available
        let metadata = null;
        if (result.count !== undefined) {
            metadata = `Found ${result.count.toLocaleString()} result(s)`;
        }

        // Show the SQL query for transparency
        const sql = result.sql;

        this.chat.addBotMessage(summary, sql, metadata);

        // If there are specific numeric results (not just hex_ids), display them
        if (result.results && result.results.length > 0 && !result.hex_ids.length) {
            this.displayDetailedResults(result.results);
        }
    }

    displayDetailedResults(results) {
        // For aggregation results (like averages, sums), display nicely
        if (results.length === 1) {
            const data = results[0];
            let details = '';

            for (const [key, value] of Object.entries(data)) {
                if (key !== 'h3_index') {
                    const formattedValue = typeof value === 'number'
                        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
                        : value;
                    details += `<div class="tooltip-row">
                        <span class="tooltip-label">${key}:</span>
                        <span>${formattedValue}</span>
                    </div>`;
                }
            }

            if (details) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'message bot-message';
                messageDiv.innerHTML = `
                    <div class="message-content" style="background: #f0fdf4;">
                        ${details}
                    </div>
                `;
                document.getElementById('chat-messages').appendChild(messageDiv);
                this.chat.scrollToBottom();
            }
        }
    }

    async handleClearHistory() {
        try {
            await this.api.clearHistory();
            this.map.clearHighlights();
            console.log('History cleared');
        } catch (error) {
            console.error('Failed to clear history:', error);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.initialize();
});
