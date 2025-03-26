import firebase_admin
from firebase_admin import credentials, firestore
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from populate_firestore import upload_survey

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
def clear_firestore():
    collections = db.collections()
    for collection in collections:
        docs = collection.stream()
        for doc in docs:
            doc.reference.delete()
    print("Firestore cleared successfully!")

clear_firestore()

# Populate Firestore with sample survey data
upload_survey(db)

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5001)
