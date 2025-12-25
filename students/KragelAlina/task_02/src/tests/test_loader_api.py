import os
import pytest
from app import app, db
from models import User
from flask_jwt_extended import create_access_token


def setup_module(module):
    # Ensure a clean sqlite DB for tests
    os.environ['DATABASE_URL'] = 'sqlite:///:memory:'


def test_admin_load_movies_sync(monkeypatch):
    with app.app_context():
        # Use in-memory sqlite for tests to avoid connecting to docker Postgres
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        db.engine.dispose()
        db.create_all()
        admin = User(username='admin', password='x', role='admin')
        db.session.add(admin)
        db.session.commit()
        token = create_access_token(identity=admin.id)

    client = app.test_client()
    headers = {'Authorization': f'Bearer {token}'}

    # Mock fetch and load to avoid network and DB complexity
    monkeypatch.setattr('load_movies_to_db.fetch_movies', lambda page, limit: [{'title': 'Mock Movie', 'release_date': '2020-01-01', 'genre_ids': [], 'genres': ''}])
    monkeypatch.setattr('load_movies_to_db.load_to_db', lambda movies: 1)

    resp = client.post('/admin/load_movies', json={'page': 1, 'limit': 1, 'dry_run': False, 'async': False}, headers=headers)
    assert resp.status_code == 200
    assert resp.get_json()['inserted'] == 1


def test_admin_load_movies_dry_run(monkeypatch):
    with app.app_context():
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        db.engine.dispose()
        db.create_all()
        admin = User(username='admin2', password='x', role='admin')
        db.session.add(admin)
        db.session.commit()
        token = create_access_token(identity=admin.id)

    client = app.test_client()
    headers = {'Authorization': f'Bearer {token}'}

    monkeypatch.setattr('load_movies_to_db.fetch_movies', lambda page, limit: [{'title': 'Dry Movie', 'release_date': '2021-01-01', 'genre_ids': [], 'genres': ''}])

    resp = client.post('/admin/load_movies', json={'page': 1, 'limit': 1, 'dry_run': True, 'async': False}, headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['fetched'] == 1
    assert data['items'][0]['title'] == 'Dry Movie'


def test_non_admin_forbidden(monkeypatch):
    with app.app_context():
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        db.engine.dispose()
        db.create_all()
        user = User(username='u', password='x', role='user')
        db.session.add(user)
        db.session.commit()
        token = create_access_token(identity=user.id)

    client = app.test_client()
    headers = {'Authorization': f'Bearer {token}'}

    resp = client.post('/admin/load_movies', json={'page': 1, 'limit': 1}, headers=headers)
    assert resp.status_code == 403
