import sys
import os
from sqlalchemy.orm import Session
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.database import User, SessionLocal, engine
from models.auth import UserCreate

def create_demo_user():
    db = SessionLocal()
    try:
        # Check if demo user already exists
        demo_user = db.query(User).filter(User.email == "demo@timelymate.com").first()
        if demo_user:
            print("Demo user already exists")
            return
        
        # Create demo user
        demo_user = User(
            email="demo@timelymate.com",
            organization_name="Demo Organization",
            hashed_password=User.get_password_hash("demo123")
        )
        
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print("Demo user created successfully")
        print("Email: demo@timelymate.com")
        print("Password: demo123")
        
    except Exception as e:
        print(f"Error creating demo user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_demo_user()
