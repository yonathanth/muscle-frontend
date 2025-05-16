import React, { useState } from "react";
import axios from "axios";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ExtendModalProps {
  onClose: () => void;
  isOpen: boolean;
  hasRequested: boolean;
  onConfirm: () => void;
  serviceId: string;
  serviceFee: number;
  userId: string;
}

const ExtendModal: React.FC<ExtendModalProps> = ({
  onClose,
  isOpen,
  hasRequested,
  onConfirm,
  serviceId,
  serviceFee,
  userId,
}) => {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const onOptionsConfirm = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_API_BASE_URL}/api/subscriptionRequest/${userId}`,
        { serviceId }
      );
      if (response.status === 201) {
        setMessage("Request submitted successfully!");
        onConfirm(); // Update the parent state
        setSuccess(true);
      } else {
        setMessage(
          "There was an issue submitting your request. Please try again."
        );
      }
    } catch (error) {
      console.error("Error during subscription request:", error);
      setMessage(
        "Failed to submit the subscription request. Please contact the administrator."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {isConfirmOpen ? (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-[#121212] text-white rounded-lg p-6 w-full max-w-lg shadow-lg">
            <h3 className="text-center text-lg font-semibold mb-4">
              Confirm Subscription Extension
            </h3>
            <p className="text-center text-sm mb-6">
              You are about to request a subscription extension for the fee of{" "}
              <span className="font-bold">Birr {serviceFee}</span>. Do you wish
              to proceed?
            </p>
            {message && (
              <p
                className={`text-center text-sm mb-4 ${
                  message.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
            {!success ? (
              <div className="flex justify-center space-x-4">
                <button
                  onClick={handleConfirm}
                  className="bg-[#1ea7fd] text-black font-semibold px-4 py-2 rounded-full hover:bg-[#1483c4] transition disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-gray-500 transition"
                  disabled={isLoading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex w-full justify-center">
                {" "}
                <button
                  onClick={onClose}
                  className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-full hover:bg-gray-500 transition"
                  disabled={isLoading}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div
            className="text-white rounded-lg p-6 max-w-2xl w-full bg-white/20 shadow-lg border border-white"
            style={{
              backdropFilter: "blur(10px)",
            }}
          >
            <h2 className="text-lg font-bold mb-4 text-center text-customBlue">
              Payment Options
            </h2>
            <p className="text-sm text-center mb-6">
              Please transfer the Birr{" "}
              <span className="text-customBlue font-bold">{serviceFee}</span> to
              one of the following options and keep the receipts or screenshots
              of your payment with you. If you have any questions, please call
              us at 0943313282.
            </p>

            <div className="bg-black p-4 rounded-lg">
              <p className="font-bold mb-2">Payment Options</p>
              <ul className="text-sm">
                <li>CBE: 1000403462385 - Samrawit Solomon </li>
                <li>CBE: 1000351858684 - Robel Getahun </li>

                <li>
                  ABYSSINIA: 119144884 - Robel Getahun and or Samrawit Solomon
                </li>
              </ul>
            </div>
            <div className="flex justify-center mt-6">
              <button
                className="bg-customBlue text-black py-1 px-4 rounded-full hover:bg-customHoverBlue"
                onClick={onOptionsConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExtendModal;
