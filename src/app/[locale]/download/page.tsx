"use client";
import axios from "axios";
import jsPDF from "jspdf";

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
const fetchImageAsBase642 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(`https://robi-api.robifitness.com${url}`);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
};
const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.slice(0, maxLength) + "." : text;
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
const downloadAllMemberIds = async () => {
  try {
    const response = await fetch(
      "https://robi-api.robifitness.com/api/download"
    );
    const { data: members } = await response.json();

    if (!members || members.length === 0) {
      console.error("No members found.");
      return;
    }

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: [97, 63], // Set exact dimensions in mm
    });
    const cardWidth = 88;
    const cardHeight = 56;
    const orange = "#FF6600";
    const black = "#000000";
    const white = "#ffffff";

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      const startDate = new Date(member.startDate); // Convert to Date object

      if (
        startDate >= new Date("2025-01-09") &&
        startDate <= new Date("2025-01-13")
      ) {
        continue; // Skip members within the range
      }

      const profileImgBase64 = member.profileImageUrl
        ? await fetchImageAsBase642(member.profileImageUrl)
        : null;

      const barcodeImgBase64 = member.barcode;
      const logoBase64 = await fetchImageAsBase64("/Images/logo.png");

      if (i > 0) doc.addPage();

      //   // Left Black Background
      //   doc.setFillColor(black);
      //   doc.rect(0, 0, cardWidth / 2 - 6.5, cardHeight, "F");

      //   // Right White Background
      //   doc.setFillColor(white);
      //   doc.rect(cardWidth / 2, 0, cardWidth / 2, cardHeight, "F");

      //   // Orange Divider
      //   doc.setFillColor(orange);
      //   doc.rect(cardWidth / 2 - 7, 0, 0.5, cardHeight, "F");

      // Profile photo
      if (profileImgBase64) {
        doc.addImage(profileImgBase64, "JPEG", 8, 5, 20, 20, undefined, "FAST");
      }

      // Name and Gender on the Left
      doc.setFont("Montserrat", "bold");
      doc.setFontSize(10);
      doc.setTextColor(black);
      doc.text(
        capitalize(member.fullName.split(" ")[0]),
        (cardWidth / 2 - 6.5) / 2,
        29,
        { align: "center" }
      );
      doc.setFont("Montserrat", "normal");
      doc.setFontSize(7);
      doc.text(
        (member.fullName.split(" ")[1] &&
          capitalize(member.fullName.split(" ")[1])) ||
          "",
        (cardWidth / 2 - 6.5) / 2,
        32,
        { align: "center" }
      );
      doc.setFont("Montserrat", "bold");
      doc.setFontSize(7);

      // doc.text(
      //   member.gender === "male" ? "M" : "F",
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
      doc.text(member.phoneNumber, cardWidth / 2 + 11, 9);

      const truncatedAdress = truncateText(member.address!, 17);
      doc.text(truncatedAdress, cardWidth / 2 + 11, 14);

      const truncatedServiceName = truncateText(member.service.name, 17);
      doc.text(truncatedServiceName, cardWidth / 2 + 11, 19);

      const truncatedEmergencyContact = truncateText(
        member.emergencyContact!,
        33
      );
      doc.text(truncatedEmergencyContact, cardWidth / 2 + 11, 24);
      doc.text(member.gender, cardWidth / 2 + 11, 29);

      // barcode
      const pageWidth = doc.internal.pageSize.getWidth(); // Get the document width
      const imgWidth = 75; // Your image width

      const centerX = (pageWidth - imgWidth) / 2; // Calculate center position

      if (barcodeImgBase64) {
        doc.addImage(barcodeImgBase64, "PNG", centerX, 36, imgWidth, 15);
      }

      // "ID" Label
      doc.setFontSize(8);
      doc.setTextColor(black);
      doc.text("ID", cardWidth - 5, 5, { align: "right" });

      // BACK SIDE
      // doc.addPage();
      // doc.setFillColor(black);
      // doc.rect(0, 0, cardWidth, cardHeight, "F");

      // if (logoBase64) {
      //   doc.addImage(logoBase64, "PNG", cardWidth / 2 - 10, 8, 20, 24);
      // }

      // // Centered text
      // doc.setTextColor(white);
      // doc.setFont("Montserrat", "bold");
      // doc.setFontSize(10);
      // doc.text("Robi Fitness Center", cardWidth / 2, 33, { align: "center" });

      // doc.setFont("Montserrat", "normal");
      // doc.setFontSize(8);
      // doc.text(
      //   "St.Gabriel, In front of Evening Star, D.L Building",
      //   cardWidth / 2,
      //   38,
      //   {
      //     align: "center",
      //   }
      // );

      // doc.text("+251913212323 | +251943313282", cardWidth / 2, 43, {
      //   align: "center",
      // });

      // doc.setFont("Montserrat", "bold");

      // doc.text("www.robifitness.com", cardWidth / 2, 50, { align: "center" });
    }

    doc.save("All_Member_IDs.pdf");
  } catch (error) {
    console.error("Error generating IDs:", error);
  }
};

import React from "react";

const download = () => {
  const handleDownload = async () => {
    await downloadAllMemberIds();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <button
        onClick={handleDownload}
        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition"
      >
        Download All IDs
      </button>
    </div>
  );
};

export default download;
