import React, { useState, useEffect } from "react";
import Link from "next/link";
import LogoutButton from "../components/LogoutButton";
import { faHouse, faBell } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";

interface AdminHeaderProps {
  activeNav: string;
}

interface Notification {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  read: boolean;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ activeNav }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const token = localStorage.getItem("token");
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/notifications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(
          response.data.data.filter((n: Notification) => !n.read).length
        );
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markNotificationsAsRead = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/dashboard/notifications/mark-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Set up polling every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDropdownToggle = async () => {
    if (!isDropdownOpen) {
      await markNotificationsAsRead();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <header className="p-4 pt-[1.5rem] bg-black flex justify-between items-center gap-5 lg:gap-0 text-white border-b-[0.5px] border-gray-800">
      <h1 className="text-lg">{activeNav}</h1>
      <div className="flex gap-3 items-center">
        <Link href="/">
          <button className="bg-customBlue text-black font-light px-2 text-sm py-1 rounded-lg">
            <FontAwesomeIcon icon={faHouse} />
          </button>
        </Link>

        <div className="relative">
          <button
            onClick={handleDropdownToggle}
            className="bg-customBlue text-black font-light px-2 text-sm py-1 rounded-lg relative"
          >
            <FontAwesomeIcon icon={faBell} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#121212] border border-gray-700 rounded-lg shadow-lg z-50">
              <div className="p-2 border-b border-gray-700">
                <h3 className="text-sm font-semibold">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-700 hover:bg-gray-800 ${
                        !notification.read ? "bg-gray-800/50" : ""
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">
                            {notification.name}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {notification.description}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-center text-gray-400">
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <LogoutButton />
      </div>
    </header>
  );
};

export default AdminHeader;
