import os
import uuid
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_apscheduler import APScheduler
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv
from postgrest.exceptions import APIError

# Load environment variables
load_dotenv()

app = Flask(__name__)

# CORS Setup (keep as is)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Initialize Supabase (keep as is)
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials.")
supabase = create_client(supabase_url, supabase_key)
print("Supabase initialized successfully for Responses Service!")


# --- Helper Functions ---
def is_valid_uuid(uuid_to_test, version=4):
    """ Check if uuid_to_test is a valid UUID. """
    try:
        uuid_obj = uuid.UUID(uuid_to_test, version=version)
    except ValueError:
        return False
    return str(uuid_obj) == uuid_to_test

def _check_or_create_user(uid_from_request):
    """ Checks/creates user. Returns UID string, or (error_message, status_code) tuple."""
    if not uid_from_request or uid_from_request.strip() == "": # More robust check for blank
        new_uid = str(uuid.uuid4())
        print(f"Blank UID received. Generating new UID: {new_uid}")
        try:
            new_user_data = {'UID': new_uid, 'username': f'anon_{new_uid[:8]}'} # Adjust schema as needed
            insert_user_response = supabase.table('users').insert(new_user_data).execute()
            if hasattr(insert_user_response, 'error') and insert_user_response.error:
                print(f"Failed to insert new user {new_uid}: {insert_user_response.error.message}")
                return "Database error creating user", 500
            print(f"Successfully created new user: {new_uid}")
            return new_uid
        except Exception as e:
            print(f"Exception creating new user {new_uid}: {e}")
            return "Server error creating user", 500
    else:
        if not is_valid_uuid(uid_from_request):
             print(f"Invalid UID format received: {uid_from_request}")
             return "Invalid UID format", 400
        try:
            user_check = supabase.table("users").select("UID", count='exact').eq("UID", uid_from_request).execute()
            if hasattr(user_check, 'error') and user_check.error:
                print(f"Database error checking user {uid_from_request}: {user_check.error.message}")
                return "Database error checking user", 500
            if user_check.count == 0:
                print(f"Provided non-blank UID not found: {uid_from_request}")
                return "User not found", 404
            return uid_from_request
        except Exception as e:
            print(f"Exception checking user {uid_from_request}: {e}")
            return "Server error checking user", 500

# --- API Endpoints ---

@app.route('/responses', methods=['GET'])
def get_all_responses():
    """Endpoint to retrieve ALL survey responses"""
    try:
        response = supabase.table("responses").select("*").execute()
        if hasattr(response, 'error') and response.error:
            # Log minimal error for server admin
            print(f"DB Error GET /responses: {response.error.message}")
            return jsonify({'success': False, 'error': "Database error retrieving responses"}), 500

        return jsonify({'success': True, 'data': response.data}), 200
    except Exception as e:
        print(f"Server Error GET /responses: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': "An unexpected server error occurred"}), 500

@app.route('/responses', methods=['POST'])
def create_response():
    """Create a new response. Creates user if UID is blank."""
    try:
        data = request.json
        if not data or 'survey_id' not in data or 'UID' not in data or 'answers' not in data:
            return jsonify({'success': False, 'error': 'Missing required fields: survey_id, UID, or answers'}), 400

        survey_id = data['survey_id']
        uid_from_request = data['UID']
        answers = data['answers']

        if not is_valid_uuid(survey_id):
            return jsonify({'success': False, 'error': 'Invalid survey_id format'}), 400

        user_check_result = _check_or_create_user(uid_from_request)
        if isinstance(user_check_result, tuple):
            error_message, status_code = user_check_result
            return jsonify({'success': False, 'error': error_message}), status_code
        final_uid = user_check_result

        response_data = {
            'survey_id_fk': survey_id,
            'UID_fk': final_uid,
            'answers': answers,
        }

        # --- CORRECTED INSERT AND ERROR HANDLING ---
        try:
            # Attempt the insert
            insert_response = supabase.table('responses').insert(response_data).execute()

            # If .execute() succeeds without raising APIError, it means insertion worked
            # (Note: The current supabase-py might not return detailed data on success,
            # but the lack of exception signifies success)

        except APIError as api_error:
             # Catch the specific APIError raised by .execute() on DB error
            print(f"DB APIError POST /responses: Code={api_error.code}, Message={api_error.message}")
            # Check if it's the unique constraint violation
            if api_error.code == '23505':
                 return jsonify({'success': False, 'error': 'Response for this survey by this user already exists'}), 409 # Return 409
            else:
                 # Handle other potential database API errors
                 return jsonify({'success': False, 'error': f"Database error: {api_error.message}"}), 500

        # Respond with success, including the final UID used/created
        return jsonify({
            'success': True,
            'data': {
                'survey_id': response_data['survey_id_fk'],
                'UID': response_data['UID_fk'], # Return the UID that was actually used
                'message': 'Response created successfully'
            }
        }), 201

    except Exception as e:
        print(f"Server Error POST /responses: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': "An unexpected server error occurred"}), 500


@app.route('/responses/survey/<survey_id>', methods=['GET'])
def get_responses_by_survey(survey_id):
    """Endpoint to retrieve all responses for a specific survey"""
    if not is_valid_uuid(survey_id):
        return jsonify({'success': False, 'error': 'Invalid survey ID format'}), 400

    try:
        # Fetch responses directly (removed pre-check for survey existence)
        response = supabase.table("responses").select("*").eq("survey_id_fk", survey_id).execute()

        if hasattr(response, 'error') and response.error:
            print(f"DB Error GET /responses/survey/{survey_id}: {response.error.message}")
            return jsonify({'success': False, 'error': "Database error retrieving responses"}), 500

        return jsonify({'success': True, 'data': response.data}), 200
    except Exception as e:
        print(f"Server Error GET /responses/survey/{survey_id}: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': "An unexpected server error occurred"}), 500


@app.route('/responses/survey/<survey_id>/user/<uid>', methods=['DELETE'])
def delete_specific_response(survey_id, uid):
    """Delete a specific response identified by survey_id and user UID"""
    if not is_valid_uuid(survey_id):
        return jsonify({'success': False, 'error': 'Invalid survey ID format'}), 400
    if not is_valid_uuid(uid):
        return jsonify({'success': False, 'error': 'Invalid UID format'}), 400

    try:
        delete_response = supabase.table('responses').delete()\
            .eq('survey_id_fk', survey_id)\
            .eq('UID_fk', uid)\
            .execute()

        if hasattr(delete_response, 'error') and delete_response.error:
            print(f"DB Error DELETE /responses/survey/{survey_id}/user/{uid}: {delete_response.error.message}")
            return jsonify({'success': False, 'error': "Database error deleting response"}), 500

        # Assume success if no error, return 200 OK
        return jsonify({'success': True, 'message': 'Response deleted successfully'}), 200

    except Exception as e:
        print(f"Server Error DELETE /responses/survey/{survey_id}/user/{uid}: {e}")
        traceback.print_exc()
        return jsonify({'success': False, 'error': "An unexpected server error occurred"}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    return jsonify({"status": "healthy"})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5101))
    # Set debug=True only if actively debugging, otherwise keep False
    app.run(host='0.0.0.0', debug=False, port=port)