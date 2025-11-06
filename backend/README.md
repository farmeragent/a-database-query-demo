# Agricultural Hex Query Backend

FastAPI backend that converts natural language questions to SQL queries using Claude AI.

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and add your Anthropic API key:

```
ANTHROPIC_API_KEY=sk-ant-xxxxx
DATABASE_PATH=../agricultural_data.db
```

### 3. Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Or simply:

```bash
python main.py
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Interactive docs**: http://localhost:8000/docs
- **Alternative docs**: http://localhost:8000/redoc

## Endpoints

### GET `/health`
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "database": "connected",
  "total_hexes": 17580
}
```

### GET `/schema`
Get database schema information

**Response:**
```json
{
  "table_name": "agricultural_hexes",
  "columns": [...],
  "stats": {...}
}
```

### POST `/api/query`
Execute a natural language query

**Request:**
```json
{
  "question": "Show me hexes with low phosphorus",
  "include_context": false
}
```

**Response:**
```json
{
  "question": "Show me hexes with low phosphorus",
  "sql": "SELECT h3_index, P_in_soil FROM agricultural_hexes WHERE P_in_soil < 60",
  "results": [...],
  "hex_ids": ["8d44ec2b24d427f", ...],
  "count": 1523,
  "summary": "Found 1,523 hexes matching your query."
}
```

### POST `/api/query/clear-history`
Clear conversation history

### POST `/api/query/sql`
Execute SQL directly (for debugging)

## Example Usage

### Using curl

```bash
# Health check
curl http://localhost:8000/health

# Natural language query
curl -X POST http://localhost:8000/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Show hexes with low phosphorus and high yield"}'
```

### Using Python

```python
import requests

response = requests.post(
    "http://localhost:8000/api/query",
    json={"question": "What is the average yield target?"}
)

data = response.json()
print(f"SQL: {data['sql']}")
print(f"Summary: {data['summary']}")
```

## Example Questions

- "Show me hexes with low phosphorus"
- "What's the average yield target?"
- "Find hexes that need more than 100 units of nitrogen"
- "Show hexes with high yield targets and low potassium"
- "How many hexes need potassium application?"
- "What's the total nitrogen needed for the entire field?"

## Architecture

```
main.py              - FastAPI app and endpoints
query_service.py     - Claude integration for NL to SQL
database.py          - DuckDB connection and query execution
```

## Development

Run with auto-reload:
```bash
uvicorn main:app --reload
```

Run tests:
```bash
pytest
```

## Troubleshooting

### "ANTHROPIC_API_KEY not set"
Make sure you created the `.env` file with your API key

### "Database not found"
Ensure `agricultural_data.db` exists in the parent directory

### Port 8000 already in use
Change the port: `uvicorn main:app --port 8001`
