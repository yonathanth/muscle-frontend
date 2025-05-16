import React, { useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
}

const PaymentOptions: React.FC<ModalProps> = ({ isOpen, amount, onClose }) => {
  const handleCloseClick = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
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
            {`Please, transfer Birr ${amount} to one of the following
            Options. If you have any questions, please call us with the number
            0993971420`}
          </p>
          <div className="bg-black p-4 rounded-lg">
            <p className="font-bold mb-2">Payment options</p>
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
              onClick={handleCloseClick}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentOptions;
