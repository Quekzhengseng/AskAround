// utils/surveyPublisherAPI.js
const PUBLISHER_API_URL = "http://localhost:5004";

/**
 * Simplified helper function to handle API requests for the publisher service
 */
async function apiRequest(endpoint, method = "POST", data = null) { // Default to POST as GET is removed
  console.log(`Publisher API: ${method} ${endpoint}`); // Basic log
  const url = `${PUBLISHER_API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    cache: 'no-store', // Prevent caching for actions
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const responseData = await response.json(); // Assume response is always JSON

    if (!response.ok) {
      // Throw the error message from backend or a generic one
      throw new Error(responseData.error || responseData.message || `HTTP error ${response.status}`);
    }
     // Also check for backend reporting success: false
     if (responseData.success === false) {
         throw new Error(responseData.error || "Operation failed");
     }


    return responseData; // Return the parsed data on success
  } catch (error) {
    console.error(`Publisher API Error (${method} ${endpoint}):`, error);
    // Re-throw the error to be caught by the calling function
    throw error;
  }
}

// --- API Function definitions remain the same ---
export const SurveyPublisherAPI = {
  createSurvey: async (surveyData) => {
    return await apiRequest(`/surveys`, "POST", surveyData);
  },
  updateSurvey: async (surveyId, surveyData) => {
    return await apiRequest(`/surveys/${surveyId}`, "PUT", surveyData);
  },
  deleteSurvey: async (surveyId) => {
    return await apiRequest(`/surveys/${surveyId}`, "DELETE");
  },
  publishSurvey: async (surveyId) => {
    return await apiRequest(`/surveys/${surveyId}/publish`, "POST");
  },
  unpublishSurvey: async (surveyId) => {
    return await apiRequest(`/surveys/${surveyId}/unpublish`, "POST");
  },
  healthCheck: async () => {
     // Keep GET for health check specifically
     try {
        console.log(`Publisher API: GET /health`);
        const response = await fetch(`${PUBLISHER_API_URL}/health`);
        if (!response.ok) throw new Error(`Health check failed: ${response.status}`)
        return await response.json();
     } catch (error) {
         console.error(`Publisher API Error (GET /health):`, error);
         throw error;
     }
  },
};