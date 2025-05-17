// hooks/useFetchSurveys.js
import { useEffect, useState } from "react";
import { SurveyAPI } from "./../../utils/SurveyAPI";

const UseFetchSurveys = (userData) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSurveys = async () => {
    if (!userData) return;
    try {
      setLoading(true);
      const data = await SurveyAPI.getUserToBeAnsweredSurveys(
        localStorage.getItem("token")
      );
      setSurveys(data);
    } catch (err) {
      setError(err.message || "Failed to fetch surveys");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userData) {
      fetchSurveys();
    }
  }, [userData]);

  return { surveys, loading, error, fetchSurveys };
};

export default UseFetchSurveys;
