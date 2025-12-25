import os
import logging
import requests
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import db, Title  # Import from your app's models (adjust path if needed)
from config import Config

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# TMDB API key (use env var when possible)
api_key = os.getenv('TMDB_API_KEY') or 'a65dee42d8107a3a1f5f438517ce7bfa'

# Database connection (use your .env or Docker env)
DATABASE_URL = Config.SQLALCHEMY_DATABASE_URI or os.getenv('DATABASE_URL')
if not DATABASE_URL:
    logger.warning('DATABASE_URL not set, falling back to local sqlite database file movies.db')
    DATABASE_URL = 'sqlite:///movies.db'

# Genre mapping
genre_dict = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Science Fiction',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western'
}

def get_demo_movies():
    return [
        {
            'title': 'The Shawshank Redemption',
            'release_date': '1994-10-14',
            'genre_ids': [18, 80],
            'genres': 'Drama, Crime'
        },
        {
            'title': 'The Dark Knight',
            'release_date': '2008-07-18',
            'genre_ids': [28, 80, 18],
            'genres': 'Action, Crime, Drama'
        },
        {
            'title': 'Inception',
            'release_date': '2010-07-16',
            'genre_ids': [28, 12, 878],
            'genres': 'Action, Adventure, Science Fiction'
        },
        {
            'title': 'Pulp Fiction',
            'release_date': '1994-10-14',
            'genre_ids': [80, 53],
            'genres': 'Crime, Thriller'
        },
        {
            'title': 'The Matrix',
            'release_date': '1999-03-31',
            'genre_ids': [28, 878],
            'genres': 'Action, Science Fiction'
        },
    ]

def fetch_movies(page=1, limit=20):
    if not api_key:
        logger.warning('TMDB API key is not set. Using demo movies.')
        return get_demo_movies()[:limit]

    headers = {"User-Agent": "load-movies-script/1.0"}
    movies = []
    
    try:
        pages_needed = (limit + 19) // 20
        for p in range(page, page + pages_needed):
            url = f'https://api.themoviedb.org/3/discover/movie?api_key={api_key}&sort_by=popularity.desc&page={p}'
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if 'errors' in data:
                logger.warning(f'TMDB API error on page {p}: {data.get("errors", [])}')
                break
            
            page_movies = data.get('results', [])
            if not page_movies:
                logger.warning(f'No movies returned from TMDB API on page {p}')
                break
            
            movies.extend(page_movies)
            if len(movies) >= limit:
                break
        
        if not movies:
            logger.warning('No movies fetched from TMDB API. Using demo movies.')
            return get_demo_movies()[:limit]
        
        movies = movies[:limit]
        for movie in movies:
            movie['genres'] = ', '.join([genre_dict.get(gid, 'Unknown') for gid in movie.get('genre_ids', [])])
        return movies
    except requests.exceptions.RequestException as e:
        logger.warning(f'Failed to fetch from TMDB API: {str(e)}. Using demo movies.')
        return get_demo_movies()[:limit]

# Load to DB
def load_to_db(movies):
    engine = create_engine(DATABASE_URL)

    # Ensure tables exist (works with Flask-SQLAlchemy models)
    db.metadata.create_all(engine)

    Session = sessionmaker(bind=engine)
    session = Session()

    inserted = 0
    for movie in movies:
        title_name = movie.get('title') or movie.get('name')
        if not title_name:
            continue

        # Check if exists to avoid duplicates
        existing = session.query(Title).filter_by(name=title_name).first()
        if not existing:
            year = None
            release_date = movie.get('release_date') or movie.get('first_air_date')
            if release_date:
                try:
                    year = int(release_date[:4])
                except ValueError:
                    year = None

            new_title = Title(
                name=title_name,
                type='movie',  # Assuming all are movies; adjust for series if needed
                genre=movie.get('genres'),
                year=year
            )
            session.add(new_title)
            inserted += 1

    session.commit()
    session.close()
    logger.info(f"Inserted {inserted} new titles (out of {len(movies)} fetched).")
    return inserted

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Fetch movies from TMDB and load to DB')
    parser.add_argument('--page', type=int, default=1, help='TMDB page to fetch')
    parser.add_argument('--limit', type=int, default=20, help='Max number of movies to fetch')
    parser.add_argument('--dry-run', action='store_true', help='Do not insert into DB; just print')
    args = parser.parse_args()

    movies = fetch_movies(page=args.page, limit=args.limit)

    if args.dry_run:
        for m in movies:
            logger.info(f"{m.get('title')} ({m.get('release_date')}) - Genres: {m.get('genres')}")
    else:
        try:
            inserted = load_to_db(movies)
            logger.info(f"Done: {inserted} records inserted.")
        except Exception as e:
            logger.exception('Failed to load movies to DB')
    