# config.py
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

class Config:
    _db_url = os.getenv('DATABASE_URL')
    if _db_url and _db_url.strip() and _db_url != 'sqlite:///app.db':
        SQLALCHEMY_DATABASE_URI = _db_url
    else:
        db_path = Path(__file__).parent.absolute() / 'app.db'
        SQLALCHEMY_DATABASE_URI = f'sqlite:///{db_path.as_posix()}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY')