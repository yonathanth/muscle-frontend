"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import axios from "axios";
import WebcamCapture from "./components/PhotoUpload";
import PhotoUploadModal from "./components/PhotoUploadModal";
import TermsAndConditionsModal from "../components/TermsAndConditionsModal";
import LoadingPage from "./components/loading";
import { routing } from "@/src/i18n/routing";
import SmallLoading from "../admin/components/SmallLoading";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Service {
  id: string;
  name: string;
  price: string;
  benefits: string[] | string; // Updated to accept both array and string
  category: string;
  description?: string[];
}

const Register = () => {
  const t = useTranslations("registration_page");
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<number>(1); // 1 for info, 2 for package selection
  const [selectedCategory, setSelectedCategory] = useState<string>("Exercise");
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    password: "mf1234",
    email: "",
    address: "",
    dob: "2020-10-10",
    emergencyContact: "",
    gender: "",
    profileImage: null as string | File | null,
    workouts: [],
    mealPlans: [],
    exercisesCompleted: [],
  });
  const [services, setServices] = useState<Record<string, Service[]>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUsingCamera, setIsUsingCamera] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [selectedPackageName, setSelectedPackageName] = useState<string | null>(
    null
  );
  const pathname = usePathname();

  const currentLocale = pathname.split("/")[1] || routing.defaultLocale;

  useEffect(() => {
    axios
      .get(`${NEXT_PUBLIC_API_BASE_URL}/api/services`)
      .then((response) => {
        const fetchedServices = response.data.data;
        const categorizedServices: Record<string, Service[]> = {};

        fetchedServices.forEach((service: Service) => {
          // Ensure benefits is always an array
          const benefitsArray = Array.isArray(service.benefits)
            ? service.benefits
            : service.description
            ? service.description
            : [];

          const serviceWithBenefits = {
            ...service,
            benefits: benefitsArray,
          };

          if (!categorizedServices[service.category]) {
            categorizedServices[service.category] = [];
          }
          categorizedServices[service.category].push(serviceWithBenefits);
        });

        setServices(categorizedServices);
        setIsLoading(false);
      })
      .catch((error) => {
        setError("Failed to fetch services.");
        setIsLoading(false);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files && files[0] ? files[0] : value,
    }));
  };

  const handlePackageSelect = (service: Service) => {
    setSelectedPackage(service.id);
    setSelectedPackageName(service.name);
  };

  const validateStep1 = () => {
    if (!formData.fullName) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.phoneNumber) {
      setError("Please enter your phone number");
      return false;
    }
    if (!/^\d{10}$/.test(formData.phoneNumber)) {
      setError("Phone number must be 10 digits number");
      return false;
    }
    if (!formData.profileImage) {
      setError("Please upload a profile picture");
      return false;
    }
    if (!formData.gender) {
      setError("Please select your gender");
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextStep = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleRegister = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!selectedPackage) {
      setError("Please choose a package.");
      return;
    }

    const totalPrice = parseFloat(
      services[selectedCategory]?.find(
        (service) => service.id === selectedPackage
      )?.price || "0"
    );

    const newUser = {
      ...formData,
      selectedPackage,
      totalPrice,
      serviceId: selectedPackage || "",
    };

    const formDataToSend = new FormData();
    Object.entries(newUser).forEach(([key, value]) => {
      if (key === "profileImage" && value) {
        formDataToSend.append(key, value as File);
      } else if (value) {
        formDataToSend.append(key, value as string);
      }
    });

    try {
      setIsRegistering(true);
      const response = await axios.post(
        `${NEXT_PUBLIC_API_BASE_URL}/api/members`,
        formDataToSend
      );

      if (response.status === 201) {
        setError(null);
        router.push(
          `/${currentLocale}/Register/registerSummary?packages=${encodeURIComponent(
            JSON.stringify([selectedPackageName])
          )}&total=${totalPrice}`
        );
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      console.error("Error during POST request:", error);
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "An unknown error occurred.");
      } else {
        setError("Network error. Please try again later.");
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleOptionSelect = (option: "camera" | "gallery") => {
    if (option === "camera") {
      setIsUsingCamera(true);
    } else {
      document.getElementById("fileInput")?.click();
    }
    setIsModalOpen(false);
  };

  const handleCapture = (capturedPhoto: string | null) => {
    setPhoto(capturedPhoto);
    setFormData((prev) => ({
      ...prev,
      profileImage: capturedPhoto,
    }));
    setIsModalOpen(false);
  };

  const closeModal = () => {
    setIsUsingCamera(false);
    setIsModalOpen(false);
  };

  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFormData((prev) => ({
        ...prev,
        profileImage: selectedFile,
      }));
      setPhoto(URL.createObjectURL(selectedFile));
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingPage />
      </div>
    );
  }

  return (
    <div className="bg-black">
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col w-11/12 max-w-4xl shadow-lg rounded-lg overflow-hidden bg-gray-800">
          {step === 1 ? (
            // Step 1: Personal Information
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-center text-white mb-6">
                Please fill out the form
              </h2>
              <form className="space-y-4">
                <input
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  type="text"
                  className="w-full p-3 border border-zinc-600 rounded-md focus:outline-none focus:ring-1 focus:ring-customBlue bg-gray-800 text-gray-400"
                  placeholder={t("fields.full_name")}
                />
                <input
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  type="number"
                  className="w-full p-3 border border-zinc-600 rounded-md focus:outline-none focus:ring-1 focus:ring-customBlue bg-gray-800 text-gray-400"
                  placeholder={t("fields.phone_number")}
                />
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  type="text"
                  className="w-full p-3 border border-zinc-600 rounded-md focus:outline-none focus:ring-1 focus:ring-customBlue bg-gray-800 text-gray-400"
                  placeholder={t("fields.address")}
                />
                {/* <input
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  type="date"
                  className="w-full p-3 border border-zinc-600 rounded-md focus:outline-none focus:ring-1 focus:ring-customBlue bg-gray-800 text-gray-400"
                  placeholder={t("fields.birthdate")}
                /> */}
                <input
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  type="tel"
                  className="w-full p-3 border border-zinc-600 rounded-md focus:outline-none focus:ring-1 focus:ring-customBlue bg-gray-800 text-gray-400"
                  placeholder={t("fields.emergency_number")}
                />

                {/* Upload Photo Section */}
                <div className="mb-4">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setIsModalOpen(true);
                    }}
                    className="p-3 bg-customBlue text-black rounded-lg"
                  >
                    Upload Photo
                  </button>

                  <PhotoUploadModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onOptionSelect={handleOptionSelect}
                  />

                  {isUsingCamera ? (
                    <WebcamCapture
                      onCapture={handleCapture}
                      onClose={closeModal}
                    />
                  ) : (
                    <input
                      id="fileInput"
                      type="file"
                      accept="image/*"
                      onChange={handleGallerySelect}
                      className="hidden"
                    />
                  )}

                  {photo && (
                    <img
                      src={photo}
                      alt="Uploaded"
                      className="mt-4 w-40 h-auto"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-gray-400">{t("fields.gender.label")}</h3>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center text-gray-400">
                      <input
                        value="male"
                        onChange={handleInputChange}
                        type="radio"
                        name="gender"
                        className="mr-2"
                      />
                      {t("fields.gender.options.male")}
                    </label>
                    <label className="flex items-center text-gray-400">
                      <input
                        value="female"
                        onChange={handleInputChange}
                        type="radio"
                        name="gender"
                        className="mr-2"
                      />
                      {t("fields.gender.options.female")}
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 text-red-500 text-base text-center">
                    {error}
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={handleNextStep}
                    className="w-full p-3 font-semibold text-white rounded-lg bg-customBlue hover:bg-customHoverBlue hover:text-white"
                  >
                    Next
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Step 2: Package Selection
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Choose a Package
              </h2>

              <div className="flex flex-wrap md:flex-nowrap gap-2 mb-6">
                {Object.keys(services).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`py-2 px-4 rounded-md ${
                      selectedCategory === category
                        ? "bg-customBlue text-black"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {services[selectedCategory]?.map((service) => (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPackage === service.id
                        ? "border-customBlue bg-gray-700"
                        : "border-gray-600 hover:border-gray-500"
                    }`}
                    onClick={() => handlePackageSelect(service)}
                  >
                    <h3 className="text-lg font-medium text-white">
                      {service.name}
                    </h3>
                    <p className="text-customBlue text-lg font-semibold my-2">
                      {`Birr ${service.price}`}
                    </p>
                    {Array.isArray(service.benefits) &&
                      service.benefits.length > 0 && (
                        <ul className="text-gray-400 text-sm">
                          {service.benefits.map((benefit, index) => (
                            <li key={index} className="mb-1">
                              • {benefit}
                            </li>
                          ))}
                        </ul>
                      )}
                    {typeof service.benefits === "string" &&
                      service.benefits && (
                        <ul className="text-gray-400 text-sm">
                          <li className="mb-1">• {service.benefits}</li>
                        </ul>
                      )}
                    {selectedPackage === service.id && (
                      <div className="mt-2 text-green-400 flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="mb-4 text-red-500 text-base text-center">
                  {error}
                </div>
              )}

              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 text-white bg-gray-600 rounded-lg hover:bg-gray-500"
                >
                  Back
                </button>
                <button
                  onClick={handleRegister}
                  disabled={isRegistering || !selectedPackage}
                  className={`px-6 py-3 rounded-lg ${
                    isRegistering || !selectedPackage
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-customBlue text-white hover:bg-customHoverBlue hover:text-white"
                  }`}
                >
                  {isRegistering ? (
                    <span className="flex items-center justify-center">
                      <SmallLoading />
                      <span className="ml-2">Processing...</span>
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;

// import Link from "next/link";
// import React from "react";

// const ResponsiveModal: React.FC = () => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black px-4">
//       {/* Modal container */}
//       <div
//         className="bg-[#121212] text-white rounded-lg p-6 w-full max-w-lg sm:max-w-lg lg:max-w-2xl shadow-md"
//         style={{
//           backdropFilter: "blur(10px)",
//           border: "1px solid #fff",
//         }}
//       >
//         {/* Modal title */}
//         <h2 className="text-center text-lg font-semibold mb-4 text-customBlue">
//           Feature not available for a while{" "}
//         </h2>
//         {/* Modal content */}
//         <p className="text-sm text-center mb-6 leading-relaxed">
//           please contanct the admin for more information.
//         </p>
//         {/* Action button */}
//         <div className="flex justify-center">
//           <Link href="/">
//             <button className="bg-customBlue text-black font-semibold px-6 py-2 rounded-full hover:bg-customHoverBlue transition">
//               Back to Home{" "}
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResponsiveModal;

// import React from "react";

// const page = () => {
//   return <div>page</div>;
// };

// export default page;
