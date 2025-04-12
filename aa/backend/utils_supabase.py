# utils_supabase.py

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
sample_survey = [{
    "id": "sample-survey-001",
    "title": "Singapore Management University Toilet Survey",
    "description": "To survey toilets at SMU",
    "questions": [
        {
            "id": "q1",
            "type": QUESTION_TYPES["SHORT_TEXT"],
            "question": "What's your name?",
            "placeholder": "Type your answer here...",
            "addable": True,
            "points": 5
        },
        {
            "id": "q2",
            "type": QUESTION_TYPES["YES_NO"],
            "question": "Are you a student?",
            "addable": False,
            "points": 5
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
            "addable": True,
            "points": 5
        },
        {
            "id": "q4",
            "type": QUESTION_TYPES["RATING"],
            "question": "How would you rate the overall toilet experience in Singapore Management University?",
            "scale": 5,
            "addable": True,
            "points": 5
        },
        {
            "id": "q5",
            "type": QUESTION_TYPES["LONG_TEXT"],
            "question": "Do you have any suggestions for toilet improvement?",
            "placeholder": "Share your thoughts here...",
            "addable": True,
            "points": 5
        },
        {
            "id": "q6",
            "type": QUESTION_TYPES["YES_NO"],
            "question": "Do you think the toilets in Singapore Management University need refurbishment?",
            "addable": False,
            "points": 5
        },
    ],
}, 
{
    "id": "sample-survey-002",
    "title": "SMU Campus Facilities Feedback",
    "description": "Collecting feedback on various campus facilities at Singapore Management University",
    "questions": [
        {
            "id": "q1",
            "type": QUESTION_TYPES["SHORT_TEXT"],
            "question": "What's your student ID?",
            "placeholder": "Enter your student ID...",
            "addable": False,
            "points": 5
        },
        {
            "id": "q2",
            "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
            "question": "Which features do you appreciate in SMU toilets? (Select all that apply)",
            "options": [
                "Hand dryers",
                "Paper towels",
                "Automatic flush",
                "Touchless faucets",
                "Well-stocked toilet paper",
                "Air fresheners",
                "Good lighting"
            ],
            "addable": True,
            "points": 5
        },
        {
            "id": "q3",
            "type": QUESTION_TYPES["SINGLE_CHOICE"],
            "question": "What time of day do you typically use the toilets at SMU?",
            "options": [
                "Morning (8am-12pm)",
                "Afternoon (12pm-5pm)",
                "Evening (5pm-10pm)",
                "Late night (After 10pm)"
            ],
            "addable": False,
            "points": 5
        },
        {
            "id": "q4",
            "type": QUESTION_TYPES["RATING"],
            "question": "How would you rate the cleanliness of the toilets?",
            "scale": 5,
            "addable": True,
            "points": 5
        },
        {
            "id": "q5",
            "type": QUESTION_TYPES["YES_NO"],
            "question": "Have you ever found an SMU toilet out of service when you needed it?",
            "addable": False,
            "points": 5
        },
        {
            "id": "q6",
            "type": QUESTION_TYPES["SINGLE_CHOICE"],
            "question": "How frequently do you use the toilets at SMU?",
            "options": [
                "Multiple times per day",
                "Once a day",
                "2-3 times per week",
                "Once a week or less"
            ],
            "addable": False,
            "points": 5
        },
        {
            "id": "q7",
            "type": QUESTION_TYPES["YES_NO"],
            "question": "Do you think there are enough toilets in SMU?",
            "addable": False,
            "points": 5
        },
        {
            "id": "q8",
            "type": QUESTION_TYPES["SINGLE_CHOICE"],
            "question": "Which floor toilets do you prefer using?",
            "options": [
                "Basement level",
                "Ground floor",
                "Higher floors"
            ],
            "addable": True,
            "points": 5
        },
        {
            "id": "q9",
            "type": QUESTION_TYPES["RATING"],
            "question": "How would you rate the privacy of the toilet cubicles?",
            "scale": 5,
            "addable": True,
            "points": 5
        },
        {
            "id": "q10",
            "type": QUESTION_TYPES["SHORT_TEXT"],
            "question": "What's the biggest issue you've encountered in SMU toilets?",
            "placeholder": "Please describe briefly...",
            "addable": True,
            "points": 5
        },
        {
            "id": "q11",
            "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
            "question": "What improvements would you like to see in SMU toilets? (Select all that apply)",
            "options": [
                "Better ventilation",
                "More frequent cleaning",
                "Better quality toilet paper",
                "More hooks for bags",
                "Better locks on doors",
                "More spacious cubicles",
                "Better lighting",
                "Better hand soap"
            ],
            "addable": True,
            "points": 5
        },
        {
            "id": "q12",
            "type": QUESTION_TYPES["DATE"],
            "question": "When did you last notice any maintenance issues in an SMU toilet?",
            "addable": True,
            "points": 5
        },
        {
            "id": "q13",
            "type": QUESTION_TYPES["YES_NO"],
            "question": "Are the hand dryers in SMU toilets effective?",
            "addable": False,
            "points": 5
        },
        {
            "id": "q14",
            "type": QUESTION_TYPES["EMAIL"],
            "question": "Please provide your email if you'd like to participate in future facility improvement surveys",
            "placeholder": "your.email@example.com",
            "addable": False,
            "points": 5
        },
        {
            "id": "q15",
            "type": QUESTION_TYPES["LONG_TEXT"],
            "question": "If you could redesign the SMU toilets, what changes would you make?",
            "placeholder": "Share your design ideas here...",
            "addable": True,
            "points": 5
        }
    ],
}]

user_data = [{
    "id": "user_data-001",
    "Surveys": [],
    "points": 0,
    "saved_questions": [],
    "answered_surveys": [],
    "to_be_answered_surveys": []
}]

# Upload data to Supabase
def upload_survey(supabase):
    """Upload sample survey data to Supabase"""
    for survey in sample_survey:
        result = supabase.table("surveys").upsert(survey).execute()
        if hasattr(result, 'error') and result.error:
            print(f"Error uploading survey {survey['id']}: {result.error}")
        else:
            print(f"Survey {survey['id']} uploaded successfully!")
    
    for user in user_data:
        result = supabase.table("users").upsert(user).execute()
        if hasattr(result, 'error') and result.error:
            print(f"Error uploading user {user['id']}: {result.error}")
        else:
            print(f"User {user['id']} uploaded successfully!")

def clear_supabase(supabase):
    """Clear all data from Supabase tables"""
    try:
        # Clear surveys table
        supabase.table("surveys").delete().neq("id", "dummy-id-for-safety").execute()
        
        # Clear users table
        supabase.table("users").delete().neq("id", "dummy-id-for-safety").execute()
        
        print("Supabase tables cleared successfully!")
    except Exception as e:
        print(f"Error clearing Supabase tables: {e}")