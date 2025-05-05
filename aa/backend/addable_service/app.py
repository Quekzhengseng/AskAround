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

@app.route('/addable', methods=['POST'])
def addable():
    """Endpoint to update responses and mark unanswered questions as addable"""
    try:
        request_data = request.get_json()
        user_id = request_data.get("user_id")
        survey_id = request_data.get("survey_id")
        
        if not user_id and not survey_id:
            return jsonify({
                'success':False,
                'error': "Missing key parameter"
            }), 400
        
        # First check if response exists
        user_response = supabase.table('responses')\
        .select("*")\
        .eq('survey_id_fk', survey_id)\
        .eq('UID_fk', user_id)\
        .execute()

        if not user_response.data:
            return jsonify({
                'success': False,
                'error': f"Response with keys not found."
            }), 404
        
        # Get the current response data
        response_data = user_response.data[0]
        
        # Get the answers array
        answers = response_data.get('answers', [])
        
        # Iterate through answers and check for empty responses
        for answer in answers:
            # Check if the response is empty
            response_value = answer.get('response')
            
            # Check different types of empty responses
            is_empty = (
                response_value is None or
                response_value == "" or
                (isinstance(response_value, list) and len(response_value) == 0)
            )
            
            # Add addable attribute if response is empty
            if is_empty:
                answer['addable'] = True
            else:
                # Make sure addable is False or not present for answered questions
                answer['addable'] = False
        
        # Update the response in the database
        update_response = supabase.table('responses').update({
            'answers': answers
        }).eq('survey_id_fk', survey_id)\
          .eq('UID_fk', user_id)\
          .execute()
        
        if not update_response.data:
            return jsonify({
                'success': False,
                'error': "Failed to update responses"
            }), 500
        
        data = {
            "user_id" : user_id,
            "survey_id" : survey_id
        }
        
        # API call to add to answered 
        response = request.post("http://user-service:5000/addSurvey", json=data)

        if not response.data:
                return jsonify({
                    'success': False,
                    'error': "Failed to transfer to to be answered survey"
                }), 500
        
        return jsonify({
            'success': True,
            'data': answers
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
    app.run(host='0.0.0.0', debug=True, port=5009)