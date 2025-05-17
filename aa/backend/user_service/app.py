# app.py
import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Import route modules
from routes.user_profile import user_profile_bp
from routes.survey_management import survey_management_bp
from routes.saved_questions import saved_questions_bp
from routes.account import account_bp

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure CORS
    CORS(app, resources={r"/*": {
        "origins": "*",  
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }})
    
    # Register blueprints
    app.register_blueprint(user_profile_bp)
    app.register_blueprint(survey_management_bp)
    app.register_blueprint(saved_questions_bp)
    app.register_blueprint(account_bp)
    
    # Health check endpoint
    @app.route('/health', methods=['GET'])
    def health_check():
        return {"status": "healthy", "service": "user"}
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', debug=True, port=5001)