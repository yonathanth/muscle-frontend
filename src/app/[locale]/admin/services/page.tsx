"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import axios from "axios";
import ServiceCard from "../../services/ServicesCards";
import EditServiceModal from "./EditServiceModal";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import SmallLoading from "../components/SmallLoading";
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
}

type TabName =
  | "Body Building"
  | "Exercise"
  | "Group Fitness"
  | "Personal Training";

const Services: React.FC = () => {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [serviceToDelete, setServiceToDelete] = useState<ServiceType | null>(
    null
  );
  const [services, setServices] = useState<{
    [key in TabName]?: ServiceType[];
  }>({});
  const [activeTab, setActiveTab] = useState<keyof typeof services>("Exercise");
  const [modalService, setModalService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    period: "",
    maxDays: "",
    price: "",
    category: "Exercise",
    details: "",
    isPremium: false,
  });

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/api/services`);
      const data = response.data.data;
      const categorizedServices: { [key in TabName]?: ServiceType[] } = {};
      data.forEach((service: ServiceType) => {
        const category = normalizeCategory(service.category);
        if (category) {
          categorizedServices[category] = [
            ...(categorizedServices[category] || []),
            service,
          ];
        }
      });
      console.log("Categorized Services:", categorizedServices);
      setServices(categorizedServices);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };
  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : false;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddService = async () => {
    setIsLoading(true);
    const { name, period, maxDays, price, category, details, isPremium } =
      formData;

    // Prepare payload
    const newService = {
      name,
      period: parseInt(period),
      maxDays: parseInt(maxDays),
      price: parseFloat(price),
      category,
      description: {
        benefits: details.split(",").map((benefit) => benefit.trim()), // Assume comma-separated benefits
      },
      preferred: isPremium,
    };

    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_API_BASE_URL}/api/services`,
        newService,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Parse response
      const addedService = response.data.data;
      const updatedCategory = normalizeCategory(addedService.category);

      if (updatedCategory) {
        setServices((prevServices) => ({
          ...prevServices,
          [updatedCategory]: [
            ...(prevServices[updatedCategory] || []),
            addedService,
          ],
        }));
      }
    } catch (error) {
      console.error("Failed to add service:", error);
      setErrorMessage("Failed to add service. Please try again.");
    } finally {
      setIsLoading(false);
      setFormData({
        name: "",
        period: "",
        maxDays: "",
        price: "",
        category: "Exercise",
        details: "",
        isPremium: false,
      });
    }
  };

  const normalizeCategory = (category: string): TabName | null => {
    switch (category.trim().toLowerCase()) {
      case "body building":
        return "Body Building";
      case "exercise":
        return "Exercise";
      case "group fitness":
        return "Group Fitness";
      case "personal training":
        return "Personal Training";
      default:
        return null;
    }
  };

  const tabs = Object.keys(services) as TabName[];
  const handleCardClick = (service: any) => {
    setModalService(service);
  };

  const handleCloseModal = () => {
    setModalService(null);
  };

  const handleSaveService = (updatedService: any) => {
    const category = normalizeCategory(updatedService.category);
    if (category) {
      setServices((prevServices) => ({
        ...prevServices,
        [category]: prevServices[category]?.map((service) =>
          service.id === updatedService.id ? updatedService : service
        ),
      }));
    }
  };

  const handleOpenDeleteModal = (service: ServiceType) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setServiceToDelete(null);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setIsLoading(true);

    try {
      const response = await axios.delete(
        `${NEXT_PUBLIC_API_BASE_URL}/api/services/${serviceToDelete.id}`
      );

      if (response.status === 204) {
        // Successful deletion
        const category = normalizeCategory(serviceToDelete.category);
        if (category) {
          setServices((prevServices) => ({
            ...prevServices,
            [category]: prevServices[category]?.filter(
              (service) => service.id !== serviceToDelete.id
            ),
          }));
        }
        handleCloseDeleteModal();
      } else {
        setError(
          "Can not Delete Service, Check if there are any users associated with it!"
        );
        // Prisma did not allow the delete
        console.error("Service could not be deleted. Check server response.");
        setTimeout(() => setError(""), 4000); // Clear error after 2 seconds
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
    } finally {
      handleCloseDeleteModal();
      setIsLoading(false);
      setModalService(null);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-black min-h-screen text-white">
      {error && (
        <div
          className="fixed top-8 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-md animate-fade-in-out"
          style={{
            animation: "fadeInOut 2s forwards",
          }}
        >
          {error}
        </div>
      )}
      {/* Left side form */}
      <div className="w-full lg:w-1/3 p-4 space-y-4">
        <h2 className="text-sm font-extralight">Name</h2>
        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          type="text"
          className="w-full bg-[#121212] text-sm font-extralight text-white rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
        />
        <div className="flex flex-col sm:flex-row gap-2">
          <div>
            <h2 className="text-sm font-extralight mb-3">Period</h2>
            <input
              name="period"
              value={formData.period}
              onChange={handleInputChange}
              type="text"
              className="w-full bg-[#121212] text-sm font-extralight text-white rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
            />
          </div>
          <div>
            <h2 className="text-sm font-extralight mb-3">Days Allocated</h2>
            <input
              name="maxDays"
              value={formData.maxDays}
              onChange={handleInputChange}
              type="text"
              className="w-full bg-[#121212] text-sm font-extralight text-white rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
            />
          </div>
        </div>
        <h2 className="text-sm font-extralight">Price</h2>
        <input
          name="price"
          value={formData.price}
          onChange={handleInputChange}
          type="text"
          className="w-full bg-[#121212] text-sm font-extralight text-white rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
        />
        <h2 className="text-sm font-extralight">Category</h2>
        <select
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          className="w-full bg-[#121212] text-sm font-extralight text-gray-300 rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
        >
          <option>Exercise</option>
          <option>Body Building</option>
          <option>Group Fitness</option>
          <option>Personal Training</option>
        </select>
        <h2 className="text-sm font-extralight">Details</h2>
        <input
          name="details"
          value={formData.details}
          onChange={handleInputChange}
          type="text"
          className="w-full bg-[#121212] text-sm font-extralight text-white rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
        />
        <div className="flex items-center gap-2 mt-4">
          <input
            type="checkbox"
            name="isPremium"
            checked={formData.isPremium}
            onChange={handleInputChange}
            className="form-checkbox w-5 h-5 border-2 border-customBlue rounded text-customBlue"
          />
          <label htmlFor="isPremium" className="text-sm font-extralight">
            preferred{" "}
          </label>
        </div>
        <button
          onClick={handleAddService}
          className="mt-4 px-5 py-[0.2rem] bg-customBlue text-black rounded hover:bg-zinc-800 text-sm font-extralight"
        >
          {isLoading ? <SmallLoading /> : "Add"}
        </button>
        {/* Error Message Display */}
        {errorMessage && (
          <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
        )}
      </div>

      {/* Right side tabs */}
      <div className="w-full lg:w-2/3 bg-[#121212] p-4 lg:p-7 rounded-xl">
        <div className="flex justify-center space-x-4 mb-4 text-lg font-semibold">
          <ul className="flex text-base space-x-6 lg:space-x-10">
            {tabs.map((tab) => (
              <li
                key={tab}
                onClick={() => setActiveTab(tab as keyof typeof services)}
                className={`cursor-pointer ${
                  activeTab === tab ? "text-customBlue" : ""
                }`}
              >
                {tab}
              </li>
            ))}
          </ul>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services[activeTab]?.map((service, index) => (
            <div key={index} onClick={() => handleCardClick(service)}>
              <ServiceCard
                key={index}
                isFromAdmin={true}
                title={service.name}
                price={`Birr ${service.price}`}
                benefits={service.description.benefits}
                isPremium={service.preferred}
                onClick={() => {}}
                className="scale-75 sm:scale-75"
              />
            </div>
          ))}
          {modalService && (
            <EditServiceModal
              service={modalService}
              onClose={() => setModalService(null)}
              onSave={handleSaveService}
              onDelete={() => handleOpenDeleteModal(modalService)}
            />
          )}
        </div>
      </div>
      {deleteModalOpen && serviceToDelete && (
        <ConfirmDeleteModal
          isLoading={isLoading}
          isOpen={deleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteService}
          itemName={serviceToDelete.name}
        />
      )}
    </div>
  );
};

export default Services;
