import axios from "axios";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const getDashboardAttendanceData = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${NEXT_PUBLIC_API_BASE_URL}/api/dashboard/attendanceData`
      {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
      
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    throw error;
  }
};
