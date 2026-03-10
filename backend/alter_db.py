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
                
        # Add failed_attempts to users
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN failed_attempts INTEGER DEFAULT 0;")
            print("Added failed_attempts column to users.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column failed_attempts already exists.")
            else:
                print(f"Error adding failed_attempts: {e}")

        # Add is_locked to users
        try:
            cursor.execute("ALTER TABLE users ADD COLUMN is_locked INTEGER DEFAULT 0;")
            print("Added is_locked column to users.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e):
                print("Column is_locked already exists.")
            else:
                print(f"Error adding is_locked: {e}")

        # Create system_config table
        try:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS system_config (
                    key TEXT PRIMARY KEY,
                    value TEXT NOT NULL
                );
            """)
            print("Table system_config ready.")
        except sqlite3.OperationalError as e:
            print(f"Error creating system_config: {e}")

        # Seed default login limits if not present
        try:
            cursor.execute("INSERT OR IGNORE INTO system_config (key, value) VALUES ('max_attempts_gestor', '5');")
            cursor.execute("INSERT OR IGNORE INTO system_config (key, value) VALUES ('max_attempts_consultor', '5');")
            print("Default login limits seeded.")
        except Exception as e:
            print(f"Error seeding system_config: {e}")

        conn.commit()
        conn.close()
        print("Database update complete.")
    except Exception as e:
        print(f"Failed to update database: {e}")

if __name__ == '__main__':
    update_db()
