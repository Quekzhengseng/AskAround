# routes/survey_management.py
from flask import Blueprint, request, jsonify
from datetime import datetime, timezone
from utils.auth import get_user_id_from_request
from utils.db import supabase, get_user_by_id

survey_management_bp = Blueprint('survey_management', __name__)

@survey_management_bp.route('/user/surveys/to-answer', methods=['GET'])
def get_user_to_be_answered_surveys():
    """Endpoint to retrieve the surveys a specific user needs to answer"""
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id
    
    try:
        # Get the user data
        user_data = get_user_by_id(user_id, "to_be_answered_surveys")

        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        # Get the survey IDs to be answered
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
    
@survey_management_bp.route('/user/surveys/answered', methods=['GET'])
def get_user_answered_surveys():
    """Endpoint to retrieve the surveys a specific user has already answered"""
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id

    try:
        # Get the user data
        user_data = get_user_by_id(user_id, "answered_surveys")

        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404

        # Get the survey IDs answered
        answered_surveys = user_data.get('answered_surveys', [])
        survey_ids = [item['survey_id'] for item in answered_surveys if 'survey_id' in item]
        
        if not survey_ids:
            # No answered surveys
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

@survey_management_bp.route('/user', methods=['PUT'])
def add_answered_surveys():
    """Endpoint to add a survey to a user's answered surveys and remove from to-be-answered"""
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id

    try:
        request_data = request.get_json()
        survey_id = request_data["survey_id"]

        # Fetch user data for both answered_surveys and to_be_answered_surveys
        user_data = get_user_by_id(user_id, "answered_surveys,to_be_answered_surveys")
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
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

@survey_management_bp.route('/addSurveys', methods=['POST'])
def add_to_be_answered_surveys():
    """Endpoint to add survey to specific user's to be answered survey databank"""
    try:
        request_data = request.get_json()
        user_id = request_data.get("user_id")
        survey_id = request_data.get("survey.id")

        # Fetch user data
        user_data = get_user_by_id(user_id, "to_be_answered_surveys")
        
        if not user_data:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Get current to_be_answered_surveys
        to_be_answered = user_data.get('to_be_answered_surveys', [])
        
        # Add survey to to-be-answered list
        to_be_answered.append({
            'survey_id': survey_id,
            'timestamp': datetime.now(timezone.utc).isoformat()
        })
        
        # Update user
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