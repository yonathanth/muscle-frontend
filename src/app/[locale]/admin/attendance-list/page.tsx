"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCalendar } from "@fortawesome/free-solid-svg-icons";
import { useRouter, useSearchParams } from "next/navigation";

interface GymMember {
  id: string;
  fullName: string;
  phoneNumber: string;
  status: string;
  daysLeft: number;
  startDate: string;
}

const GymAttendanceList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const [members, setMembers] = useState<GymMember[]>([]);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("searchTerm") || ""
  );
  const [selectedDate, setSelectedDate] = useState(
    searchParams.get("date") || new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      if (!token) {
        setLoading(false);
        setMembers([]);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/attendance?date=${selectedDate}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMembers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching attendance data:", error);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [selectedDate, token]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("searchTerm", searchTerm);
    if (selectedDate) params.set("date", selectedDate);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [searchTerm, selectedDate, router]);

  const filteredMembers = members.filter((member) =>
    member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 sm:p-6 bg-black text-white rounded-lg shadow-lg">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <h1 className="text-lg sm:text-2xl font-bold text-white">
          Gym Attendance
        </h1>
        <div className="flex flex-col gap-4 w-full md:flex-row md:gap-4 md:w-auto">
          <div className="relative w-full sm:w-auto">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon
                icon={faCalendar}
                className="text-customBlue text-xl"
              />
            </span>
            <input
              type="date"
              className="w-full pl-10 px-6 py-2 rounded-md bg-[#ffffff29] text-gray-300 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-customBlue"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <div className="relative w-full sm:w-auto">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon
                icon={faSearch}
                className="text-customBlue text-xl"
              />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 px-6 py-2 rounded-md bg-[#ffffff29] text-gray-300 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-customBlue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="bg-black border-t border-[#D9D9D93B] text-gray-300 uppercase">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Phone Number</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Days Left</th>
              <th className="px-6 py-4">Start Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  Loading...
                </td>
              </tr>
            ) : filteredMembers.length ? (
              filteredMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className={`${
                    index % 2 === 0 ? "bg-[#ffffff12]" : "bg-black"
                  }`}
                >
                  <td className="px-6 py-2">
                    <Link
                      href={`/en/admin/gym-member/${member.id}`}
                      className="text-customBlue hover:underline"
                    >
                      {member.fullName}
                    </Link>
                  </td>
                  <td className="px-6 py-2">{member.phoneNumber}</td>
                  <td className="px-6 py-2">{member.status}</td>
                  <td className="px-6 py-2">{member.daysLeft}</td>
                  <td className="px-6 py-2">
                    {new Date(member.startDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center text-gray-500 py-4">
                  No members found for{" "}
                  {new Date(selectedDate).toLocaleDateString()}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GymAttendanceList;
