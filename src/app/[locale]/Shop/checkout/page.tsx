"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useCart } from "../_components/CartContext";
import { Link } from "../../../../i18n/routing";

import SmallLoading from "../../admin/components/SmallLoading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const RegisterSummary = () => {
  const { cartItems, clearCart } = useCart();
  const [total, setTotal] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showModal, setShowModal] = useState(false); // Modal state
  const [loading, setLoading] = useState(false);

  const router = useRouter(); // For navigating back to shop

  useEffect(() => {
    const cartTotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotal(cartTotal.toFixed(2));
  }, [cartItems]);

  const handleConfirmPayment = async () => {
    setErrorMessage(""); // Reset error message

    // Validate phone number
    if (!/^\d{10,}$/.test(phoneNumber)) {
      setErrorMessage("Phone number must be at least 10 digits and numeric.");
      return;
    }

    if (!name) {
      setErrorMessage("Please enter your name.");
      return;
    }

    // Prepare order data
    const orderData = {
      customerName: name,
      phoneNumber,
      status: "Pending", // Set a default status
      orderItems: cartItems.map((item) => ({
        productId: item.id, // Ensure `id` matches your product model
        quantity: item.quantity,
      })),
    };

    setLoading(true); // Start loading

    try {
      // Send a single API request with the entire order and its items
      const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error("Failed to create order. Please try again.");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || "Order creation failed.");
      }

      // Show modal if successful
      setShowModal(true);
    } catch (error) {
      console.error("Error confirming payment:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "An unexpected error occurred during payment confirmation."
      );
    } finally {
      setLoading(false); // End loading
    }
  };

  if (!cartItems.length) {
    return <p>Loading...</p>;
  }

  return (
    <div className="text-white flex justify-center items-center p-4 md:p-10 min-h-screen bg-black">
      <div className="bg-gray-800 p-6 md:p-8 pt-12 md:pt-16 rounded-lg shadow-lg w-full max-w-4xl md:w-3/4">
        <h2 className="text-lg md:text-xl font-semibold mb-4 pb-2 border-b border-gray-600">
          Order Summary
        </h2>

        {/* User Details */}
        <div className="mt-4 mb-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-200"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-lg bg-gray-700 text-white"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-200"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full p-2 border rounded-lg bg-gray-700 text-white"
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </div>

        {/* Cart Summary */}
        <div className="mb-4">
          <h3 className="text-lg md:text-xl font-semibold mb-2">
            Items Selected:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First column - Items */}
            <ul>
              {cartItems.map((item, index) => (
                <li key={index} className="mb-1">
                  {item.name} (Qty: {item.quantity})
                </li>
              ))}
            </ul>

            {/* Second column - Prices */}
            <ul className="text-left md:text-right">
              {cartItems.map((item, index) => (
                <li key={index} className="mb-1">
                  {`ETB ${(item.price * item.quantity).toFixed(2)}`}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Total */}
        <div className="border-t border-customHoverBlue pt-4">
          <div className="flex justify-between font-semibold text-lg">
            <p>Total:</p>
            <p>{`ETB ${total}`}</p>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="mt-6">
          <h3 className="text-lg md:text-xl font-semibold text-customBlue">
            Payment Instructions
          </h3>
          <div className="bg-[#c0ebff] p-4 mt-2 rounded-lg border border-customBlue text-sm md:text-base">
            <p className="mb-2 text-black">
              Please transfer 50% of the total amount --- ETB{" "}
              {total ? (parseFloat(total) / 2).toFixed(2) : "0.00"} --- to one
              of the following accounts:
            </p>
            <ul className="list-none text-black space-y-1">
              <li>
                <strong>CBE:</strong> Account Number 123456789
              </li>
              <li>
                <strong>Bank of Abyssinia:</strong> Account Number 987654321
              </li>
              <li>
                <strong>TeleBirr:</strong> Phone Number 0912345678
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-400 mt-4">
            After making the payment, click the button below to confirm your
            order.
          </p>
        </div>

        {/* Buttons */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleConfirmPayment}
            className="bg-customBlue text-white py-2 px-6 rounded-lg font-semibold hover:bg-customHoverBlue w-full md:w-auto flex items-center justify-center gap-2"
          >
            {loading ? <SmallLoading /> : "Confirm Payment"}
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-800 p-6 md:p-10 rounded-lg shadow-lg w-full max-w-sm flex flex-col justify-center">
            <h2 className="text-gray-400 mb-6 text-center text-lg md:text-xl">
              Your order is being processed. Thank you for your patience!
            </h2>
            <div className="flex justify-center mt-auto">
              <Link href="/Shop">
                <button
                  className="bg-customBlue text-white py-3 px-8 rounded-lg font-semibold hover:bg-customHoverBlue"
                  onClick={() => clearCart()}
                >
                  Go Back to Shop
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegisterSummary;
