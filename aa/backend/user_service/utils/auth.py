# utils/auth.py
import os
import jwt
from flask import jsonify

# Load the JWT secret key from environment
jwt_secret_key = os.getenv("JWT_SECRET_KEY")

def decode_token(token):
    """
    Decodes and validates a JWT token
    
    Args:
        token (str): JWT token string
        
    Returns:
        str or tuple: User ID if successful, error response tuple if failed
    """
    try:
        # Verify token signature and decode
        decoded_token = jwt.decode(token, jwt_secret_key, algorithms=["HS256"])
        user_id = decoded_token.get("sub")
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Invalid token format (missing sub)'
            }), 401
        
        # Return the user_id when successful
        return user_id

    except jwt.ExpiredSignatureError:
        return jsonify({
            'success': False,
            'error': 'Token has expired'
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            'success': False,
            'error': 'Invalid token'
        }), 401
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Unexpected error during token decoding: {str(e)}"
        }), 500

def get_user_id_from_request(request):
    """
    Extracts and validates the user ID from the request's Authorization header
    
    Args:
        request: Flask request object
        
    Returns:
        str or tuple: User ID if successful, error response tuple if failed
    """
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'success': False,
            'error': 'Authorization token missing or malformed'
        }), 401
    
    # Get token from header
    token = auth_header.split(" ")[1]

    # Decode token and return result
    return decode_token(token)