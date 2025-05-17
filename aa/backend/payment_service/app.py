import os
from flask import Flask, request, jsonify, redirect
from flask_cors import CORS
from datetime import datetime, timezone
from supabase import create_client
from dotenv import load_dotenv
import stripe
import jwt
import json
import logging
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

# Create a logger for your application
logger = logging.getLogger('stripe-webhook-service')


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
        # Check if the request is JSON or form data
        if request.is_json:
            data = request.get_json()
            quantity = int(data.get('quantity', 1))
            
            # Get user id from authorization header
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header.split(' ')[1]
                user_id = decode(token)  # Your JWT decode function
            else:
                return jsonify({"error": "Invalid or missing authorization"}), 401
        
        # Create Stripe checkout session
        checkout_session = stripe.checkout.Session.create(
            line_items=[
                {
                    'price': 'price_1RNAFo08GVVR9wqqVDcDlu8b',
                    'quantity': quantity,
                },
            ],
            mode='payment',
            allow_promotion_codes=True,
            success_url=f"{DOMAIN_NAME}/payment?success=true&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{DOMAIN_NAME}/store",
            metadata={
                'user_id': user_id,
                'quantity': str(quantity),
                'credits_per_quantity': '10'
            }
        )
        
        if request.is_json:
            return jsonify({
                "url": checkout_session.url,
                "sessionId": checkout_session.id
            })
        
    except Exception as e:
        # Return error as JSON for API requests
        return jsonify({"error": str(e)}), 400

@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')
    
    logger.info("Received webhook request")
    
    try:
        # Verify the webhook signature
        if webhook_secret:
            event = stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
            logger.info(f"Received event: {event['type']}")
        else:
            logger.warning("No webhook secret configured - skipping signature verification")
            return jsonify({'error': 'Webhook secret not configured'}), 400
        
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
            # logger.info(f"Processing completed checkout: {session['id']}")
            # logger.info(f"User ID: {user_id}")
            # logger.info(f"Adding {credits_to_add} credits")
            
            # Only proceed if we have a user_id
            if user_id:
                try:
                    # First, get current credits for the user
                    user_response = supabase.table('users').select('credit').eq('UID', user_id).execute()
                    
                    if user_response.data and len(user_response.data) > 0:
                        # User exists, get current credits (default to 0 if null)
                        current_credits = user_response.data[0].get('credit', 0) or 0
                        new_credits = current_credits + credits_to_add
                        
                        # logger.info(f"Current credits for user {user_id}: {current_credits}")
                        
                        # Update user's credits in Supabase
                        update_response = supabase.table('users').update({
                            'credit': new_credits
                        }).eq('UID', user_id).execute()
                        
                        # logger.info(f"Updated credit for user {user_id}: {current_credits} -> {new_credits}")
                        # logger.info(f"Supabase update response: {update_response}")
                        
                        # Add transaction logging if needed
                        # transaction_data = {
                        #     'user_id': user_id,
                        #     'stripe_session_id': session['id'],
                        #     'amount': session.get('amount_total', 0) / 100,
                        #     'credits_added': credits_to_add,
                        #     'created_at': datetime.now(timezone.utc).isoformat()
                        # }
                        # supabase.table('credit_transactions').insert(transaction_data).execute()
                        # logger.info(f"Transaction logged: {session['id']}")
                    else:
                        logger.warning(f"User {user_id} not found in Supabase")
                        logger.debug(f"Supabase response: {user_response}")
                except Exception as e:
                    logger.error(f"Error updating Supabase: {str(e)}")
                    logger.exception("Full exception details:")
            else:
                logger.warning("No user_id provided in metadata, cannot update credits")
        elif event['type'] == 'payment_intent.succeeded':
            logger.info(f"Payment intent succeeded: {event['data']['object']['id']}")
        elif event['type'] == 'payment_intent.payment_failed':
            logger.warning(f"Payment intent failed: {event['data']['object']['id']}")
            logger.warning(f"Failure reason: {event['data']['object'].get('last_payment_error', {}).get('message', 'Unknown')}")
        else:
            logger.info(f"Received unhandled event type: {event['type']}")
        
        return jsonify({'status': 'success'})
    
    except stripe.error.SignatureVerificationError as e:
        # Invalid signature
        logger.error(f"Webhook signature verification failed: {str(e)}")
        return jsonify({'error': 'Invalid signature'}), 400
    
    except Exception as e:
        logger.error(f"Webhook error: {str(e)}")
        logger.exception("Full exception details:")
        return jsonify({'error': str(e)}), 400

@app.route('/checkout-session', methods=['GET'])
def get_checkout_session():
    try:
        # Get session ID from query parameters
        session_id = request.args.get('session_id')
        
        if not session_id:
            logger.warning("No session_id provided to /checkout-session")
            return jsonify({"error": "No session_id provided"}), 400
        
        logger.info(f"Fetching checkout session: {session_id}")
        
        # Retrieve session from Stripe
        checkout_session = stripe.checkout.Session.retrieve(
            session_id,
            expand=['line_items', 'payment_intent']
        )
        
        # Extract the needed details
        session_data = {
            'id': checkout_session.id,
            'amount_total': checkout_session.amount_total,
            'currency': checkout_session.currency,
            'payment_status': checkout_session.payment_status,
            'customer_email': checkout_session.customer_details.email if hasattr(checkout_session, 'customer_details') else None,
            'metadata': checkout_session.metadata,
            'quantity': checkout_session.metadata.get('quantity', '1')
        }
        
        logger.info(f"Session details retrieved successfully: {session_data}")
        
        return jsonify(session_data)
        
    except stripe.error.StripeError as e:
        logger.error(f"Stripe error in /checkout-session: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"Error in /checkout-session: {str(e)}")
        logger.exception("Full exception details:")
        return jsonify({"error": "Failed to retrieve session"}), 500

@app.route('/health', methods=['HEAD'])
def health_check():
    return '', 200, {'X-Service-Status': 'healthy', 'X-Service-Name': 'survey'}

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5010)