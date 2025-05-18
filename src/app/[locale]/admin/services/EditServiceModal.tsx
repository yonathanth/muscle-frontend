import React, { useState } from "react";
import axios from "axios";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ServiceType {
  id: number;
  name: string;
  price: number;
  description: {
    benefits: string[];
  };
  preferred: boolean;
  category: TabName;
  period: string;
  maxDays: string;
  details: string;
}
type TabName =
  | "Body Building"
  | "Exercise"
  | "Group Fitness"
  | "Personal Training";

interface EditServiceModalProps {
  service: ServiceType;
  onClose: () => void;
  onSave: (updatedService: ServiceType) => void;
  onDelete: () => void;
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  onClose,
  onSave,
  onDelete,
}) => {
  console.log(service);
  const [editedService, setEditedService] = useState(service);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem("token");
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
    setEditedService({
      ...editedService,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const sanitizedService = {
        ...editedService,
        maxDays: parseInt(editedService.maxDays, 10), // Convert maxDays to an integer
        period: parseInt(editedService.period, 10), // Convert period to an integer
        price: parseFloat(editedService.price.toString()), // Convert price to a float
      };
      const response = await axios.patch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/services/${editedService.id}`,
        sanitizedService,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      onSave(response.data.data);
    } catch (error) {
      console.error("Error updating service:", error);
    } finally {
      setIsSaving(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#121212] p-6 rounded-lg w-full max-w-lg text-white">
        <h2 className="text-sm font-extralight mb-4">Edit Service</h2>

        {/* Other Input Fields */}
        <input
          name="name"
          value={editedService.name}
          onChange={handleChange}
          className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue text-sm font-extralight text-gray-300"
          placeholder="Name"
        />
        <input
          name="price"
          type="number"
          value={editedService.price}
          onChange={handleChange}
          className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue text-sm font-extralight text-gray-300"
          placeholder="Price"
        />

        <textarea
          name="description"
          value={editedService.description.benefits.join(", ")}
          onChange={(e) =>
            setEditedService({
              ...editedService,
              description: {
                benefits: e.target.value.split(",").map((b) => b.trim()),
              },
            })
          }
          className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 h-24 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue text-sm font-extralight text-gray-300 resize-none"
          placeholder="Benefits (comma-separated)"
        ></textarea>

        <input
          name="period"
          value={editedService.period}
          onChange={handleChange}
          className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue text-sm font-extralight text-gray-300"
          placeholder="Period"
        />

        <input
          name="maxDays"
          value={editedService.maxDays}
          onChange={handleChange}
          className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue text-sm font-extralight text-gray-300"
          placeholder="Days Allocated"
        />

        <input
          name="details"
          value={editedService.details}
          onChange={handleChange}
          className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue text-sm font-extralight text-gray-300"
          placeholder="Details"
        />

        <select
          name="category"
          value={editedService.category}
          onChange={handleChange}
          className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue text-sm font-extralight text-gray-300"
        >
          <option>Body Building</option>
          <option>Exercise</option>
          <option>Group Fitness</option>
          <option>Personal Training</option>
        </select>

        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            name="preferred"
            checked={editedService.preferred}
            onChange={handleChange}
            className="form-checkbox w-5 h-5 border-2 border-customBlue rounded text-customBlue"
          />
          <label htmlFor="preferred" className="text-sm font-extralight">
            preferred
          </label>
        </div>

        <div className="flex justify-between space-x-4">
          <button
            onClick={onDelete}
            className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center"
          >
            {isDeleting ? (
              <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
            ) : (
              "Delete"
            )}
          </button>
          <div className="flex">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="ml-4 bg-customBlue text-white px-4 py-2 rounded-lg flex items-center justify-center"
            >
              {isSaving ? (
                <div className="animate-spin h-5 w-5 border-2 border-t-transparent border-white rounded-full"></div>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditServiceModal;
