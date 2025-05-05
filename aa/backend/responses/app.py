import os
import uuid
import traceback
import jwt
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
from postgrest.exceptions import APIError

# --- Constants and Setup ---
load_dotenv()
app = Flask(__name__)
CORS(app, resources={r"/*": { "origins": "*", "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not supabase_url or not supabase_key or not JWT_SECRET_KEY:
    raise ValueError("Missing Supabase credentials or JWT Secret Key")
supabase = create_client(supabase_url, supabase_key)
print("Supabase initialized successfully for Responses Service!")


# --- Helper Functions ---
def is_valid_uuid(uuid_to_test, version=4):
    try:
        uuid.UUID(str(uuid_to_test), version=version)
        return True
    except (ValueError, TypeError): return False

def _check_or_create_user(uid_from_request):
    """ Creates guest user if uid_from_request is blank. Returns UID or error tuple."""
    if not uid_from_request or uid_from_request.strip() == "":
        new_uid = str(uuid.uuid4())
        print(f"Guest path: Generating new UID: {new_uid}")
        try:
            new_user_data = {'UID': new_uid, 'username': f'anon_{new_uid[:8]}'}
            insert_user_response = supabase.table('users').insert(new_user_data).execute()
            if hasattr(insert_user_response, 'error') and insert_user_response.error:
                 return "Database error creating user", 500
            return new_uid
        except Exception: return "Server error creating user", 500
    else: return "Invalid request: Non-guest UID requires authentication", 401


def _verify_and_get_uid_from_token(token):
    """Verifies JWT locally. Returns (UID, None) on success, or (None, (error, status)) on failure."""
    if not token: return None, ("Token is missing", 401)
    if not JWT_SECRET_KEY: return None, ("Server authentication configuration error", 500)

    try:
        decoded_token = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"]) # Use your algorithm
        user_id = decoded_token.get("sub")

        if not user_id:
            return None, ('Invalid token format (missing sub)', 401)
        if not is_valid_uuid(user_id): # Validate format
            return None, ('Invalid UID format in token', 401)


        return user_id, None 

    except ExpiredSignatureError:
        return None, ('Token has expired', 401)
    except InvalidTokenError as e: # Catches various JWT format/signature errors
        print(f"Invalid Token Error: {e}") # Log the specific JWT error
        return None, ('Invalid token', 401)
    except Exception as e: # Catch-all for unexpected errors
        print(f"Unexpected error during token decoding: {e}")
        return None, ("Internal error during token verification", 500)


# --- API Endpoints ---

@app.route('/responses', methods=['GET'])
def get_all_responses():
    # ... (no changes needed unless GET needs auth) ...
    try:
        response = supabase.table("responses").select("*").execute()
        if hasattr(response, 'error') and response.error: return jsonify({'success': False, 'error': "DB error"}), 500
        return jsonify({'success': True, 'data': response.data}), 200
    except Exception: return jsonify({'success': False, 'error': "Server error"}), 500

@app.route('/responses', methods=['POST'])
def create_response():
    final_uid = None
    token = None
    try:
        # 1. Check Auth Header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "): token = auth_header.split(" ")[1]

        # 2. Verify Token (if present) using LOCAL verification
        if token:
            # Use the new direct verification helper
            verified_uid, error_info = _verify_and_get_uid_from_token(token)
            if error_info:
                return jsonify({'success': False, 'error': error_info[0]}), error_info[1]
            final_uid = verified_uid
            print(f"Authenticated request processed. UID from token: {final_uid}")
        # else: No token provided, proceed to check request body / guest flow

        # 3. Parse Data
        data = request.json
        if not data or 'survey_id' not in data or 'answers' not in data: return jsonify({'success': False, 'error': 'Missing fields'}), 400
        survey_id = data['survey_id']
        answers = data['answers']
        uid_from_request = data.get('UID', '')
        if not is_valid_uuid(survey_id): return jsonify({'success': False, 'error': 'Invalid survey_id format'}), 400

        # 4. Determine Final UID (Guest or Authenticated)
        if not final_uid: # No valid token processed
            # Check body for UID to see if it's a guest or invalid attempt
            # --- Use .get() with default for uid_from_request ---
            uid_from_request = data.get('UID', '')
            # ---
            if not uid_from_request or uid_from_request.strip() == "": # Guest? (Handles missing key or blank value)
                user_create_result = _check_or_create_user("")
                if isinstance(user_create_result, tuple): return jsonify({'success': False, 'error': user_create_result[0]}), user_create_result[1]
                final_uid = user_create_result
            else: # Non-blank UID in body WITHOUT valid token -> Reject
                return jsonify({'success': False, 'error': 'Auth required'}), 401

        # 5. Insert Response
        response_data = { 'survey_id_fk': survey_id, 'UID_fk': final_uid, 'answers': answers }
        try:
            supabase.table('responses').insert(response_data).execute()
        except APIError as api_error:
            if api_error.code == '23505': return jsonify({'success': False, 'error': 'Already submitted'}), 409
            else: return jsonify({'success': False, 'error': "DB insert error"}), 500

        # 6. Success
        return jsonify({ 'success': True, 'data': { 'survey_id': survey_id, 'UID': final_uid, 'message': 'Response created' }}), 201

    except Exception as e:
        print(f"POST /responses Error: {type(e).__name__} - {e}")
        return jsonify({'success': False, 'error': "Server error"}), 500


@app.route('/responses/survey/<survey_id>', methods=['GET'])
def get_responses_by_survey(survey_id):
    # TODO: Add auth?
    if not is_valid_uuid(survey_id): return jsonify({'success': False, 'error': 'Invalid survey ID format'}), 400
    try:
        response = supabase.table("responses").select("*").eq("survey_id_fk", survey_id).execute()
        if hasattr(response, 'error') and response.error: return jsonify({'success': False, 'error': "DB error"}), 500
        return jsonify({'success': True, 'data': response.data}), 200
    except Exception: return jsonify({'success': False, 'error': "Server error"}), 500

@app.route('/responses/survey/<survey_id>', methods=['GET'])
def get_responses_by_survey_and_user(survey_id):
    token = None
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        if auth_header.startswith("Bearer "): token = auth_header.split(" ")[1]
    if not token: return jsonify({'success': False, 'error': 'Auth token required'}), 401

    # Verify Token using LOCAL verification
    verified_uid, error_info = _verify_and_get_uid_from_token(token)
    if error_info: return jsonify({'success': False, 'error': error_info[0]}), error_info[1]

    try:
        response = supabase.table("responses").select("*").eq("survey_id_fk", survey_id).eq("UID_fk", verified_uid).execute()
        if hasattr(response, 'error') and response.error: return jsonify({'success': False, 'error': "DB error"}), 500
        return jsonify({'success': True, 'data': response.data.questions}), 200
    except Exception: return jsonify({'success': False, 'error': "Server error"}), 500

@app.route('/responses/survey/<survey_id>', methods=['PUT'])
def save_responses_by_survey_and_user(survey_id):
    token = None
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        if auth_header.startswith("Bearer "): token = auth_header.split(" ")[1]
    if not token: return jsonify({'success': False, 'error': 'Auth token required'}), 401

    # Verify Token using LOCAL verification
    verified_uid, error_info = _verify_and_get_uid_from_token(token)
    if error_info: return jsonify({'success': False, 'error': error_info[0]}), error_info[1]

    try:
        request_data = request.get_json()
        answer_data = request_data.get("answers")
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

    try:
        response = supabase.table("responses").update({"answers" : answer_data}).eq("survey_id_fk", survey_id).eq("UID_fk", verified_uid).execute()
        if hasattr(response, 'error') and response.error: return jsonify({'success': False, 'error': "DB error"}), 500
        return jsonify({'success': True}), 200
    except Exception: return jsonify({'success': False, 'error': "Server error"}), 500

@app.route('/responses/survey/<survey_id>/user/<uid_in_url>', methods=['DELETE'])
def delete_specific_response(survey_id, uid_in_url):
    token = None
    if 'Authorization' in request.headers:
        auth_header = request.headers['Authorization']
        if auth_header.startswith("Bearer "): token = auth_header.split(" ")[1]
    if not token: return jsonify({'success': False, 'error': 'Auth token required'}), 401

    # Verify Token using LOCAL verification
    verified_uid, error_info = _verify_and_get_uid_from_token(token)
    if error_info: return jsonify({'success': False, 'error': error_info[0]}), error_info[1]

    # Authorize
    if verified_uid != uid_in_url: return jsonify({'success': False, 'error': 'Forbidden'}), 403

    # Validate IDs
    if not is_valid_uuid(survey_id): return jsonify({'success': False, 'error': 'Invalid survey ID format'}), 400
    if not is_valid_uuid(uid_in_url): return jsonify({'success': False, 'error': 'Invalid user ID format'}), 400

    # Delete
    try:
        delete_response = supabase.table('responses').delete().eq('survey_id_fk', survey_id).eq('UID_fk', verified_uid).execute()
        if hasattr(delete_response, 'error') and delete_response.error: return jsonify({'success': False, 'error': "DB delete error"}), 500
        return jsonify({'success': True, 'message': 'Response deleted'}), 200
    except Exception: return jsonify({'success': False, 'error': "Server error"}), 500


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5101))
    app.run(host='0.0.0.0', debug=False, port=port)