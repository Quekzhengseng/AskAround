# routes/user_profile.py
from flask import Blueprint, request, jsonify
from utils.auth import get_user_id_from_request
from utils.db import supabase, get_user_by_id

user_profile_bp = Blueprint('user_profile', __name__)

@user_profile_bp.route('/user', methods=['GET'])
def get_specific_user_data():
    """Endpoint to retrieve the specific user's data"""
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id

    try:
        # Fetch user data
        user_data = get_user_by_id(user_id)
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': user_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@user_profile_bp.route('/user/next', methods=['PUT'])
def change_points():
    """Endpoint to change the points of the user based on the question or survey completion"""
    # Get user ID from token
    result = get_user_id_from_request(request)
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
            user_data = get_user_by_id(user_id, "points")

            if not user_data:
                return jsonify({
                    'success': False,
                    'error': f"User with id {user_id} not found."
                }), 404
                
            # Update points
            current_points = user_data.get("points", 0)
            new_points = current_points + total_points
            
            # Update user
            supabase.table('users').update({
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
            user_data = get_user_by_id(user_id, "points")

            if not user_data:
                return jsonify({
                    'success': False,
                    'error': f"User with id {user_id} not found."
                }), 404
                
            # Update points
            current_points = user_data.get("points", 0)
            new_points = current_points + points
            
            # Update user
            supabase.table('users').update({
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

@user_profile_bp.route('/useCredit', methods=['POST'])
def use_credit():
    """Endpoint to subtract credit from a user"""
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id

    try:
        request_data = request.get_json()
        quantity = request_data.get("quantity")

        # Fetch user data
        user_data = get_user_by_id(user_id, "credit")
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Calculate new credit balance
        credit = user_data.get('credit', 0) - quantity 
        
        # Update user with new credit balance
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