import pytest
from app import app
from models import db, User, Title, List, Review, Rating


@pytest.fixture(scope='function')
def client():
    app.testing = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
    
    test_client = app.test_client()
    yield test_client
    
    with app.app_context():
        db.session.remove()
        db.drop_all()


@pytest.fixture(scope='function')
def auth_user(client):
    with client.application.app_context():
        if not User.query.filter_by(username='testuser').first():
            user = User(username='testuser', password='testpass', role='user')
            db.session.add(user)
            db.session.commit()
    
    response = client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}'}


@pytest.fixture(scope='function')
def admin_user(client):
    with client.application.app_context():
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', password='admin123', role='admin')
            db.session.add(admin)
            db.session.commit()
    
    response = client.post('/login', json={'username': 'admin', 'password': 'admin123'})
    token = response.get_json()['token']
    return {'Authorization': f'Bearer {token}'}


class TestAuth:
    def test_register_success(self, client):
        response = client.post('/register', json={'username': 'newuser', 'password': 'pass123'})
        assert response.status_code == 201

    def test_register_duplicate_user(self, client):
        client.post('/register', json={'username': 'testuser', 'password': 'pass123'})
        response = client.post('/register', json={'username': 'testuser', 'password': 'pass456'})
        assert response.status_code == 409

    def test_register_invalid_json(self, client):
        response = client.post('/register', json={})
        assert response.status_code == 400

    def test_login_success(self, client):
        client.post('/register', json={'username': 'loginuser', 'password': 'testpass'})
        response = client.post('/login', json={'username': 'loginuser', 'password': 'testpass'})
        assert response.status_code == 200
        assert 'token' in response.get_json()

    def test_login_invalid_credentials(self, client):
        client.post('/register', json={'username': 'testuser', 'password': 'testpass'})
        response = client.post('/login', json={'username': 'testuser', 'password': 'wrongpass'})
        assert response.status_code == 401


