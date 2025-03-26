const QUESTION_TYPES = {
  SHORT_TEXT: "SHORT_TEXT",
  LONG_TEXT: "LONG_TEXT",
  SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  RATING: "RATING",
  YES_NO: "YES_NO",
  EMAIL: "EMAIL",
  DATE: "DATE",
};

export const sampleSurvey = {
  id: "sample-survey-001",
  title: "Singapore Management University Toliet Survey",
  description: "To Survey Toliets",
  questions: [
    {
      id: "q1",
      type: QUESTION_TYPES.SHORT_TEXT,
      question: "What's your name?",
      placeholder: "Type your answer here...",
      required: true,
    },
    {
      id: "q2",
      type: QUESTION_TYPES.YES_NO,
      question: "Are you a student?",
      required: true,
    },
    {
      id: "q3",
      type: QUESTION_TYPES.SINGLE_CHOICE,
      question: "Which Toliet in Singapore Management University do you use the most?",
      options: [
        "School Of Computing",
        "School Of Economics",
        "School Of Business",
        "School Of Law",
        "Other",
      ],
      required: true,
    },
    {
      id: "q4",
      type: QUESTION_TYPES.RATING,
      question: "How would you rate the overall toliet experience in Singapore Management University?",
      scale: 5,
      required: true,
    },
    {
      id: "q5",
      type: QUESTION_TYPES.LONG_TEXT,
      question: "Do you have any suggestions for toliet improvement?",
      placeholder: "Share your thoughts here...",
      required: false,
    },
    {
      id: "q6",
      type: QUESTION_TYPES.YES_NO,
      question: "Do you think the toliets in Singapore Managemnent University need refurbishment?",
      required: true,
    },
  ],
};
