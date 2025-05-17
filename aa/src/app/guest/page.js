"use client";

import React, { useState, useEffect, Suspense } from 'react'; 
import { useSearchParams, useRouter } from 'next/navigation'; 
import SurveyContainer from '../components/survey/SurveyContainer';
import { SurveyAPI } from '../utils/SurveyAPI'; 

// --- Loading/Error/Not Found Components ---
const LoadingSpinner = () => (
    <div className="flex items-center justify-center min-h-screen p-10">
        {/* You can replace this with a more sophisticated spinner */}
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <span className="ml-4 text-indigo-600">Loading Survey...</span>
    </div>
);
const ErrorDisplay = ({ message }) => (
    <div className="flex items-center justify-center min-h-screen p-10">
        <div className="text-center text-red-600 bg-red-50 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Error Loading Survey</h2>
            <p>{message || "An unexpected error occurred."}</p>
            {/* Optional: Link back home */}
            {/* <a href="/" className="text-indigo-600 hover:underline mt-4 inline-block">Go Home</a> */}
        </div>
    </div>
);
const NotFoundDisplay = () => (
    <div className="flex items-center justify-center min-h-screen p-10">
         <div className="text-center bg-white p-8 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Survey Not Found</h2>
            <p className="text-gray-600">The survey you are looking for might have been moved, deleted, or the link is incorrect.</p>
            {/* Optional: Link back home */}
            {/* <a href="/" className="text-indigo-600 hover:underline mt-4 inline-block">Go Home</a> */}
        </div>
    </div>
);
// --- End Components ---


// --- Inner component that uses the hooks ---
function GuestSurveyContent() {
    const searchParams = useSearchParams(); // Hook to read query params
    const surveyId = searchParams.get('id'); // Get 'id' value
    const router = useRouter();

    const [surveyData, setSurveyData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Now surveyId comes from useSearchParams
        if (!surveyId) {
            setError("Survey ID is missing from URL.");
            setLoading(false);
            return;
        }

        const fetchGuestSurvey = async () => {
            setLoading(true);
            setError(null);
            try {
                console.log(`Guest fetching survey by ID: ${surveyId}`);
                // Assumes SurveyAPI.getSurveyById is correctly implemented
                const fetchedSurvey = await SurveyAPI.getSurveyById(surveyId);

                if (fetchedSurvey) {
                    setSurveyData(fetchedSurvey);
                } else {
                    // If API returns successfully but no data (should ideally be caught by 404 in catch)
                    setError("Survey not found.");
                    setSurveyData(null);
                }
            } catch (err) {
                console.error("Error fetching survey for guest:", err);
                 if (err.status === 404 || err.message?.includes('not found')) {
                    setError("Survey not found.");
                 } else {
                    setError(err.message || "Failed to load survey.");
                }
                setSurveyData(null); // Clear data on error
            } finally {
                setLoading(false);
            }
        };

        fetchGuestSurvey();

    // Depend on surveyId extracted from searchParams
    }, [surveyId]);

    const handleGuestSurveyComplete = () => {
        console.log("Guest survey completed.");
        router.push('/'); // Redirect home after completion
    };

    // Render logic based on state
    if (loading) {
        return <LoadingSpinner />;
    }

    if (error || !surveyData) {
        return error === "Survey not found."
            ? <NotFoundDisplay />
            : <ErrorDisplay message={error || "Survey could not be loaded."} />;
    }

    // Render the main survey area if data loaded successfully
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <header className="text-center mb-8">
                 <h1 className="text-2xl font-bold text-gray-800">{surveyData.title || "Survey"}</h1>
                 {/* You could add a simple AskAround logo/title here if desired */}
            </header>
            <main className="container mx-auto max-w-4xl">
                <SurveyContainer
                    key={surveyData.survey_id} // Use unique key
                    survey={surveyData}
                    userId="" // Explicitly empty for guest
                    onComplete={handleGuestSurveyComplete}
                />
            </main>
             <footer className="text-center mt-8 text-gray-500 text-sm">
                AskAround Survey Platform
             </footer>
        </div>
    );
}


// --- Main Export wrapping the content in Suspense ---
export default function GuestSurveyPage() {
    return (
        // Suspense provides a fallback while useSearchParams resolves
        <Suspense fallback={<LoadingSpinner />}>
            <GuestSurveyContent />
        </Suspense>
    );
}