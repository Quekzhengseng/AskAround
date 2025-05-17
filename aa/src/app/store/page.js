"use client";

import React, { useState, useEffect } from "react";

// Components Imports
import Footer from "../components/common/footer";
import Header from "../components/common/header";
import CreditPackage from "../components/store/CreditPackage";
import OrderSummary from "../components/store/OrderSummary";
import PaymentStatus from "../components/store/PaymentStatus";

// API Imports
import { UseAuth } from "./../utils/hooks/UseAuth";
import { PaymentAPI } from "./../utils/SurveyAPI";

const CreditStoreDisplay = () => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const { userData } = UseAuth();

  const CREDIT_PRICE = 10.0;
  const totalPrice = CREDIT_PRICE * quantity;

  // Credit package benefits
  const CREDIT_BENEFIT = [
    "Run surveys with respondents per credit",
    "Access to all question types and templates",
    "Real-time analytics and reporting",
    "Export data in multiple formats",
  ];

  const handleCheckout = async () => {
    try {
      setLoading(true);
      // Get token from wherever you store it (localStorage, context, etc.)
      const token = localStorage.getItem("token");

      const response = await PaymentAPI.handleCheckout(token, quantity * 10);

      console.log(response);

      // Redirect to Stripe checkout
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 flex flex-col">
      {/* --- Header --- */}
      <Header />

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Purchase Credits
            </h1>
            <p className="text-gray-600 mt-2">
              Power your research with flexible survey credits
            </p>
          </div>

          {/* Credit Purchase Section */}
          <section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Survey Credits</h2>
              <p className="text-indigo-100">
                Get more responses with our flexible credit packages
              </p>
            </div>

            <div className="p-6 md:p-8 md:flex gap-8">
              <CreditPackage
                creditPrice={CREDIT_PRICE}
                benefits={CREDIT_BENEFIT}
              />

              <OrderSummary
                quantity={quantity}
                setQuantity={setQuantity}
                creditPrice={CREDIT_PRICE}
                totalPrice={totalPrice}
                handleCheckout={handleCheckout}
                loading={loading}
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

// Builder for after payment modal
const Message = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 flex flex-col">
    <Header />

    <main className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
      <PaymentStatus message={message} />
    </main>

    <Footer />
  </div>
);

// After payment is fufilled
export default function CreditStore() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage(
        "Credits purchased successfully! You can now use these credits for your surveys."
      );
    }

    if (query.get("canceled")) {
      setMessage(
        "Credit purchase canceled. You have not been charged. Please try again when you're ready."
      );
    }
  }, []);

  return (
    <>{message ? <Message message={message} /> : <CreditStoreDisplay />}</>
  );
}
