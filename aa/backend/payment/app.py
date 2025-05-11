import os
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv
import stripe
import jwt
import json


# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {
    "origins": "*",  
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization", "Stripe-Signature"]  # Added Stripe-Signature header
}})

# Initialize Supabase
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
jwt_secret_key = os.getenv("JWT_SECRET_KEY")
DOMAIN_NAME = "http://localhost:3000"

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials")

supabase = create_client(supabase_url, supabase_key)

#Helper Functions
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

@app.route('/create-checkout-session', methods=['POST'])
def create_checkout_session():
    try:
        # Get quantity from form data (default to 1 if not provided)
        quantity = int(request.form.get('quantity', 1))

        # Get user ID from JWT token
        auth_header = request.headers.get('Authorization')
        token = auth_header.split(" ")[1]
        user_id = decode(token)  # Your JWT decoding function

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
            metadata={
                'user_id': user_id,
                'quantity': str(quantity),
                'credits_per_quantity': '10'
            }
        )
    except Exception as e:
        return str(e)

    return redirect(checkout_session.url, code=303)

@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    try:
        # Verify the webhook signature
        if webhook_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            print(f"Received event: {event['type']}")
        else:
            # For testing/development without webhook secret
            # (NOT recommended for production)
            return jsonify({'error': 'Invalid signature'}), 400
        
        # Handle the checkout.session.completed event
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            
            # Get metadata from the session
            metadata = session.get('metadata', {})
            user_id = metadata.get('user_id')
            quantity = int(metadata.get('quantity', 1))
            credits_per_quantity = int(metadata.get('credits_per_quantity', 10))
            
            # Calculate credits to add
            credits_to_add = quantity * credits_per_quantity
            
            # Log transaction details
            print(f"Processing completed checkout: {session['id']}")
            print(f"User ID: {user_id}")
            print(f"Adding {credits_to_add} credits")
            
            # Only proceed if we have a user_id
            if user_id:
                try:
                    # First, get current credits for the user
                    user_response = supabase.table('users').select('credits').eq('id', user_id).execute()
                    
                    if user_response.data and len(user_response.data) > 0:
                        # User exists, get current credits (default to 0 if null)
                        current_credits = user_response.data[0].get('credits', 0) or 0
                        new_credits = current_credits + credits_to_add
                        
                        # Update user's credits in Supabase
                        update_response = supabase.table('users').update({
                            'credits': new_credits
                        }).eq('id', user_id).execute()
                        
                        print(f"Updated credits for user {user_id}: {current_credits} -> {new_credits}")
                        
                        # # Log the transaction in a separate table (optional)
                        # transaction_data = {
                        #     'user_id': user_id,
                        #     'stripe_session_id': session['id'],
                        #     'amount': session.get('amount_total', 0) / 100,  # Convert cents to dollars
                        #     'credits_added': credits_to_add,
                        #     'created_at': datetime.now(timezone.utc).isoformat()
                        # }
                        
                        # supabase.table('credit_transactions').insert(transaction_data).execute()
                    else:
                        print(f"User {user_id} not found in Supabase")
                except Exception as e:
                    print(f"Error updating Supabase: {str(e)}")
            else:
                print("No user_id provided in metadata, cannot update credits")
        
        return jsonify({'status': 'success'})
    
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        print(f"⚠️ Webhook signature verification failed: {str(e)}")
        return jsonify({'error': 'Invalid signature'}), 400
    
    except Exception as e:
        print(f"⚠️ Webhook error: {str(e)}")
        return jsonify({'error': str(e)}), 400


@app.route('/health', methods=['HEAD'])
def health_check():
    return '', 200, {'X-Service-Status': 'healthy', 'X-Service-Name': 'survey'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5010)