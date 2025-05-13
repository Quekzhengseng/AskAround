# user_service.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from datetime import datetime, timezone
import jwt
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
jwt_secret_key = os.getenv("JWT_SECRET_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials")

supabase = create_client(supabase_url, supabase_key)
print("Supabase initialized for User Service!")

#Helper Functions
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

@app.route('/user', methods=['GET'])
def get_specific_user_data():
    """Endpoint to retrieve the specific user's data"""
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
        response = supabase.table('users').select("*").eq('UID', user_id).execute()
        
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

@app.route('/user/savedquestion', methods=['GET'])
def get_saved_questions():
    """Endpoint to retrieve the specific user's saved questions"""
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
        response = supabase.table('users').select("saved_questions").eq('UID', user_id).execute()
        
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

@app.route('/user/<num>', methods=['DELETE'])
def delete_specific_saved_question(num):
    """Endpoint to delete a particular saved question"""
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
        response = supabase.table('users').select("*").eq('UID', user_id).execute()
        
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        user_data = response.data[0]

        index = int(num)

        saved_questions = user_data.get("saved_questions", [])

        del saved_questions[index]

        response = supabase.table('users').update({'saved_questions': saved_questions}).eq('UID', user_id).execute()
        
        return jsonify({
            'success': True,
            'data': saved_questions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/user/add', methods=['PUT'])
def add_to_responded():
    """Endpoint to add to specific user's questions answered databank to be saved"""
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

        question = request_data["question"]
        response_text = request_data["answer"]

        # First check if the user exists
        user_response = supabase.table('users').select("saved_questions").eq('UID', user_id).execute()
        
        new_question = {
            'question': question,
            'response': response_text,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        if not user_response.data:
            # Create new user with the question
            supabase.table('users').insert({
                'UID': user_id,
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
            }).eq('UID', user_id).execute()

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/user/surveys/to-answer', methods=['GET'])
def get_user_to_be_answered_surveys():
    """Endpoint to retrieve the surveys a specific user needs to answer"""
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
        # Get the user data
        user_response = supabase.table('users').select("to_be_answered_surveys").eq('UID', user_id).execute()

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
    
@app.route('/user/surveys/answered', methods=['GET'])
def get_user_answered_surveys():
    """Endpoint to retrieve the surveys a specific user needs to answer"""
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
        # Get the user data
        user_response = supabase.table('users').select("answered_surveys").eq('UID', user_id).execute()

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


@app.route('/user', methods=['PUT'])
def add_answered_surveys():
    """Endpoint to add the specific user's answered survey databank to track survey movement"""
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
        
    user_id = result 

    try:
        request_data = request.get_json()
        survey_id = request_data["survey_id"]

        # Fetch user data for both answered_surveys and to_be_answered_surveys
        user_response = supabase.table('users').select("answered_surveys,to_be_answered_surveys").eq('UID', user_id).execute()
        
        if not user_response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        # Get user data
        user_data = user_response.data[0]
        
        # Add to answered surveys
        new_survey = {
            'survey_id': survey_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Get current answered surveys
        answered_surveys = user_data.get('answered_surveys', [])
        
        # Add new survey
        answered_surveys.append(new_survey)
        
        # Get current to_be_answered_surveys
        to_be_answered = user_data.get('to_be_answered_surveys', [])
        
        # Filter out the survey we're marking as answered
        to_be_answered = [item for item in to_be_answered if item.get('survey_id') != survey_id]
        
        # Update user with both changes
        supabase.table('users').update({
            'answered_surveys': answered_surveys,
            'to_be_answered_surveys': to_be_answered
        }).eq('UID', user_id).execute()

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/user/next', methods=['PUT'])
def change_points():
    """Endpoint to change the points of the user based on the question or survey completion"""
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

        if not request_data or 'survey_id' not in request_data or 'question_id' not in request_data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: survey_id or question_id'
            }), 400

        survey_id = request_data["survey_id"]
        question_id = request_data["question_id"]

        # Check if survey was done before
        

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
            user_response = supabase.table('users').select("points").eq('UID', user_id).execute()

            if not user_response.data:
                return jsonify({
                    'success': False,
                    'error': f"User with id {user_id} not found."
                }), 404
                
            # Update points
            user_data = user_response.data[0]
            current_points = user_data.get("points", 0)
            new_points = current_points + total_points
            
            # Update user
            update_response = supabase.table('users').update({
                'points': new_points
            }).eq('UID', user_id).execute()

            return jsonify({
                'success': True,
                'message': f"User {user_id} awarded {total_points} points for completing survey",
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
            user_response = supabase.table('users').select("points").eq('UID', user_id).execute()

            if not user_response.data:
                return jsonify({
                    'success': False,
                    'error': f"User with id {user_id} not found."
                }), 404
                
            # Update points
            user_data = user_response.data[0]
            current_points = user_data.get("points", 0)
            new_points = current_points + points
            
            # Update user
            update_response = supabase.table('users').update({
                'points': new_points
            }).eq('UID', user_id).execute()

            return jsonify({
                'success': True,
                'message': f"User {user_id} updated with points",
                'points': new_points
            }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/addSurveys', methods=['POST'])
def add_to_be_answered_surveys():
    """Endpoint to add survey to specific user's to be answered survey databank to track survey movement"""
    try:
        request_data = request.get_json()
        user_id = request_data.get("user_id")
        survey_id = request_data.get("survey.id")

        # Fetch user data for both answered_surveys and to_be_answered_surveys
        user_response = supabase.table('users').select("to_be_answered_surveys").eq('UID', user_id).execute()
        
        if not user_response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Get user data
        user_data = user_response.data[0]
        
        # Get current to_be_answered_surveys
        to_be_answered = user_data.get('to_be_answered_surveys', [])
        
        # Filter out the survey we're marking as answered
        to_be_answered.append(survey_id)
        
        # Update user with both changes
        supabase.table('users').update({
            'to_be_answered_surveys': to_be_answered
        }).eq('UID', user_id).execute()

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    
@app.route('/deleteAccount', methods=['DELETE'])
def delete_user_data():
    """
    Delete all data related to a specific user across all tables
    
    Args:
        supabase: Initialized Supabase client
        user_id: The user's UID to delete
    
    Returns:
        dict: Result with success status and details
    """
    results = {
        "success": True,
        "details": {}
    }

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
        # 1. Delete from answer-rag table
        answer_rag_result = supabase.table('answer-rag').delete().eq('uid_fk', user_id).execute()
        results["details"]["answer_rag_deleted"] = len(answer_rag_result.data) if answer_rag_result.data else 0
        
        # 2. Delete from responses table
        responses_result = supabase.table('responses').delete().eq('UID_fk', user_id).execute()
        results["details"]["responses_deleted"] = len(responses_result.data) if responses_result.data else 0
        
        # 3. Delete any blacklisted tokens
        token_result = supabase.table('token_blacklist').delete().eq('user_id', user_id).execute()
        results["details"]["tokens_deleted"] = len(token_result.data) if token_result.data else 0
        
        # 4. Delete from users table
        user_result = supabase.table('users').delete().eq('UID', user_id).execute()
        results["details"]["user_deleted"] = len(user_result.data) if user_result.data else 0
        
        # 5. Delete user from auth table - requires service role key
        try:
            auth_result = supabase.auth.admin.delete_user(user_id)
            results["details"]["auth_deleted"] = True
        except Exception as auth_error:
            results["details"]["auth_deletion_error"] = str(auth_error)
            # Continue with the process even if auth deletion fails
        
        return results
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "details": results.get("details", {})
        }
    
@app.route('/useCredit', methods=['POST'])
def useCredit():
    """Endpoint to subtract credit from a user"""
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
        quantity = request_data.get("quantity")

        # Fetch user data for both answered_surveys and to_be_answered_surveys
        user_response = supabase.table('users').select("credit").eq('UID', user_id).execute()
        
        if not user_response.data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Get user data
        user_data = user_response.data[0]
        
        # Get current user credit
        credit = user_data.get('credit') - quantity 
        
        # Update user with new credit
        supabase.table('users').update({
            'credit': credit
        }).eq('UID', user_id).execute()

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
    return jsonify({"status": "healthy", "service": "user"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)