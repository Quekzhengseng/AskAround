"use client";
import React, { useState, useEffect } from "react";
import { Coins, AlertCircle, CheckCircle2, X } from "lucide-react";

const PublishSurveyModal = ({
  isOpen,
  onClose,
  userData,
  onPublishWithPush,
  onPublishWithoutPush,
  surveyTitle,
  isUpdate,
}) => {
  const [selectedRespondents, setSelectedRespondents] = useState(1); // Default to 1
  const availableCredits = userData?.credit || 0;
  const [error, seterror] = useState();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedRespondents(1);
    }
  }, [isOpen]);

  // Handle slider or input change
  const handleRespondentChange = (e) => {
    const value = parseInt(e.target.value);
    setSelectedRespondents(Math.min(Math.max(1, value), availableCredits || 1));
  };

  // Handle publish with push
  const handlePublishWithPush = () => {
    if (userData.credit < selectedRespondents) {
      seterror("Not Enough Credits");
    } else {
      onPublishWithPush(selectedRespondents);
      onClose();
    }
  };

  // Get classes for the publish button
  const getPublishButtonClasses = () => {
    const baseClasses =
      "w-full py-2 px-4 rounded-md font-medium text-sm transition-colors shadow-sm";

    if (availableCredits < 1) {
      return `${baseClasses} bg-gray-300 text-gray-500 cursor-not-allowed`;
    }

    return `${baseClasses} bg-[#7c3aed] hover:bg-[#5b21b6] text-white hover:shadow`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7c3aed] to-[#6d28d9] px-6 py-4 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">
            {isUpdate ? "Update & Publish Survey" : "Publish Survey"}
          </h3>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="font-medium text-gray-800">{surveyTitle}</p>
            <p className="text-gray-500 text-sm mt-1">
              Your survey is ready to be published.
            </p>
          </div>

          {/* Credit display */}
          <div className="bg-indigo-50 p-4 rounded-lg mb-6">
            <div className="flex items-center mb-3">
              <Coins size={20} className="text-indigo-600 mr-2" />
              <span className="font-medium text-indigo-800">
                Available Credits
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Balance</span>
              <span className="font-bold text-indigo-700">
                {availableCredits} credits
              </span>
            </div>
            <div className="mt-3 text-xs text-gray-500">
              Each credit allows for one survey respondent.
            </div>
          </div>

          {/* Respondent selector - only show if they have credits */}
          {availableCredits > 0 ? (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of respondents to push survey to
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1"
                  max={availableCredits}
                  value={selectedRespondents}
                  onChange={handleRespondentChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <input
                  type="number"
                  min="1"
                  max={availableCredits}
                  value={selectedRespondents}
                  onChange={handleRespondentChange}
                  className="w-16 p-1 text-center border border-gray-300 rounded-md"
                />
              </div>
              <div className="mt-1 text-xs text-gray-500 flex justify-between">
                <span>Min: 1</span>
                <span>Max: {availableCredits}</span>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 p-4 rounded-lg mb-6 flex items-start">
              <AlertCircle
                size={18}
                className="text-amber-500 mr-2 mt-0.5 flex-shrink-0"
              />
              <div>
                <p className="text-amber-800 font-medium text-sm">
                  No credits available
                </p>
                <p className="text-amber-700 text-xs mt-1">
                  You don't have any credits to push your survey to respondents.
                  You can still publish without respondent push or
                  <a href="/store" className="text-indigo-600 font-medium ml-1">
                    purchase credits
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {/* Publish options */}
          <div className="space-y-3">
            <button
              onClick={handlePublishWithPush}
              disabled={availableCredits < 1}
              className={getPublishButtonClasses()}
            >
              <div className="flex items-center justify-center">
                <CheckCircle2 size={16} className="mr-2" />
                {isUpdate
                  ? "Update & Push to Respondents"
                  : "Publish & Push to Respondents"}
                <span className="ml-1 text-xs">
                  ({selectedRespondents}{" "}
                  {selectedRespondents === 1 ? "credit" : "credits"})
                </span>
              </div>
            </button>

            <button
              onClick={onPublishWithoutPush}
              className="w-full py-2 px-4 border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 rounded-md font-medium text-sm transition-colors"
            >
              {isUpdate
                ? "Update Without Push"
                : "Publish Without Respondent Push"}
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            <p>{error}</p>
            <p>
              <strong>With push:</strong> Your survey will be distributed to
              participants automatically.
            </p>
            <p className="mt-1">
              <strong>Without push:</strong> Your survey will be published but
              you'll need to share the link manually.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublishSurveyModal;
