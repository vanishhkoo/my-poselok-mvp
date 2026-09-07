import json
import os
import psycopg2


def handler(event: dict, context) -> dict:
    """Проверка работоспособности бэкенда: доступность функции и подключение к БД.
    Args: event - dict с httpMethod, headers, body; context - объект с request_id
    Returns: HTTP dict со статусом сервиса и БД
    """
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token, X-Session-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }

    db_status = 'unknown'
    dsn = os.environ.get('DATABASE_URL')
    if dsn:
        try:
            conn = psycopg2.connect(dsn, connect_timeout=3)
            cur = conn.cursor()
            cur.execute('SELECT 1')
            cur.fetchone()
            cur.close()
            conn.close()
            db_status = 'connected'
        except Exception:
            db_status = 'error'
    else:
        db_status = 'not_configured'

    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'status': 'healthy',
            'service': 'my-poselok-api',
            'database': db_status
        })
    }
