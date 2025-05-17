import os
import jwt
from flask import jsonify

class Auth:
    def __init__(self):
        self.jwt_secret_key = os.getenv("JWT_SECRET_KEY")
        if not self.jwt_secret_key:
            raise ValueError("Missing JWT_SECRET_KEY")

    def decode_token(self, token):
        """Decodes and validates a JWT token"""
        try:
            decoded_token = jwt.decode(token, self.jwt_secret_key, algorithms=["HS256"])
            user_id = decoded_token.get("sub")
            
            if not user_id:
                return jsonify({
                    'success': False,
                    'error': 'Invalid token format (missing sub)'
                }), 401
            
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

    def get_user_id_from_request(self, request):
        """Extracts user ID from request Authorization header"""
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({
                'success': False,
                'error': 'Authorization token missing or malformed'
            }), 401
        
        token = auth_header.split(" ")[1]
        return self.decode_token(token)