class TestTitles:
    def test_get_titles(self, client, auth_user):
        with client.application.app_context():
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()

        response = client.get('/titles', headers=auth_user)
        assert response.status_code == 200
        data = response.get_json()
        assert data['total'] == 1
        assert data['items'][0]['name'] == 'Test Movie'

    def test_get_titles_with_filters(self, client, auth_user):
        with client.application.app_context():
            db.session.add(Title(name='Action Movie', type='movie', genre='Action', year=2023))
            db.session.add(Title(name='Comedy Series', type='series', genre='Comedy', year=2022))
            db.session.commit()

        response = client.get('/titles?genre=Action', headers=auth_user)
        assert response.status_code == 200
        assert response.get_json()['total'] == 1

    def test_get_title_detail(self, client, auth_user):
        with client.application.app_context():
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id

        response = client.get(f'/titles/{title_id}', headers=auth_user)
        assert response.status_code == 200
        assert response.get_json()['name'] == 'Test Movie'

    def test_create_title_user_forbidden(self, client, auth_user):
        response = client.post('/titles', 
                             json={'name': 'New Movie', 'type': 'movie', 'genre': 'Action', 'year': 2023},
                             headers=auth_user)
        assert response.status_code == 403

    def test_create_title_admin(self, client, admin_user):
        response = client.post('/titles',
                             json={'name': 'New Movie', 'type': 'movie', 'genre': 'Action', 'year': 2023},
                             headers=admin_user)
        assert response.status_code == 201

    def test_update_title_admin(self, client, admin_user):
        with client.application.app_context():
            title = Title(name='Old Name', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id

        response = client.put(f'/titles/{title_id}',
                            json={'name': 'New Name', 'type': 'movie', 'genre': 'Action', 'year': 2023},
                            headers=admin_user)
        assert response.status_code == 200

    def test_delete_title_admin(self, client, admin_user):
        with client.application.app_context():
            title = Title(name='Delete Me', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id

        response = client.delete(f'/titles/{title_id}', headers=admin_user)
        assert response.status_code == 200


class TestLists:
    def test_get_empty_lists(self, client, auth_user):
        response = client.get('/lists', headers=auth_user)
        assert response.status_code == 200
        assert response.get_json()['total'] == 0

    def test_add_to_list(self, client, auth_user):
        with client.application.app_context():
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id

        response = client.post('/lists',
                             json={'title_id': title_id, 'status': 'watching'},
                             headers=auth_user)
        assert response.status_code == 201

    def test_get_user_lists(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            
            lst = List(user_id=user.id, title_id=title.id, status='planned')
            db.session.add(lst)
            db.session.commit()

        response = client.get('/lists', headers=auth_user)
        assert response.status_code == 200
        assert response.get_json()['total'] == 1

    def test_update_list_status(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id
            
            lst = List(user_id=user.id, title_id=title_id, status='planned')
            db.session.add(lst)
            db.session.commit()

        response = client.post('/lists',
                             json={'title_id': title_id, 'status': 'completed'},
                             headers=auth_user)
        assert response.status_code == 201

    def test_delete_list_item(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            
            lst = List(user_id=user.id, title_id=title.id, status='planned')
            db.session.add(lst)
            db.session.commit()
            list_id = lst.id

        response = client.delete(f'/lists/{list_id}', headers=auth_user)
        assert response.status_code == 200

    def test_delete_list_item_unauthorized(self, client):
        with client.application.app_context():
            user1 = User(username='user1unauth', password='pass123', role='user')
            user2 = User(username='user2unauth', password='pass123', role='user')
            db.session.add(user1)
            db.session.add(user2)
            db.session.commit()
            user1_id = user1.id
            
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id
            
            lst = List(user_id=user1_id, title_id=title_id, status='planned')
            db.session.add(lst)
            db.session.commit()
            list_id = lst.id

        response = client.post('/login', json={'username': 'user2unauth', 'password': 'pass123'})
        token = response.get_json()['token']
        headers = {'Authorization': f'Bearer {token}'}

        response = client.delete(f'/lists/{list_id}', headers=headers)
        assert response.status_code == 403


class TestReviews:
    def test_post_review(self, client, auth_user):
        with client.application.app_context():
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id

        response = client.post('/reviews',
                             json={'title_id': title_id, 'text': 'Great movie!'},
                             headers=auth_user)
        assert response.status_code == 201

    def test_get_reviews_by_title(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id
            
            review = Review(user_id=user.id, title_id=title_id, text='Great!')
            db.session.add(review)
            db.session.commit()

        response = client.get(f'/reviews?title_id={title_id}', headers=auth_user)
        assert response.status_code == 200
        assert response.get_json()['total'] == 1

    def test_get_reviews_by_user(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            user_id = user.id
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id
            
            review = Review(user_id=user_id, title_id=title_id, text='Great!')
            db.session.add(review)
            db.session.commit()

        response = client.get(f'/reviews?user_id={user_id}', headers=auth_user)
        assert response.status_code == 200

    def test_update_review(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id
            
            review = Review(user_id=user.id, title_id=title_id, text='Old review')
            db.session.add(review)
            db.session.commit()

        response = client.post('/reviews',
                             json={'title_id': title_id, 'text': 'Updated review'},
                             headers=auth_user)
        assert response.status_code == 201

    def test_delete_review(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            
            review = Review(user_id=user.id, title_id=title.id, text='Test review')
            db.session.add(review)
            db.session.commit()
            review_id = review.id

        response = client.delete(f'/reviews/{review_id}', headers=auth_user)
        assert response.status_code == 200


class TestRatings:
    def test_post_rating(self, client, auth_user):
        with client.application.app_context():
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id

        response = client.post('/ratings',
                             json={'title_id': title_id, 'score': 8},
                             headers=auth_user)
        assert response.status_code == 201

    def test_get_ratings_by_title(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id
            
            rating = Rating(user_id=user.id, title_id=title_id, score=8)
            db.session.add(rating)
            db.session.commit()

        response = client.get(f'/ratings?title_id={title_id}', headers=auth_user)
        assert response.status_code == 200
        assert response.get_json()['total'] == 1

    def test_get_ratings_by_user(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            user_id = user.id
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id
            
            rating = Rating(user_id=user_id, title_id=title_id, score=7)
            db.session.add(rating)
            db.session.commit()

        response = client.get(f'/ratings?user_id={user_id}', headers=auth_user)
        assert response.status_code == 200

    def test_update_rating(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            title_id = title.id
            
            rating = Rating(user_id=user.id, title_id=title_id, score=5)
            db.session.add(rating)
            db.session.commit()

        response = client.post('/ratings',
                             json={'title_id': title_id, 'score': 9},
                             headers=auth_user)
        assert response.status_code == 201

    def test_delete_rating(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            
            rating = Rating(user_id=user.id, title_id=title.id, score=8)
            db.session.add(rating)
            db.session.commit()
            rating_id = rating.id

        response = client.delete(f'/ratings/{rating_id}', headers=auth_user)
        assert response.status_code == 200


class TestPagination:
    def test_titles_pagination(self, client, auth_user):
        with client.application.app_context():
            for i in range(15):
                title = Title(name=f'Movie {i}', type='movie', genre='Action', year=2023)
                db.session.add(title)
            db.session.commit()

        response = client.get('/titles?page=1&per_page=10', headers=auth_user)
        assert response.status_code == 200
        data = response.get_json()
        assert len(data['items']) == 10
        assert data['pages'] == 2

    def test_reviews_pagination(self, client, auth_user):
        with client.application.app_context():
            user = User.query.filter_by(username='testuser').first()
            title = Title(name='Test Movie', type='movie', genre='Action', year=2023)
            db.session.add(title)
            db.session.commit()
            
            for i in range(12):
                review = Review(user_id=user.id, title_id=title.id, text=f'Review {i}')
                db.session.add(review)
            db.session.commit()

        response = client.get('/reviews?page=2&per_page=5', headers=auth_user)
        assert response.status_code == 200
        data = response.get_json()
        assert data['pages'] >= 2


class TestErrorHandling:
    def test_missing_auth_header(self, client):
        response = client.get('/titles')
        assert response.status_code == 401

    def test_invalid_token(self, client):
        headers = {'Authorization': 'Bearer invalid_token'}
        response = client.get('/titles', headers=headers)
        assert response.status_code == 422

    def test_title_not_found(self, client, auth_user):
        response = client.get('/titles/99999', headers=auth_user)
        assert response.status_code == 404

    def test_review_not_found(self, client, auth_user):
        response = client.delete('/reviews/99999', headers=auth_user)
        assert response.status_code == 404

    def test_rating_not_found(self, client, auth_user):
        response = client.delete('/ratings/99999', headers=auth_user)
        assert response.status_code == 404
