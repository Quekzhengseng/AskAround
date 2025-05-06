import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client
from dotenv import load_dotenv
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

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials")

supabase_client: Client = create_client(supabase_url, supabase_key)

# Initialize openai
openai_key = os.getenv("OPENAI_API_KEY")

if not openai_key:
    raise ValueError("Missing OpenAI API key")

openai_client = OpenAI(api_key=openai_key)
OPEN_AI_EMBEDDING_MODEL = "text-embedding-ada-002"
OPEN_AI_ENCODING_FORMAT = "float"

@app.route('/persist_response_into_vector_store', methods=['POST'])
def persist_response_into_vector_store():
    data = request.get_json()
    survey_id = data.get("survey_id")
    user_ids = data.get("user_ids")

    # query supabase surveys table for the specific survey_id
    survey_response = supabase_client.table('surveys').select("*").eq('survey_id', survey_id).execute()
    if not survey_response.data:
        return jsonify({
            'success': False,
            'error': f"Survey with id {survey_id} not found."
        }), 404

    questions = survey_response.data[0]['questions']

    response_responses = supabase_client.table('responses').select("*").eq('survey_id_fk', survey_id).in_('UID_fk', user_ids).execute()
    
    if not response_responses.data:
        return jsonify({
            'success': False,
            'error': f"No responses found for survey with id {survey_id} and user ids {user_ids}."
        }), 404

    print(f"Found responses for survey with id {survey_id} and user ids {user_ids} : count: {len(response_responses.data)}")
    for response in response_responses.data:
        answers = response['answers']
        uid = response['UID_fk']

        # zip answers with the respective questions of the survey
        zipped_answers = zip(answers, questions)
        for answer, question in zipped_answers:
            question_id = question['id']
            question_text = question['question']
            response = answer['response']
            print(f'question_id: {question_id}, question_text: {question_text}, response: {response}')

            formatted_response = f"{question_text}: {response}"
            response = openai_client.embeddings.create(
                input=formatted_response, model=OPEN_AI_EMBEDDING_MODEL, encoding_format=OPEN_AI_ENCODING_FORMAT
            )

            embedding = response.data[0].embedding

            supabase_client.table('answer-rag').insert(
                {
                    "survey_id_fk": survey_id,
                    "uid_fk": uid,
                    "vector": embedding,
                    "response": formatted_response,
                    "question_id": question_id
                }
            ).execute()
    
    return jsonify({
        'success': True,
        'message': 'Query Succeeed'
    }), 200

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
        response = supabase_client.rpc('cosine_similarity_search_with_user',
            {
                'query_embedding': embedding,
                "user_id": user_id,
                'match_count': 10
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