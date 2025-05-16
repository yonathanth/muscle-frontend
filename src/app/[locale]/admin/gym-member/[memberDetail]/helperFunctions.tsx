import { jsPDF } from "jspdf";
import axios from "axios";
import React, { useState } from "react";
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
    const response = await axios.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    const mimeType = response.headers["content-type"];
    return `data:${mimeType};base64,${base64}`;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};
const downloadMemberId = async (memberDetails: memberDetails) => {
  const doc = new jsPDF("landscape", "mm", "credit-card"); // ID size in landscape mode

  const cardWidth = 88; // Standard width
  const cardHeight = 56; // Standard height
  const orange = "#FF6600";
  const black = "#000000";
  const white = "#ffffff";

  // Fetch image utility

  // Images
  const profileImgBase64 = memberDetails.profileImageUrl
    ? await fetchImageAsBase64(
        `${NEXT_PUBLIC_API_BASE_URL}${memberDetails.profileImageUrl}`
      )
    : null;
  const barcodeImgBase64 = memberDetails.barcode;
  const logoBase64 = await fetchImageAsBase64("/Images/logo.png");
  // FRONT SIDE
  // Left Black Background
  // doc.setFillColor(black);
  // doc.rect(0, 0, cardWidth / 2 - 6.5, cardHeight - 30, "F");

  // // Right White Background
  // doc.setFillColor(white);
  // doc.rect(cardWidth / 2, 0, cardWidth / 2, cardHeight, "F");

  // // Orange Divider
  // doc.setFillColor(orange);
  // doc.rect(cardWidth / 2 - 7, 0, 0.5, cardHeight - 30, "F");

  // Profile photo
  if (profileImgBase64) {
    doc.addImage(profileImgBase64, "JPEG", 8, 5, 20, 20, undefined, "FAST");
  }

  // Name and Gender on the Left
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
  doc.setFont("Montserrat", "bold");
  doc.setFontSize(7);

  // doc.text(
  //   memberDetails.gender === "male" ? "M" : "F",
  //   (cardWidth / 2 - 6.5) / 2,
  //   46,
  //   {
  //     align: "center",
  //   }
  // );

  // Contact Details on the Right
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

  // Barcode on the Right Bottom
  if (barcodeImgBase64) {
    doc.addImage(barcodeImgBase64, "PNG", 6, 36, 75, 15);
  }

  // Logo

  // "ID" Label

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

  // Centered text
  doc.setTextColor(white);
  doc.setFont("Montserrat", "bold");
  doc.setFontSize(10);
  doc.text("Robi Fitness Center", cardWidth / 2, 33, { align: "center" });

  doc.setFont("Montserrat", "normal");
  doc.setFontSize(8);
  doc.text(
    "St.Gabriel, In front of Evening Star, D.L Building",
    cardWidth / 2,
    38,
    {
      align: "center",
    }
  );

  doc.text("+251913212323 | +251943313282", cardWidth / 2, 43, {
    align: "center",
  });

  doc.setFont("Montserrat", "bold");

  doc.text("www.robifitness.com", cardWidth / 2, 50, { align: "center" });

  // Save the PDF
  doc.save(`${memberDetails.fullName}_MembershipID.pdf`);
};

const downloadMemberDetails = async (memberDetails: memberDetails) => {
  const doc = new jsPDF();

  // Theme Colors
  const orange = "#FF6600";
  const black = "#000000";
  const white = "#FFFFFF";

  // Fetch the logo as a Base64 string

  // Add black background for the logo
  const profileImgBase64 = memberDetails.profileImageUrl
    ? await fetchImageAsBase64(
        `${NEXT_PUBLIC_API_BASE_URL}${memberDetails.profileImageUrl}`
      )
    : null;

  // Add profile image if available
  if (profileImgBase64) {
    doc.addImage(profileImgBase64, "JPEG", 80, 5, 50, 40, undefined, "FAST");
  }

  // Add logo at the top left if provided

  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(orange);
  doc.text(`Member Details`, 105, 58, { align: "center" }); // Centered title

  // Add member full name as a subtitle
  doc.setFontSize(16);
  doc.setTextColor(black);
  doc.text(memberDetails.fullName, 105, 68, { align: "center" });

  // Add member details section
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(black);

  const startY = 85; // Initial vertical position for details
  const lineHeight = 10; // Line height between rows

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
    `BMI: ${memberDetails.bmis[0].value || "N/A"} kg/m²`,
  ];

  details.forEach((detail, index) => {
    doc.text(detail, 105, startY + index * lineHeight, { align: "center" });
  });

  // Add a footer
  const footerY = 280; // Position for the footer
  doc.setFontSize(10);
  doc.setTextColor(orange);
  doc.text("Thank you for being a valued member of our gym!", 105, footerY, {
    align: "center",
  });

  // Save the document
  doc.save(`${memberDetails.fullName}_details.pdf`);
};
const FormattedName: React.FC<{ fullName: string }> = ({ fullName }) => {
  // Helper function to capitalize the first letter
  const capitalize = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();

  const nameParts = fullName.trim().split(" ");
  const firstName = capitalize(nameParts[0]); // Capitalize the first name
  const otherNames = nameParts
    .slice(1)
    .map(capitalize) // Capitalize each of the other names
    .join(" ");

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
      {/* Profile Image */}
      <img
        src={`${NEXT_PUBLIC_API_BASE_URL}${profileImageUrl}`}
        alt="Profile"
        className="w-16 h-16 rounded-full object-cover cursor-pointer"
        onClick={handleOpenModal}
      />

      {/* Modal */}
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
