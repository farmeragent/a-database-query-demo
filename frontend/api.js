// API Communication
class API {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async query(question) {
        try {
            const response = await fetch(`${this.baseUrl}/api/query`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ question })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Query failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async health() {
        try {
            const response = await fetch(`${this.baseUrl}/health`);
            return await response.json();
        } catch (error) {
            console.error('Health check failed:', error);
            throw error;
        }
    }

    async clearHistory() {
        try {
            const response = await fetch(`${this.baseUrl}/api/query/clear-history`, {
                method: 'POST'
            });
            return await response.json();
        } catch (error) {
            console.error('Failed to clear history:', error);
            throw error;
        }
    }

    async getConfig() {
        try {
            const response = await fetch(`${this.baseUrl}/config`);
            return await response.json();
        } catch (error) {
            console.error('Failed to get config:', error);
            throw error;
        }
    }
}
