import React, { useState, useEffect } from "react";
import SmallLoading from "./SmallLoading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EditEmployeeModalProps {
  closeModal: () => void;
  updateMember: (updatedMember: Member) => Promise<void>;
  employee: Member;
}

interface Member {
  id: string;
  name: string;
  phone: string;
  startDate: string;
  jobType: string;
  photoUrl?: string;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  closeModal,
  updateMember,
  employee,
}) => {
  const [name, setName] = useState(employee.name);
  const [phone, setPhone] = useState(employee.phone);
  const [startDate, setStartDate] = useState(employee.startDate);
  const [jobType, setJobType] = useState(employee.jobType);
  const [photoUrl, setPhotoUrl] = useState(employee.photoUrl || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to handle the form submission
  const handleEditEmployee = async () => {
    const token = localStorage.getItem("token");
    if (name && phone && startDate && jobType) {
      const updatedMember: Member = {
        id: employee.id,
        name,
        phone,
        startDate,
        jobType,
        photoUrl,
      };

      try {
        setLoading(true);

        const response = await fetch(
          `${NEXT_PUBLIC_API_BASE_URL}/api/employees/${employee.id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(updatedMember),
          }
        );

        const data = await response.json();

        if (data.success) {
          updateMember(data.data);
          closeModal();
        } else {
          setError(data.message || "Error updating employee.");
        }
      } catch (error) {
        console.error("Error updating employee:", error);
        setError("Error updating employee. Please try again.");
      } finally {
        setLoading(false);
      }
    } else {
      setError("Please fill out all fields.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[#121212] bg-opacity-50">
      <div className="bg-[#121212] p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-300 mb-4">Edit Employee</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full px-4 py-2 rounded-md bg-[#1d1d1d] text-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="text"
            placeholder="Phone"
            className="w-full px-4 py-2 rounded-md bg-[#1d1d1d] text-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="date"
            className="w-full px-4 py-2 rounded-md bg-[#1d1d1d] text-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <select
            className="w-full px-4 py-2 rounded-md bg-[#1d1d1d] text-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue"
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
          >
            <option value="">Select Job Type</option>
            <option value="Janitor">Janitor</option>
            <option value="Trainer">Trainer</option>
            <option value="Reception">Reception</option>
          </select>
          {/* Optional photo URL field */}
          <input
            type="text"
            placeholder="Photo URL (Optional)"
            className="w-full px-4 py-2 rounded-md bg-[#1d1d1d] text-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue"
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />
        </div>
        {/* Error message */}
        {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
        <div className="flex justify-end mt-4 space-x-3">
          <button
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md mr-2"
            onClick={closeModal}
          >
            Cancel
          </button>
          <button
            className="bg-customBlue text-white px-4 py-2 rounded-md hover:bg-customHoverBlue"
            onClick={handleEditEmployee}
            disabled={loading}
          >
            {loading ? <SmallLoading /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
