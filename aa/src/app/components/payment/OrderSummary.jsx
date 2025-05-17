import React from "react";

const OrderSummary = ({ orderDetails }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-md text-left mb-6">
      <h3 className="font-medium text-gray-700 mb-3">Order Summary</h3>

      {orderDetails ? (
        <>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Product:</span>
            <span className="font-medium">Survey Credits</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Credits Added:</span>
            <span className="font-medium">
              {parseInt(orderDetails.quantity)} credits
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount:</span>
            <span className="font-medium">
              ${(orderDetails.amount_total / 100).toFixed(2)}
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between mb-2">
            <span className="text-gray-500">Product:</span>
            <span className="font-medium">Survey Credits</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Amount:</span>
            <span className="font-medium">Purchase Confirmed</span>
          </div>
        </>
      )}
    </div>
  );
};

export default OrderSummary;
