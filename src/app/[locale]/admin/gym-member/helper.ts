interface Service {
  id: string;
  name: string;
  price: string;
  benefits: string[];
  category: string;
  description?: string[];
}
export type Member = {
  id: string;
  fullName: string;
  gender: string;
  phoneNumber: string;
  email?: string | null;
  address: string;
  dob: string;
  emergencyContact: string;
  firstRegisteredAt: string;
  startDate: string;
  totalAttendance: number;
  remainingDays: number;
  countDown: number | null;
  height: number | null;
  weight: number | null;
  bmi: number | null;
  healthConditions: Record<string, boolean> | null;
  level: string | null;
  goal: string | null;
  status: string;
  freezeDate: string | null;
  createdAt: string;
  updatedAt: string;
  role: string;
  serviceId: string | null;
  profileImageUrl: string | null;
  service: Service;
  serviceName: string;
};

// downloadUsers.tsx

import axios from "axios";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const downloadUsers = async () => {
  const token = localStorage.getItem("token");
  try {
    // Fetch members from the API
    const response = await axios.get(
      `${NEXT_PUBLIC_API_BASE_URL}/api/members`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const users = response.data.data.users;

    // Filter users if needed
    const filteredUsers = users.filter((user: Member) => user.role === "user");

    // Map to extract relevant details
    const userData = filteredUsers.map((user: Member) => ({
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      serviceName: user.service?.name || "N/A",
      startDate: user.startDate,
    }));

    // Convert to CSV format
    const csvHeader = "Name, Phone Number,Service Name,Start Date\n";
    const csvRows = userData
      .map(
        (user: Member) =>
          `${user.fullName},${user.phoneNumber},${user.serviceName},${user.startDate}`
      )
      .join("\n");
    const csvContent = `${csvHeader}${csvRows}`;

    // Trigger download
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "members.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (error) {
    console.error("Error downloading users:", error);
    alert("Failed to download users. Please try again.");
  }
};

export default downloadUsers;
