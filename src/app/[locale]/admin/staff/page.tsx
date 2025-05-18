"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faSearch } from "@fortawesome/free-solid-svg-icons";

interface StaffMember {
  id: string;
  fullName: string;
  phoneNumber: string;
  role: string;
}

const StaffManagement = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [updateMessage, setUpdateMessage] = useState("");

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/staff`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStaff(response.data.data);
    } catch (err) {
      setError("Failed to fetch staff members");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setNewPhoneNumber(staffMember.phoneNumber);
    setNewPassword("");
    setIsModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedStaff) return;

    try {
      const updateData: any = {};
      if (newPhoneNumber !== selectedStaff.phoneNumber) {
        updateData.phoneNumber = newPhoneNumber;
      }
      if (newPassword) {
        updateData.password = newPassword;
      }

      if (Object.keys(updateData).length === 0) {
        setUpdateMessage("No changes to update");
        return;
      }

      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/staff/${selectedStaff.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setUpdateMessage("Staff member updated successfully");
        fetchStaff(); // Refresh the list
        setTimeout(() => {
          setIsModalOpen(false);
          setUpdateMessage("");
        }, 2000);
      }
    } catch (err: any) {
      setUpdateMessage(
        err.response?.data?.message || "Failed to update staff member"
      );
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="p-2 sm:p-6 bg-black text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Staff </h1>
        <div className="relative">
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search staff..."
            className="pl-9 pr-4 py-2 rounded-lg bg-[#ffffff29] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-customBlue"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#ffffff12]">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Phone Number</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((member) => (
                <tr key={member.id} className="border-b border-[#ffffff12]">
                  <td className="px-6 py-4">{member.fullName}</td>
                  <td className="px-6 py-4">{member.phoneNumber}</td>
                  <td className="px-6 py-4">{member.role}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(member)}
                      className="text-customBlue hover:text-customHoverBlue"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && selectedStaff && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-[#121212] p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Staff Member</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#ffffff29] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-customBlue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 rounded-lg bg-[#ffffff29] text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-customBlue"
                />
              </div>
              {updateMessage && (
                <p
                  className={`text-sm ${
                    updateMessage.includes("success")
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {updateMessage}
                </p>
              )}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-4 py-2 bg-customBlue text-white rounded hover:bg-customHoverBlue transition"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;
