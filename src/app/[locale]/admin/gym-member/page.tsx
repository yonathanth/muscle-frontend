"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faPlus,
  faSearch,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import AddMember from "../components/AddMemberForm";
import SmallLoading from "../components/SmallLoading";
import Loading from "../loading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
import downloadUsers from "./helper"; // Adjust the path as needed
import { useRouter, useSearchParams } from "next/navigation";

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
  daysLeft: number;
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
  serviceId: string | null;
  profileImageUrl: string | null;
  service: Service;
};

const GymMembersList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from query parameters
  const initialSearchTerm = searchParams.get("searchTerm") || "";
  const initialStatusFilter = searchParams.get("statusFilter") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [isLoading, setIsLoading] = useState(false);

  const [memberList, setMemberList] = useState<Member[]>([]);
  const [dropdownIndex, setDropdownIndex] = useState<number | null>(null);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [selectedMemberForDate, setSelectedMemberForDate] =
    useState<Member | null>(null);
  const [showFreezeModal, setShowFreezeModal] = useState<boolean>(false);

  const [selectedMemberForFreeze, setSelectedMemberForFreeze] =
    useState<Member | null>(null);
  let [freezeDuration, setFreezeDuration] = useState<number>();

  let [activationDate, setActivationDate] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error message

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false); // State for AddMember modal
  const [isPageLoading, setIsPageLoading] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null); // Reference for the dropdown menu
  const fetchMembers = async () => {
    setIsPageLoading(true);
    try {
      const response = await axios.get(
        `${NEXT_PUBLIC_API_BASE_URL}/api/members`
      );
      const users = response.data.data.users;

      // Filter out members with the role 'root'
      const filteredUsers = users.filter(
        (user: { role: string }) => user.role === "user"
      );

      setMemberList(filteredUsers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching members:", error);
      setErrorMessage("Failed to load members. Please try again.");
      setLoading(false);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("searchTerm", searchTerm);
    if (statusFilter) params.set("statusFilter", statusFilter);
    // router.push changes the URL, updating the query string
    router.push(`?${params.toString()}`);
  }, [searchTerm, statusFilter, router]);

  const filteredMembers = memberList.filter((member) => {
    const matchesSearchTerm = member.fullName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesService = member.service?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesDate = member.startDate
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter
      ? member.status.toLowerCase() === statusFilter.toLowerCase()
      : true;
    return (
      (matchesSearchTerm || matchesService || matchesDate) && matchesStatus
    );
  });

  const updateUserStatus = async (
    memberId: string,
    newStatus: string,
    startDate?: string,
    freezeDuration?: number
  ) => {
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${NEXT_PUBLIC_API_BASE_URL}/api/memberManagement/${memberId}/status`,
        {
          status: newStatus,
          startDate,
          freezeDuration,
        }
      );
      console.log(response.data);
      fetchMembers();
      // const refetchResponse = await axios.get(
      //   `${NEXT_PUBLIC_API_BASE_URL}/api/members`
      // );
      // const users = refetchResponse.data.data.users;

      // setMemberList(users);
    } catch (error) {
      console.error(`Error updating status for member ${memberId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMember = async (memberId: string) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(
        `${NEXT_PUBLIC_API_BASE_URL}/api/members/${memberId}`
      );
      if (response.status === 200) {
        setMemberList((prev) =>
          prev.filter((member) => member.id !== memberId)
        );
      }
    } catch (error) {
      console.error(`Error deleting member ${memberId}:`, error);
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
      setMemberToDelete(null);
    }
  };

  const handleDropdownAction = (action: string, member: Member) => {
    const { id, status } = member;

    if (
      action === "Activate" &&
      (status === "inactive" ||
        status === "expired" ||
        status === "freeze" ||
        status === "dormant" ||
        status === "pending")
    ) {
      setSelectedMemberForDate(member);
      setShowDateModal(true);
    } else if (action === "Deactivate" && status !== "inactive") {
      updateUserStatus(id, "inactive");
    } else if (action === "Freeze" && status === "active") {
      setSelectedMemberForFreeze(member);
      setShowFreezeModal(true);
    } else if (action === "Unfreeze" && status === "frozen") {
      updateUserStatus(id, "unfreeze");
    } else if (action === "Dormant" && status !== "dormant") {
      updateUserStatus(id, "dormant");
    } else if (action === "Delete") {
      setMemberToDelete(member);
      setShowDeleteModal(true);
    }
    setDropdownIndex(null); // Close the dropdown after action
  };

  const toggleDropdown = (index: number) => {
    setDropdownIndex(dropdownIndex === index ? null : index);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownIndex(null); // Close the dropdown if clicked outside
    }
  };

  useEffect(() => {
    if (dropdownIndex !== null) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownIndex]);

  const handleDateSubmit = async () => {
    if (activationDate.trim() === "") {
      activationDate = new Date().toString();
    }

    if (selectedMemberForDate) {
      const formattedDate = new Date(activationDate).toISOString();
      await updateUserStatus(selectedMemberForDate.id, "active", formattedDate); // Pass the correct date here
      setShowDateModal(false);
      setActivationDate(""); // Reset the date input after submission
    }
  };
  const handleFreezeDurationSubmission = async () => {
    if (selectedMemberForFreeze) {
      await updateUserStatus(
        selectedMemberForFreeze.id,
        "frozen",
        undefined,
        freezeDuration
      );
      setShowFreezeModal(false);
      setFreezeDuration(0);
    }
  };

  const handleDeleteConfirm = () => {
    if (memberToDelete) {
      deleteMember(memberToDelete.id);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setMemberToDelete(null);
  };

  return isPageLoading ? (
    <Loading />
  ) : (
    <div className="text-white flex flex-col h-full">
      <div className="flex justify-between items-center ">
        <h1 className="hidden sm:block text-2xl font-bold text-black">
          Gym Members
        </h1>
        <div className="flex flex-row items-center space-x-4">
          <button
            onClick={() => setShowAddMemberModal(true)}
            className="bg-customBlue  text-black font-light mb-4 md:mb-0 px-4 py-2 rounded-lg hover:bg-customHoverBlue flex items-center space-x-2"
          >
            <FontAwesomeIcon icon={faPlus} />
            <span className="hidden md:block">Add Member</span>
          </button>
          <button
            onClick={() => downloadUsers()}
            className="bg-[#ffffff29] px-4 py-2 rounded-md border border-gray-600 flex items-center"
          >
            <span className="text-gray-300">
              <FontAwesomeIcon
                icon={faDownload}
                className="text-customBlue text-base sm:text-xl cursor-pointer"
              />
            </span>
          </button>
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
          <div className="relative ">
            <div className="bg-[#ffffff29] px-4 py-2 rounded-md border border-gray-600 flex items-center">
              <span className="text-gray-300">
                <FontAwesomeIcon
                  icon={faFilter}
                  className="text-customBlue text-base sm:text-xl cursor-pointer"
                />
              </span>
              <select
                className="absolute mt-4 opacity-0 px-5 cursor-pointer left-0  z-10 rounded-md bg-zinc-900 "
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="frozen">Frozen</option>
                <option value="expired">Expired</option>
                <option value="dormant">Dormant</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex justify-end"></div> */}
      {showAddMemberModal && (
        <AddMember
          setShowModal={setShowAddMemberModal}
          fetchData={fetchMembers}
        />
      )}

      {/* Modal for add member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-md max-w-sm w-full">
            <AddMember
              setShowModal={setShowAddMemberModal}
              fetchData={fetchMembers}
            />
          </div>
        </div>
      )}

      <div className="md:p-6">
        <div className="overflow-x-auto overflow-y-auto ">
          <table className="min-w-[800px] w-full mb-32">
            <thead>
              <tr>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Name
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Phone no.
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Days Left{" "}
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Service{" "}
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Start Date
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Status
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Error Message Display */}
              {errorMessage && (
                <div className="mt-4 text-red-500 text-center">
                  {errorMessage}
                </div>
              )}
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member, index) => {
                  const statusColors: { [key: string]: string } = {
                    active: "bg-green-500/30",
                    inactive: "bg-red-500/30",
                    frozen: "bg-blue-500/30",
                    expired: "bg-gray-400/20",
                    pending: "bg-[#ffffff12]",
                  };

                  const bgColor =
                    statusColors[member.status.toLowerCase()] ||
                    "bg-gray-400/30";

                  return (
                    <tr
                      key={member.id}
                      className={` border-b border-[#333]  ${bgColor}`}
                    >
                      <Link href={`./gym-member/${member.id}`}>
                        <td className="text-gray-400 py-3 px-2 font-extralight  hover:text-white ">
                          {member.fullName}
                        </td>
                      </Link>
                      <td className="text-gray-400 py-3 px-2 font-extralight text-sm">
                        {member.phoneNumber}
                      </td>
                      <td className="text-gray-400 py-3 px-2 font-extralight text-sm">
                        {member.status === "expired" ||
                        member.status === "active"
                          ? member.daysLeft
                          : "-"}
                      </td>
                      <td className="text-gray-400 py-3 px-2 font-extralight text-sm">
                        {member.service?.name}
                      </td>
                      <td className="text-gray-400 py-3 px-2 font-extralight text-sm">
                        {member.startDate.substring(0, 10)}
                      </td>
                      <td className="text-gray-400 py-3 px-2 font-extralight text-sm">
                        {member.status}
                      </td>
                      <td className="text-gray-400 py-3 px-2 font-extralight text-sm relative">
                        <button
                          onClick={() => toggleDropdown(index)}
                          className="text-customBlue hover:text-gray-300 ml-8"
                        >
                          ⋮
                        </button>
                        {dropdownIndex === index && (
                          <div
                            ref={dropdownRef}
                            className="absolute flex justify-center bg-[#121212] shadow-lg rounded-lg mt-2 w-36 py-2 z-20"
                          >
                            <ul>
                              {member.status === "pending" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Activate", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Activate
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Dormant", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Dormant
                                    </button>
                                  </li>
                                </>
                              )}
                              {member.status === "active" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction(
                                          "Deactivate",
                                          member
                                        )
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Inactive
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Freeze", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Freeze
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Dormant", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Dormant
                                    </button>
                                  </li>
                                </>
                              )}
                              {member.status === "inactive" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Activate", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Active
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Dormant", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Dormant
                                    </button>
                                  </li>
                                </>
                              )}
                              {member.status === "expired" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Activate", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Active
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Dormant", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Dormant
                                    </button>
                                  </li>
                                </>
                              )}
                              {member.status === "frozen" && (
                                <>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Unfreeze", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Unfreeze
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction("Dormant", member)
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Dormant
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() =>
                                        handleDropdownAction(
                                          "Deactivate",
                                          member
                                        )
                                      }
                                      className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                    >
                                      Inactive
                                    </button>
                                  </li>
                                </>
                              )}
                              {member.status === "dormant" && (
                                <li>
                                  <button
                                    onClick={() =>
                                      handleDropdownAction("Activate", member)
                                    }
                                    className="block px-4 py-2 text-gray-300 hover:bg-[#1d1d1d]"
                                  >
                                    Active
                                  </button>
                                </li>
                              )}
                              <li>
                                <button
                                  onClick={() =>
                                    handleDropdownAction("Delete", member)
                                  }
                                  className="block px-4 py-2 text-red-500 hover:bg-[#1d1d1d]"
                                >
                                  Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    No members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-4">
              Are you sure you want to delete?
            </h3>
            <div className="flex px-4 justify-between">
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 text-white px-6 py-2 rounded-md"
              >
                {isLoading ? <SmallLoading /> : "Delete"}
              </button>
              <button
                onClick={handleDeleteCancel}
                className="bg-gray-300 text-black px-6 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Modal */}
      {showDateModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-4">
              Select Activation Date for {selectedMemberForDate?.fullName}
            </h3>
            <input
              type="date"
              value={activationDate}
              onChange={(e) => setActivationDate(e.target.value)}
              className="w-full p-2 border bg-[#ffffff29] border-gray-300 rounded-md mb-4"
            />
            <div className="flex justify-between">
              <button
                onClick={handleDateSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded-md"
              >
                {isLoading ? <SmallLoading /> : "Activate"}
              </button>
              <button
                onClick={() => setShowDateModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showFreezeModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-black p-6 rounded-lg w-80">
            <h3 className="text-lg font-semibold mb-4">
              Select Freeze Duration (in days) for{" "}
              {selectedMemberForFreeze?.fullName}
            </h3>
            <input
              type="number"
              value={freezeDuration}
              onChange={(e) => setFreezeDuration(Number(e.target.value))}
              className="w-full p-2 border bg-[#ffffff29] border-gray-300 rounded-md mb-4"
              required
            />
            <div className="flex justify-between">
              <button
                onClick={handleFreezeDurationSubmission}
                className="bg-customBlue text-white px-4 py-2 rounded-md"
              >
                {isLoading ? <SmallLoading /> : "Freeze"}
              </button>
              <button
                onClick={() => setShowFreezeModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    // <div className="min-h-screen flex items-center justify-center bg-black px-4">
    //   {/* Modal container */}
    //   <div
    //     className="bg-[#121212] text-white rounded-lg p-6 w-full max-w-lg sm:max-w-lg lg:max-w-2xl shadow-md"
    //     style={{
    //       backdropFilter: "blur(10px)",
    //       border: "1px solid #fff",
    //     }}
    //   >
    //     {/* Modal title */}
    //     <h2
    //       className="text-center text-6xl font-bold mb-6
    //     "
    //     >
    //       {" "}
    //       ሰላም👋!{" "}
    //     </h2>

    //     <h2
    //       className="text-center text-2xl  mb-2 text-white
    //     "
    //     >
    //       አገልግሎቱን ለማስቀጠል <span className="font-bold ">እባኮት</span> ከታች ባሉት አካውንቶች
    //       የቀረቦትን ክፍያ (65,000.00 ብር) ያስገቡ! እናመሰግናለን!
    //     </h2>
    //     {/* Modal content */}
    //     <p className="text-lg  text-center mb-6 leading-9">
    //       Leul Derebe - 1000298686418 <br />
    //       Yonatan Tenaye - 1000477728147
    //     </p>

    //     {/* Action button */}
    //     <div className="flex justify-center">
    //       <Link href="/">
    //         <button className="bg-[#1ea7fd] text-black font-semibold px-6 py-2 rounded-full hover:bg-[#1483c4] transition">
    //           Back to Home{" "}
    //         </button>
    //       </Link>
    //     </div>
    //   </div>
    // </div>
  );
};

export default GymMembersList;
