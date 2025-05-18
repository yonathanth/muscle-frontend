import { jsPDF } from "jspdf";
import axios from "axios";
import React, { useState } from "react";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Get token from localStorage
const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

interface memberDetails {
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

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "." : text;
};

const fetchImageAsBase64 = async (url: string) => {
  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    const mimeType = response.headers["content-type"];
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};

const downloadMemberId = async (memberDetails: memberDetails) => {
  const doc = new jsPDF("landscape", "mm", "credit-card");

  const cardWidth = 88;
  const cardHeight = 56;
  const orange = "#FF6600";
  const black = "#000000";
  const white = "#ffffff";

  // Images
  const profileImgBase64 = memberDetails.profileImageUrl
    ? await fetchImageAsBase64(
        `${NEXT_PUBLIC_API_BASE_URL}${memberDetails.profileImageUrl}`
      )
    : null;

  const barcodeImgBase64 = memberDetails.barcode;
  const logoBase64 = await fetchImageAsBase64("/Images/logo (3).svg");

  // FRONT SIDE
  if (profileImgBase64) {
    doc.addImage(profileImgBase64, "JPEG", 8, 5, 20, 20, undefined, "FAST");
  }

  // Name and Gender
  doc.setFont("Montserrat", "bold");
  doc.setFontSize(10);
  doc.setTextColor(black);
  doc.text(
    capitalize(memberDetails.fullName.split(" ")[0]),
    (cardWidth / 2 - 6.5) / 2,
    29,
    { align: "center" }
  );

  doc.setFont("Montserrat", "normal");
  doc.setFontSize(7);
  doc.text(
    (memberDetails.fullName.split(" ")[1] &&
      capitalize(memberDetails.fullName.split(" ")[1])) ||
      "",
    (cardWidth / 2 - 6.5) / 2,
    32,
    { align: "center" }
  );

  // Contact Details
  doc.setFont("Montserrat", "normal");
  doc.setFontSize(6);
  doc.setTextColor(black);
  doc.text("Phone no.", cardWidth / 2 - 4, 9);
  doc.text("Address", cardWidth / 2 - 4, 14);
  doc.text("Service", cardWidth / 2 - 4, 19);
  doc.text("Emergency", cardWidth / 2 - 4, 24);
  doc.text("Sex", cardWidth / 2 - 4, 29);

  doc.setFontSize(8);
  doc.setFont("Montserrat", "bold");
  doc.setTextColor(black);
  doc.text(memberDetails.phoneNumber, cardWidth / 2 + 11, 9);

  const truncatedAdress = truncateText(memberDetails.address!, 17);
  doc.text(truncatedAdress, cardWidth / 2 + 11, 14);

  const truncatedServiceName = truncateText(memberDetails.service.name, 17);
  doc.text(truncatedServiceName, cardWidth / 2 + 11, 19);

  const truncatedEmergencyContact = truncateText(
    memberDetails.emergencyContact!,
    33
  );
  doc.text(truncatedEmergencyContact, cardWidth / 2 + 11, 24);
  doc.text(memberDetails.gender, cardWidth / 2 + 11, 29);

  // Barcode
  if (barcodeImgBase64) {
    doc.addImage(barcodeImgBase64, "PNG", 6, 36, 75, 15);
  }

  doc.setFontSize(8);
  doc.setTextColor(black);
  doc.text("ID", cardWidth - 5, 5, { align: "right" });

  // BACK SIDE
  doc.addPage();
  doc.setFillColor(black);
  doc.rect(0, 0, cardWidth, cardHeight, "F");

  if (logoBase64) {
    doc.addImage(logoBase64, "PNG", cardWidth / 2 - 10, 8, 20, 24);
  }

  doc.setTextColor(white);
  doc.setFont("Montserrat", "bold");
  doc.setFontSize(10);
  doc.text("MUSCLE FITNESS Center", cardWidth / 2, 33, { align: "center" });

  doc.setFont("Montserrat", "normal");
  doc.setFontSize(8);
  doc.text(
    "Muscle Fitness - Megenagna, Figa, Gerji, Hayat 72",
    cardWidth / 2,
    38,
    { align: "center" }
  );

  doc.text("0945511884", cardWidth / 2, 43, {
    align: "center",
  });

  doc.setFont("Montserrat", "bold");
  doc.text("www.musclefitness.com", cardWidth / 2, 50, { align: "center" });

  doc.save(`${memberDetails.fullName}_MembershipID.pdf`);
};

