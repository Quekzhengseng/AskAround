from supabase import Client
from openai import OpenAI

class Rag:
    def __init__(self, supabase_client: Client, openai_client: OpenAI, openai_embedding_model: str, openai_encoding_format: str):
        self.supabase_client = supabase_client
        self.openai_client = openai_client
        self.openai_embedding_model = openai_embedding_model
        self.openai_encoding_format = openai_encoding_format

    def persist_response_into_vector_store(self, survey_responses: list, questions: list):
        for survey_response in survey_responses:
            answers = survey_response['answers']
            uid = survey_response['UID_fk']

            # zip answers with the respective questions of the survey
            zipped_answers = zip(answers, questions)
            for answer, question in zipped_answers:
                question_id = question['id']
                question_text = question['question']
                response = answer['response']
                print(f'question_id: {question_id}, question_text: {question_text}, response: {response}')

                formatted_response = f"{question_text}: {response}"
                response = self.openai_client.embeddings.create(
                    input=formatted_response, model=self.openai_embedding_model, encoding_format=self.openai_encoding_format
                )

                embedding = response.data[0].embedding

                self.supabase_client.table('answer-rag').insert(
                    {
                        "survey_id_fk": survey_response['survey_id_fk'],
                        "uid_fk": uid,
                        "vector": embedding,
                        "response": formatted_response,
                        "question_id": question_id
                    }
                ).execute()

    def query_vector_store(self, query_text: str, user_id: str):
        response = self.openai_client.embeddings.create(
            input=query_text,
            model=self.openai_embedding_model,
            encoding_format=self.openai_encoding_format
        )
        embedding = response.data[0].embedding

        response = self.supabase_client.rpc('cosine_similarity_search_with_user',
            {
                'query_embedding': embedding,
                "user_id": user_id,
                'match_count': 10
        }
        ).execute()

        return response.data
        