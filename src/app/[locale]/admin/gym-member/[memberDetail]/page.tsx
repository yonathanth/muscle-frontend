"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import profile from "../../../../../../assets/images/pp.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

import {
  faMessage,
  faDownload,
  faEdit,
  faCalendar,
  faRefresh,
} from "@fortawesome/free-solid-svg-icons";

import ProfileImageWithModal, {
  downloadMemberId,
  downloadMemberDetails,
  FormattedName,
} from "./helperFunctions";
import { Link } from "@/src/i18n/routing";

import NotificationModal from "../../components/NotificationModal";
import EditAdmin from "../../components/EditMemberForm";
import Loading from "../../loading";
import axios from "axios";
import SmallLoading from "../../components/SmallLoading";
interface Service {
  id: string;
  name: string;
  price: string;
  benefits: string[];
  category: string;
  description?: string[];
}

interface Attendance {
  date: string;
}

interface User {
  id: string;
  barcode: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  email: string | null;
  address: string | null;
  dob: string | null;
  emergencyContact: string | null;
  firstRegisteredAt: string;
  startDate: string;
  totalAttendance: number;
  preFreezeAttendance: number;
  preFreezeDaysCount: number;
  daysLeft: number;
  height: number | null;
  weight: number | null;
  bmis: {
    id: string;
    userId: string;
    value: number;
  }[];
  healthCondition: {
    exerciseRestriction: false;
    painDuringExercise: true;
    dizzinessOrFainting: false;
    boneOrJointDisease: false;
    heartHypertensionMeds: false;
    chronicDiseases: "";
    additionalRemarks: "";
  };
  level: string | null;
  goal: string | null;
  role: string;
  password: string;
  status: string;
  freezeDate: string | null;
  createdAt: string;
  updatedAt: string;
  serviceId: string | null;
  profileImageUrl: string | null;
  attendance: Attendance[];
  service: Service;
}

