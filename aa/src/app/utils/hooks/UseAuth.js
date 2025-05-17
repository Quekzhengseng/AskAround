// hooks/useAuth.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAPI } from "./../SurveyAPI";

export const UseAuth = ({ skipRedirect = false } = {}) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      // Only redirect if skipRedirect is false
      if (!skipRedirect) {
        router.push("/login");
      }
      return;
    }

    const verifyUser = async () => {
      try {
        const result = await UserAPI.verifyToken(token);
        const fetchedUserData = await UserAPI.getUserData(token);
        setUserData(fetchedUserData);
      } catch (err) {
        setError("Invalid token");
        // Clear invalid token and redirect if not skipping redirects
        localStorage.removeItem("token");
        if (!skipRedirect) {
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router, skipRedirect]);

  return { userData, loading, error };
};