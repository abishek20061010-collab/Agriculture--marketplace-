import os
from decimal import Decimal
from datetime import date, datetime, timedelta
from database import execute_query
from firebase import db

def clean_data_for_firestore(row):
    """
    Cleans up a MySQL row dictionary so it can be safely stored in Firestore.
    Firestore doesn't support Decimal, date, time objects directly without conversion.
    """
    cleaned = {}
    for key, value in row.items():
        if isinstance(value, Decimal):
            cleaned[key] = float(value)
        elif isinstance(value, (date, datetime)):
            cleaned[key] = value.isoformat()
        elif isinstance(value, timedelta):
            cleaned[key] = str(value)
        else:
            cleaned[key] = value
    return cleaned

def migrate_mysql_to_firebase():
    print("Starting MySQL to Firebase migration...")
    
    if not db:
        print("Error: Firebase is not initialized.")
        return

    # 1. Fetch all tables from the database
    try:
        tables = execute_query("SHOW TABLES")
    except Exception as e:
        print(f"Error fetching tables: {e}")
        return

    if not tables:
        print("No tables found in MySQL database.")
        return

    # 2. Iterate over each table
    for table_info in tables:
        # The dictionary key for SHOW TABLES depends on your DB name e.g., 'Tables_in_agrisupplydb'
        table_name = list(table_info.values())[0]
        print(f"\nMigrating table: '{table_name}'...")
        
        # 3. Fetch all rows for the current table
        try:
            rows = execute_query(f"SELECT * FROM {table_name}")
        except Exception as e:
            print(f"  -> Error fetching data for {table_name}: {e}")
            continue
            
        if not rows:
            print(f"  -> No data found in {table_name}. Skipping.")
            continue
            
        # 4. Insert each row into Firebase FireStore
        collection_ref = db.collection(table_name)
        count = 0
        for row in rows:
            cleaned_row = clean_data_for_firestore(row)
            # Add document to the collection
            collection_ref.add(cleaned_row)
            count += 1
            
        print(f"  -> Successfully migrated {count} records into Firestore collection '{table_name}'.")

    print("\nMigration Completed!")

if __name__ == "__main__":
    migrate_mysql_to_firebase()
