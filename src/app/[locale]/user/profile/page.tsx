"use client";
import Image from "next/image";
import React, { useCallback, useEffect, useState } from "react";
import {
  CartesianGrid,
  LineChart,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";
import EditProfileModal from "./components/EditProfileModal";
import { jwtDecode } from "jwt-decode";
import {
  downloadMemberId,
  FormattedName,
} from "../../admin/gym-member/[memberDetail]/helperFunctions";
import LoadingPage from "@/src/app/[locale]/user/loading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// interface BmiData {
//   id: string;
//   userId: string;
//   value: number;
// }
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
interface CustomJwtPayload {
  id: string;
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
    createdAt: Date;
    updatedAt: Date;
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

const Page = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [memberDetails, setMemberDetails] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [showEditForm, setShowEditForm] = useState<boolean>(false);
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);

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

  const fetchMemberDetails = useCallback(async () => {
    if (!userId) return;
    setIsPageLoading(true);

    setLoading(true);
    setIsPageLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/memberManagement/${userId}/profile`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch member details");
      }

      const data = await response.json();
      if (data.success) {
        return data.data;
      } else {
        setError(data.message || "Failed to load member details");
      }
    } catch (err: any) {
      setError(err.message || "An unknown error occurred");
    } finally {
      setLoading(false);
      setIsPageLoading(false);
    }
  }, [userId]);
  useEffect(() => {
    if (userId) {
      fetchMemberDetails().then((fetchedData) => {
        setMemberDetails(fetchedData);
      });
    }
  }, [userId, fetchMemberDetails]);

  if (loading) {
    return <div>Loading member details...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!memberDetails) {
    return <div>No member details available.</div>;
  }

  if (isPageLoading) return <LoadingPage />;
  return (
    <div className="flex flex-col lg:flex-row bg-black text-white h-auto">
      {/* Personal Info */}
      <div className="w-full lg:w-1/3 space-y-3 pr-0 sm:pr-4 flex flex-col">
        {/* Profile Card */}
        <div className="bg-[#111111] rounded-lg flex justify-between items-center">
          <div className="flex items-center p-4 space-x-4">
            <Image
              src={
                `${NEXT_PUBLIC_API_BASE_URL}${memberDetails.profileImageUrl}` ||
                ""
              }
              alt="Profile"
              width={64}
              height={64}
              className=" rounded-full object-cover"
            />
            <div>
              <FormattedName fullName={memberDetails?.fullName || ""} />{" "}
            </div>
          </div>
          <div
            className="mt-2 lg:mt-4 flex flex-col justify-between gap-2 lg:gap-5 p-2 pr-3 items-end"
            onClick={() => downloadMemberId(memberDetails!)}
          >
            <Image
              src={memberDetails?.barcode || ""}
              alt="barcode"
              width={64}
              height={24}
              className="h-6 w-12 lg:w-16 bg-white"
            />
            <span className="text-customBlue">M</span>
          </div>
        </div>

        {/* Address and Contact Info */}
        <div className="bg-[#111111] p-4 lg:p-6 rounded-lg flex flex-col flex-grow">
          <div className="flex-grow space-y-2 lg:space-y-4">
            {[
              { label: "Phone number:", value: memberDetails?.phoneNumber },
              { label: "Email Address:", value: memberDetails?.email || "N/A" }, // Fallback for null
              { label: "Address:", value: memberDetails?.address },
              {
                label: "DOB:",
                value: memberDetails?.dob
                  ? new Date(memberDetails?.dob).toLocaleDateString()
                  : "N/A",
              }, // Format date
              {
                label: "Emergency Contact:",
                value: memberDetails?.emergencyContact,
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
          <button
            onClick={() => setShowEditForm(true)}
            className="text-xs mt-3 bg-customBlue text-black py-1 px-4 rounded-full self-start"
          >
            Edit profile
          </button>
          {showEditForm && (
            <EditProfileModal
              setShowModal={setShowEditForm}
              fetchData={fetchMemberDetails}
              member={memberDetails}
            />
          )}
        </div>
      </div>

      {/* Health Info */}
      <div className="w-full lg:w-2/3 bg-[#111111] rounded-lg p-4 lg:p-6 space-y-4 flex-grow mt-5 sm:mt-0">
        {/* Membership Info */}
        <div className="bg-[#1b1b1b] px-3 py-2 border border-[#18282d] rounded-lg flex flex-wrap sm:flex-row sm:justify-between sm:items-center flex-col gap-3">
          {[
            {
              label: "Membership Type",
              value: memberDetails?.service?.name || "N/A",
            },
            {
              label: "Days left",
              value: `${memberDetails?.daysLeft || 0} Days`,
            },
            {
              label: "Member Since",
              value: new Date(
                memberDetails?.firstRegisteredAt || "0000-00-00"
              ).toLocaleDateString(),
            },
            {
              label: "Total Attendance",
              value: `${memberDetails?.totalAttendance || 0} Days`,
            },
            {
              label: "Weight",
              value: memberDetails?.weight
                ? `${memberDetails?.weight} kg`
                : "N/A",
            },
            {
              label: "Height",
              value: memberDetails?.height
                ? `${memberDetails?.height} cm`
                : "N/A",
            },
            {
              label: "BMI",
              value: memberDetails.bmis.at(-1)
                ? `${memberDetails.bmis.at(-1)!.value} kg/m²`
                : "N/A",
            },
          ].map((item, index) => (
            <div key={index} className="text-center flex flex-col items-center">
              <p className="text-customBlue font-bold">{item.value}</p>
              <p className="text-xs text-white">{item.label}</p>
            </div>
          ))}
        </div>

        {/* Health Info */}
        <div className="flex flex-col p-8 lg:flex-row lg:justify-between items-start lg:items-center">
          <h3 className="text-xl lg:text-3xl font-bold mb-4 lg:mb-0">
            Health Info.
          </h3>
          <div className="text-xs lg:text-sm space-y-2 w-full">
            {[
              {
                label: "Exercise Restrictions",
                value: memberDetails?.healthCondition?.exerciseRestriction
                  ? "Yes"
                  : "No",
              },
              {
                label: "Pain During Exercise",
                value: memberDetails?.healthCondition?.painDuringExercise
                  ? "Yes"
                  : "No",
              },
              {
                label: "Dizziness or Fainting",
                value: memberDetails?.healthCondition?.dizzinessOrFainting
                  ? "Yes"
                  : "No",
              },
              {
                label: "Bone or Joint Disease",
                value: memberDetails?.healthCondition?.boneOrJointDisease
                  ? "Yes"
                  : "No",
              },
              {
                label: "Heart/Hypertension Meds",
                value: memberDetails?.healthCondition?.heartHypertensionMeds
                  ? "Yes"
                  : "No",
              },
              {
                label: "Chronic Diseases",
                value:
                  memberDetails?.healthCondition?.chronicDiseases || "None",
              },
              {
                label: "Additional Remarks",
                value:
                  memberDetails?.healthCondition?.additionalRemarks || "None",
              },
            ].map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-white">{item.label}</span>
                <p className="text-customBlue">{item.value}</p>
              </div>
            ))}
          </div>
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

        {/* BMI Chart */}
        <div className="m-4 lg:m-6 p-4 lg:p-6 rounded-lg border border-[#18282d] bg-[#1b1b1b]">
          <h3 className="text-xs lg:text-sm">BMI</h3>
          <div className="mt-4">
            <ResponsiveContainer width="100%" height={60}>
              <LineChart
                data={memberDetails.bmis || []}
                width={970}
                height={60}
              >
                <CartesianGrid
                  stroke="#333"
                  strokeDasharray="4 4"
                  strokeOpacity={0.3}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#121212",
                    border: "1px solid #333",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#00bfff", fontSize: "12px" }}
                />
                <Line type="monotone" dataKey="value" stroke="#00bfff" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
