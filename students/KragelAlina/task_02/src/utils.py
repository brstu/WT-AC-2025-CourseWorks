# utils.py
import logging
from flask import jsonify

logging.basicConfig(level=logging.INFO)

def log_error(message):
    logging.error(message)

def error_response(message, status=400):
    return jsonify({'error': message}), status