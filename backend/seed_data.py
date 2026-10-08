"""
Seed script: exports local SQLite data and inserts it into the production database.
Run this AFTER setting DATABASE_URL to your Render PostgreSQL connection string.

Usage:
  set DATABASE_URL=postgresql://user:pass@host/dbname
  python seed_data.py
"""

import sqlite3
import os
import sys

# Add backend to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.config import settings
from app.database import engine, Base
from app import models
from sqlalchemy.orm import sessionmaker

SQLITE_DB = os.path.join(os.path.dirname(__file__), "teaching_assistant.db")

def export_sqlite_data():
    conn = sqlite3.connect(SQLITE_DB)
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    data = {}
    tables = ["users", "materials", "quiz_attempts", "study_materials", "gamification_profiles"]
    for t in tables:
        try:
            cur.execute(f"SELECT * FROM {t}")
            data[t] = [dict(row) for row in cur.fetchall()]
            print(f"  Exported {len(data[t])} rows from {t}")
        except Exception as e:
            print(f"  Skipping {t}: {e}")
            data[t] = []
    conn.close()
    return data

def seed_to_production(data):
    # Create all tables
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    try:
        # Seed users
        for row in data.get("users", []):
            exists = db.query(models.User).filter_by(email=row["email"]).first()
            if not exists:
                user = models.User(
                    id=row["id"],
                    email=row["email"],
                    hashed_password=row["hashed_password"],
                    role=row["role"],
                )
                db.add(user)
        db.commit()
        print(f"  Seeded {len(data['users'])} users")

        # Seed materials (library)
        for row in data.get("materials", []):
            exists = db.query(models.Material).filter_by(id=row["id"]).first()
            if not exists:
                mat = models.Material(**{k: v for k, v in row.items()})
                db.add(mat)
        db.commit()
        print(f"  Seeded {len(data['materials'])} library items")

        # Seed study materials
        for row in data.get("study_materials", []):
            exists = db.query(models.StudyMaterial).filter_by(id=row["id"]).first()
            if not exists:
                sm = models.StudyMaterial(**{k: v for k, v in row.items()})
                db.add(sm)
        db.commit()
        print(f"  Seeded {len(data['study_materials'])} study materials")

        # Seed gamification profiles
        for row in data.get("gamification_profiles", []):
            exists = db.query(models.GamificationProfile).filter_by(user_id=row["user_id"]).first()
            if not exists:
                gp = models.GamificationProfile(**{k: v for k, v in row.items()})
                db.add(gp)
        db.commit()
        print(f"  Seeded {len(data['gamification_profiles'])} gamification profiles")

    except Exception as e:
        db.rollback()
        print(f"Error seeding: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    db_uri = settings.get_database_uri()
    print(f"Target DB: {db_uri[:50]}...")
    print("\nExporting from local SQLite...")
    data = export_sqlite_data()
    print("\nSeeding to production database...")
    seed_to_production(data)
    print("\nDone! All data migrated.")
