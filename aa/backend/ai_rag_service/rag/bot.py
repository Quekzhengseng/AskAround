from openai import OpenAI

from rag.rag import Rag
from pydantic import BaseModel

SYSTEM_PROMPT_FOR_ANSWERING_QUESTION_TEMPLATE = '''
You are a personal assistant that can answer questions based on previously answered questions by the user
Question: {question}
Previously Answered Questions: {previously_answered_questions}
'''

DEFAULT_MODEL = 'gpt-4o-mini'

class QuestionAnswerPairs(BaseModel):
    question: str
    answer: str
    is_certain: bool

class Bot:
    def __init__(self, openai_client: OpenAI, rag: Rag):
        self.openai_client = openai_client
        self.rag = rag

    def attempt_to_answer_question(self, question: str, user_id: str) -> QuestionAnswerPairs: 
        most_similar_documents = self.rag.query_vector_store(question, user_id)

        open_ai_response = self.openai_client.beta.chat.completions.parse(
            model=DEFAULT_MODEL,
            messages=[
                {"role": "user", "content": SYSTEM_PROMPT_FOR_ANSWERING_QUESTION_TEMPLATE.format(question=question, previously_answered_questions=most_similar_documents)}
            ],
            response_format=QuestionAnswerPairs

        )
        bot_response: QuestionAnswerPairs = open_ai_response.choices[0].message.content

        return bot_response