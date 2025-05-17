import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
import jwt
from datetime import datetime, timezone, timedelta
import traceback

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"]
}})

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
jwt_secret_key = os.getenv("JWT_SECRET_KEY")

if not supabase_url or not supabase_key or not jwt_secret_key:
    raise ValueError("Missing Supabase credentials or JWT Secret Key")

supabase = create_client(supabase_url, supabase_key)

# Helper function
def generate_jwt(user_id: str):
    # Fixed datetime references
    current_time = datetime.utcnow()
    expiration_time = current_time + timedelta(days=1)
    
    payload = {
        "sub": user_id,
        "iat": int(current_time.timestamp()),  # Issue time as integer timestamp
        "exp": int(expiration_time.timestamp()),
    }
    
    return jwt.encode(payload, jwt_secret_key, algorithm="HS256")

def decode(token):
    try:
        # ✅ Verify token signature and decode
        decoded_token = jwt.decode(token, jwt_secret_key, algorithms=["HS256"])
        user_id = decoded_token.get("sub")
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Invalid token format (missing sub)'
            }), 401
        
        # Return the user_id when successful
        return user_id

    except jwt.ExpiredSignatureError:
        return jsonify({
            'success': False,
            'error': 'Token has expired'
        }), 401
    except jwt.InvalidTokenError:
        return jsonify({
            'success': False,
            'error': 'Invalid token'
        }), 401
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f"Unexpected error during token decoding: {str(e)}"
        }), 500

# Route to handle login
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    try:
        # Attempt to sign in with Supabase
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})

        if response.user is None:
            return jsonify({"error": "Invalid credentials"}), 401

        # Generate JWT token for the user
        jwt_token = generate_jwt(response.user.id)

        return jsonify({
            "message": "Login successful",
            "token": jwt_token,
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Route to handle signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not email or not password or not username:
        return jsonify({"error": "Email and password and username are required"}), 400

    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "data": {"username": username},
            },
        })

        if response.user is None:
            error_message = response.error.message if response.error else "Signup failed"
            return jsonify({"error": error_message}), 400

        jwt_token = generate_jwt(response.user.id)

        return jsonify({
            "message": "Signup successful",
            "token": jwt_token
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
# Route to handle password reset request
@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get("email")
    
    if not email:
        return jsonify({"error": "Email is required"}), 400

    try:
        reset_url = "http://localhost:3000/login/resetPassword"
        
        # Use Supabase to send password reset email
        result = supabase.auth.reset_password_for_email(
            email,
            options={
                "redirect_to": reset_url
            }
        )
        
        # Note: result might not contain useful info since this is an email operation
        return jsonify({
            "message": "If your email exists in our system, you will receive a password reset link shortly."
        })

    except Exception as e:
        traceback.print_exc()
        # Use a generic message for security (don't reveal if email exists)
        return jsonify({
            "message": "If your email exists in our system, you will receive a password reset link shortly."
        }), 200  # Still return 200 for security

# Route to handle password reset with token invalidation
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    new_password = data.get("password")
    access_token = data.get("access_token")
    refresh_token = data.get("refresh_token")
    
    if not new_password or not access_token or not refresh_token:
        return jsonify({"error": "Password, access token, and refresh token are required"}), 400

    try:
        # Set the session with both tokens
        supabase.auth.set_session(access_token, refresh_token)
        
        # Get the user information
        user_result = supabase.auth.get_user()
        if not user_result.user:
            return jsonify({"error": "Invalid user"}), 400
            
        user_id = user_result.user.id
        
        # Update the user's password
        result = supabase.auth.update_user({
            "password": new_password
        })
        
        if not result.user:
            return jsonify({"error": "Password reset failed"}), 400

        # Current time - any tokens issued before this are now invalid
        # Fixed datetime reference
        now = datetime.utcnow()
        
        # Add or update entry in token_blacklist
        supabase.table("token_blacklist").upsert(
            {
                "user_id": user_id,
                "valid_after": now.isoformat()
            },
            on_conflict="user_id"  # This is the key line - specify which column is unique
        ).execute()
        
        # Generate a new JWT token for the user
        jwt_token = generate_jwt(user_id)
        
        return jsonify({
            "message": "Password reset successful",
            "token": jwt_token
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
    
# Route to handle logout
@app.route('/logout', methods=['POST'])
def logout():
    # 🔐 Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'success': False,
            'error': 'Authorization token missing or malformed'
        }), 401
    
    token = auth_header.split(" ")[1]

    # Use the decode helper function
    result = decode(token)
    
    # Check if decode returned an error response
    if isinstance(result, tuple):
        return result  # This is an error response
        
    user_id = result  # This is the successfully decoded user_id
    
    if not token:
        return jsonify({"error": "Token is required"}), 400

    try:
        # Current time - any tokens issued before this are now invalid
        # Fixed datetime reference
        now = datetime.utcnow()
        
        # Add or update entry in token_blacklist
        supabase.table("token_blacklist").upsert(
            {
                "user_id": user_id,
                "valid_after": now.isoformat()
            },
            on_conflict="user_id"  # This is the key line - specify which column is unique
        ).execute()
        
        return jsonify({
            "message": "Logout is successful",
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/verify', methods=['POST'])
def verify_jwt():
    # 🔐 Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'success': False,
            'error': 'Authorization token missing or malformed'
        }), 401
    
    token = auth_header.split(" ")[1]
    
    if not token:
        return jsonify({"error": "Token is required"}), 400
        
    try:
        # First decode the token without verification to get user_id and issue time
        unverified_payload = jwt.decode(token, options={"verify_signature": False})
        user_id = unverified_payload.get("sub")
        
        # More robust handling of the issued-at time
        iat = unverified_payload.get("iat", 0)
        try:
            token_issue_time = datetime.fromtimestamp(iat, tz=timezone.utc)
        except (ValueError, TypeError) as e:
            print(f"Error parsing token issue time: {str(e)}, iat value: {iat}")
            token_issue_time = datetime.fromtimestamp(0, tz=timezone.utc)  # Fallback
            
        if not user_id:
            return jsonify({"error": "Invalid token format"}), 401
            
        print(f"Checking token for user: {user_id}, issued at: {token_issue_time}")
        
        # Check if there's a blacklist entry for this user
        try:
            result = supabase.table("token_blacklist").select("valid_after").eq("user_id", user_id).execute()
            print(f"Blacklist result: {result.data}")
            
            # If user has a blacklist entry, check if token was issued before valid_after time
            if result.data and len(result.data) > 0:
                valid_after_str = result.data[0]["valid_after"]
                print(f"Valid after string: {valid_after_str}")
                
                # Use Approach 1 which worked, but add timezone information
                valid_after = datetime.fromisoformat(valid_after_str.replace('Z', '+00:00'))
                # Ensure timezone awareness
                if valid_after.tzinfo is None:
                    valid_after = valid_after.replace(tzinfo=timezone.utc)
                    
                print(f"Comparing: token issued {token_issue_time} vs valid after {valid_after}")
                
                # If token was issued before valid_after, it's invalid
                if token_issue_time < valid_after:
                    return jsonify({"error": "Token has been invalidated"}), 401
                    
        except Exception as e:
            print(f"Error during blacklist check: {str(e)}")
            traceback.print_exc()
            # Continue with validation even if blacklist check fails
            
        # Now verify the token signature and expiration
        decoded_token = jwt.decode(token, jwt_secret_key, algorithms=["HS256"])
        
        # Token is valid
        return jsonify({"message": "Token is valid", "id": user_id})
        
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401
    except Exception as e:
        print(f"Unexpected error in verify_jwt: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "authentication"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5005)