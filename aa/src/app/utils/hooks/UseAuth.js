// hooks/useAuth.js
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserAPI } from "./../SurveyAPI";

export const UseAuth = () => {
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    const verifyUser = async () => {
      try {
        const result = await UserAPI.verifyToken(token);
        const fetchedUserData = await UserAPI.getUserData(token);
        setUserData(fetchedUserData);
      } catch (err) {
        setError("Invalid token");
        router.push("/login");
      }
    };

    verifyUser();
  }, [router]);

  return { userData };
};
