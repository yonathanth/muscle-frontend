"use client";
import axios from "axios";
import jsPDF from "jspdf";
import React from "react";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const fetchImageAsBase64 = async (url: string) => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
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

const downloadMemberDetails = async () => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      console.error("No authentication token found");
      return;
    }

    const response = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/members`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const members = result.data.users || [];

    if (!members || members.length === 0) {
      console.error("No members found.");
      return;
    }

    const doc = new jsPDF();

    // Theme Colors
    const orange = "#FF6600";
    const black = "#000000";

    for (let i = 0; i < members.length; i++) {
      const memberDetails = members[i];

      if (i > 0) doc.addPage();

      // Add profile image if available
      const profileImgBase64 = memberDetails.profileImageUrl
        ? await fetchImageAsBase64(
            `${NEXT_PUBLIC_API_BASE_URL}${memberDetails.profileImageUrl}`
          )
        : null;

      if (profileImgBase64) {
        doc.addImage(
          profileImgBase64,
          "JPEG",
          80,
          5,
          50,
          40,
          undefined,
          "FAST"
        );
      }

      // Add title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(orange);
      doc.text(`Member Details`, 105, 58, { align: "center" });

      // Add member full name
      doc.setFontSize(16);
      doc.setTextColor(black);
      doc.text(memberDetails.fullName, 105, 68, { align: "center" });

      // Member details
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
          memberDetails.healthCondition?.chronicDiseases || "N/A"
        }`,
        `Additional Remarks: ${
          memberDetails.healthCondition?.additionalRemarks || "N/A"
        }`,
        `Goal: ${memberDetails.goal || "N/A"}`,
        `Service: ${memberDetails.service?.name || "No Service Assigned"}`,
        `Weight: ${memberDetails.weight || "N/A"} kg`,
        `Height: ${memberDetails.height || "N/A"} cm`,
        `BMI: ${memberDetails.bmis?.[0]?.value || "N/A"} kg/m²`,
      ];

      details.forEach((detail, index) => {
        doc.text(detail, 105, startY + index * lineHeight, { align: "center" });
      });

      // Footer
      const footerY = 280;
      doc.setFontSize(10);
      doc.setTextColor(orange);
      doc.text(
        "Thank you for being a valued member of our gym!",
        105,
        footerY,
        { align: "center" }
      );
    }

    doc.save(`All_Member_details.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};

const DownloadPage = () => {
  const handleDownload = async () => {
    await downloadMemberDetails();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
      >
        Download All Details
      </button>
    </div>
  );
};

export default DownloadPage;
