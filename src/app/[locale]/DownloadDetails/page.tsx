"use client";
import axios from "axios";
import jsPDF from "jspdf";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

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
const downloadMemberDetails = async () => {
  try {
    const response = await fetch(
      "https://robi-api.robifitness.com/api/members"
    );
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
    const white = "#FFFFFF";

    for (let i = 0; i < members.length; i++) {
      const memberDetails = members[i];

      // Add black background for the logo
      const profileImgBase64 = memberDetails.profileImageUrl
        ? await fetchImageAsBase64(
            `${NEXT_PUBLIC_API_BASE_URL}${memberDetails.profileImageUrl}`
          )
        : null;

      if (i > 0) doc.addPage(); // Add a new page for each member

      // Add profile image if available
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
      doc.text(
        "Thank you for being a valued member of our gym!",
        105,
        footerY,
        {
          align: "center",
        }
      );
    } // Save the document
    doc.save(`All_Member_details.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};
import React from "react";

const download = () => {
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

export default download;
