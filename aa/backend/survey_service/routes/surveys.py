# survey_service/routes/surveys.py
from flask import Blueprint, request
from shared.db import Database

# Initialize database connection
db = Database()

survey_bp = Blueprint('surveys', __name__)

@survey_bp.route('/survey', methods=['GET'])
def get_all_surveys():    
    """Endpoint to retrieve all surveys"""
    try:
        survey_data = db.get_all_surveys()
        return db.format_response(True, survey_data)
    except Exception as e:
        return db.format_response(False, error=str(e), status_code=500)

@survey_bp.route('/survey/<id>', methods=['GET'])
def get_survey(id):
    """Endpoint to retrieve a specific survey"""
    try:
        survey_data = db.get_survey_by_id(id)
        
        if not survey_data:
            return db.format_response(False, error='Survey not found', status_code=404)
            
        return db.format_response(True, survey_data)
    except Exception as e:
        return db.format_response(False, error=str(e), status_code=500)