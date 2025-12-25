# app.py
from flask import Flask, request, jsonify, render_template
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from flasgger import Flasgger
from config import Config
from models import db, User, Title, List, Review, Rating, Person
from schemas import UserSchema, TitleSchema, ListSchema, ReviewSchema, RatingSchema
from utils import error_response
from datetime import datetime

app = Flask(__name__, static_folder='static', template_folder='templates')
app.config.from_object(Config)
import os
import logging
import threading
from load_movies_to_db import fetch_movies, load_to_db

db.init_app(app)
jwt = JWTManager(app)
CORS(app)
swagger = Flasgger(app)

with app.app_context():
    try:
        db.create_all()
        logging.info('Database tables created')
        
        try:
            if User.query.count() == 0:
                admin = User(username='admin', password='admin123', role='admin')
                user1 = User(username='user1', password='password1', role='user')
                user2 = User(username='user2', password='password2', role='user')
                db.session.add(admin)
                db.session.add(user1)
                db.session.add(user2)
                db.session.commit()
                logging.info('Database seeded with default admin and users')
        except Exception as e:
            logging.warning(f'Could not seed database: {e}')
    except Exception as e:
        logging.warning(f'Could not create database tables. Database may not be fully configured yet: {e}')

# Auth endpoints
@app.route('/register', methods=['POST'])
def register():
    """
    Register a new user
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
            password:
              type: string
    responses:
      201:
        description: User registered successfully
      400:
        description: Invalid or missing JSON
      409:
        description: User already exists
    """
    try:
        if not request.is_json:
            return error_response("Content-Type must be application/json", 415)
        json_data = request.get_json(silent=True)
        if json_data is None:
            return error_response("Invalid or missing JSON", 400)
        data = UserSchema(**json_data)
        if User.query.filter_by(username=data.username).first():
            return error_response('User exists', 409)
        user = User(username=data.username, password=data.password)
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Registered'}), 201
    except Exception as e:
        return error_response(str(e))

@app.route('/login', methods=['POST'])
def login():
    """
    Login user and get JWT token
    ---
    tags:
      - Auth
    parameters:
      - name: body
        in: body
        required: true
        schema:
          type: object
          required:
            - username
            - password
          properties:
            username:
              type: string
            password:
              type: string
    responses:
      200:
        description: Login successful
        schema:
          type: object
          properties:
            token:
              type: string
      401:
        description: Invalid credentials
    """
    try:
        json_data = request.get_json(silent=True)
        if not json_data:
            return error_response('Invalid or missing JSON', 400)
        data = UserSchema(**json_data)
        user = User.query.filter_by(username=data.username).first()
        if user and user.password == data.password:
            token = create_access_token(identity=str(user.id), additional_claims={'role': user.role})
            return jsonify({'token': token})
        return error_response('Invalid credentials', 401)
    except Exception as e:
        return error_response(str(e))

# Titles API
@app.route('/titles', methods=['GET', 'POST'])
@jwt_required()
def titles():
    """
    Get all titles with optional filters or add a new title (admin only)
    ---
    tags:
      - Titles
    security:
      - Bearer: []
    parameters:
      - name: name
        in: query
        type: string
        description: Filter by title name
      - name: genre
        in: query
        type: string
        description: Filter by genre
      - name: year
        in: query
        type: integer
        description: Filter by year
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
      - name: body
        in: body
        schema:
          type: object
          properties:
            name:
              type: string
            type:
              type: string
              enum: [movie, series]
            genre:
              type: string
            year:
              type: integer
    responses:
      200:
        description: List of titles
        schema:
          type: object
          properties:
            items:
              type: array
            total:
              type: integer
            pages:
              type: integer
      201:
        description: Title created (POST)
      403:
        description: Admin only
    """
    if request.method == 'POST':
        if User.query.get(int(get_jwt_identity())).role != 'admin':
            return error_response('Admin only', 403)
        try:
            data = TitleSchema(**request.json)
            title = Title(**data.dict())
            db.session.add(title)
            db.session.commit()
            return jsonify({'id': title.id}), 201
        except Exception as e:
            return error_response(str(e))
    
    # GET with filters/pagination/search
    query = Title.query
    name = request.args.get('name')
    genre = request.args.get('genre')
    year = request.args.get('year')
    status = request.args.get('status')  # Для фильтра по статусу в списках пользователя
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    if name:
        query = query.filter(Title.name.ilike(f'%{name}%'))
    if genre:
        query = query.filter(Title.genre.ilike(f'%{genre}%'))
    if year:
        query = query.filter_by(year=year)
    if status:
        user_id = int(get_jwt_identity())
        query = query.join(List).filter(List.user_id == user_id, List.status == status)
    
    titles_paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    titles_list = [{
        'id': t.id,
        'name': t.name,
        'type': t.type,
        'genre': t.genre,
        'year': t.year
    } for t in titles_paginated.items]  # Сериализация для JSON
    
    return jsonify({
        'items': titles_list,
        'total': titles_paginated.total,
        'pages': titles_paginated.pages
    })

