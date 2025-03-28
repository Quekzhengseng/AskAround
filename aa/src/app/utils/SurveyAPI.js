// utils/surveyAPI.js
const API_BASE_URL = "http://localhost:5001";

/**
 * Helper function to handle API requests
 */
async function apiRequest(endpoint, method = "GET", data = null) {
  const url = `${API_BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.error || "An error occurred");
    }

    return responseData;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Survey-related API functions
 */
export const SurveyAPI = {
  /**
   * Get all available surveys
   */
  getAllSurveys: async () => {
    const response = await apiRequest("/survey");
    return response.data;
  },

  /**
   * Get surveys that a user needs to answer
   */
  getUserToBeAnsweredSurveys: async (userId) => {
    const response = await apiRequest(`/user/${userId}/surveys/to-answer`);
    return response.data;
  },

  /**
   * Check the health status of the API
   */
  healthCheck: async () => {
    return await apiRequest("/health");
  },
};

/**
 * User-related API functions
 */
export const UserAPI = {
  /**
   * Get all user data including answered questions and surveys
   */
  getAnsweredQuestions: async (userId) => {
    const response = await apiRequest(`/user/${userId}`);
    return response.data;
  },

  /**
   * Get all user data for saved questions
   */
  getSavedQuestions: async (userId) => {
    const response = await apiRequest(`/user/savedquestion/${userId}`);
    return response.data;
  },

  /**
   * Add a question response for a specific user
   */
  addQuestionResponse: async (userId, question, answer) => {
    return await apiRequest(`/user/add/${userId}`, "PUT", {
      question,
      answer,
    });
  },

  /**
   * Add a survey to user's answered surveys list
   */
  addAnsweredSurvey: async (userId, surveyId) => {
    return await apiRequest(`/user/${userId}`, "PUT", {
      survey_id: surveyId,
    });
  },

  /**
   * Move a survey from to-be-answered to answered list
   */
  moveToAnsweredSurveys: async (userId, surveyId) => {
    return await apiRequest(`/user/move/${userId}`, "PUT", {
      survey_id: surveyId,
    });
  },
};

export default {
  SurveyAPI,
  UserAPI,
};
