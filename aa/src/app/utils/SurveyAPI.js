// utils/surveyAPI.js

// Update the base URL for each service
const SURVEY_SERVICE_URL = "http://localhost:5000";
const USER_SERVICE_URL = "http://localhost:5001";
const VOUCHER_SERVICE_URL = "http://localhost:5002";
const AUTHENTICATION_SERVICE_URL = "http://localhost:5005";
const RESPONSES_SERVICE_URL = "http://localhost:5101";

/**
 * Helper function to handle API requests with dynamic base URL
 */
async function apiRequest(
  baseUrl,
  endpoint,
  method = "GET",
  data = null,
  token = null
) {
  console.log(`Calling: ${baseUrl}${endpoint}`);
  const url = `${baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  getUserToBeAnsweredSurveys: async (token) => {
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/surveys/to-answer`,
      "GET",
      null,
      token
    );
    return response.data;
  },

  /**
   * Check the health status of the API
   */
  healthCheck: async () => {
    return await apiRequest(SURVEY_SERVICE_URL, "/health");
  },
};

/**
 * User-related API functions
 */
export const UserAPI = {
  /**
   * Verify JWT Token
   */
  verifyToken: async (token) => {
    // Just pass the token in the Authorization header
    const response = await apiRequest(
      AUTHENTICATION_SERVICE_URL,
      "/verify",
      "POST",
      null, // No body needed
      token // Pass token in header
    );
    return response;
  },

  /**
   * Logout of all devices
   */
  logout: async (token) => {
    // Updated to send token in Authorization header
    const response = await apiRequest(
      AUTHENTICATION_SERVICE_URL,
      "/logout",
      "POST",
      null,
      token
    );
    return response;
  },

  /**
   * Get user data
   */
  getUserData: async (token) => {
    // Updated to use token-based authentication
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user`,
      "GET",
      null,
      token
    );
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
  changePoints: async (userId, surveyId, questionId, token) => {
    // Updated to use token and match the Flask API endpoint
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/next/${userId}`,
      "PUT",
      {
        survey_id: surveyId,
        question_id: questionId,
      },
      token
    );
    return response;
  },

  /**
   * Get all user data for saved questions
   */
  getSavedQuestions: async (token) => {
    // Updated to use token-based authentication
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/savedquestion`,
      "GET",
      null,
      token
    );
    return response.data;
  },

  /**
   * Delete specific saved question per user
   */
  removeSavedQuestion: async (index, token) => {
    // Updated to use token-based authentication
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/${index}`,
      "DELETE",
      null,
      token
    );
    return response.data;
  },

  /**
   * Add a question response for a specific user
   */
  addQuestionResponse: async (question, answer, token) => {
    // Updated to use token-based authentication
    return await apiRequest(
      USER_SERVICE_URL,
      `/user/add`,
      "PUT",
      {
        question,
        answer,
      },
      token
    );
  },

  /**
   * Add a survey to user's answered surveys list
   */
  addAnsweredSurvey: async (surveyId, token) => {
    // Updated to use token-based authentication
    return await apiRequest(
      USER_SERVICE_URL,
      `/user`,
      "PUT",
      {
        survey_id: surveyId,
      },
      token
    );
  },

  // ResponseAPI 
  submitFullResponse: async (surveyId, userId, answersPayload, token = null) => {
    const endpoint = "/responses";
    const url = `${RESPONSES_SERVICE_URL}${endpoint}`;
    const method = "POST";
    const payload = { 
        survey_id: surveyId,
        UID: userId,
        answers: answersPayload,
    };

    console.log(`Calling Directly: ${method} ${url}`);

    const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
    };

    // Add Authorization header ONLY if a token is provided
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log(">>> submitFullResponse: Authorization header ADDED");
    } else {
        console.log(">>> submitFullResponse: Authorization header NOT added (no token)");
    }

    const options = {
        method: method,
        headers: headers,
        body: JSON.stringify(payload), 
    };

    try {
        const response = await fetch(url, options);

        // Try to parse JSON, handle errors/non-JSON
        const contentType = response.headers.get("content-type");
        let responseData;
        if (contentType && contentType.includes("application/json")) {
           try { responseData = await response.json(); }
           catch (e) { responseData = { error: "Invalid JSON response", _status: response.status }; }
        } else { responseData = { _status: response.status }; }

        if (!response.ok) {
          const errorMessage = responseData?.error || response.statusText || `HTTP error ${response.status}`;
          console.error(`Direct API Error (${url}): Status ${response.status}, Message: ${errorMessage}`, responseData);
          const error = new Error(errorMessage);
          error.status = response.status;
          error.data = responseData;
          throw error;
        }
        // Return parsed JSON data on success
        return responseData;

    } catch (error) {
        console.error(`Direct Fetch/Processing Error (${endpoint}):`, error);
        throw error;
    }},

  /**
   * Answer a question and update user points in one operation
   * @param {string} surveyId - The survey ID
   * @param {string} questionId - The question ID
   * @param {string} question - The question text
   * @param {any} answer - The user's answer
   * @param {string} token - JWT token
   * @returns {Object} - The updated points and success status
   */
  answerQuestion: async (surveyId, questionId, question, answer, token) => {
    try {
      // First, save the question response
      await UserAPI.addQuestionResponse(question, answer, token);

      // Then update points (userId is derived from token on the server-side)
      const pointsResponse = await UserAPI.changePoints(
        "current", // Placeholder since userId is derived from token
        surveyId,
        questionId,
        token
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
  getUserToBeAnsweredSurveys: async (token) => {
    const response = await apiRequest(
      USER_SERVICE_URL,
      `/user/surveys/answered`,
      "GET",
      null,
      token
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
