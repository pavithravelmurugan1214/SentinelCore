from app.database import execute_query


def count_alerts():
    result = execute_query(
        "SELECT COUNT(*) FROM alerts"
    )
    return result[0][0]


def count_incidents():
    result = execute_query(
        "SELECT COUNT(*) FROM incidents"
    )
    return result[0][0]


def count_threats():
    result = execute_query(
        "SELECT COUNT(*) FROM threats"
    )
    return result[0][0]


def count_vulnerabilities():
    result = execute_query(
        "SELECT COUNT(*) FROM vulnerabilities"
    )
    return result[0][0]


def count_users():
    result = execute_query(
        "SELECT COUNT(*) FROM users"
    )
    return result[0][0]