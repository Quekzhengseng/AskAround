// Base URL for the Responses Microservice
const RESPONSES_SERVICE_URL = "http://localhost:5101"; // Make sure this is correct

/**
 * Helper function to handle API requests - can be shared or redefined here
 * If you have a shared helper, import it instead.
 */
async function apiRequest(baseUrl, endpoint, method = "GET", data = null) {
  console.log(`Calling ResponsesAPI: ${baseUrl}${endpoint}`);
  const url = `${baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // Add Authorization header if needed for these endpoints in the future
    },
  };

  if (data && (method === "POST" || method === "PUT" || method === "PATCH")) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    // Handle responses that might not have a body (like DELETE 200 OK)
    const contentType = response.headers.get("content-type");
    let responseData;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      responseData = await response.json();
    } else {
      // Handle non-JSON responses if necessary, or just check status
      responseData = { success: response.ok, status: response.status }; // Create basic object
    }


    if (!response.ok) {
      // Use error message from JSON if available, otherwise use status text
      const errorMessage = responseData.error || response.statusText || "An error occurred";
      console.error(`API Error (${url}): Status ${response.status}, Message: ${errorMessage}`, responseData);
      throw new Error(errorMessage);
    }

    // For GET requests expecting data, it's already in responseData
    // For successful DELETE (often 200 OK or 204 No Content), responseData might just have success/status
    return responseData;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error; // Re-throw to be caught by the caller
  }
}


/**
 * Responses Service API functions (excluding create)
 */
export const ResponsesAPI = {
  /**
   * Get all responses submitted across all surveys.
   * @returns {Promise<Array<Object>>} Array of response objects.
   */
  getAllResponses: async () => {
    // GET /responses returns { success: true, data: [...] }
    const response = await apiRequest(RESPONSES_SERVICE_URL, "/responses");
    return response.data; // Extract data array
  },

  /**
   * Get all responses submitted for a specific survey.
   * @param {string} surveyId - The ID of the survey.
   * @returns {Promise<Array<Object>>} Array of response objects for the given survey.
   */
  getResponsesBySurvey: async (surveyId) => {
    // GET /responses/survey/{id} returns { success: true, data: [...] }
    const response = await apiRequest(
      RESPONSES_SERVICE_URL,
      `/responses/survey/${surveyId}`
    );
    return response.data; // Extract data array
  },

  /**
   * Delete a specific response entry.
   * @param {string} surveyId - The ID of the survey.
   * @param {string} userId - The ID of the user whose response should be deleted.
   * @returns {Promise<Object>} Response from the server, e.g., { success: true, message: '...' }
   */
  deleteResponse: async (surveyId, userId) => {
    // DELETE returns { success: true, message: '...' }
    return await apiRequest(
      RESPONSES_SERVICE_URL,
      `/responses/survey/${surveyId}/user/${userId}`,
      "DELETE"
    );
  },
};

// Export the API object
export default ResponsesAPI;