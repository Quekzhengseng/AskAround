import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv
import jwt
import datetime
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

# Helper function to generate JWT token
def generate_jwt(user_id: str):
    expiration_time = datetime.datetime.utcnow() + datetime.timedelta(days=1)
    payload = {
        "sub": user_id,
        "exp": expiration_time,
    }
    return jwt.encode(payload, jwt_secret_key, algorithm="HS256")

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

        access_token = response.session.access_token
        refresh_token = response.session.refresh_token

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

# Route to update password after reset
@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    new_password = data.get("password")
    access_token = data.get("access_token")  # From Supabase password reset email
    refresh_token = data.get("refresh_token")  # Also needed for set_session
    
    if not new_password or not access_token:
        return jsonify({"error": "Password and access token are required"}), 400

    try:
        # Set the access token in the client to update the user's password
        supabase.auth.set_session(access_token, refresh_token)
        
        # Update the user's password
        result = supabase.auth.update_user({
            "password": new_password
        })
        
        if result.user is None:
            return jsonify({"error": "Password reset failed"}), 400
        
        return jsonify({
            "message": "Password reset successful"
        })

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# Route to check JWT validity (for protected routes)
@app.route('/verify', methods=['POST'])
def verify_jwt():
    data = request.json
    token = data.get("token")
    
    if not token:
        return jsonify({"error": "Token is required"}), 400

    try:
        decoded_token = jwt.decode(token, jwt_secret_key, algorithms=["HS256"])
        user_id = decoded_token.get("sub")

        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        return jsonify({"message": "Token is valid", "id": user_id})

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token has expired"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Invalid token"}), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5005)
