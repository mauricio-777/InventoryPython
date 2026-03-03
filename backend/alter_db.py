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
                
        # Add supplier_id to movements
        try:
            cursor.execute("ALTER TABLE movements ADD COLUMN supplier_id VARCHAR(50) REFERENCES suppliers(id);")
            print("Added supplier_id column to movements.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column supplier_id already exists.")
            else:
                print(f"Error adding supplier_id: {e}")

        # Add customer_id to movements
        try:
            cursor.execute("ALTER TABLE movements ADD COLUMN customer_id VARCHAR(50) REFERENCES customers(id);")
            print("Added customer_id column to movements.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column customer_id already exists.")
            else:
                print(f"Error adding customer_id: {e}")
                
        conn.commit()
        conn.close()
        print("Database update complete.")
    except Exception as e:
        print(f"Failed to update database: {e}")

if __name__ == '__main__':
    update_db()
