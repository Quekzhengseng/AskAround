import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
import jwt
from datetime import datetime, timezone, timedelta
import traceback

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
jwt_secret_key = os.getenv("JWT_SECRET_KEY")

if not supabase_url or not supabase_key or not jwt_secret_key:
    raise ValueError("Missing Supabase credentials or JWT Secret Key")

supabase = create_client(supabase_url, supabase_key)

def decode(token):
    try:
        # ✅ Verify token signature and decode
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

@app.route('/recsys', methods=['POST'])
def recsys():
    """Endpoint to recommend surveys to users"""
    # 🔐 Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'success': False,
            'error': 'Authorization token missing or malformed'
        }), 401
    
    # Get token from header
    token = auth_header.split(" ")[1]

    # Call decode and check if it returned an error response
    result = decode(token)
    if isinstance(result, tuple):
        return result  # This is an error response
        
    user_id = result  # This is the successfully decoded user_id

    try:
        request_data = request.get_json()

        survey_id = request_data["survey_id"]

        # First check if survey exists
        survey_response = supabase.table('surveys').select("*").eq('survey_id', survey_id).execute()
        if not survey_response.data:
            return jsonify({
                'success': False,
                'error': f"Survey with id {survey_id} not found."
            }), 404
        
        # INCLUDE RECSYS SYSTEM HERE, for now skip this to recommend to x amount of users
        
        # Retrieve num of users to propagate the survey to, change default to 0 once in production
        num_users = survey_response[0].get("num_users", 50)

        # Get random users from the database
        user_response = supabase.table('users') \
            .select("*") \
            .order('random()') \
            .limit(num_users) \
            .execute()
        
        users = user_response.data
        
        for user in users:
            

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "authentication"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5008)