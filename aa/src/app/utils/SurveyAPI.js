// utils/surveyAPI.js

// Update the base URL for each service
const SURVEY_SERVICE_URL = "http://localhost:5000";
const USER_SERVICE_URL = "http://localhost:5001";
const VOUCHER_SERVICE_URL = "http://localhost:5002";

/**
 * Helper function to handle API requests with dynamic base URL
 */
async function apiRequest(baseUrl, endpoint, method = "GET", data = null) {
  console.log(`Calling: ${baseUrl}${endpoint}`);
  const url = `${baseUrl}${endpoint}`;
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
    const response = await apiRequest(SURVEY_SERVICE_URL, "/survey");
    return response.data;
  },

  /**
   * Get surveys that a user needs to answer
   */
  getUserToBeAnsweredSurveys: async (userId) => {
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/${userId}/surveys/to-answer`
    );
    return response.data;
  },

  /**
   * Check the health status of the API
   */
  healthCheck: async () => {
    return await apiRequest(SURVEY_SERVICE_URL, "/health");
  },

  /**
   * Complete a survey by marking it as answered and updating user data
   * @param {string} userId - The user ID
   * @param {string} surveyId - The survey ID
   * @returns {boolean} - Success status
   */
  completeSurvey: async (userId, surveyId) => {
    try {
      // Call the API to move the survey
      await UserAPI.moveToAnsweredSurveys(userId, surveyId);
      return true;
    } catch (error) {
      console.error("Error completing survey:", error);
      return false;
    }
  },
};

/**
 * User-related API functions
 */
export const UserAPI = {
  /**
   * Get user data
   */
  getUserData: async (userId) => {
    const response = await apiRequest(USER_SERVICE_URL, `/user/${userId}`);
    return response.data;
  },

  /**
   * Change points of the User
   */
  changePoints: async (userId, surveyId, questionId) => {
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/next/${userId}`,
      "PUT",
      {
        survey_id: surveyId,
        question_id: questionId,
      }
    );
    return response;
  },

  /**
   * Get all user data for saved questions
   */
  getSavedQuestions: async (userId) => {
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/savedquestion/${userId}`
    );
    return response.data;
  },

  /**
   * Delete specific saved question per user
   */
  removeSavedQuestion: async (userId, index) => {
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/${userId}/${index}`,
      "DELETE"
    );
    return response.data;
  },

  /**
   * Add a question response for a specific user
   */
  addQuestionResponse: async (userId, question, answer) => {
    return await apiRequest(USER_SERVICE_URL, `/user/add/${userId}`, "PUT", {
      question,
      answer,
    });
  },

  /**
   * Add a survey to user's answered surveys list
   */
  addAnsweredSurvey: async (userId, surveyId) => {
    return await apiRequest(USER_SERVICE_URL, `/user/${userId}`, "PUT", {
      survey_id: surveyId,
    });
  },

  /**
   * Move a survey from to-be-answered to answered list
   */
  moveToAnsweredSurveys: async (userId, surveyId) => {
    return await apiRequest(USER_SERVICE_URL, `/user/move/${userId}`, "PUT", {
      survey_id: surveyId,
    });
  },

  /**
   * Answer a question and update user points in one operation
   * @param {string} userId - The user ID
   * @param {string} surveyId - The survey ID
   * @param {string} questionId - The question ID
   * @param {string} question - The question text
   * @param {any} answer - The user's answer
   * @returns {Object} - The updated points and success status
   */
  answerQuestion: async (userId, surveyId, questionId, question, answer) => {
    try {
      // First, save the question response
      await UserAPI.addQuestionResponse(userId, question, answer);

      // Then update points
      const pointsResponse = await UserAPI.changePoints(
        userId,
        surveyId,
        questionId
      );

      return {
        success: true,
        points: pointsResponse.points,
      };
    } catch (error) {
      console.error("Error answering question:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
};

/**
 * Voucher-related API functions
 */
export const VoucherAPI = {
  /**
   * Get Voucher data
   */
  getVoucher: async () => {
    const response = await apiRequest(VOUCHER_SERVICE_URL, `/voucher`);
    return response.data;
  },
};

/**
 * Combined functionality for survey flows
 */
export const SurveyFlow = {
  /**
   * Process a complete survey submission
   * @param {string} userId - The user ID
   * @param {string} surveyId - The survey ID
   * @param {Array} responses - Array of question responses
   * @returns {Object} - Status and final points
   */
  submitSurvey: async (userId, surveyId, responses) => {
    try {
      let currentPoints = 0;

      // Process each question response
      for (const response of responses) {
        const { questionId, question, answer } = response;

        // Save the response and update points
        await UserAPI.addQuestionResponse(userId, question, answer);
        const pointsResult = await UserAPI.changePoints(
          userId,
          surveyId,
          questionId
        );
        currentPoints = pointsResult.points;
      }

      // Mark the survey as complete
      await UserAPI.moveToAnsweredSurveys(userId, surveyId);

      return {
        success: true,
        surveyId,
        finalPoints: currentPoints,
      };
    } catch (error) {
      console.error("Error submitting complete survey:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  /**
   * Get all available surveys and filter them by status
   * @param {string} userId - The user ID
   * @returns {Object} - Various survey categories
   */
  getSurveysByStatus: async (userId) => {
    try {
      // Get all data in parallel
      const [allSurveys, userData] = await Promise.all([
        SurveyAPI.getAllSurveys(),
        UserAPI.getAnsweredQuestions(userId),
      ]);

      // Extract answered survey IDs
      const answeredSurveyIds = (userData.answered_surveys || []).map(
        (survey) => survey.survey_id
      );

      // Extract to-be-answered survey IDs
      const toBeAnsweredSurveyIds = (userData.to_be_answered_surveys || []).map(
        (survey) => survey.survey_id
      );

      // Filter surveys by status
      const answeredSurveys = allSurveys.filter((survey) =>
        answeredSurveyIds.includes(survey.id) 
      );

      const toBeAnsweredSurveys = allSurveys.filter((survey) =>
        toBeAnsweredSurveyIds.includes(survey.id)
      );

      const otherSurveys = allSurveys.filter(
        (survey) =>
          !answeredSurveyIds.includes(survey.id) &&
          !toBeAnsweredSurveyIds.includes(survey.id)
      );

      return {
        all: allSurveys,
        answered: answeredSurveys,
        toBeAnswered: toBeAnsweredSurveys,
        other: otherSurveys,
      };
    } catch (error) {
      console.error("Error categorizing surveys:", error);
      throw error;
    }
  },
};

export default {
  SurveyAPI,
  UserAPI,
  VoucherAPI,
  SurveyFlow,
};
