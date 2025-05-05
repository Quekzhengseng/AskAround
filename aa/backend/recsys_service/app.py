import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
import jwt
from datetime import datetime, timezone, timedelta
import traceback
import requests

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
    # auth_header = request.headers.get('Authorization')
    # if not auth_header or not auth_header.startswith('Bearer '):
    #     return jsonify({
    #         'success': False,
    #         'error': 'Authorization token missing or malformed'
    #     }), 401
    
    # # Get token from header
    # token = auth_header.split(" ")[1]

    # # Call decode and check if it returned an error response
    # result = decode(token)
    # if isinstance(result, tuple):
    #     return result  # This is an error response
        
    # user_id = result  # This is the successfully decoded user_id

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
        num_users = survey_response.data[0].get("num_users", 50) 

        # Call the function to get random users
        user_response = supabase.rpc('get_random_users', {'num': num_users}).execute()

        users = user_response.data

        failed_users = []

        for user in users:
            # add to failed_users if any operation fails
            data = {
                "user_id": user.get("UID"),
                "survey_id": survey_id
            }

            # Call ai_rag service
            try:
                #To do Sidik, below is what is required for ai_rag_service API to receive the information. 
                #In recsys, pass the user_id and survey_id via a POST requests call to ai_rag_service.
                #The url is not localhost, follow docker/flask convention, it is the service_name_in_docker_compose:port-number
                # response = requests.post("http://airag-service:5000/process", json=data)
                
                if not False:
                    failed_users.append(user.get("UID"))
            except Exception as e:
                # Added error handling for request failures
                print(f"Error calling AI-RAG service for user {user.get('UID')}: {str(e)}")
                failed_users.append(user.get("UID"))

        return jsonify({
            'success': True,
            'total_users_processed': len(users),
            'failed_user_count': len(failed_users),
            'failed_users': failed_users
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
    app.run(host='0.0.0.0', debug=True, port=5006)