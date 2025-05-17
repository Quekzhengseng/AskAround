# routes/account.py
from flask import Blueprint, request, jsonify
from utils.auth import get_user_id_from_request
from utils.db import supabase

account_bp = Blueprint('account', __name__)

@account_bp.route('/deleteAccount', methods=['DELETE'])
def delete_user_data():
    """
    Delete all data related to a specific user across all tables
    """
    # Get user ID from token
    result = get_user_id_from_request(request)
    if isinstance(result, tuple):
        return result  # This is an error response
    
    user_id = result  # This is the successfully decoded user_id
    
    results = {
        "success": True,
        "details": {}
    }
    
    try:
        # 1. Delete from answer-rag table
        answer_rag_result = supabase.table('answer-rag').delete().eq('uid_fk', user_id).execute()
        results["details"]["answer_rag_deleted"] = len(answer_rag_result.data) if answer_rag_result.data else 0
        
        # 2. Delete from responses table
        responses_result = supabase.table('responses').delete().eq('UID_fk', user_id).execute()
        results["details"]["responses_deleted"] = len(responses_result.data) if responses_result.data else 0
        
        # 3. Delete any blacklisted tokens
        token_result = supabase.table('token_blacklist').delete().eq('user_id', user_id).execute()
        results["details"]["tokens_deleted"] = len(token_result.data) if token_result.data else 0
        
        # 4. Delete from users table
        user_result = supabase.table('users').delete().eq('UID', user_id).execute()
        results["details"]["user_deleted"] = len(user_result.data) if user_result.data else 0
        
        # 5. Delete user from auth table - requires service role key
        try:
            auth_result = supabase.auth.admin.delete_user(user_id)
            results["details"]["auth_deleted"] = True
        except Exception as auth_error:
            results["details"]["auth_deletion_error"] = str(auth_error)
            # Continue with the process even if auth deletion fails
        
        return jsonify(results), 200
        
    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "details": results.get("details", {})
        }
        return jsonify(error_result), 500