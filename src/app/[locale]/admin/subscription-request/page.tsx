"use client";

import axios from "axios";
import Link from "next/link";
import React, { useEffect, useState } from "react";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Requests {
  id: string;
  userName: string;
  requestDate: string;
  serviceName: string;
  serviceFee: number;
  status: string;
  userId: string;
}

const Page = () => {
  const [requests, setRequests] = useState<Requests[]>([]);
  const token = localStorage.getItem("token");

  // Fetch Requests and stats from API
  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await axios.get(
          `${NEXT_PUBLIC_API_BASE_URL}/api/subscriptionRequest/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = response.data.data;

        setRequests(data);
      } catch (error) {
        console.error("Error fetching Requests:", error);
      }
    };

    fetchRequest();
  }, []);
  // Handle status change
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await axios.patch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/subscriptionRequest/${id}/changeStatus`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === id ? { ...request, status: newStatus } : request
        )
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
  return (
    <div className="bg-black p-3 md:p-6 rounded-lg overflow-auto">
      {/* Table Layout with Responsive Scroll */}
      <div>
        <table className="min-w-[800px] w-full">
          <thead>
            <tr>
              <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                Name
              </th>
              <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                Request Date
              </th>
              <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                Service
              </th>
              <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                Amount Expected
              </th>
              <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                Status
              </th>
              <th className="px-2 text-left text-gray-200 font-bold text-sm py-3"></th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request, index) => (
              <tr
                key={request.id}
                className={`${index % 2 === 0 ? "bg-[#ffffff12]" : "bg-black"}`}
              >
                <Link href={`./gym-member/${request.userId}`}>
                  <td className="text-gray-400 py-2 px-2 font-extralight text-sm">
                    {request.userName}
                  </td>
                </Link>
                <td className="text-gray-400 py-2 px-2 font-extralight text-sm">
                  {request.requestDate.substring(0, 10)}
                </td>
                <td className="text-gray-400 py-2 px-2 font-extralight text-sm">
                  {request.serviceName}
                </td>
                <td className="text-gray-400 py-2 px-2 font-extralight text-sm">
                  {request.serviceFee}
                </td>
                <td
                  className={`py-2 px-2 font-extralight text-sm ${
                    request.status === "approved"
                      ? "text-green-500"
                      : request.status === "rejected"
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {request.status}
                </td>

                <td className="py-2">
                  {request.status === "pending" ? (
                    <select
                      className="form-select   rounded bg-gray-700 text-white"
                      onChange={(e) =>
                        handleStatusChange(request.id, e.target.value)
                      }
                      defaultValue=""
                    >
                      <option value="" disabled>
                        status{" "}
                      </option>
                      <option value="approved">Approve</option>
                      <option value="rejected">Reject</option>
                    </select>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Page;
