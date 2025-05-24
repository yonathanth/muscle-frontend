import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logos/logo (3).svg";
import { jwtDecode } from "jwt-decode";

interface AdminSidebarProps {
  setActiveNav: (nav: string) => void;
}

interface DecodedToken {
  role: string;
  id: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ setActiveNav }) => {
  const [userRole, setUserRole] = useState<string>("");

  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Define visible routes for each role
  const routes = {
    admin: [
      { name: "Dashboard", path: "/en/admin" },
      { name: "Gym Members", path: "/en/admin/gym-member" },
      { name: "Attendance", path: "/en/attendance" },
      { name: "Attendance List", path: "/en/admin/attendance-list" },
      { name: "Staff", path: "/en/admin/staff" },
      { name: "Employees", path: "/en/admin/employee" },
      { name: "Stock", path: "/en/admin/stock" },
      { name: "Financial Report", path: "/en/admin/financial-report" },
      { name: "Services", path: "/en/admin/services" },
      { name: "Requests", path: "/en/admin/subscription-request" },
    ],
    moderator: [
      { name: "Dashboard", path: "/en/admin" },
      { name: "Gym Members", path: "/en/admin/gym-member" },
      { name: "Attendance", path: "/en/attendance" },
      { name: "Attendance List", path: "/en/admin/attendance-list" },
      { name: "Services", path: "/en/admin/services" },
      { name: "Requests", path: "/en/admin/subscription-request" },
    ],
    root: [
      { name: "Dashboard", path: "/en/admin" },
      { name: "Gym Members", path: "/en/admin/gym-member" },
      { name: "Attendance", path: "/en/attendance" },
      { name: "Attendance List", path: "/en/admin/attendance-list" },
      { name: "Staff", path: "/en/admin/staff" },
      { name: "Employees", path: "/en/admin/employee" },
      { name: "Stock", path: "/en/admin/stock" },
      { name: "Financial Report", path: "/en/admin/financial-report" },
      { name: "Services", path: "/en/admin/services" },
      { name: "Requests", path: "/en/admin/subscription-request" },
    ],
  };

  // Get the appropriate navigation items based on user role
  const getNavItems = () => {
    if (userRole === "admin") return routes.admin;
    if (userRole === "moderator") return routes.moderator;
    if (userRole === "root") return routes.root;
    return []; // Default empty array if role not recognized
  };

  const navItems = getNavItems();

  return (
    <aside className="bg-black w-40 text-white flex flex-col border-r-[0.5px] border-gray-800 h-screen z-50 overflow-y-auto">
      <div className="p-[0.85rem] border-b-[0.5px] border-gray-800">
        <Image src={logo} alt="logo" className="w-10 h-10 mx-auto" />
      </div>
      <nav className="flex-grow mx-auto flex flex-col gap-4 pt-10 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className="w-full text-left px-4 font-extralight py-3 hover:text-customBlue focus:text-customBlue"
            onClick={() => setActiveNav(item.name)}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
