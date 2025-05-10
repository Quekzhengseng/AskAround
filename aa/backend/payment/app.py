import os
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv
import stripe


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
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
DOMAIN_NAME = "http://localhost:3000"

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials")

supabase = create_client(supabase_url, supabase_key)

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        # Get quantity from form data (default to 1 if not provided)
        quantity = int(request.form.get('quantity', 1))

        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': 'price_1RNAFo08GVVR9wqqVDcDlu8b',
                    'quantity': quantity,
                },
            ],
            mode='payment',
            success_url=DOMAIN_NAME + '/payment?success=true',
            cancel_url=DOMAIN_NAME + '/payment?canceled=true',
        )
    except Exception as e:
        return str(e)

    return redirect(checkout_session.url, code=303)

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "survey"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5010)