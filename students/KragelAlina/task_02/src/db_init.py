import logging
import os
from dotenv import load_dotenv

load_dotenv()

def init_db():
    DATABASE_URL = os.getenv('DATABASE_URL', '')
    
    if not DATABASE_URL or not DATABASE_URL.startswith('postgresql'):
        logging.info('Using SQLite database - skipping PostgreSQL initialization')
        return True
    
    try:
        import psycopg2
        
        DB_USER = 'user'
        DB_PASSWORD = 'password'
        DB_NAME = 'what_to_watch'
        DB_HOST = 'localhost'
        DB_PORT = 5432
        
        POSTGRES_USER = os.getenv('POSTGRES_SUPERUSER', 'postgres')
        POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'postgres')
        
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=POSTGRES_USER,
            password=POSTGRES_PASSWORD,
            database='postgres',
            connect_timeout=5
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        try:
            cursor.execute(f"CREATE USER {DB_USER} WITH PASSWORD '{DB_PASSWORD}'")
            logging.info(f'Created user {DB_USER}')
        except psycopg2.ProgrammingError:
            logging.info(f'User {DB_USER} already exists')
        
        try:
            cursor.execute(f"CREATE DATABASE {DB_NAME} OWNER {DB_USER}")
            logging.info(f'Created database {DB_NAME}')
        except psycopg2.ProgrammingError:
            logging.info(f'Database {DB_NAME} already exists')
        
        try:
            cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER}")
            logging.info(f'Granted privileges to {DB_USER}')
        except psycopg2.ProgrammingError as e:
            logging.warning(f'Could not grant privileges: {e}')
        
        cursor.close()
        conn.close()
        logging.info('PostgreSQL initialization successful')
        return True
    except Exception as e:
        logging.warning(f'PostgreSQL initialization error: {e}')
        return False
