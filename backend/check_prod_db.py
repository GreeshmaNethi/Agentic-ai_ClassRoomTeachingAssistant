"""Check actual column names in production materials table"""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))

os.environ['DATABASE_URL'] = 'postgresql://agentic_ai_db_uhvr_user:cjEA3ayee1F2jywVuS93PsKnjl2QxqkA@dpg-db3q740473hc73ev5fo0-a.oregon-postgres.render.com/agentic_ai_db_uhvr'

from app.core.config import settings
from sqlalchemy import create_engine, text

engine = create_engine(settings.get_database_uri())
with engine.connect() as conn:
    # Get column names of materials table
    rows = conn.execute(text("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name='materials' 
        ORDER BY ordinal_position
    """)).fetchall()
    print("=== materials table columns ===")
    for r in rows:
        print(f"  {r[0]} ({r[1]})")

    # Get all materials
    rows = conn.execute(text("SELECT * FROM materials LIMIT 5")).fetchall()
    print(f"\n=== materials rows ({len(rows)} shown) ===")
    for r in rows:
        print(f"  {dict(r._mapping)}")
