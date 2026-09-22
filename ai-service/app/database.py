import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "sentinelcore",
    "user": "postgres",
    "password": "postgres123"
}


def execute_query(query, params=None):
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()

        cur.execute(query, params)

        rows = cur.fetchall()

        cur.close()
        conn.close()

        return rows
    except Exception as e:
        print(f"Database query error: {e}")
        return [[0]]