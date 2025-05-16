"use client";

import React, { useState } from "react";
import axios from "axios";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const AttendancePage: React.FC = () => {
  const [userId, setUserId] = useState<string>("");
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Handle scanned ID
  const handleScan = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scannedId = e.target.value;
    console.log(scannedId);

    setUserId(scannedId);
    e.target.value = ""; // Clear input field for the next scan
  };

  // Send ID to backend
  const handleAttendance = async () => {
    try {
      setError("");
      setResult("Processing...");

      const response = await axios.post(
        `${NEXT_PUBLIC_API_BASE_URL}/api/attendance/${userId}`,
        { id: userId }
      );

      if (response.data.success) {
        const { totalAttendance, name } = response.data.data;
        setResult(`✅ Attendance recorded for ${name} successfully!.`);
      }
    } catch (err: any) {
      setResult("");
      setError(err.response?.data?.message || "An error occurred.");
    } finally {
      setUserId("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-6 py-12">
      <h1 className="text-2xl font-bold text-[#1ea7fd] mb-6">Attendance</h1>

      {/* Input for barcode scanner */}
      <div className="w-full max-w-sm">
        <label htmlFor="barcode" className="text-white text-sm">
          Scan User ID:
        </label>
        <input
          type="text"
          id="barcode"
          className="w-full mt-2 p-2 rounded-lg border border-gray-600 bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-[#1ea7fd]"
          placeholder="Scan barcode..."
          value={userId}
          onChange={handleScan}
          onKeyDown={(e) => e.key === "Enter" && handleAttendance()} // Trigger on Enter
        />
      </div>

      {/* Button to record attendance */}
      <button
        onClick={handleAttendance}
        className="mt-4 bg-[#1ea7fd] text-black font-semibold px-4 py-2 rounded-full hover:bg-[#1483c4] transition"
        disabled={!userId}
      >
        Record Attendance
      </button>

      {/* Results Section */}
      <div className="mt-6 w-full max-w-lg p-4 rounded-lg bg-[#121212] border border-gray-700">
        {result && <p className="text-green-400 text-center">{result}</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default AttendancePage;