const MemberDetails = ({
  params,
}: {
  params: { locale: string; memberDetail: string };
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmtModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleNotify = () => {
    setIsModalOpen(true);
  };

  const handleSendNotification = (name: string, description: string) => {
    // Handle notification logic here (e.g., send to an API)
    console.log("Notification Sent:", { name, description });
  };
  const id = params.memberDetail;

  const [memberDetails, setMemberDetails] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const [isModalLoading, setIsModalLoading] = useState<boolean>(false);

  const [message, setMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const [showEditForm, setShowEditForm] = useState<boolean>(false);

  const [isZoomed, setIsZoomed] = useState<boolean>(false); // Define the isZoomed state
  const fetchMemberDetails = async () => {
    if (!id) return;
    setIsPageLoading(true);

    setLoading(true);
    setIsPageLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/memberManagement/${id}/profile`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch member details");
      }

      const data = await response.json();
      if (data.success) {
        setMemberDetails(data.data);
      } else {
        setError(data.message || "Failed to load member details");
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
      setIsPageLoading(false);
    }
  };
  useEffect(() => {
    if (id) {
      fetchMemberDetails();
    }
  }, [id]);

  const handleManualAttendance = async () => {
    if (!id) {
      setErrorMessage("Please enter a valid User ID.");
      setMessage("");
      return;
    }

    try {
      setErrorMessage("");
      setMessage("Processing...");

      const response = await axios.post(
        `${NEXT_PUBLIC_API_BASE_URL}/api/attendance/${id}`,
        { id: id }
      );

      if (response.data.success) {
        const { totalAttendance, daysLeft } = response.data.data;
        setMessage(
          `Attendance recorded successfully! Total Attendance: ${totalAttendance}, Days Left: ${daysLeft}.`
        );
      }
    } catch (err: any) {
      setMessage("");
      setErrorMessage(
        err.response?.data?.message ||
          "An error occurred while recording attendance."
      );
    } finally {
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage("");
        setErrorMessage("");
      }, 3000);
    }
  };

  const handleRefresh = async (id: string) => {
    setIsModalLoading(true);
    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/memberManagement/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }
      setIsConfirmModalOpen(false);
      setIsModalLoading(false);

      return { success: true, message: data.message };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };
  if (loading) {
    return <div>Loading member details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!memberDetails) {
    return <div>No member details available.</div>;
  }

  return isPageLoading ? (
    <Loading />
  ) : (
    <div className="flex flex-col space-y-5 md:space-y-0 lg:flex-row bg-black text-white h-full">
      {/* Personal Info */}
      <div className="w-full lg:w-1/3 space-y-3 pr-4 flex flex-col">
        {/* Profile Card */}
        <div className="bg-[#111111] rounded-lg flex justify-between items-center">
          <div className="flex items-center p-4 space-x-4">
            <ProfileImageWithModal
              profileImageUrl={memberDetails.profileImageUrl}
            />

            <div>
              <FormattedName fullName={memberDetails.fullName} />{" "}
            </div>
          </div>
          <div
            className="mt-2 lg:mt-4 flex flex-col justify-between gap-2 lg:gap-5 p-2 pr-3 items-end"
            onClick={() => downloadMemberId(memberDetails)}
          >
            <img
              src={memberDetails.barcode}
              alt="barcode"
              className="h-6 w-12 lg:w-16 bg-white"
            />
            <span className="text-customBlue">
              {memberDetails.gender.toLowerCase() === "male" ? "M" : "F"}
            </span>
          </div>
        </div>

        {/* Address and Contact Info */}
        <div className="bg-[#111111] p-4 lg:p-6 rounded-lg flex flex-col flex-grow">
          <div className="flex-grow space-y-2 lg:space-y-4">
            {[
              { label: "Phone number:", value: memberDetails.phoneNumber },
              { label: "Email Address:", value: memberDetails.email || "N/A" }, // Fallback for null
              { label: "Address:", value: memberDetails.address },
              {
                label: "DOB:",
                value: memberDetails.dob
                  ? new Date(memberDetails.dob).toLocaleDateString()
                  : "N/A",
              }, // Format date
              {
                label: "Emergency Contact:",
                value: memberDetails.emergencyContact,
              },
            ].map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-[#6a6a6a] text-xs lg:text-sm">
                  {item.label}
                </span>
                <p className="text-xs lg:text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditForm(true)}
              className="text-xs mt-3 bg-customBlue text-black py-1 px-4 rounded-full self-start"
            >
              <FontAwesomeIcon icon={faEdit} />
            </button>
            <button
              onClick={() => downloadMemberDetails(memberDetails)}
              className="text-xs mt-3 bg-customBlue text-black py-1 px-4 rounded-full self-start"
            >
              <FontAwesomeIcon icon={faDownload} />
            </button>
            <button
              onClick={handleNotify}
              className="text-xs mt-3 bg-customBlue text-black py-1 px-4 rounded-full self-start"
            >
              <FontAwesomeIcon icon={faMessage} />
            </button>
            <button
              onClick={handleManualAttendance}
              className="text-xs mt-3 bg-customBlue text-black py-1 px-4 rounded-full self-start"
            >
              <FontAwesomeIcon icon={faCalendar} />
            </button>
            <button
              onClick={() => setIsConfirmModalOpen(true)}
              className="text-xs mt-3 bg-customBlue text-black py-1 px-4 rounded-full self-start"
            >
              <FontAwesomeIcon icon={faRefresh} />
            </button>
          </div>
        </div>
      </div>

      {/* Health Info */}
      <div className="w-full lg:w-2/3 bg-[#111111] rounded-lg p-4 pt-8 lg:p-6 space-y-8 flex-grow relative">
        {/* Membership Info */}{" "}
        <div className="flex justify-end p-1 px-3 rounded-xl absolute top-1 right-4">
          <p
            className={`${
              memberDetails.status === "active"
                ? "text-green-400"
                : memberDetails.status === "inactive"
                ? "text-red-400"
                : memberDetails.status === "pending"
                ? "text-yellow-400"
                : memberDetails.status === "expired"
                ? "text-gray-400"
                : memberDetails.status === "frozen"
                ? "text-blue-400"
                : "text-gray-400" // Default for "dormant" or any other unexpected status
            }`}
          >
            {memberDetails.status.charAt(0).toUpperCase() +
              memberDetails.status.slice(1)}
          </p>
        </div>
        <div className="bg-[#1b1b1b] px-3 py-2 border border-[#18282d] rounded-lg flex  space-y-2 justify-between items-center flex-wrap">
          {[
            {
              label: "Membership Type",
              value: memberDetails.service?.name || "N/A",
            },
            {
              label: "Days left",
              value: `${memberDetails.daysLeft || 0} Days`,
            },
            {
              label: "Member Since",
              value: new Date(
                memberDetails.firstRegisteredAt
              ).toLocaleDateString(),
            },
            {
              label: "Total Attendance",
              value: `${memberDetails.totalAttendance || 0} Days`,
            },
            {
              label: "Weight",
              value: memberDetails.weight
                ? `${memberDetails.weight} kg`
                : "N/A",
            },
          ].map((item, index) => (
            <div key={index} className="text-center flex flex-col items-center">
              <p className="text-customBlue font-bold">{item.value}</p>
              <p className="text-xs text-white">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-[#1b1b1b] px-3 py-2 border border-[#18282d] rounded-lg flex space-y-2 justify-between items-center flex-wrap">
          {[
            {
              label: "Height",
              value: memberDetails.height
                ? `${memberDetails.height} cm`
                : "N/A",
            },
            {
              label: "BMI",
              value: memberDetails.bmis.at(-1)
                ? `${memberDetails.bmis.at(-1)!.value} kg/m²`
                : "N/A",
            },
            {
              label: "Total Attendance",
              value: `${memberDetails.totalAttendance || 0}`,
            },
            {
              label: "Start Date",
              value: new Date(memberDetails.startDate).toLocaleDateString(),
            },
          ].map((item, index) => (
            <div key={index} className="text-center flex flex-col items-center">
              <p className="text-customBlue font-bold">{item.value}</p>
              <p className="text-xs text-white">{item.label}</p>
            </div>
          ))}
        </div>
        {/* Health Info */}
        <div className="flex flex-col p-8 lg:flex-row lg:justify-between items-start  lg:items-center">
          <h3 className="text-xl lg:text-3xl font-bold mb-4 lg:mb-0">
            Health Info.
          </h3>
          {memberDetails.healthCondition ? (
            <div className="text-xs lg:text-sm space-y-2 w-full">
              {[
                {
                  label: "Exercise Restrictions",
                  value: memberDetails.healthCondition.exerciseRestriction
                    ? "Yes"
                    : "No",
                },
                {
                  label: "Pain During Exercise",
                  value: memberDetails.healthCondition.painDuringExercise
                    ? "Yes"
                    : "No",
                },
                {
                  label: "Dizziness or Fainting",
                  value: memberDetails.healthCondition.dizzinessOrFainting
                    ? "Yes"
                    : "No",
                },
                {
                  label: "Bone or Joint Disease",
                  value: memberDetails.healthCondition.boneOrJointDisease
                    ? "Yes"
                    : "No",
                },
                {
                  label: "Heart/Hypertension Meds",
                  value: memberDetails.healthCondition.heartHypertensionMeds
                    ? "Yes"
                    : "No",
                },
                {
                  label: "Chronic Diseases",
                  value:
                    memberDetails.healthCondition.chronicDiseases || "None",
                },
                {
                  label: "Additional Remarks",
                  value:
                    memberDetails.healthCondition.additionalRemarks || "None",
                },
              ].map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span className="text-white">{item.label}</span>
                  <p className="text-customBlue">{item.value}</p>
                </div>
              ))}
            </div>
          ) : (
            "Not available"
          )}
        </div>
        {/* Status */}
        <div className="mt-10 rounded-lg flex flex-col py-2 px-8 lg:flex-row lg:justify-between items-start lg:items-center">
          <h3 className="text-3xl mb-2 font-bold">Status</h3>
          <div className="text-sm font-light w-full lg:ml-20">
            <div className="flex justify-between">
              <span className="text-white">Level</span>
              <p className="text-customBlue ">{memberDetails.level || "N/A"}</p>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Goal</span>
              <p className="text-customBlue"> {memberDetails.goal || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>
      <NotificationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSend={handleSendNotification}
        userId={memberDetails.id}
      />
      {showEditForm && (
        <EditAdmin
          setShowModal={setShowEditForm}
          fetchData={fetchMemberDetails}
          member={memberDetails}
        />
      )}
      {message && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {message}
        </div>
      )}
      {errorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {errorMessage}
        </div>
      )}
      {isConfirmtModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#121212] p-6 rounded-lg text-white max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirm Member Reset</h2>
            <p className="text-sm mb-6">
              Are you sure you want to reset the details of{" "}
              <span className="font-semibold">{memberDetails.fullName}</span>
            </p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition"
                onClick={() => setIsConfirmModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-customBlue text-white rounded hover:bg-customHoverBlue transition"
                onClick={() => handleRefresh(memberDetails.id)}
              >
                {isModalLoading ? <SmallLoading /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberDetails;
