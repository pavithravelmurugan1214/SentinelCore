import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "sentinelcore",
    "user": "postgres",
    "password": "postgres"
}


def execute_query(query, params=None):
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute(query, params)

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return rows