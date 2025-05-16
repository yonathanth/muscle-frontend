"use client";
import React, { useEffect, useState } from "react";
import PaymentOptions from "../components/PaymentOptions";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


interface CustomJwtPayload {
  id: string;
}

const ResponsiveModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [serviceFee, setServiceFee] = useState<number | null>(null);
  const [filledOUtTheForm, setFilledOutTheForm] = useState(false);

  const [userId, setUserId] = useState("");

  useEffect(() => {
    // Decode the token to extract the userId
    const decodeToken = () => {
      const token = localStorage.getItem("token");
      console.log(token);
      if (!token) {
        console.error("No token found in localStorage.");
        return;
      }

      try {
        const decodedToken = jwtDecode<CustomJwtPayload>(token);
        console.log(decodedToken.id); // Extract and store the userId
        setUserId(decodedToken.id);
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
        const isComplete = response.data.isComplete;

        const firstName = fullName.split(" ")[0]; // Extract the first name
        setUsername(firstName);
        setServiceFee(serviceFee);
        setFilledOutTheForm(isComplete);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [userId]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 relative">
      {/* Top-right toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="absolute top-6 right-6 bg-[#1ea7fd] text-black font-semibold px-4 py-2 rounded-full hover:bg-[#1483c4] transition z-50"
      >
        Payment Options
      </button>

      <div
        className="bg-[#121212] text-white rounded-lg p-6 w-full max-w-lg sm:max-w-lg lg:max-w-2xl shadow-md"
        style={{
          backdropFilter: "blur(10px)",
          border: "1px solid #fff",
        }}
      >
        {/* Modal title */}
        <h2 className="text-center text-lg font-semibold mb-4 text-customBlue">
          {!filledOUtTheForm
            ? `Dear ${username} Your Registration Request Has Been Sent!`
            : "You're all set now!"}
        </h2>
        {/* Modal content */}
        <p className="text-sm text-center mb-6 leading-relaxed">
          {!filledOUtTheForm
            ? "Your registration is currently being processed. While you wait for the admin's approval, please complete the remaining forms to provide all necessary details. If you have not yet made the payment, kindly do so using the account details provided at the top-right corner of the page. Thank you for your patience and cooperation!"
            : "Your registration is currently pending admin approval. All required forms have been successfully completed. If you have not yet made the payment, please use the account details provided at the top-right corner of the page. We appreciate your patience and will notify you once your registration is approved."}
        </p>
        {/* Action button */}
        {!filledOUtTheForm && (
          <div className="flex justify-center">
            <button
              className="bg-[#1ea7fd] text-black font-semibold px-4 py-2 rounded-full hover:bg-[#1483c4] transition"
              onClick={() => router.push(`/en/pending-user/form?id=${userId}`)}
            >
              Fill Out the Forms{" "}
            </button>
          </div>
        )}
      </div>
      {isOpen && (
        <PaymentOptions
          amount={serviceFee!}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ResponsiveModal;