@app.route('/titles/<int:title_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def title_detail(title_id):
    """
    Get, update, or delete a specific title
    ---
    tags:
      - Titles
    security:
      - Bearer: []
    parameters:
      - name: title_id
        in: path
        type: integer
        required: true
      - name: body
        in: body
        schema:
          type: object
          properties:
            name:
              type: string
            type:
              type: string
            genre:
              type: string
            year:
              type: integer
    responses:
      200:
        description: Title details or update successful
      403:
        description: Admin only (for PUT/DELETE)
      404:
        description: Title not found
    """
    title = Title.query.get_or_404(title_id)
    if request.method == 'GET':
        return jsonify({
            'id': title.id,
            'name': title.name,
            'type': title.type,
            'genre': title.genre,
            'year': title.year
        })
    
    user = User.query.get(int(get_jwt_identity()))
    if user.role != 'admin':
        return error_response('Admin only', 403)
    
    if request.method == 'PUT':
        try:
            data = TitleSchema(**request.json)
            for key, value in data.dict(exclude_unset=True).items():
                setattr(title, key, value)
            db.session.commit()
            return jsonify({'message': 'Updated'})
        except Exception as e:
            return error_response(str(e))
    
    if request.method == 'DELETE':
        db.session.delete(title)
        db.session.commit()
        return jsonify({'message': 'Deleted'})

# Lists API
@app.route('/lists', methods=['GET', 'POST'])
@jwt_required()
def lists():
    """
    Get user's lists or add a title to list
    ---
    tags:
      - Lists
    security:
      - Bearer: []
    parameters:
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
      - name: body
        in: body
        schema:
          type: object
          required:
            - title_id
            - status
          properties:
            title_id:
              type: integer
            status:
              type: string
              enum: [watching, planned, completed, dropped]
    responses:
      200:
        description: User's lists
      201:
        description: List item added/updated
    """
    user_id = int(get_jwt_identity())
    if request.method == 'POST':
        try:
            data = ListSchema(**request.json)
            existing = List.query.filter_by(user_id=user_id, title_id=data.title_id).first()
            if existing:
                existing.status = data.status
            else:
                lst = List(user_id=user_id, **data.dict())
                db.session.add(lst)
            db.session.commit()
            return jsonify({'message': 'Added/Updated'}), 201
        except Exception as e:
            return error_response(str(e))
    
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    lists_paginated = List.query.filter_by(user_id=user_id).paginate(page=page, per_page=per_page, error_out=False)
    lists_data = [{
        'id': l.id,
        'title_id': l.title_id,
        'title_name': Title.query.get(l.title_id).name if l.title_id else 'Unknown',
        'status': l.status
    } for l in lists_paginated.items]
    return jsonify({
        'items': lists_data,
        'total': lists_paginated.total,
        'pages': lists_paginated.pages
    })

@app.route('/lists/<int:list_id>', methods=['DELETE'])
@jwt_required()
def delete_list(list_id):
    """
    Delete a list item
    ---
    tags:
      - Lists
    security:
      - Bearer: []
    parameters:
      - name: list_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: List item deleted
      403:
        description: Unauthorized
      404:
        description: List item not found
    """
    user_id = int(get_jwt_identity())
    lst = List.query.get_or_404(list_id)
    if lst.user_id != user_id:
        return error_response('Unauthorized', 403)
    db.session.delete(lst)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

# Reviews API
@app.route('/reviews', methods=['GET', 'POST'])
@jwt_required()
def reviews():
    """
    Get reviews or post a new review
    ---
    tags:
      - Reviews
    security:
      - Bearer: []
    parameters:
      - name: title_id
        in: query
        type: integer
        description: Filter by title ID
      - name: user_id
        in: query
        type: integer
        description: Filter by user ID
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
      - name: body
        in: body
        schema:
          type: object
          required:
            - title_id
            - text
          properties:
            title_id:
              type: integer
            text:
              type: string
    responses:
      200:
        description: List of reviews
      201:
        description: Review posted
    """
    if request.method == 'POST':
        try:
            data = ReviewSchema(**request.json)
            user_id = int(get_jwt_identity())
            existing = Review.query.filter_by(user_id=user_id, title_id=data.title_id).first()
            if existing:
                existing.text = data.text
                existing.created_at = datetime.utcnow()
            else:
                review = Review(user_id=user_id, **data.dict())
                db.session.add(review)
            db.session.commit()
            return jsonify({'message': 'Reviewed/Updated'}), 201
        except Exception as e:
            return error_response(str(e))
    
    title_id = request.args.get('title_id')
    user_id_param = request.args.get('user_id')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    if title_id:
        reviews_query = Review.query.filter_by(title_id=title_id)
    elif user_id_param:
        reviews_query = Review.query.filter_by(user_id=user_id_param)
    else:
        reviews_query = Review.query
    
    reviews_paginated = reviews_query.paginate(page=page, per_page=per_page, error_out=False)
    reviews_list = [{
        'id': r.id,
        'user_id': r.user_id,
        'title_id': r.title_id,
        'title_name': Title.query.get(r.title_id).name if r.title_id else 'Unknown',
        'text': r.text,
        'created_at': r.created_at.isoformat()
    } for r in reviews_paginated.items]
    return jsonify({
        'items': reviews_list,
        'total': reviews_paginated.total,
        'pages': reviews_paginated.pages
    })

@app.route('/reviews/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    """
    Delete a review
    ---
    tags:
      - Reviews
    security:
      - Bearer: []
    parameters:
      - name: review_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Review deleted
      403:
        description: Unauthorized
      404:
        description: Review not found
    """
    user_id = int(get_jwt_identity())
    review = Review.query.get_or_404(review_id)
    if review.user_id != user_id:
        return error_response('Unauthorized', 403)
    db.session.delete(review)
    db.session.commit()
    return jsonify({'message': 'Deleted'})

# Ratings API
@app.route('/ratings', methods=['GET', 'POST'])
@jwt_required()
def ratings():
    """
    Get ratings or post a new rating
    ---
    tags:
      - Ratings
    security:
      - Bearer: []
    parameters:
      - name: title_id
        in: query
        type: integer
        description: Filter by title ID
      - name: user_id
        in: query
        type: integer
        description: Filter by user ID
      - name: page
        in: query
        type: integer
        default: 1
      - name: per_page
        in: query
        type: integer
        default: 10
      - name: body
        in: body
        schema:
          type: object
          required:
            - title_id
            - score
          properties:
            title_id:
              type: integer
            score:
              type: integer
              minimum: 1
              maximum: 10
    responses:
      200:
        description: List of ratings
      201:
        description: Rating posted
    """
    if request.method == 'POST':
        try:
            data = RatingSchema(**request.json)
            existing = Rating.query.filter_by(user_id=int(get_jwt_identity()), title_id=data.title_id).first()
            if existing:
                existing.score = data.score
            else:
                rating = Rating(user_id=int(get_jwt_identity()), **data.dict())
                db.session.add(rating)
            db.session.commit()
            return jsonify({'message': 'Rated/Updated'}), 201
        except Exception as e:
            return error_response(str(e))
    
    title_id = request.args.get('title_id')
    user_id_param = request.args.get('user_id')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    
    if title_id:
        ratings_query = Rating.query.filter_by(title_id=title_id)
    elif user_id_param:
        ratings_query = Rating.query.filter_by(user_id=user_id_param)
    else:
        ratings_query = Rating.query
    
    ratings_paginated = ratings_query.paginate(page=page, per_page=per_page, error_out=False)
    ratings_list = [{
        'id': r.id,
        'user_id': r.user_id,
        'title_id': r.title_id,
        'title_name': Title.query.get(r.title_id).name if r.title_id else 'Unknown',
        'score': r.score
    } for r in ratings_paginated.items]
    return jsonify({
        'items': ratings_list,
        'total': ratings_paginated.total,
        'pages': ratings_paginated.pages
    })

@app.route('/ratings/<int:rating_id>', methods=['DELETE'])
@jwt_required()
def delete_rating(rating_id):
    """
    Delete a rating
    ---
    tags:
      - Ratings
    security:
      - Bearer: []
    parameters:
      - name: rating_id
        in: path
        type: integer
        required: true
    responses:
      200:
        description: Rating deleted
      403:
        description: Unauthorized
      404:
        description: Rating not found
    """
    user_id = int(get_jwt_identity())
    rating = Rating.query.get_or_404(rating_id)
    if rating.user_id != user_id:
        return error_response('Unauthorized', 403)
    db.session.delete(rating)
    db.session.commit()
    return jsonify({'message': 'Deleted'})


# Admin endpoint to trigger loading movies from TMDB
@app.route('/admin/load_movies', methods=['POST'])
@jwt_required()
def admin_load_movies():
    """
    Load movies from TMDB (admin only)
    ---
    tags:
      - Admin
    security:
      - Bearer: []
    parameters:
      - name: body
        in: body
        schema:
          type: object
          properties:
            page:
              type: integer
              default: 1
            limit:
              type: integer
              default: 20
            dry_run:
              type: boolean
              default: false
            async:
              type: boolean
              default: false
    responses:
      200:
        description: Movies loaded successfully
      403:
        description: Admin only
      500:
        description: Failed to load movies
    """
    logging.info('admin_load_movies called')
    try:
        user_id = int(get_jwt_identity())
        logging.info(f'User ID: {user_id}')
        user = User.query.get(user_id)
        logging.info(f'User: {user}')
        if not user or user.role != 'admin':
            logging.warning(f'User {user_id} is not admin')
            return error_response('Admin only', 403)

        data = request.get_json(silent=True) or {}
        logging.info(f'Request data: {data}')
        try:
            page = int(data.get('page', 1))
            limit = int(data.get('limit', 20))
        except (ValueError, TypeError) as e:
            logging.error(f'Invalid parameters: {e}')
            return error_response(f'Invalid page or limit parameter: {str(e)}', 400)
        
        dry_run = bool(data.get('dry_run', False))
        async_flag = bool(data.get('async', False))
        
        logging.info(f'Fetching movies: page={page}, limit={limit}')
        movies = fetch_movies(page=page, limit=limit)
        logging.info(f'Fetched {len(movies)} movies')
        
        if dry_run:
            items = [{'title': m.get('title'), 'release_date': m.get('release_date'), 'genres': m.get('genres')} for m in movies]
            return jsonify({'fetched': len(movies), 'items': items}), 200
        
        logging.info('Loading movies to DB')
        inserted = load_to_db(movies)
        logging.info(f'Inserted {inserted} movies')
        return jsonify({'inserted': inserted}), 200
    except Exception as e:
        logging.exception('Error in admin_load_movies')
        return error_response(f'Failed to load movies: {str(e)}', 500)

# Frontend entry point (serve index.html)
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/profile')
def profile():
    return render_template('profile.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)