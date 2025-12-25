from app import app

with app.test_client() as client:
    resp = client.post('/register', json={'username': 'test', 'password': 'testpass'})
    print('status', resp.status_code)
    print('data', resp.get_data(as_text=True))
    print('headers', resp.headers)
