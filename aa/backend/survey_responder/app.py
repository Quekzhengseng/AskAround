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

scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

# In your Flask app
CORS(app, resources={r"/*": {
    "origins": "*",  
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")

supabase = create_client(supabase_url, supabase_key)
print("Supabase initialized successfully for Surveys!")

# Import utility functions for Supabase
from utils_supabase import upload_survey, clear_supabase

# Clear Supabase before initializing
clear_supabase(supabase)

# Populate Supabase with sample survey data
upload_survey(supabase)

"""Helper Functions"""

def retrieve_all_surveys():
    """Retrieve all surveys from Supabase"""
    response = supabase.table("surveys").select("*").execute()
    if hasattr(response, 'error') and response.error:
        raise Exception(f"Error retrieving surveys: {response.error}")
    return response.data

"""API End Points"""
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

@app.route('/user/<id>', methods=['GET'])
def get_specific_user_data(id):
    """Endpoint to retrieve the specific user's data"""
    try:
        response = supabase.table('users').select("*").eq('id', id).execute()
        
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        # Return the first (and should be only) user data
        user_data = response.data[0]
        
        return jsonify({
            'success': True,
            'data': user_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/user/<id>/<num>', methods=['DELETE'])
def delete_specific_saved_question(id, num):
    """Endpoint to delete a particular saved question"""
    try:
        response = supabase.table('users').select("*").eq('id', id).execute()
        
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        user_data = response.data[0]

        index = int(num)

        saved_questions = user_data.get("saved_questions", [])

        del saved_questions[index]

        response = supabase.table('users').update({'saved_questions': saved_questions}).eq('id', id).execute()
        
        return jsonify({
            'success': True,
            'data': saved_questions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/user/savedquestion/<id>', methods=['GET'])
def get_saved_questions(id):
    """Endpoint to retrieve the specific user's saved questions"""
    try:
        response = supabase.table('users').select("saved_questions").eq('id', id).execute()
        
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        # Get the saved questions or an empty list if none
        saved_questions = response.data[0].get("saved_questions", [])
        
        return jsonify({
            'success': True,
            'data': saved_questions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/user/add/<id>', methods=['PUT'])
def add_to_responded(id):
    """Endpoint to add to specific user's questions answered databank to be saved"""
    try:
        request_data = request.get_json()

        question = request_data["question"]
        response_text = request_data["answer"]

        # First check if the user exists
        user_response = supabase.table('users').select("saved_questions").eq('id', id).execute()
        
        new_question = {
            'question': question,
            'response': response_text,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        if not user_response.data:
            # Create new user with the question
            supabase.table('users').insert({
                'id': id,
                'saved_questions': [new_question]
            }).execute()
        else:
            # Get current saved questions
            user_data = user_response.data[0]
            saved_questions = user_data.get('saved_questions', [])
            
            # Add new question
            saved_questions.append(new_question)
            
            # Update user
            supabase.table('users').update({
                'saved_questions': saved_questions
            }).eq('id', id).execute()

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    

@app.route('/user/<id>', methods=['PUT'])
def add_answered_surveys(id):
    """Endpoint to add the specific user's answered survey databank to track survey movement"""
    try:
        request_data = request.get_json()
        survey_id = request_data["survey_id"]

        # Check if user exists
        user_response = supabase.table('users').select("answered_surveys").eq('id', id).execute()
        
        new_survey = {
            'survey_id': survey_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        if not user_response.data:
            # Create new user with the answered survey
            supabase.table('users').insert({
                'id': id,
                'answered_surveys': [new_survey]
            }).execute()
        else:
            # Get current answered surveys
            user_data = user_response.data[0]
            answered_surveys = user_data.get('answered_surveys', [])
            
            # Add new survey
            answered_surveys.append(new_survey)
            
            # Update user
            supabase.table('users').update({
                'answered_surveys': answered_surveys
            }).eq('id', id).execute()

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/user/move/<id>', methods=['PUT'])
def remove_answered_surveys(id):
    """Endpoint to move a survey from to-be-answered to answered surveys for a specific user"""
    try:
        request_data = request.get_json()

        if not request_data or 'survey_id' not in request_data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: survey_id'
            }), 400

        survey_id = request_data["survey_id"]
        
        # Get user data
        user_response = supabase.table('users').select("*").eq('id', id).execute()
        
        new_answered_survey = {
            'survey_id': survey_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        if not user_response.data:
            # Create new user with the answered survey
            supabase.table('users').insert({
                'id': id,
                'answered_surveys': [new_answered_survey],
                'to_be_answered_surveys': []
            }).execute()
        else:
            # Get current data
            user_data = user_response.data[0]
            
            # Update answered surveys array
            answered_surveys = user_data.get('answered_surveys', [])
            answered_surveys.append(new_answered_survey)
            
            # Update to_be_answered_surveys array
            to_be_answered = user_data.get('to_be_answered_surveys', [])
            updated_to_be_answered = [
                survey for survey in to_be_answered 
                if survey.get('survey_id') != survey_id
            ]
            
            # Update user
            supabase.table('users').update({
                'answered_surveys': answered_surveys,
                'to_be_answered_surveys': updated_to_be_answered
            }).eq('id', id).execute()

        return jsonify({
            'success': True,
            'message': f"Survey {survey_id} marked as answered for user {id}"
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/user/<id>/surveys/to-answer', methods=['GET'])
def get_user_to_be_answered_surveys(id):
    """Endpoint to retrieve the surveys a specific user needs to answer"""
    try:
        # Get the user data
        user_response = supabase.table('users').select("to_be_answered_surveys").eq('id', id).execute()

        if not user_response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        # Get the survey IDs to be answered
        user_data = user_response.data[0]
        to_be_answered = user_data.get('to_be_answered_surveys', [])
        survey_ids = [item['survey_id'] for item in to_be_answered if 'survey_id' in item]
        
        if not survey_ids:
            # No surveys to answer
            return jsonify({
                'success': True,
                'data': []
            }), 200
        
        # Fetch the actual survey documents
        surveys = []
        
        for survey_id in survey_ids:
            survey_response = supabase.table('surveys').select("*").eq('id', survey_id).execute()
            if survey_response.data:
                surveys.append(survey_response.data[0])
        
        return jsonify({
            'success': True,
            'data': surveys
        }), 200
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    

@app.route('/user/next/<id>', methods=['PUT'])
def change_points(id):
    """Endpoint to change the points of the user based on the question answered"""
    try:
        request_data = request.get_json()

        if not request_data or 'survey_id' not in request_data or 'question_id' not in request_data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: survey_id or question_id'
            }), 400

        survey_id = request_data["survey_id"]
        question_id = request_data["question_id"]

        # Get the survey
        survey_response = supabase.table('surveys').select("*").eq('id', survey_id).execute()

        if not survey_response.data:
            return jsonify({
                'success': False,
                'error': f"Survey with id {survey_id} not found."
            }), 404
            
        survey_data = survey_response.data[0]
        
        # Find the question and get points
        points = None
        for question in survey_data.get('questions', []):
            if question.get('id') == question_id:
                points = question.get('points')
                break
                
        if points is None:
            return jsonify({
                'success': False,
                'error': f"Question with id {question_id} not found in survey {survey_id}."
            }), 404

        # Get user data
        user_response = supabase.table('users').select("points").eq('id', id).execute()

        if not user_response.data:
            return jsonify({
                'success': False,
                'error': f"User with id {id} not found."
            }), 404
            
        # Update points
        user_data = user_response.data[0]
        current_points = user_data.get("points", 0)
        new_points = current_points + points
        
        # Update user
        update_response = supabase.table('users').update({
            'points': new_points
        }).eq('id', id).execute()

        return jsonify({
            'success': True,
            'message': f"User {id} updated with points",
            'points': new_points
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

#Voucher API

@app.route('/voucher', methods=['GET'])
def get_vouchers():
    """Endpoint to retrieve voucher data"""
    try:
        response = supabase.table('vouchers').select("*").execute()
        
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'Vouchers not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': response.data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"})

"""Scheduled Cron Jobs"""
@scheduler.task('cron', id='update_user_surveys', minute='*/1')
def update_user_surveys():
    """Job that runs every 1 minute to update users' to-be-answered survey lists"""
    try:
        print("Running scheduled task to update user surveys...")
        
        # Get all available surveys
        surveys_response = supabase.table('surveys').select("id").execute()
        all_survey_ids = [survey["id"] for survey in surveys_response.data]
        
        # Get all users
        users_response = supabase.table('users').select("id,answered_surveys").execute()
        
        for user in users_response.data:
            user_id = user["id"]
            
            # Get the list of surveys this user has already answered
            answered_surveys = []
            if 'answered_surveys' in user and user['answered_surveys']:
                answered_surveys = [survey_item['survey_id'] for survey_item in user.get('answered_surveys', [])]
            
            # Find surveys the user hasn't answered yet
            to_be_answered = [survey_id for survey_id in all_survey_ids if survey_id not in answered_surveys]
            
            # Update the user's to_be_answered_surveys field
            supabase.table('users').update({
                'to_be_answered_surveys': [{'survey_id': survey_id} for survey_id in to_be_answered]
            }).eq('id', user_id).execute()
            
        print(f"Successfully updated to-be-answered surveys for {len(users_response.data)} users")
        
    except Exception as e:
        print(f"Error updating user surveys: {str(e)}")


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)