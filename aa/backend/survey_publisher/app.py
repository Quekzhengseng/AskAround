# --- START OF FILE app.py (Survey Publisher @ :5004) ---

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
# from datetime import datetime, timezone # No longer needed for basic schema
from supabase import create_client
from dotenv import load_dotenv
import uuid

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["POST", "PUT", "DELETE", "OPTIONS", "GET"], # Allow GET only for /health
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

print(f"Loaded Supabase URL: {supabase_url}")
print(f"Loaded Supabase Key: {'SET' if supabase_key else 'NOT SET'}")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials. Please set SUPABASE_URL and SUPABASE_KEY environment variables.")

supabase = create_client(supabase_url, supabase_key)
print("Supabase initialized successfully for Survey Publisher!")

"""API Endpoints"""

# REMOVED GET /surveys endpoint


@app.route('/surveys', methods=['POST'])
def create_survey():
    """Create a new survey (strictly id, title, description, questions ONLY)"""
    try:
        data = request.json
        if not data or 'title' not in data or 'questions' not in data:
             return jsonify({'success': False, 'error': 'Missing required fields: title and questions'}), 400

        # Prepare survey data with ONLY the 4 required fields
        survey_data = {
            'survey_id': str(uuid.uuid4()),
            'title': data['title'],
            'description': data.get('description', ''), # Use .get for optional description
            'questions': data['questions'], 
            'conditional_logic': data.get('conditional_logic', {})
            # --- REMOVED ALL OTHER FIELDS ---
            # 'status': 'draft',
            # 'is_published': False,
            # 'published_at': None,
            # 'created_at': datetime.now(timezone.utc).isoformat(),
            # 'updated_at': datetime.now(timezone.utc).isoformat()
        }
        # print(f"Attempting to insert minimal survey data: {survey_data}")

        # Insert into database
        response = supabase.table('surveys').insert(survey_data).execute()

        if hasattr(response, 'error') and response.error:
            # Log the specific Supabase error message
            print(f"Supabase Error creating survey: {response.error.message} (Code: {response.error.code})")
            # Return a clear error message
            return jsonify({'success': False, 'error': f"Database error: {response.error.message}"}), 500

        print(f"Insert successful for survey: {survey_data['survey_id']}")

        # Return the generated ID
        return jsonify({
            'success': True,
            'data': {
                'id': survey_data['survey_id'],
                'message': 'Survey created successfully'
            }
        }), 201

    except Exception as e:
        print(f"Server Error in create_survey: {e}") # Log the full exception
        return jsonify({'success': False, 'error': f"An unexpected server error occurred: {str(e)}"}), 500


@app.route('/surveys/<survey_id>', methods=['PUT'])
def update_survey(survey_id):
    """Update an existing survey (title, description, questions ONLY)"""
    try:
        data = request.json
        if not data:
             return jsonify({'success': False, 'error': 'Missing request body'}), 400

        # Check if survey exists
        count_response = supabase.table('surveys').select('survey_id', count='exact').eq('survey_id', survey_id).execute()
        if count_response.count == 0:
            return jsonify({'success': False, 'error': f'Survey with ID {survey_id} not found'}), 404

        # Prepare update data - ONLY these fields
        update_data = {}
        updatable_fields = ['title', 'description', 'questions', 'conditional_logic']
        for field in updatable_fields:
            if field in data:
                update_data[field] = data[field]

        if not update_data:
             return jsonify({'success': False, 'error': 'No updatable fields provided (title, description, or questions)'}), 400

        # --- REMOVED updated_at ---
        # update_data['updated_at'] = datetime.now(timezone.utc).isoformat()

        print(f"Attempting to update survey {survey_id} with: {list(update_data.keys())}")
        # Update in database
        response = supabase.table('surveys').update(update_data).eq('survey_id', survey_id).execute()

        if hasattr(response, 'error') and response.error:
            print(f"Supabase Error updating survey {survey_id}: {response.error.message} (Code: {response.error.code})")
            return jsonify({'success': False, 'error': f"Database error: {response.error.message}"}), 500

        print(f"Update successful for survey: {survey_id}")
        return jsonify({
            'success': True,
            'data': {
                'message': 'Survey updated successfully'
            }
        }), 200
    except Exception as e:
        print(f"Server Error in update_survey: {e}")
        return jsonify({'success': False, 'error': f"An unexpected server error occurred: {str(e)}"}), 500


