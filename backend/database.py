import os
from dotenv import load_dotenv
import mysql.connector
from fastapi import HTTPException

load_dotenv()

config = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "agrisupplydb"),
}

def get_connection():
    try:
        return mysql.connector.connect(**config)
    except mysql.connector.Error as err:
        print(f"Error connecting to database: {err}")
        return None

def execute_query(sql, params=None, fetch=True):
    conn = get_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")
        
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(sql, params or ())
        if fetch:
            result = cursor.fetchall()
            return result
        else:
            conn.commit()
            return cursor.lastrowid
    except mysql.connector.Error as err:
        if not fetch:
            conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {err}")
    finally:
        cursor.close()
        conn.close()
