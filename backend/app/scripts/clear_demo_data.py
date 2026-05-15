import sys
import os
import traceback
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

print("Starting demo data cleanup script...")

try:
    print("Importing database models...")
    from models.database import User, SessionLocal, Base, engine
    print("Successfully imported database models")
except Exception as e:
    print(f"Error importing database models: {e}")
    traceback.print_exc()
    sys.exit(1)

def clear_demo_data():
    """Clear all demo data from the database"""
    print("Connecting to database...")
    try:
        db = SessionLocal()
        print("Successfully connected to database")
    except Exception as e:
        print(f"Error connecting to database: {e}")
        traceback.print_exc()
        return
    
    try:
        # Print current users
        users = db.query(User).all()
        print(f"Found {len(users)} users in the database")
        for user in users:
            print(f"  - User ID: {user.id}, Email: {user.email}, Organization: {user.organization_name}")
        
        # Delete all users
        print("Deleting users...")
        num_deleted = db.query(User).delete()
        db.commit()
        print(f"Successfully deleted {num_deleted} users from the database")
        
        # Optionally, you can reset the auto-increment counters
        # This is PostgreSQL specific syntax
        try:
            print("Resetting ID sequence counter...")
            db.execute("ALTER SEQUENCE users_id_seq RESTART WITH 1")
            db.commit()
            print("Reset ID sequence counter")
        except Exception as e:
            print(f"Warning: Could not reset sequence counter: {e}")
            # Not critical, so we continue
        
        print("All demo data has been cleared successfully!")
        print("The application is now ready for testing as a new user")
        
    except Exception as e:
        print(f"Error clearing demo data: {e}")
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()
        print("Database connection closed")

if __name__ == "__main__":
    print("=" * 50)
    print("TIMELY MATE DEMO DATA CLEANUP")
    print("=" * 50)
    clear_demo_data()
    print("=" * 50)
