# voucher_service.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client
from dotenv import load_dotenv

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

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials")

supabase = create_client(supabase_url, supabase_key)
print("Supabase initialized for Voucher Service!")

@app.route('/voucher', methods=['GET'])
def get_vouchers():
    """Endpoint to retrieve voucher data"""
    try:
        response = supabase.table('vouchers').select("*").execute()
        
        if not response.data:
            return jsonify({
                'success': False,
                'error': 'Vouchers not found'
            }), 404
        
        return jsonify({
            'success': True,
            'data': response.data
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/voucher/redeem', methods=['POST'])
def redeem_voucher():
    """Endpoint to redeem a voucher"""
    # Implementation for voucher redemption
    pass

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "voucher"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5002)