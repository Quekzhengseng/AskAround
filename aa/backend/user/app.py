# user_service.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from datetime import datetime, timezone
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
print("Supabase initialized for User Service!")

@app.route('/user/<id>', methods=['GET'])
def get_specific_user_data(id):
    """Endpoint to retrieve the specific user's data"""
    try:
        response = supabase.table('users').select("*").eq('UID', id).execute()
        
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

@app.route('/user/savedquestion/<id>', methods=['GET'])
def get_saved_questions(id):
    """Endpoint to retrieve the specific user's saved questions"""
    try:
        response = supabase.table('users').select("saved_questions").eq('UID', id).execute()
        
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

@app.route('/user/<id>/<num>', methods=['DELETE'])
def delete_specific_saved_question(id, num):
    """Endpoint to delete a particular saved question"""
    try:
        response = supabase.table('users').select("*").eq('UID', id).execute()
        
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        user_data = response.data[0]

        index = int(num)

        saved_questions = user_data.get("saved_questions", [])

        del saved_questions[index]

        response = supabase.table('users').update({'saved_questions': saved_questions}).eq('UID', id).execute()
        
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
        user_response = supabase.table('users').select("saved_questions").eq('UID', id).execute()
        
        new_question = {
            'question': question,
            'response': response_text,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        if not user_response.data:
            # Create new user with the question
            supabase.table('users').insert({
                'UID': id,
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
            }).eq('UID', id).execute()

        return jsonify({
            'success': True,
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
        user_response = supabase.table('users').select("to_be_answered_surveys").eq('UID', id).execute()

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
            survey_response = supabase.table('surveys').select("*").eq('survey_id', survey_id).execute()
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
    
@app.route('/user/<id>/surveys/answered', methods=['GET'])
def get_user_answered_surveys(id):
    """Endpoint to retrieve the surveys a specific user needs to answer"""
    try:
        # Get the user data
        user_response = supabase.table('users').select("answered_surveys").eq('UID', id).execute()

        if not user_response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        # Get the survey IDs to be answered
        user_data = user_response.data[0]
        answered_surveys = user_data.get('answered_surveys', [])
        survey_ids = [item['survey_id'] for item in answered_surveys if 'survey_id' in item]

        # print(survey_ids)
        
        if not survey_ids:
            # No surveys to answer
            return jsonify({
                'success': True,
                'data': []
            }), 200
        
        # Fetch the actual survey documents
        surveys = []
        
        for survey_id in survey_ids:
            survey_response = supabase.table('surveys').select("*").eq('survey_id', survey_id).execute()
            if survey_response.data:
                surveys.append(survey_response.data[0])
        # print(surveys)
        return jsonify({
            'success': True,
            'data': surveys
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
        user_response = supabase.table('users').select("answered_surveys").eq('UID', id).execute()
        
        new_survey = {
            'survey_id': survey_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        if not user_response.data:
            # Create new user with the answered survey
            supabase.table('users').insert({
                'UID': id,
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
            }).eq('UID', id).execute()

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/user/next/<id>', methods=['PUT'])
def change_points(id):
    """Endpoint to change the points of the user based on the question or survey completion"""
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
        survey_response = supabase.table('surveys').select("*").eq('survey_id', survey_id).execute()

        if not survey_response.data:
            return jsonify({
                'success': False,
                'error': f"Survey with id {survey_id} not found."
            }), 404
            
        survey_data = survey_response.data[0]
        
        # Check if this is a survey completion request (special case)
        if question_id == "survey_completion":
            # Calculate total points from all questions in the survey
            total_points = sum(question.get('points', 0) for question in survey_data.get('questions', []))
            
            # Get user data
            user_response = supabase.table('users').select("points").eq('UID', id).execute()

            if not user_response.data:
                return jsonify({
                    'success': False,
                    'error': f"User with id {id} not found."
                }), 404
                
            # Update points
            user_data = user_response.data[0]
            current_points = user_data.get("points", 0)
            new_points = current_points + total_points
            
            # Update user
            update_response = supabase.table('users').update({
                'points': new_points
            }).eq('UID', id).execute()

            return jsonify({
                'success': True,
                'message': f"User {id} awarded {total_points} points for completing survey",
                'points': new_points
            }), 200
        
        # Original behavior for individual questions
        else:
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
            user_response = supabase.table('users').select("points").eq('UID', id).execute()

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
            }).eq('UID', id).execute()

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

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "user"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)