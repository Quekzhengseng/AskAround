import firebase_admin
from firebase_admin import credentials, firestore
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from utils_firestore import upload_survey
from utils_firestore import clear_firestore
from flask_apscheduler import APScheduler
from datetime import datetime, timezone

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

# Load Firebase credentials
key_path = os.getenv("SURVEY_DB_KEY")
if not key_path or not os.path.isfile(key_path):
    raise FileNotFoundError(f"Could not find the Firebase JSON at {key_path}")

# Initialize Firestore
cred = credentials.Certificate(key_path)
firebase_admin.initialize_app(cred)
db = firestore.client()

print("Firestore initialized successfully for Matches!")

# Clear Firestore before initializing
clear_firestore(db)

# Populate Firestore with sample survey data
upload_survey(db)

"""Helper Functions"""

def retrieveAllSurvey():
    doc_ref = db.collection("surveys")
    survey_snapshot = doc_ref.get()
    survey_list = []
    for survey in survey_snapshot:
        survey_data = survey.to_dict()
        survey_list.append(survey_data)

    return survey_list

"""API End Points"""
@app.route('/survey', methods=['GET'])
def getAllSurveys():    
    """Endpoint to retrieve all surveys"""
    survey_data = retrieveAllSurvey()
    return jsonify({
            'success': True,
            'data' : survey_data
        }), 200


@app.route('/user/<id>', methods=['GET'])
def getAnsweredQuestions(id):
    """Endpoint to retrieve the specific user's questions answered databank"""
    try:
        user_ref = db.collection('users').document(id)
        user_doc = user_ref.get()

        # Check if the user document exists
        if not user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        # Convert document to dictionary
        user_data = user_doc.to_dict() or {}
        
        # Return the entire user data
        return jsonify({
            'success': True,
            'data': user_data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    

@app.route('/user/add/<id>', methods=['PUT'])
def addToResponded(id):
    """Endpoint to add to specific user's questions answered databank to be saved"""
    try:
        request_data = request.get_json()

        question = request_data["question"]
        response = request_data["answer"]

        user_ref = db.collection('users').document(id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            user_ref.set({
                'responded_questions': [{
                    'question': question,
                    'response': response,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }]
            })
        else:
            # Update the existing user document by adding the new response
            user_ref.update({
                'responded_questions': firestore.ArrayUnion([{
                    'question': question,
                    'response': response,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }])
            })

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    

@app.route('/user/<id>', methods=['PUT'])
def addAnsweredSurveys(id):
    """Endpoint to add the specific user's answered survey databank to track survey movement"""
    try:
        request_data = request.get_json()

        survey_id = request_data["survey_id"]

        user_ref = db.collection('users').document(id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            user_ref.set({
                'answered_surveys': [{
                    'survey_id': survey_id,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }]
            })
        else:
            # Update the existing user document by adding the new survey
            user_ref.update({
                'answered_surveys': firestore.ArrayUnion([{
                    'survey_id': survey_id,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }])
            })

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/user/move/<id>', methods=['PUT'])
def removeAnsweredSurveys(id):
    """Endpoint to move a survey from to-be-answered to answered surveys for a specific user to track survey movement"""
    try:
        request_data = request.get_json()

        if not request_data or 'survey_id' not in request_data:
            return jsonify({
                'success': False,
                'error': 'Missing required field: survey_id'
            }), 400

        survey_id = request_data["survey_id"]

        user_ref = db.collection('users').document(id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            # If user doesn't exist, create a new document
            user_ref.set({
                'answered_surveys': [{
                    'survey_id': survey_id,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }],
                'to_be_answered_surveys': []
            })
        else:
            # Get the current user data
            user_data = user_doc.to_dict()
            
            # Add to answered_surveys array
            user_ref.update({
                'answered_surveys': firestore.ArrayUnion([{
                    'survey_id': survey_id,
                    'timestamp': datetime.now(timezone.utc).isoformat()
                }])
            })
            
            # Remove from to_be_answered_surveys array if it exists
            to_be_answered = user_data.get('to_be_answered_surveys', [])
            updated_to_be_answered = [
                survey for survey in to_be_answered 
                if survey.get('survey_id') != survey_id
            ]
            
            user_ref.update({
                'to_be_answered_surveys': updated_to_be_answered
            })

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
def getUserToBeAnsweredSurveys(id):
    """Endpoint to retrieve the surveys a specific user needs to answer"""
    try:
        # Get the user document
        user_ref = db.collection('users').document(id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
            
        # Get the user data
        user_data = user_doc.to_dict()
        
        # Get the IDs of surveys to be answered
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
        surveys_ref = db.collection('surveys')
        
        for survey_id in survey_ids:
            survey_doc = surveys_ref.document(survey_id).get()
            if survey_doc.exists:
                survey_data = survey_doc.to_dict()
                # Add the ID to the survey data
                survey_data['id'] = survey_doc.id
                surveys.append(survey_data)
        
        return jsonify({
            'success': True,
            'data': surveys
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
        surveys_ref = db.collection('surveys')
        surveys_snapshot = surveys_ref.get()
        all_survey_ids = [doc.id for doc in surveys_snapshot]
        
        # Get all users
        users_ref = db.collection('users')
        users_snapshot = users_ref.get()
        
        for user_doc in users_snapshot:
            user_data = user_doc.to_dict()
            user_id = user_doc.id
            
            # Get the list of surveys this user has already answered
            answered_surveys = []
            if 'answered_surveys' in user_data:
                answered_surveys = [survey_item['survey_id'] for survey_item in user_data.get('answered_surveys', [])]
            
            # Find surveys the user hasn't answered yet
            to_be_answered = [survey_id for survey_id in all_survey_ids if survey_id not in answered_surveys]
            
            # Update the user's to_be_answered_surveys field
            user_ref = users_ref.document(user_id)
            
            # You can either replace the entire list:
            user_ref.update({
                'to_be_answered_surveys': [{'survey_id': survey_id} for survey_id in to_be_answered]
            })
            
        print(f"Successfully updated to-be-answered surveys for {len(users_snapshot)} users")
        
    except Exception as e:
        print(f"Error updating user surveys: {str(e)}")


if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)
