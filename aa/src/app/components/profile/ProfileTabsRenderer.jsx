// components/profile/ProfileTabsRenderer.jsx
import React from "react";
import ProfileTab from "./ProfileTab";
import QuestionsTab from "./QuestionsTab";
import VouchersTab from "./VouchersTab";
import PastSurveyTab from "./PastSurvey";
import ErrorMessage from "./ErrorMessage";
import LoadingSpinner from "./LoadingSpinner";

export default function ProfileTabsRenderer({
  activeTab,
  userData,
  loading,
  error,
}) {
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  switch (activeTab) {
    case "profile":
      return <ProfileTab userData={userData} />;
    case "questions":
      return <QuestionsTab userData={userData} />;
    case "vouchers":
      return <VouchersTab userData={userData} />;
    case "pastSurveys":
      return <PastSurveyTab userData={userData} />;
    default:
      return <div className="text-gray-600">Invalid tab selected</div>;
  }
}
