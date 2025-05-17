"use client";

// Components Imports
import UserCard from "./components/main/UserCard";
import SurveyGrid from "./components/main/SurveyGrid";
import NoSurveyCard from "./components/main/NoSurveyCard";
import LoadingIndicator from "./components/common/loadingIndicator";
import ErrorCard from "./components/main/ErrorCard";
import Header from "./components/common/header";
import Footer from "./components/common/footer";

// Hooks Imports
import { UseAuth } from "./utils/hooks/UseAuth";
import UseFetchSurveys from "./utils/hooks/UseFetchSurveys";

export default function Home() {
  // State for surveys and loading status
  const { userData } = UseAuth();
  const { surveys, loading, error, fetchSurveys } = UseFetchSurveys(userData);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      {/* --- Header --- */}
      <Header />

      <main className="container mx-auto px-4 py-12">
        {/* User Info Card */}
        <UserCard userData={userData} />

        {/* Loading state */}
        {loading && <LoadingIndicator loadingText="Fetching Surveys..." />}

        {/* Error state */}
        {error && <ErrorCard tryAgain={(error, fetchSurveys)} />}

        {/* No surveys available */}
        {!loading && !error && surveys.length === 0 && (
          <NoSurveyCard onRefresh={fetchSurveys} />
        )}

        {/* Survey container */}
        {!loading && !error && surveys.length > 0 && (
          <SurveyGrid surveys={surveys} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
