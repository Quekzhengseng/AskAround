import firebase_admin
from firebase_admin import firestore

# Define question types
QUESTION_TYPES = {
    "SHORT_TEXT": "SHORT_TEXT",
    "LONG_TEXT": "LONG_TEXT",
    "SINGLE_CHOICE": "SINGLE_CHOICE",
    "MULTIPLE_CHOICE": "MULTIPLE_CHOICE",
    "RATING": "RATING",
    "YES_NO": "YES_NO",
    "EMAIL": "EMAIL",
    "DATE": "DATE",
}

# Sample survey data
sample_survey = {
    "id": "sample-survey-001",
    "title": "Singapore Management University Toilet Survey",
    "description": "To survey toilets at SMU",
    "questions": [
        {
            "id": "q1",
            "type": QUESTION_TYPES["SHORT_TEXT"],
            "question": "What's your name?",
            "placeholder": "Type your answer here...",
            "required": True,
        },
        {
            "id": "q2",
            "type": QUESTION_TYPES["YES_NO"],
            "question": "Are you a student?",
            "required": True,
        },
        {
            "id": "q3",
            "type": QUESTION_TYPES["SINGLE_CHOICE"],
            "question": "Which toilet in Singapore Management University do you use the most?",
            "options": [
                "School Of Computing",
                "School Of Economics",
                "School Of Business",
                "School Of Law",
                "Other",
            ],
            "required": True,
        },
        {
            "id": "q4",
            "type": QUESTION_TYPES["RATING"],
            "question": "How would you rate the overall toilet experience in Singapore Management University?",
            "scale": 5,
            "required": True,
        },
        {
            "id": "q5",
            "type": QUESTION_TYPES["LONG_TEXT"],
            "question": "Do you have any suggestions for toilet improvement?",
            "placeholder": "Share your thoughts here...",
            "required": False,
        },
        {
            "id": "q6",
            "type": QUESTION_TYPES["YES_NO"],
            "question": "Do you think the toilets in Singapore Management University need refurbishment?",
            "required": True,
        },
    ],
}

# Upload data to Firestore
def upload_survey(db):
    doc_ref = db.collection("surveys").document(sample_survey["id"])
    doc_ref.set(sample_survey)
    print(f"Survey {sample_survey['id']} uploaded successfully!")
