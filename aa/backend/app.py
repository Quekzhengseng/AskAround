import firebase_admin
from firebase_admin import credentials, firestore
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from aa.backend.utils_firestore import upload_survey
from aa.backend.utils_firestore import clear_firestore

app = Flask(__name__)
CORS(app)

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
    doc_ref = db.collection("users")
    survey_snapshot = doc_ref.get()
    survey_list = []
    for survey in survey_snapshot:
        survey_data = survey.to_dict()
        survey_list.append(survey_data)

    return survey_list

"""API End Points"""

@app.route('/Survey', methods=['GET'])
def getAllSurveys():
    """Endpoint to retrieve all surveys"""
    survey_data = retrieveAllSurvey()
    return survey_data

@app.route('/user/<id>', methods=['POST'])
def addToResponded(id):
    """Endpoint to add to specific user's questions answered databank"""
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
                    'timestamp': firestore.SERVER_TIMESTAMP
                }]
            })
        else:
            # Update the existing user document by adding the new response
            user_ref.update({
                'responded_questions': firestore.ArrayUnion([{
                    'question': question,
                    'response': response,
                    'timestamp': firestore.SERVER_TIMESTAMP
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

@app.route('/user/<id>', methods=['POST'])
def addToResponded(id):
    """Endpoint to add to specific user's questions answered databank"""
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
                    'timestamp': firestore.SERVER_TIMESTAMP
                }]
            })
        else:
            # Update the existing user document by adding the new response
            user_ref.update({
                'responded_questions': firestore.ArrayUnion([{
                    'question': question,
                    'response': response,
                    'timestamp': firestore.SERVER_TIMESTAMP
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


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)
