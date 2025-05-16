import { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SmallLoading from "./SmallLoading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


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
interface Member {
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

interface EditAdminProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  fetchData: () => {};
  member: Member;
}

const EditAdmin = ({ setShowModal, fetchData, member }: EditAdminProps) => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "",
    email: "",
    address: "",
    dob: "",
    emergencyContact: "",
    gender: "",
    serviceId: "",
    profileImage: null as string | File | null,
    startDate: "",
    height: 0.0,
    weight: 0.0,
    healthCondition: {
      exerciseRestriction: false,
      painDuringExercise: false,
      dizzinessOrFainting: false,
      boneOrJointDisease: false,
      heartHypertensionMeds: false,
      chronicDiseases: "",
      additionalRemarks: "",
    },
    goal: "",
    level: "",
  });
  useEffect(() => {
    console.log(member);
    setFormData({
      fullName: member.fullName || "",
      phoneNumber: member.phoneNumber || "",
      password: "", // Password should not be pre-filled for security
      email: member.email || "",
      address: member.address || "",
      dob: member.dob || "",
      emergencyContact: member.emergencyContact || "",
      gender: member.gender || "",
      profileImage: member.profileImageUrl || null, // Map profileImageUrl to profileImage
      startDate: member.startDate || "",
      height: member.height || 0.0,
      weight: member.weight || 0.0,
      healthCondition: {
        exerciseRestriction:
          member.healthCondition?.exerciseRestriction || false,
        painDuringExercise: member.healthCondition?.painDuringExercise || false,
        dizzinessOrFainting:
          member.healthCondition?.dizzinessOrFainting || false,
        boneOrJointDisease: member.healthCondition?.boneOrJointDisease || false,
        heartHypertensionMeds:
          member.healthCondition?.heartHypertensionMeds || false,
        chronicDiseases: member.healthCondition?.chronicDiseases || "",
        additionalRemarks: member.healthCondition?.additionalRemarks || "",
      },
      serviceId: member.serviceId || "",
      goal: member.goal || "",
      level: member.level || "",
    });
  }, [member]);

  const [services, setServices] = useState<Service[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/api/services`);
      setServices(response.data.data);
    } catch {
      setError("Failed to fetch services.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files && files[0] ? files[0] : value,
    }));
  };
  const handlehealthConditionTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      healthCondition: {
        ...prev.healthCondition,
        [name]: value,
      },
    }));
  };
  const handlehealthConditionChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      healthCondition: {
        ...prev.healthCondition,
        [name]: checked,
      },
    }));
  };

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedServiceId(e.target.value);
  };

  const handleGenderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      gender: e.target.value,
    }));
  };
  const hanldeGoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      goal: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create new data object
    const newMemberData = {
      ...formData,
      serviceId: selectedServiceId,
      healthCondition: JSON.stringify(formData.healthCondition), // Serialize health conditions as JSON
    };

    const filteredData = Object.entries(newMemberData).reduce(
      (acc, [key, value]) => {
        if (
          key === "profileImage" ||
          value !== (member as unknown as Record<string, unknown>)[key]
        ) {
          acc[key] = value;
        }
        return acc;
      },
      {} as Record<string, unknown>
    );

    // If no fields have changed, return early
    if (Object.keys(filteredData).length === 0) {
      setError("No changes detected.");
      return;
    }

    // Prepare form data for submission
    const formDataToSend = new FormData();
    Object.entries(filteredData).forEach(([key, value]) => {
      if (key === "profileImage" && value) {
        formDataToSend.append(key, value as File);
      } else if (value) {
        formDataToSend.append(key, value as string);
      }
    });
    setIsLoading(true);

    try {
      const response = await axios.patch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/members/${member.id}`,
        formDataToSend,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200) {
        fetchData();
        setShowModal(false);
        router.push(`/en/admin/gym-member/${member.id}`);
      } else {
        setError(response.data.message || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Error occurred while submitting the form:", error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          setError(
            `Error: ${error.response.data.message || error.response.statusText}`
          );
        } else if (error.request) {
          setError("No response received from the server.");
        } else {
          setError("An error occurred. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212] bg-opacity-50 flex justify-center items-center z-10">
      <div className="bg-[#121212] text-white pr-10 pl-10 pt-6 rounded-lg shadow-lg max-w-2xl w-full h-[80vh] overflow-y-auto">
        <h2 className="text-lg mb-4 font-extralight">Edit Member</h2>
        {error && <div className="error mb-4 text-red-500">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Member Form Fields */}
          <div className="mb-4">
            <label className="block text-sm">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Phone Number</label>
            <input
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              type="tel"
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Email</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleInputChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Emergency Contact</label>
            <input
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              type="tel"
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>

          {/* Gender Select */}
          <div className="mb-4">
            <label className="block text-sm">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleGenderChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Add more form fields for other details like phoneNumber, email, etc. */}

          <div className="mb-4">
            <label className="block text-sm">Select Service</label>
            <select
              name="serviceId"
              value={selectedServiceId || member.serviceId?.toString()}
              onChange={handleServiceChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            >
              <option value="">Select a Service</option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} - Birr {service.price}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>

          {/* Profile image input */}
          <div className="mb-4">
            <label className="block text-sm">Profile Image</label>
            <input
              type="file"
              name="profileImage"
              onChange={handleInputChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Height</label>
            <input
              name="height"
              value={formData.height}
              onChange={handleInputChange}
              type="float"
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Weight</label>
            <input
              name="weight"
              value={formData.weight}
              onChange={handleInputChange}
              type="float"
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm">Goal</label>
            <select
              name="goal"
              value={formData.goal}
              onChange={hanldeGoalChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            >
              <option value="">Select Goal</option>
              <option value="Gain Weight">Gain Weight</option>
              <option value="Loss Weight">Loss weight</option>
              <option value="Be Flexible">Be Flexible</option>
              <option value="Be Active">Be Active</option>
              <option value="Not Sure">Not Sure</option>
              <option value="Not Metntioned Here ">Not mentioned Here</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm">Level</label>
            <input
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              type="tel"
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>
          <h2 className="mb-4 text-customBlue">Helath related </h2>
          <div className="pl-5">
            <div className="mb-4 flex flex-row justify-between pr-24">
              <label className="block text-sm">Exercise Restriction</label>
              <input
                type="checkbox"
                name="exerciseRestriction"
                checked={formData.healthCondition.exerciseRestriction}
                onChange={handlehealthConditionChange}
                className=" p-2 rounded mt-1 bg-[#222] text-white"
              />
            </div>

            <div className="mb-4 flex flex-row justify-between pr-24">
              <label className="block text-sm">Pain During Exercise</label>
              <input
                type="checkbox"
                name="painDuringExercise"
                checked={formData.healthCondition.painDuringExercise}
                onChange={handlehealthConditionChange}
                className=" p-2 rounded mt-1 bg-[#222] text-white"
              />
            </div>

            <div className="mb-4 flex flex-row justify-between pr-24">
              <label className="block text-sm">Dizziness or Fainting</label>
              <input
                type="checkbox"
                name="dizzinessOrFainting"
                checked={formData.healthCondition.dizzinessOrFainting}
                onChange={handlehealthConditionChange}
                className=" p-2 rounded mt-1 bg-[#222] text-white"
              />
            </div>

            <div className="mb-4 flex flex-row justify-between pr-24">
              <label className="block text-sm">Bone or Joint Disease</label>
              <input
                type="checkbox"
                name="boneOrJointDisease"
                checked={formData.healthCondition.boneOrJointDisease}
                onChange={handlehealthConditionChange}
                className=" p-2 rounded mt-1 bg-[#222] text-white"
              />
            </div>

            <div className="mb-4 flex flex-row justify-between pr-24">
              <label className="block text-sm">
                Heart/Hypertension Medications
              </label>
              <input
                type="checkbox"
                name="heartHypertensionMeds"
                checked={formData.healthCondition.heartHypertensionMeds}
                onChange={handlehealthConditionChange}
                className=" p-2 rounded mt-1 bg-[#222] text-white"
              />
            </div>
          </div>

          {/* Health Conditions: Text Inputs */}
          <div className="mb-4">
            <label className="block text-sm">Chronic Diseases</label>
            <input
              type="text"
              name="chronicDiseases"
              value={formData.healthCondition.chronicDiseases}
              onChange={handlehealthConditionTextChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm">Additional Remarks</label>
            <textarea
              name="additionalRemarks"
              value={formData.healthCondition.additionalRemarks}
              onChange={handlehealthConditionTextChange}
              className="w-full p-2 rounded mt-1 bg-[#222] text-white"
            />
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={() => setShowModal(false)} // Close modal on cancel
            >
              Cancel
            </button>
            <button
              type="submit"
              className="hover:bg-customBlue bg-customHoverBlue text-white px-4 py-2 rounded"
              disabled={isLoading}
            >
              {isLoading ? <SmallLoading /> : "Edit Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAdmin;