const downloadMemberDetails = async (memberDetails: memberDetails) => {
  const doc = new jsPDF();

  const orange = "#FF6600";
  const black = "#000000";

  const profileImgBase64 = memberDetails.profileImageUrl
    ? await fetchImageAsBase64(
        `${NEXT_PUBLIC_API_BASE_URL}${memberDetails.profileImageUrl}`
      )
    : null;

  if (profileImgBase64) {
    doc.addImage(profileImgBase64, "JPEG", 80, 5, 50, 40, undefined, "FAST");
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(orange);
  doc.text(`Member Details`, 105, 58, { align: "center" });

  doc.setFontSize(16);
  doc.setTextColor(black);
  doc.text(memberDetails.fullName, 105, 68, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(black);

  const startY = 85;
  const lineHeight = 10;

  const details = [
    `Phone Number: ${memberDetails.phoneNumber}`,
    `Email: ${memberDetails.email || "N/A"}`,
    `Address: ${memberDetails.address || "N/A"}`,
    `Date of Birth: ${
      memberDetails.dob
        ? new Date(memberDetails.dob).toLocaleDateString()
        : "N/A"
    }`,
    `Emergency Contact: ${memberDetails.emergencyContact ? "Yes" : "No"}`,
    `Exercise Restrictions: ${
      memberDetails.healthCondition?.exerciseRestriction ? "Yes" : "No"
    }`,
    `Pain During Workout: ${
      memberDetails.healthCondition?.painDuringExercise ? "Yes" : "No"
    }`,
    `Heart / HyperTension Meds: ${
      memberDetails.healthCondition?.heartHypertensionMeds ? "Yes" : "No"
    }`,
    `Dizziness or Fainting Before: ${
      memberDetails.healthCondition?.dizzinessOrFainting ? "Yes" : "No"
    }`,
    `Chronic Diseases: ${
      memberDetails.healthCondition?.chronicDiseases ? "Yes" : "No"
    }`,
    `Additional Remarks : ${
      memberDetails.healthCondition?.additionalRemarks ? "Yes" : "No"
    }`,
    `Goal: ${memberDetails.goal || "N/A"}`,
    `Service: ${memberDetails.service.name || "No Service Assigned"}`,
    `Weight: ${memberDetails.weight || "N/A"} kg`,
    `Height: ${memberDetails.height || "N/A"} cm`,
    `BMI: ${memberDetails.bmis[0]?.value || "N/A"} kg/m²`,
  ];

  details.forEach((detail, index) => {
    doc.text(detail, 105, startY + index * lineHeight, { align: "center" });
  });

  const footerY = 280;
  doc.setFontSize(10);
  doc.setTextColor(orange);
  doc.text("Thank you for being a valued member of our gym!", 105, footerY, {
    align: "center",
  });

  doc.save(`${memberDetails.fullName}_details.pdf`);
};

const FormattedName: React.FC<{ fullName: string }> = ({ fullName }) => {
  const capitalize = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const nameParts = fullName.trim().split(" ");
  const firstName = capitalize(nameParts[0]);
  const otherNames = nameParts.slice(1).map(capitalize).join(" ");

  return (
    <h2 className="text-sm lg:text-base font-bold">
      {firstName}
      {otherNames && <br />}
      {otherNames}
    </h2>
  );
};

const capitalize = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

const ProfileImageWithModal = ({
  profileImageUrl,
}: {
  profileImageUrl: string | null;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div>
      <img
        src={`${NEXT_PUBLIC_API_BASE_URL}${profileImageUrl}`}
        alt="Profile"
        className="w-16 h-16 rounded-full object-cover cursor-pointer"
        onClick={handleOpenModal}
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={`${NEXT_PUBLIC_API_BASE_URL}${profileImageUrl}`}
              alt="Profile Fullscreen"
              className="max-w-full max-h-screen rounded-lg"
            />
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-white bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full p-2 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileImageWithModal;

export {
  downloadMemberId,
  downloadMemberDetails,
  FormattedName,
  ProfileImageWithModal,
};
