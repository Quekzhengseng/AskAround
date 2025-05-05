import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
import jwt
from openai import OpenAI

# Load environment variables
load_dotenv()

print("Starting up ai_rag_service")

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

supabase: Client = create_client(supabase_url, supabase_key)

# Initialize openai
openai_key = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=openai_key)
OPEN_AI_EMBEDDING_MODEL = "text-embedding-ada-002"
OPEN_AI_ENCODING_FORMAT = "float"

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

@app.route('/recsys', methods=['POST'])
def recsys():
    """Endpoint to recommend surveys to users"""
    # 🔐 Get token from Authorization header
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return jsonify({
            'success': False,
            'error': 'Authorization token missing or malformed'
        }), 401
    
    # Get token from header
    token = auth_header.split(" ")[1]

    # Call decode and check if it returned an error response
    result = decode(token)
    if isinstance(result, tuple):
        return result  # This is an error response
        
    user_id = result  # This is the successfully decoded user_id

    try:
        request_data = request.get_json()

        survey_id = request_data["survey_id"]

        # First check if survey exists
        survey_response = supabase.table('surveys').select("*").eq('survey_id', survey_id).execute()
        if not survey_response.data:
            return jsonify({
                'success': False,
                'error': f"Survey with id {survey_id} not found."
            }), 404
        
        # INCLUDE RECSYS SYSTEM HERE, for now skip this to recommend to x amount of users
        
        # Retrieve num of users to propagate the survey to, change default to 0 once in production
        num_users = survey_response[0].get("num_users", 50)

        # Get random users from the database
        user_response = supabase.table('users') \
            .select("*") \
            .order('random()') \
            .limit(num_users) \
            .execute()
        
        users = user_response.data

        return jsonify({
            'success': True,
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/query_text_for_user', methods=['POST'])
def query_text_for_user():
    data = request.get_json()
    query_text = data.get("query_text")
    user_id = data.get("user_id", None)

    response = openai_client.embeddings.create(
        input=query_text,
        model=OPEN_AI_EMBEDDING_MODEL,
        encoding_format=OPEN_AI_ENCODING_FORMAT
    )
    embedding = response.data[0].embedding
    
    try:
        response = supabase.rpc('cosine_similarity_search_with_user',
            {
                'query_embedding': embedding,
                "user_id": user_id,
                'match_count': 20
        }
        ).execute()
        
        if response.data:
            most_similar_documents = response.data
            print("Most similar documents:")
            for doc in most_similar_documents:
                print(f"Response: {doc['response']}, Similarity (Distance): {doc['similarity']}")
            return jsonify({
                'success': True,
                'result': response.data
            }), 200
        else:
            print("No similar documents found - vector store may be empty")
            return jsonify({
                'success': True,
                'result': "No similar documents found - vector store may be empty"
            }), 200
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
    

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'success': True,
        'message': 'AI RAG service is healthy'
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=5008)