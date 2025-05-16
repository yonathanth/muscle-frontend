import React, { useState, useEffect } from "react";
import axios from "axios";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import { useRouter } from "next/navigation";
import SmallLoading from "../../admin/components/SmallLoading";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  user: User;
}
export interface User {
  id: string; // UUID
  fullName: string;
  gender: string;
  phoneNumber: string;
  email?: string;
  address: string;
  dob: Date;
  emergencyContact: string;
  firstRegisteredAt: Date;
  startDate: Date;
  totalAttendance: number;
  countDown?: number;
  height?: number;
  weight?: number;
  healthConditions: {
    condition: string;
    medications: string;
  };
  level: string;
  goal: string;
  status: string;
  freezeDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  serviceId: string;
  service?: Array<Object>;
  attendance: Array<Object>;
  profileImageUrl?: string | null;
  daysLeft: number;
  lastWorkoutDate?: Date;
  currentStreak: number;
  highestStreak: number;
  exercisesCompleted: Array<Object>;
  notifications: Notification[];
  workouts: Array<Object>;
  bmis: Array<Object>;
  mealPlans: Array<Object>;
}

const ExtendModal: React.FC<ModalProps> = ({ isOpen, onClose, user }) => {
  const router = useRouter();
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [serviceFee, setServiceFee] = useState<number | null>(null);
  const [hasRequested, setHasRequested] = useState<boolean>(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchServiceFee = async () => {
      try {
        const response = await axios.get(
          `${NEXT_PUBLIC_API_BASE_URL}/api/services/${user.serviceId}`
        );
        setServiceFee(response.data?.data?.price || null);
      } catch (error) {
        console.error("Error fetching service fee:", error);
      }
    };

    const fetchSubscriptionStatus = async () => {
      if (!user?.id || !user?.serviceId) return;

      try {
        const response = await axios.get(
          `${NEXT_PUBLIC_API_BASE_URL}/api/subscriptionRequest/${user.id}/subscriptionStatus`
        );
        setHasRequested(response.data.status === "pending");
      } catch (error) {
        console.error("Error fetching subscription status:", error);
      }
    };

    fetchServiceFee();
    fetchSubscriptionStatus();
  }, [user?.id, user?.serviceId]);

  const handleConfirmClick = async () => {
    const serviceId = user?.serviceId;
    console.log(serviceId);
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_API_BASE_URL}/api/subscriptionRequest/${user.id}`,
        { serviceId }
      );

      if (response.status === 201) {
        setIsSecondModalOpen(true);
      } else {
        setError(
          "There was an issue submitting your request. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error submitting subscription request:", error);
      setError("Failed to send request. Please contact gym management.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecondModalClose = () => {
    setIsSecondModalOpen(false);
    window.location.reload();
    onClose(); // Close both modals when the second modal is dismissed
  };

  if (!isOpen) return null;

  return (
    <>
      {!isSecondModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <div
            className="text-white rounded-lg p-6 max-w-2xl w-full shadow-lg border border-white"
            style={{
              backdropFilter: "blur(10px)",
            }}
          >
            <h2 className="text-lg font-bold mb-4 text-center">
              Extend your subscription
            </h2>
            {hasRequested ? (
              <p className="text-sm text-center mb-6">
                Your previous request is pending and being processed. If you
                have any questions, please contact gym management.
              </p>
            ) : (
              <>
                <p className="text-sm text-center mb-6">
                  We’re excited to help you continue your fitness journey!
                  Transfer{" "}
                  <strong>
                    {serviceFee ? `Birr ${serviceFee}` : "loading..."}
                  </strong>{" "}
                  to one of the below accounts and keep the receipt with you. We
                  will contact you soon. If you have any questions, please
                  contact the gym management.
                </p>
                <div className="bg-black p-4 rounded-lg">
                  <p className="font-bold mb-2">Payment options</p>
                  <ul className="text-sm">
                    <li>COMMERCIAL BANK OF ETHIOPIA: 1000564737339</li>
                    <li>BANK OF ABYSSINIA: 34323236</li>
                    <li>TELEBIRR: 094768748</li>
                    <li>DASHEN BANK: 4464738990</li>
                    <li>COOP: 74484930</li>
                  </ul>
                </div>
                <div className="flex flex-col items-center justify-center mt-6">
                  <button
                    className="flex justify-center bg-customBlue text-black py-1 px-4  w-1/3 rounded-full hover:bg-customHoverBlue"
                    onClick={handleConfirmClick}
                  >
                    {isLoading ? <SmallLoading /> : "Confirm"}
                  </button>{" "}
                  <br />
                  {error && <p className="text-red-400 ">{error}</p>}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {isSecondModalOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={(event) => {
            if (event.target === event.currentTarget) handleSecondModalClose();
          }}
        >
          <div
            className="text-white rounded-lg p-6 max-w-2xl w-full shadow-lg border border-white"
            style={{
              backdropFilter: "blur(10px)",
            }}
          >
            <h2 className="text-lg font-bold mb-4 text-center">
              Your request has been sent
            </h2>
            <div className="flex justify-center mt-6">
              <button
                className="bg-customBlue text-black py-1 px-4 rounded-full hover:bg-customHoverBlue"
                onClick={handleSecondModalClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExtendModal;
