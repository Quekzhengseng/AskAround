# scheduler_service.py
import os
import time
import requests
from flask import Flask, jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler
from supabase import create_client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
scheduler = APScheduler()
scheduler.init_app(app)
scheduler.start()

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
print("Supabase initialized for Scheduler Service!")

@scheduler.task('cron', id='update_user_surveys', minute='*/1')
def update_user_surveys():
    """Job that runs every 1 minute to update users' to-be-answered survey lists"""
    try:
        print("Running scheduled task to update user surveys...")
        
        # Get all available surveys
        surveys_response = supabase.table('surveys').select("survey_id").execute()
        all_survey_ids = [survey["survey_id"] for survey in surveys_response.data]
        
        # Get all users
        users_response = supabase.table('users').select("UID,answered_surveys").execute()
        
        for user in users_response.data:
            user_id = user["UID"]
            
            # Get the list of surveys this user has already answered
            answered_surveys = []
            if 'answered_surveys' in user and user['answered_surveys']:
                answered_surveys = [survey_item['survey_id'] for survey_item in user.get('answered_surveys', [])]
            
            # Find surveys the user hasn't answered yet
            to_be_answered = [survey_id for survey_id in all_survey_ids if survey_id not in answered_surveys]
            
            # Update the user's to_be_answered_surveys field
            supabase.table('users').update({
                'to_be_answered_surveys': [{'survey_id': survey_id} for survey_id in to_be_answered]
            }).eq('UID', user_id).execute()
            
        print(f"Successfully updated to-be-answered surveys for {len(users_response.data)} users")
        
    except Exception as e:
        print(f"Error updating user surveys: {str(e)}")

@app.route('/scheduler/status', methods=['GET'])
def get_scheduler_status():
    """Endpoint to check the status of scheduled jobs"""
    jobs = scheduler.get_jobs()
    job_details = [{"id": job.id, "next_run_time": str(job.next_run_time)} for job in jobs]
    return jsonify({
        "success": True,
        "data": {
            "active_jobs": len(jobs),
            "jobs": job_details
        }
    })

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "scheduler"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5003)