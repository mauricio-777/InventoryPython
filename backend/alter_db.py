import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'inventory.db')

def update_db():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Add unit_value
        try:
            cursor.execute("ALTER TABLE products ADD COLUMN unit_value FLOAT DEFAULT 1.0;")
            print("Added unit_value column.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column unit_value already exists.")
            else:
                print(f"Error adding unit_value: {e}")
                
        # Add expiration_date
        try:
            cursor.execute("ALTER TABLE products ADD COLUMN expiration_date VARCHAR(50);")
            print("Added expiration_date column.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column expiration_date already exists.")
            else:
                print(f"Error adding expiration_date: {e}")
                
        conn.commit()
        conn.close()
        print("Database update complete.")
    except Exception as e:
        print(f"Failed to update database: {e}")

if __name__ == '__main__':
    update_db()
