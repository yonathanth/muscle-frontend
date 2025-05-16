"use client";
import React, { useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import SmallLoading from "../../admin/components/SmallLoading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const RegisterForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const memberId = searchParams.get("id");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  const hanldeGoalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      goal: e.target.value,
    }));
  };
  const handleLevelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      level: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await axios.patch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/members/${memberId}`,
        {
          ...formData,
          healthCondition: JSON.stringify(formData.healthCondition),
          isComplete: true,
        }
      );

      if (response.status === 200) {
        setMessage("Registration completed successfully!");
        router.push("/en/pending-user");
      } else {
        setMessage("Failed to complete the registration. Please try again.");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage(
        "An error occurred while completing the registration. Please contact support."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex py-6 md:py-12 px-3 md:p-6 md:pr-12 justify-center ">
      {/*Personal Information Section */}
      <div className="text-white bg-white/20 bg-opacity-75 p-8 rounded-md w-full max-w-2xl">
        <h2 className="text-3xl mb-8 text-center">Personal Information</h2>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center p-1"
        >
          <div className="w-full mb-4">
            <label className="block mb-2 text-white" htmlFor="email">
              Email Address:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              required
              onChange={handleInputChange}
              className="w-full p-2 placeholder-white/40 rounded-lg border-2 border-white/20 bg-black"
              placeholder="Email Address"
            />
          </div>
          <div className="flex flex-col md:flex-row gap-4 w-full mb-4">
            <div className="w-full">
              <label className="block mb-2 text-white" htmlFor="weight">
                Current Weight (kg):
              </label>
              <input
                type="text"
                id="weight"
                name="weight"
                value={formData.weight}
                required
                onChange={handleInputChange}
                className="w-full p-2 placeholder-white/40 rounded-lg border-2 border-white/20 bg-black"
                placeholder="70"
              />
            </div>
            <div className="w-full">
              <label className="block mb-2 text-white" htmlFor="height">
                Current Height (M):
              </label>
              <input
                type="text"
                id="height"
                name="height"
                required
                value={formData.height}
                onChange={handleInputChange}
                className="w-full p-2 placeholder-white/40 rounded-lg border-2 border-white/20 bg-black"
                placeholder="170"
              />
            </div>
          </div>

          <div className="w-full mb-4">
            <div className="mb-4">
              <label className="block text-sm">Goal</label>
              <select
                name="goal"
                value={formData.goal}
                onChange={hanldeGoalChange}
                className="w-full p-2 rounded mt-1 bg-black text-white"
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
              <label className="block text-sm">Experience</label>
              <select
                name="level"
                value={formData.level}
                onChange={handleLevelChange}
                className="w-full p-2 rounded mt-1 bg-black text-white"
              >
                <option value="">Your Gym Experience</option>
                <option value="Beginner">I am a Beginner</option>
                <option value="Intermediate">
                  I have worked for some time
                </option>
                <option value="Advanced">I am well experienced</option>
              </select>
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
            <div className="w-full mb-4 mt-6 ">
              <label
                className="block mb-2 text-white"
                htmlFor="chronic-diseases"
              >
                Please specify any chronic diseases you have:
              </label>
              <input
                type="text"
                id="chronic-diseases"
                name="chronicDiseases"
                required
                value={formData.healthCondition.chronicDiseases}
                onChange={handlehealthConditionTextChange}
                className="w-full p-2 placeholder-white/40 rounded-lg border-2 border-white/20 bg-black"
                placeholder="E.g., Diabetes, Hypertension"
              />
            </div>
            <div className="w-full mb-4">
              <label
                className="block mb-2 text-white"
                htmlFor="additional-remarks"
              >
                Add any additional remarks:
              </label>
              <textarea
                id="additional-remarks"
                name="additionalRemarks"
                required
                value={formData.healthCondition.additionalRemarks}
                onChange={handlehealthConditionTextChange}
                className="w-full p-2 placeholder-white/40 rounded-lg border-2 border-white/20 bg-black"
                placeholder="E.g., Specific health concerns"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="flex justify-center w-1/3 bg-customBlue  hover:bg-zinc-800 text-black    hover:text-customBlue  py-2   font-semibold  rounded-lg text-center"
          >
            {isSubmitting ? <SmallLoading /> : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm;
