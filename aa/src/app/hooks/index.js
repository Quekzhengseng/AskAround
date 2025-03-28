// hooks/index.js
import { useState, useEffect, useCallback } from "react";
import { SurveyAPI, UserAPI } from "../utils/surveyAPI";

/**
 * Custom hook to fetch to-be-answered surveys for a specific user
 * @param {string} userId - The user ID
 * @returns {Object} - Surveys and loading state
 */
export const useUserToBeAnsweredSurveys = (userId) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSurveys = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      // Use the dedicated endpoint for to-be-answered surveys
      const data = await SurveyAPI.getUserToBeAnsweredSurveys(userId);
      console.log("To-be-answered surveys:", data);
      setSurveys(data);
    } catch (err) {
      console.error("Error fetching to-be-answered surveys:", err);
      setError(err.message || "Failed to fetch surveys");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchSurveys();
    }
  }, [userId, fetchSurveys]);

  return {
    surveys,
    loading,
    error,
    refetch: fetchSurveys,
  };
};

/**
 * Custom hook to manage a user's surveys (both answered and to-be-answered)
 * @param {string} userId - The user ID
 * @returns {Object} - User survey data and management functions
 */
export const useUserSurveys = (userId) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({});
  const [toBeAnsweredSurveys, setToBeAnsweredSurveys] = useState([]);

  // Fetch user data and to-be-answered surveys
  const fetchUserData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      // Get user data (contains answered surveys)
      const userDataResponse = await UserAPI.getAnsweredQuestions(userId);
      setUserData(userDataResponse);

      // Get to-be-answered surveys with complete data
      const surveysResponse = await SurveyAPI.getUserToBeAnsweredSurveys(
        userId
      );
      setToBeAnsweredSurveys(surveysResponse);
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError(err.message || "Failed to fetch user data");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Mark a survey as completed and move it from to-be-answered to answered
  const markSurveyAsAnswered = useCallback(
    async (surveyId) => {
      if (!userId || !surveyId) return false;

      try {
        // Call the API to move the survey
        await UserAPI.moveToAnsweredSurveys(userId, surveyId);

        // Update local state
        setToBeAnsweredSurveys((prev) =>
          prev.filter((survey) => survey.id !== surveyId)
        );

        // Update the answered surveys in user data
        const timestamp = new Date().toISOString();
        setUserData((prev) => ({
          ...prev,
          answered_surveys: [
            ...(prev.answered_surveys || []),
            { survey_id: surveyId, timestamp },
          ],
        }));

        return true;
      } catch (err) {
        console.error("Error marking survey as answered:", err);
        return false;
      }
    },
    [userId]
  );

  // Fetch user data when the component mounts or userId changes
  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  return {
    loading,
    error,
    userData,
    answeredSurveys: userData.answered_surveys || [],
    toBeAnsweredSurveys,
    markSurveyAsAnswered,
    refetch: fetchUserData,
  };
};

/**
 * Custom hook for fetching all surveys
 * @returns {Object} - All surveys and loading state
 */
export const useSurveys = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSurveys = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SurveyAPI.getAllSurveys();
      setSurveys(data);
    } catch (err) {
      console.error("Error fetching surveys:", err);
      setError(err.message || "Failed to fetch surveys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  return {
    surveys,
    loading,
    error,
    refetch: fetchSurveys,
  };
};

export default {
  useSurveys,
  useUserSurveys,
  useUserToBeAnsweredSurveys,
};
