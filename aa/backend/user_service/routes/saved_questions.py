# routes/saved_questions.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from utils.auth import get_user_id_from_request
from utils.db import supabase, get_user_by_id

saved_questions_bp = Blueprint('saved_questions', __name__)

@saved_questions_bp.route('/user/savedquestion', methods=['GET'])
def get_saved_questions():
    """Endpoint to retrieve the specific user's saved questions"""
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id

    try:
        # Get user data with only the saved_questions field
        user_data = get_user_by_id(user_id, "saved_questions")
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        # Get the saved questions or an empty list if none
        saved_questions = user_data.get("saved_questions", [])
        
        return jsonify({
            'success': True,
            'data': saved_questions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@saved_questions_bp.route('/user/<num>', methods=['DELETE'])
def delete_specific_saved_question(num):
    """Endpoint to delete a particular saved question"""
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id

    try:
        # Get user data
        user_data = get_user_by_id(user_id, "saved_questions")
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        index = int(num)
        saved_questions = user_data.get("saved_questions", [])

        # Delete the question at the specified index
        del saved_questions[index]

        # Update user data
        supabase.table('users').update({'saved_questions': saved_questions}).eq('UID', user_id).execute()
        
        return jsonify({
            'success': True,
            'data': saved_questions
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@saved_questions_bp.route('/user/add', methods=['PUT'])
def add_to_responded():
    """Endpoint to add to specific user's questions answered databank to be saved"""
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id

    try:
        request_data = request.get_json()
        question = request_data["question"]
        response_text = request_data["answer"]

        # First check if the user exists
        user_data = get_user_by_id(user_id, "saved_questions")
        
        new_question = {
            'question': question,
            'response': response_text,
            'timestamp': datetime.now(timezone.utc).isoformat()
        }

        if not user_data:
            # Create new user with the question
            supabase.table('users').insert({
                'UID': user_id,
                'saved_questions': [new_question]
            }).execute()
        else:
            # Get current saved questions
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