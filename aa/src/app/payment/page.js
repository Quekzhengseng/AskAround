"use client";

import React, { useEffect, useState } from "react";
import { PaymentAPI } from "./../utils/SurveyAPI";
import PaymentStatus from "./../components/payment/PaymentStatus";

export default function Payment() {
  const [status, setStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL parameters to determine payment status
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setStatus("success");

      // Get session_id if available
      const sessionId = query.get("session_id");

      if (sessionId) {
        // Fetch session details from your backend
        fetchSessionDetails(sessionId);
      } else {
        setLoading(false);
      }
    } else if (query.get("canceled")) {
      setStatus("canceled");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Function to fetch session details
  const fetchSessionDetails = async (sessionId) => {
    try {
      setLoading(true);

      // Call the PaymentAPI.getSession method
      const response = await PaymentAPI.getSession(sessionId);

      // Log the response for debugging
      console.log("Session response:", response);

      // Set order details
      setOrderDetails(response);
    } catch (error) {
      console.error("Error fetching session details:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <PaymentStatus
        status={status}
        loading={loading}
        orderDetails={orderDetails}
      />
    </div>
  );
}
