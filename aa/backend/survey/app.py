import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv


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

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials")

supabase = create_client(supabase_url, supabase_key)
# # Import utility functions for Supabase
# from utils_supabase import upload_survey, clear_supabase

# # Clear Supabase before initializing
# clear_supabase(supabase)

# # Populate Supabase with sample survey data
# upload_survey(supabase)

# print("Supabase initialized successfully for Surveys!")

def retrieve_all_surveys():
    """Retrieve all surveys from Supabase"""
    response = supabase.table("surveys").select("*").execute()
    if hasattr(response, 'error') and response.error:
        raise Exception(f"Error retrieving surveys: {response.error}")
    return response.data

@app.route('/survey', methods=['GET'])
def get_all_surveys():    
    """Endpoint to retrieve all surveys"""
    try:
        survey_data = retrieve_all_surveys()
        return jsonify({
            'success': True,
            'data': survey_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/survey/<id>', methods=['GET'])
def get_survey(id):
    """Endpoint to retrieve a specific survey"""
    try:
        response = supabase.table("surveys").select("*").eq('survey_id', id).execute()
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'Survey not found'
            }), 404
        return jsonify({
            'success': True,
            'data': response.data[0]
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "survey"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5000)