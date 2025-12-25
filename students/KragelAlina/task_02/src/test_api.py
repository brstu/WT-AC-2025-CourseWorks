import requests
import json

api_key = 'a65dee42d8107a3a1f5f438517ce7bfa'
url = f'https://api.themoviedb.org/3/discover/movie?api_key={api_key}&sort_by=popularity.desc&page=1'

try:
    response = requests.get(url, timeout=10)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Keys: {data.keys()}")
    if 'results' in data:
        print(f"Results count: {len(data.get('results', []))}")
        if data.get('results'):
            print(f"First movie: {data['results'][0].get('title')}")
    else:
        print(f"Response: {json.dumps(data, indent=2)}")
except Exception as e:
    print(f"Error: {e}")
