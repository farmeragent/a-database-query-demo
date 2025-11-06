"""
Natural Language to SQL query service using Claude
"""
import os
import re
from typing import Dict, List, Any, Optional
from anthropic import Anthropic
from database import get_db


class QueryService:
    def __init__(self):
        """Initialize Claude client and database"""
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY environment variable not set")

        self.client = Anthropic(api_key=api_key)
        self.db = get_db()
        self.conversation_history = []

    def _build_system_prompt(self) -> str:
        """Build system prompt with database schema"""
        schema_info = self.db.get_schema_info()

        columns_desc = "\n".join([
            f"  - {col['name']}: {col['type']}"
            for col in schema_info['columns']
        ])

        stats = schema_info['stats']

        return f"""You are a SQL query generator for an agricultural database. Your job is to convert user questions into valid DuckDB SQL queries.

Database Schema:
Table: {schema_info['table_name']}
Columns:
{columns_desc}

Database Statistics:
- Total hexes: {stats['total_hexes']:,}
- Yield range: {stats['min_yield']} - {stats['max_yield']}
- Average P in soil: {stats['avg_P']}
- Average K in soil: {stats['avg_K']}
- Average N in soil: {stats['avg_N']}

Field Descriptions:
- h3_index: Unique H3 hexagon identifier
- yield_target: Target crop yield for the hex
- P_in_soil, K_in_soil, N_in_soil: Current nutrient levels (Phosphorus, Potassium, Nitrogen)
- N_to_apply, P_to_apply, K_to_apply: Recommended nutrient application amounts
- geometry: Spatial polygon for the hexagon

Guidelines:
1. ALWAYS include h3_index in the SELECT clause (needed for map highlighting)
2. Use ROUND() for decimal values in aggregations
3. For "low" nutrients, use thresholds: P < 60, K < 180, N < 10
4. For "high" nutrients, use thresholds: P > 90, K > 250, N > 0
5. Return ONLY the SQL query, no explanations or markdown
6. Use proper DuckDB SQL syntax
7. For counting, use COUNT(*) or COUNT(h3_index)
8. When user asks "show me" or "find", always include h3_index
9. For spatial queries, the geometry column contains POLYGON data

Example Queries:
- "Show hexes with low phosphorus" → SELECT h3_index, P_in_soil FROM agricultural_hexes WHERE P_in_soil < 60
- "What's the average yield?" → SELECT ROUND(AVG(yield_target), 2) as avg_yield FROM agricultural_hexes
- "High yield hexes needing nitrogen" → SELECT h3_index, yield_target, N_to_apply FROM agricultural_hexes WHERE yield_target >= 240 AND N_to_apply > 280

Return only valid SQL. Do not include markdown code blocks or explanations."""

    def _extract_sql(self, response: str) -> str:
        """Extract SQL from Claude's response, handling markdown code blocks"""
        # Remove markdown code blocks if present
        sql = response.strip()

        # Check for SQL code block
        if "```sql" in sql:
            match = re.search(r"```sql\s*(.*?)\s*```", sql, re.DOTALL)
            if match:
                sql = match.group(1)
        elif "```" in sql:
            match = re.search(r"```\s*(.*?)\s*```", sql, re.DOTALL)
            if match:
                sql = match.group(1)

        return sql.strip()

    def natural_language_to_sql(self, question: str, conversation_context: bool = False) -> str:
        """
        Convert natural language question to SQL using Claude

        Args:
            question: User's natural language question
            conversation_context: Whether to include conversation history

        Returns:
            SQL query string
        """
        messages = []

        # Add conversation history if requested
        if conversation_context and self.conversation_history:
            messages.extend(self.conversation_history[-6:])  # Last 3 exchanges

        # Add current question
        messages.append({
            "role": "user",
            "content": question
        })

        try:
            response = self.client.messages.create(
                model="claude-haiku-4-5",
                max_tokens=1024,
                system=self._build_system_prompt(),
                messages=messages
            )

            sql = self._extract_sql(response.content[0].text)

            # Update conversation history
            self.conversation_history.append({
                "role": "user",
                "content": question
            })
            self.conversation_history.append({
                "role": "assistant",
                "content": sql
            })

            return sql

        except Exception as e:
            raise Exception(f"Failed to generate SQL: {str(e)}")

    def execute_natural_language_query(self, question: str) -> Dict[str, Any]:
        """
        Execute a natural language query end-to-end

        Args:
            question: User's natural language question

        Returns:
            Dictionary with query results and metadata
        """
        # Generate SQL from natural language
        sql = self.natural_language_to_sql(question)

        # Validate SQL
        self.db.validate_sql(sql)

        # Execute query
        results = self.db.execute_query(sql)

        # Extract h3_indexes if present (for map highlighting)
        hex_ids = []
        if results and 'h3_index' in results[0]:
            hex_ids = [row['h3_index'] for row in results]

        # Generate summary
        summary = self._generate_summary(question, results, sql)

        return {
            "question": question,
            "sql": sql,
            "results": results,
            "hex_ids": hex_ids,
            "count": len(results),
            "summary": summary
        }

    def _generate_summary(self, question: str, results: List[Dict], sql: str) -> str:
        """Generate a human-readable summary of query results"""
        if not results:
            return "No results found for your query."

        count = len(results)

        # Check if it's a simple count query
        if len(results) == 1 and len(results[0]) == 1:
            key = list(results[0].keys())[0]
            value = results[0][key]
            return f"Result: {value:,}" if isinstance(value, (int, float)) else f"Result: {value}"

        # Check if query returns hex_ids (for highlighting)
        if 'h3_index' in results[0]:
            return f"Found {count:,} hexes matching your query."

        # For aggregation queries
        if count == 1:
            parts = []
            for key, value in results[0].items():
                if isinstance(value, (int, float)):
                    parts.append(f"{key}: {value:,.2f}")
                else:
                    parts.append(f"{key}: {value}")
            return " | ".join(parts)

        # Default
        return f"Query returned {count:,} results."

    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
