import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import LogoutButton from '../../admin/components/LogoutButton';
import { User } from "@/src/app/[locale]/user/layout";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


interface UserHeaderProps {
  activeNav: string;
  user: User | null; // Accept userId as a prop
}

interface NotificationType {
  id: string;
  name: string;
  description: string;
  updatedAt: Date
}

const UserHeader: React.FC<UserHeaderProps> = ({ activeNav, user }) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationType[] | null>(null)
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [userRes, broadcastRes] = await Promise.all([
        fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/members/${user?.id}/`, { cache: "no-store" }),
        fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/broadcast/`, { cache: "no-store" })
      ]);

      const userData = await userRes.json();
      const broadcastData = await broadcastRes.json();

      const userNotifications: NotificationType[] = userData?.data?.user?.notifications || [];
      const broadcastNotifications: NotificationType[] = broadcastData?.data?.broadcasts || [];


      const totalNotifications = [...userNotifications, ...broadcastNotifications];

      setNotifications(totalNotifications);
      console.log(totalNotifications)
      return totalNotifications;
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return []; // Return an empty array if there's an error
    } finally {
      setIsLoading(false);
    }
  };
  const toggleTooltip = () => {
    setIsTooltipVisible((prev) => !prev);
    fetchNotifications().then(r => { })
  };


  return (
    <>
      {/* Dark overlay */}
      {isTooltipVisible && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-40"
          onClick={() => setIsTooltipVisible(false)}
        ></div>
      )}

      <header
        className="p-4 pt-[1.5rem] bg-black flex justify-between items-center text-white border-b-[0.5px] border-gray-800 relative z-50">
        <h1 className="text-lg truncate mr-2 sm:mr-0">{activeNav}</h1>
        <div className="flex gap-2 items-center relative">
          {/* Notification Icon */}
          <FontAwesomeIcon
            icon={faBell}
            className="bg-customBlue text-black font-light px-2 py-[0.35rem] rounded-lg text-sm sm:text-base cursor-pointer"
            onClick={toggleTooltip}
          />

          {/* Tooltip */}
          {isTooltipVisible && (
            <div
              className="absolute top-10 right-10 w-[250px] sm:w-[350px] p-4 rounded-lg bg-opacity-80 text-white shadow-2xl border border-customBlue z-50"
              style={{
                backdropFilter: 'blur(10px)',
              }}
            >
              {isLoading ?
                <div className="flex items-center justify-center my-10 bg-black text-white">
                  <div className="animate-spin border-4 border-customBlue border-t-transparent rounded-full w-12 h-12"></div>
                </div> :
                <ul
                className="space-y-2 text-xs max-h-60 overflow-y-auto"
                style={{scrollbarWidth: "thin", scrollbarColor: "#2596BE #1E293B"}}
              >
                {notifications?.map((notification) => {
                  const updatedDate = new Date(notification.updatedAt); // Convert to Date object
                  const formattedDate = updatedDate.toLocaleDateString("en-GB"); // Format to dd-mm-yyyy
                  return (
                    <li
                      key={notification.id} // Use unique ID as key
                      className="p-3 bg-[#1E293B] bg-opacity-50 rounded-md"
                    >
                      <p className="text-xs">{notification.name}</p>
                      <p className="text-lg">{notification.description}</p>
                      <p className="text-gray-400 text-[10px]">{formattedDate}</p> {/* Display formatted date */}
                    </li>
                  );
                })}
              </ul>}

            </div>
          )}
          {/* Email Display */}
          <p className="hidden sm:block font-extralight text-sm truncate">
            {user?.email}
          </p>
          <LogoutButton/>

        </div>
      </header>
    </>
  );
};

export default UserHeader;