// utils/surveyAPI.js

// Update the base URL for each service
const SURVEY_SERVICE_URL = "http://localhost:5000";
const USER_SERVICE_URL = "http://localhost:5001";
const VOUCHER_SERVICE_URL = "http://localhost:5002";
const AUTHENTICATION_SERVICE_URL = "http://localhost:5005";

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

  // /**
  //  * Complete a survey by marking it as answered and updating user data
  //  * @param {string} userId - The user ID
  //  * @param {string} surveyId - The survey ID
  //  * @returns {boolean} - Success status
  //  */
  // completeSurvey: async (userId, surveyId) => {
  //   try {
  //     // Call the API to move the survey
  //     await UserAPI.moveToAnsweredSurveys(userId, surveyId);
  //     return true;
  //   } catch (error) {
  //     console.error("Error completing survey:", error);
  //     return false;
  //   }
  // },
};

/**
 * User-related API functions
 */
export const UserAPI = {
  /**
   * Verify JWT Token
   */
  verifyToken: async (token) => {
    const response = await apiRequest(
      AUTHENTICATION_SERVICE_URL,
      "/verify",
      "POST",
      { token }
    );
    return response;
  },

  /**
   * Logout of all devices
   */
  logout: async (token) => {
    const response = await apiRequest(
      AUTHENTICATION_SERVICE_URL,
      "/logout",
      "POST",
      { token }
    );
    return response;
  },

  /**
   * Get user data
   */
  getUserData: async (userId) => {
    const response = await apiRequest(USER_SERVICE_URL, `/user/${userId}`);
    return response.data;
  },

  /**
   * Request a password reset email
   * @param {string} email - User's email address
   * @returns {Promise<Object>} Response from the server
   */
  forgotPassword: async (email) => {
    const response = await apiRequest(
      AUTHENTICATION_SERVICE_URL,
      "/forgot-password",
      "POST",
      {
        email,
        reset_url: `${window.location.origin}/reset-password`,
      }
    );
    return response.data;
  },

  /**
   * Reset password with token from email
   * @param {string} password - New password
   * @param {string} accessToken - Access token from reset email
   * @returns {Promise<Object>} Response with new JWT token
   */
  resetPassword: async (password, accessToken, refreshToken) => {
    const response = await apiRequest(
      AUTHENTICATION_SERVICE_URL,
      "/reset-password",
      "POST",
      {
        password,
        access_token: accessToken,
        refresh_token: refreshToken,
      }
    );
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

  /**
   * Returns the answered surveys of the User
   */
  getUserToBeAnsweredSurveys: async (userId) => {
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/${userId}/surveys/answered`
    );
    return response.data;
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

export default {
  SurveyAPI,
  UserAPI,
  VoucherAPI,
};
