"use client";
import React, { useState, useEffect } from "react";
import PaymentOptions from "../components/PaymentOptions";
import ExtendModal from "./components/ExtendModal";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CustomJwtPayload {
  id: string;
}

const ResponsiveModal: React.FC = () => {
  const [isOpen, setIsoOpen] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [serviceFee, setServiceFee] = useState<number | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Decode the token to extract the userId
    const decodeToken = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      try {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        setUserId(decodedToken.id); // Extract and store the userId
        console.log(userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    };

    decodeToken();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(
          `${NEXT_PUBLIC_API_BASE_URL}/api/nonActiveMembers/${userId}`
        );
        const fullName = response.data.username;
        const serviceFee = response.data.servicePrice;
        const serviceId = response.data.serviceId;

        const firstName = fullName.split(" ")[0]; // Extract the first name
        setUsername(firstName);
        setServiceFee(serviceFee);
        setServiceId(serviceId);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);
  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!userId || !serviceId) return;

      try {
        const response = await axios.get(
          `${NEXT_PUBLIC_API_BASE_URL}/api/subscriptionRequest/${userId}/subscriptionStatus`
        );
        const status = response.data.status;

        // Set hasRequested based on the subscription status
        setHasRequested(status === "pending");
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    fetchSubscriptionStatus();
  }, [userId, serviceId]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {hasRequested && (
        <button
          onClick={() => setIsPaymentModalOpen((prev) => !prev)}
          className="absolute top-6 right-6 bg-[#1ea7fd] text-black font-semibold px-4 py-2 rounded-full hover:bg-[#1483c4] transition z-50"
        >
          Payment Options
        </button>
      )}
      <div
        className="bg-[#121212] text-white rounded-lg p-6 w-full max-w-lg sm:max-w-lg lg:max-w-2xl shadow-md"
        style={{
          backdropFilter: "blur(10px)",
          border: "1px solid #fff",
        }}
      >
        <h2 className="text-center text-lg font-semibold mb-4 text-customBlue">
          {!hasRequested
            ? `Dear ${username || "User"}, your account is inactive`
            : "Your Subscription Request Has Been Sent!"}
        </h2>
        <p className="text-sm text-center mb-6 leading-relaxed">
          {!hasRequested
            ? "To extend your subscription, please click the button below and wait for the admin's approval. If you believe your subscription is still active, we kindly ask you to contact the Facility Manager or Gym Administrator for assistance."
            : "Your request to extend your subscription has been successfully submitted. Please wait for the admin's approval. If you have not made the payment, kindly transfer the required amount to one of the accounts listed at the top of the screen. If you need assistance or believe there is an issue, please contact the Facility Manager or Gym Administrator."}
        </p>
        <div className="flex justify-center">
          {!hasRequested && (
            <button
              className="bg-[#1ea7fd] text-black font-semibold px-4 py-2 rounded-full hover:bg-[#1483c4] transition"
              onClick={() => setIsoOpen(true)}
            >
              Extend your subscription
            </button>
          )}
        </div>
      </div>
      {isOpen && (
        <ExtendModal
          onClose={() => setIsoOpen(false)}
          isOpen={isOpen}
          hasRequested={hasRequested}
          onConfirm={() => setHasRequested(true)}
          serviceId={serviceId!}
          serviceFee={serviceFee!}
          userId={userId!}
        />
      )}
      {isPaymentModalOpen && (
        <PaymentOptions
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          amount={serviceFee!}
        />
      )}
    </div>
  );
};

export default ResponsiveModal;
