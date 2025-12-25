import os
import pytest
from load_movies_to_db import fetch_movies


@pytest.mark.skipif(not os.getenv('TMDB_API_KEY'), reason='TMDB_API_KEY not set')
def test_fetch_movies():
    movies = fetch_movies(page=1, limit=2)
    assert isinstance(movies, list)
    assert len(movies) <= 2
    for m in movies:
        assert 'title' in m or 'name' in m
