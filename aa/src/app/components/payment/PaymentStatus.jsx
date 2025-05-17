import React from "react";
import LoadingSpinner from "./../common/loadingIndicator";
import SuccessMessage from "./SuccessMessage";
import CanceledMessage from "./CanceledMessage";

const PaymentStatus = ({ status, loading, orderDetails }) => {
  if (loading) {
    return <LoadingSpinner loadingText="Processing your request..." />;
  }

  switch (status) {
    case "success":
      return <SuccessMessage orderDetails={orderDetails} />;
    case "canceled":
      return <CanceledMessage />;
    default:
      return <LoadingSpinner />;
  }
};

export default PaymentStatus;
