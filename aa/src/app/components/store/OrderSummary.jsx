import React from "react";
import SecureCheckoutButton from "./SecureCheckoutButton";

const OrderSummary = ({
  quantity,
  setQuantity,
  creditPrice,
  totalPrice,
  handleCheckout,
  loading,
}) => {
  return (
    <div className="md:w-5/12 mt-6 md:mt-0">
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Order Summary
        </h3>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of credit packages
          </label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md hover:bg-gray-200 transition"
            >
              <svg
                className="h-4 w-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M20 12H4"
                ></path>
              </svg>
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              className="w-16 text-center py-2 border-t border-b border-gray-300"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-r-md hover:bg-gray-200 transition"
            >
              <svg
                className="h-4 w-4 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                ></path>
              </svg>
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {quantity} {quantity === 1 ? "package" : "packages"} ={" "}
            {quantity * 10} survey credits
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-5">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium">${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
        </div>

        <SecureCheckoutButton onClick={handleCheckout} loading={loading} />

        <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
          <svg
            className="h-4 w-4 mr-1 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
            ></path>
          </svg>
          Secure payment via Stripe
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
