import requests
import json

BASE_URL = 'http://localhost:5000'

print('1. Login...')
response = requests.post(f'{BASE_URL}/login', json={
    'username': 'user1',
    'password': 'password1'
})
token = response.json()['token']
headers = {'Authorization': f'Bearer {token}'}
print('✓ Logged in')

print('\n2. Submit first review...')
response = requests.post(f'{BASE_URL}/reviews', 
    headers=headers,
    json={'title_id': 1, 'text': 'First review - great movie!'}
)
print(f'Status: {response.status_code}')
print(f'Response: {response.json()}')

print('\n3. Submit second review for same film...')
response = requests.post(f'{BASE_URL}/reviews', 
    headers=headers,
    json={'title_id': 1, 'text': 'Updated review - absolutely amazing!'}
)
print(f'Status: {response.status_code}')
print(f'Response: {response.json()}')

print('\n4. Get all reviews for film...')
response = requests.get(f'{BASE_URL}/reviews?title_id=1', headers=headers)
print(f'Total reviews for film 1: {response.json()["total"]}')
reviews = response.json()['items']
print(f'Reviews:')
for review in reviews:
    if review['user_id'] == 2:  # user1 has id 2
        print(f'  - User {review["user_id"]}: "{review["text"]}"')
