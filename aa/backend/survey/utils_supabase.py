# utils_supabase.py
import uuid # Added import

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
    "survey_id": str(uuid.uuid4()), # Replaced with uuid
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
    "survey_id": str(uuid.uuid4()), # Replaced with uuid
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
},  {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Remote Work Preferences",
        "description": "Understanding how professionals adapt to remote work environments",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "How many days per week do you prefer to work remotely?",
                "options": [
                    "0 days (fully in-office)",
                    "1-2 days",
                    "3-4 days",
                    "5 days (fully remote)"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "What challenges do you face while working remotely?",
                "options": [
                    "Distractions at home",
                    "Communication difficulties",
                    "Lack of proper workspace",
                    "Work-life balance",
                    "Technical issues",
                    "Feeling isolated"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["RATING"],
                "question": "How would you rate your productivity when working remotely?",
                "scale": 5,
                "addable": False,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Do you have a dedicated workspace at home?",
                "addable": False,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["LONG_TEXT"],
                "question": "What improvements could your company make to better support remote work?",
                "placeholder": "Share your suggestions here...",
                "addable": True,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Digital Entertainment Habits",
        "description": "Survey about streaming services and digital entertainment preferences",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "Which streaming services do you currently subscribe to?",
                "options": [
                    "Netflix",
                    "Disney+",
                    "Amazon Prime Video",
                    "Hulu",
                    "HBO Max",
                    "Apple TV+",
                    "None of the above"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "How many hours per week do you spend watching streaming content?",
                "options": [
                    "Less than 5 hours",
                    "5-10 hours",
                    "11-20 hours",
                    "More than 20 hours"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["RATING"],
                "question": "How important is having access to new movie releases on streaming platforms?",
                "scale": 5,
                "addable": True,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "What type of content do you watch most often?",
                "options": [
                    "Movies",
                    "TV series",
                    "Documentaries",
                    "Reality shows",
                    "Sports"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Would you pay extra for early access to theatrical releases?",
                "addable": False,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Sustainable Living Practices",
        "description": "Understanding individuals' sustainability habits and awareness",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "Which eco-friendly practices do you incorporate in your daily life?",
                "options": [
                    "Recycling",
                    "Reducing plastic use",
                    "Using reusable shopping bags",
                    "Water conservation",
                    "Energy conservation",
                    "Composting",
                    "Using public transportation"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["RATING"],
                "question": "How would you rate your knowledge of environmental issues?",
                "scale": 5,
                "addable": False,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Are you willing to pay more for eco-friendly products?",
                "addable": True,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "What is your biggest motivation for adopting sustainable practices?",
                "options": [
                    "Environmental concerns",
                    "Health benefits",
                    "Cost savings",
                    "Social responsibility",
                    "Influence from friends/family"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["SHORT_TEXT"],
                "question": "What sustainable practice would you like to adopt next?",
                "placeholder": "Share your next step...",
                "addable": True,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Food Delivery Experience",
        "description": "Feedback on food delivery services and preferences",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "How often do you order food delivery?",
                "options": [
                    "Multiple times per week",
                    "Once a week",
                    "A few times per month",
                    "Once a month or less",
                    "Never"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "Which food delivery platforms do you use?",
                "options": [
                    "UberEats",
                    "DoorDash",
                    "Grubhub",
                    "Deliveroo",
                    "FoodPanda",
                    "Directly from restaurants"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["RATING"],
                "question": "How would you rate the overall quality of food delivery services?",
                "scale": 5,
                "addable": True,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "What is the most important factor for you when ordering food delivery?",
                "options": [
                    "Delivery speed",
                    "Food quality",
                    "Restaurant selection",
                    "Pricing",
                    "Customer service"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Would you be willing to pay higher fees for faster delivery?",
                "addable": False,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Travel Preferences Post-Pandemic",
        "description": "Understanding how travel habits have changed after the pandemic",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "How has your frequency of travel changed compared to pre-pandemic?",
                "options": [
                    "Traveling much less",
                    "Traveling somewhat less",
                    "No change",
                    "Traveling somewhat more",
                    "Traveling much more"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "What factors are most important when choosing a travel destination now?",
                "options": [
                    "Health and safety measures",
                    "Flexible cancellation policies",
                    "Less crowded destinations",
                    "Cost",
                    "Outdoor activities",
                    "Local healthcare facilities"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Are you more likely to choose domestic over international travel?",
                "addable": True,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["RATING"],
                "question": "How comfortable do you feel staying in hotels currently?",
                "scale": 5,
                "addable": False,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["SHORT_TEXT"],
                "question": "What is your top travel destination for the next year?",
                "placeholder": "Enter destination...",
                "addable": True,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Coffee Consumption Habits",
        "description": "Survey on coffee preferences and drinking habits",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "How many cups of coffee do you drink per day?",
                "options": [
                    "None",
                    "1 cup",
                    "2-3 cups",
                    "4-5 cups",
                    "More than 5 cups"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "How do you typically prepare your coffee?",
                "options": [
                    "Drip coffee maker",
                    "French press",
                    "Espresso machine",
                    "Pour over",
                    "Instant coffee",
                    "Cold brew",
                    "Coffee shop purchase"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "What type of coffee do you prefer?",
                "options": [
                    "Black coffee",
                    "Coffee with milk/cream",
                    "Latte/Cappuccino",
                    "Espresso",
                    "Flavored coffee drinks"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["RATING"],
                "question": "How important is the quality of coffee beans to you?",
                "scale": 5,
                "addable": False,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Do you ever drink decaffeinated coffee?",
                "addable": False,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Fitness Routines",
        "description": "Understanding personal fitness habits and preferences",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "How often do you exercise?",
                "options": [
                    "Daily",
                    "4-6 times per week",
                    "2-3 times per week",
                    "Once a week",
                    "Less than once a week",
                    "Never"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "What types of exercise do you usually do?",
                "options": [
                    "Running/jogging",
                    "Weight training",
                    "Yoga/Pilates",
                    "Team sports",
                    "Swimming",
                    "Cycling",
                    "HIIT workouts",
                    "Walking"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["RATING"],
                "question": "How would you rate your current fitness level?",
                "scale": 5,
                "addable": False,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Do you use fitness apps or wearable devices to track your workouts?",
                "addable": True,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "Where do you typically exercise?",
                "options": [
                    "At home",
                    "Gym or fitness center",
                    "Outdoors",
                    "Sports facility",
                    "Fitness studio (yoga, pilates, etc.)"
                ],
                "addable": False,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Reading Habits Survey",
        "description": "Understanding people's reading preferences and behaviors",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "How many books do you read in a year?",
                "options": [
                    "0 books",
                    "1-5 books",
                    "6-12 books",
                    "13-24 books",
                    "25+ books"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "What genres do you typically read?",
                "options": [
                    "Fiction",
                    "Non-fiction",
                    "Mystery/Thriller",
                    "Science Fiction/Fantasy",
                    "Romance",
                    "Biography/Memoir",
                    "Self-help/Personal Development",
                    "History"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "What format do you prefer for reading?",
                "options": [
                    "Physical books",
                    "E-books",
                    "Audiobooks",
                    "Mix of formats"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["RATING"],
                "question": "How important is reading in your life?",
                "scale": 5,
                "addable": False,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["SHORT_TEXT"],
                "question": "What book are you currently reading or have last read?",
                "placeholder": "Enter book title...",
                "addable": True,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Smart Home Technology",
        "description": "Survey on smart home device adoption and preferences",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "Which smart home devices do you currently use?",
                "options": [
                    "Smart speakers (Alexa, Google Home, etc.)",
                    "Smart lighting",
                    "Smart thermostats",
                    "Smart security systems",
                    "Smart appliances",
                    "Smart TVs",
                    "None of the above"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["RATING"],
                "question": "How satisfied are you with the integration of your smart home devices?",
                "scale": 5,
                "addable": True,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Do you have privacy concerns regarding smart home devices?",
                "addable": True,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "What is your primary reason for using smart home technology?",
                "options": [
                    "Convenience",
                    "Security",
                    "Energy efficiency",
                    "Entertainment",
                    "Accessibility"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["SHORT_TEXT"],
                "question": "What smart home device would you like to purchase next?",
                "placeholder": "Enter device name...",
                "addable": True,
                "points": 5
            }
        ]
    },
    {
        "survey_id": str(uuid.uuid4()), # Replaced with uuid
        "title": "Personal Finance Management",
        "description": "Understanding how people manage their personal finances",
        "questions": [
            {
                "id": "q1",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "How often do you track your personal expenses?",
                "options": [
                    "Daily",
                    "Weekly",
                    "Monthly",
                    "Occasionally",
                    "Never"
                ],
                "addable": False,
                "points": 5
            },
            {
                "id": "q2",
                "type": QUESTION_TYPES["MULTIPLE_CHOICE"],
                "question": "Which methods do you use to manage your finances?",
                "options": [
                    "Spreadsheets",
                    "Budgeting apps",
                    "Banking apps",
                    "Financial advisor",
                    "Pen and paper",
                    "Mental tracking"
                ],
                "addable": True,
                "points": 5
            },
            {
                "id": "q3",
                "type": QUESTION_TYPES["YES_NO"],
                "question": "Do you have a formal budget?",
                "addable": False,
                "points": 5
            },
            {
                "id": "q4",
                "type": QUESTION_TYPES["RATING"],
                "question": "How confident are you in your financial management skills?",
                "scale": 5,
                "addable": True,
                "points": 5
            },
            {
                "id": "q5",
                "type": QUESTION_TYPES["SINGLE_CHOICE"],
                "question": "What is your biggest financial goal currently?",
                "options": [
                    "Paying off debt",
                    "Saving for a major purchase",
                    "Building an emergency fund",
                    "Investing for retirement",
                    "Increasing income"
                ],
                "addable": True,
                "points": 5
            }
        ]
    }
]


voucher_data = [{
    "id" : "voucher-001",
    "name" : "McDonald $5",
    "points" : 5,
},
{
    "id" : "voucher-002",
    "name" : "Burger King $5",
    "points" : 5,
}
]

# Upload data to Supabase
def upload_survey(supabase):
    """Upload sample survey data to Supabase"""
    for survey in sample_survey:
        # Now survey['survey_id'] contains the UUID generated when the script was loaded
        result = supabase.table("surveys").upsert(survey).execute()
        if hasattr(result, 'error') and result.error:
            print(f"Error uploading survey {survey['survey_id']}: {result.error}")
        else:
            print(f"Survey {survey['survey_id']} uploaded successfully!")

    for voucher in voucher_data:
        result = supabase.table("vouchers").upsert(voucher).execute()
        if hasattr(result, 'error') and result.error:
            print(f"Voucher {voucher['id']} upload failed: {result.error}")
        else:
            print(f"Voucher {voucher['id']} uploaded successfully!")

def clear_supabase(supabase):
    """Clear all data from Supabase tables"""
    dummy_uuid = "00000000-0000-0000-0000-000000000000"
    try:
        # Clear surveys table
        supabase.table("surveys").delete().neq("survey_id", dummy_uuid).execute()

        # Clear users table
        # supabase.table("users").delete().neq("id", "dummy-id-for-safety").execute()

        # Clear voucher table
        supabase.table("vouchers").delete().neq("id", dummy_uuid).execute()

        print("Supabase tables cleared successfully!")
    except Exception as e:
        print(f"Error clearing Supabase tables: {e}")