@app.route('/surveys/<survey_id>', methods=['DELETE'])
def delete_survey(survey_id):
    """Delete a survey"""
    print(f" deleteing a survey with {survey_id}ID")
    try:
        # Check if survey exists
        count_response = supabase.table('surveys').select('survey_id', count='exact').eq('survey_id', survey_id).execute()
        if count_response.count == 0:
            return jsonify({'success': False, 'error': f'Survey with ID {survey_id} not found'}), 404

        print(f"Attempting to delete survey: {survey_id}")
        # Delete from database
        response = supabase.table('surveys').delete().eq('survey_id', survey_id).execute()

        if hasattr(response, 'error') and response.error:
            print(f"Supabase Error deleting survey {survey_id}: {response.error.message} (Code: {response.error.code})")
            return jsonify({'success': False, 'error': f"Database error: {response.error.message}"}), 500

        print(f"Delete successful for survey: {survey_id}")
        return jsonify({
            'success': True,
            'data': {
                'message': 'Survey deleted successfully'
            }
        }), 200
    except Exception as e:
        print(f"Server Error in delete_survey: {e}")
        return jsonify({'success': False, 'error': f"An unexpected server error occurred: {str(e)}"}), 500


@app.route('/surveys/<survey_id>/publish', methods=['POST'])
def publish_survey(survey_id):
    """Acknowledge publish request (functionality depends on schema)"""
    # NOTE: This endpoint cannot truly publish without status/is_published columns.
    # It will only check if the survey exists and potentially update user lists.
    try:
        # Check if survey exists
        survey_response = supabase.table('surveys').select('survey_id').eq('survey_id', survey_id).maybe_single().execute()
        if not survey_response.data:
            return jsonify({'success': False, 'error': f'Survey with ID {survey_id} not found'}), 404

        print(f"Received publish request for survey {survey_id}, but schema lacks publishing fields.")

        # --- REMOVED ACTUAL STATUS UPDATE ---
        # update_data = { ... }
        # response = supabase.table('surveys').update(update_data)...

        # --- User list update logic can remain, but might be less useful without status ---
        print(f"Attempting to add survey {survey_id} to users' to_be_answered list (publish requested)...")
        # (User list update code from previous version can be kept here if desired,
        #  but it won't reflect a true "published" state without the DB columns)
        # ... (omitted for brevity, add back if needed) ...

        return jsonify({
            'success': True, # Report success to frontend
            'data': {
                'message': 'Publish request received. Note: Full publishing requires status/is_published columns in database.'
            }
        }), 200 # Acknowledge the request
    except Exception as e:
        print(f"Server Error processing publish request for {survey_id}: {e}")
        return jsonify({'success': False, 'error': f"An unexpected server error occurred: {str(e)}"}), 500


@app.route('/surveys/<survey_id>/unpublish', methods=['POST'])
def unpublish_survey(survey_id):
    """Acknowledge unpublish request (functionality depends on schema)"""
    # NOTE: This endpoint cannot truly unpublish without status/is_published columns.
    try:
        # Check if survey exists
        survey_response = supabase.table('surveys').select('survey_id').eq('survey_id', survey_id).maybe_single().execute()
        if not survey_response.data:
            return jsonify({'success': False, 'error': f'Survey with ID {survey_id} not found'}), 404

        print(f"Received unpublish request for survey {survey_id}, but schema lacks publishing fields.")

        # --- REMOVED ACTUAL STATUS UPDATE ---
        # update_data = { ... }
        # response = supabase.table('surveys').update(update_data)...

        # --- User list removal logic can remain ---
        print(f"Attempting to remove survey {survey_id} from users' to_be_answered list (unpublish requested)...")
        # (User list update code from previous version can be kept here if desired)
        # ... (omitted for brevity, add back if needed) ...

        return jsonify({
            'success': True, # Report success to frontend
            'data': {
                'message': 'Unpublish request received. Note: Full unpublishing requires status/is_published columns.'
            }
        }), 200 # Acknowledge the request
    except Exception as e:
        print(f"Server Error processing unpublish request for {survey_id}: {e}")
        return jsonify({'success': False, 'error': f"An unexpected server error occurred: {str(e)}"}), 500


@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint"""
    db_status = "unknown"
    try:
        # Check connection by selecting from surveys table
        supabase.table('surveys').select('survey_id', count='exact').limit(1).execute()
        db_status = "ok"
    except Exception as db_e:
        # Catch potential errors if 'surveys' table doesn't exist or other DB issues
        print(f"Health check DB error: {db_e}")
        db_status = f"error ({type(db_e).__name__})" # Include error type if possible
    finally:
        return jsonify({"status": "healthy", "service": "survey-publisher", "db_connection": db_status})


if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5004))
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    app.run(host='0.0.0.0', debug=debug_mode, port=port)

# --- END OF FILE app.py ---