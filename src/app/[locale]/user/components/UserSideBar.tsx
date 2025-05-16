import React, {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import Image from "next/image";
import {usePathname} from "next/navigation";
import logo from "@/assets/logos/logo.svg";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCalendarCheck,
  faPersonRunning,
  faTableCells,
  faUser,
  IconDefinition,
} from "@fortawesome/free-solid-svg-icons";

interface UserSidebarProps {
  setActiveNav: (nav: string) => void;
}

const iconMapping: { [key: string]: IconDefinition } = {
  faTableCells: faTableCells,
  faPersonRunning: faPersonRunning,
  faCalendarCheck: faCalendarCheck,
  faUser: faUser,
};

const UserSidebar: React.FC<UserSidebarProps> = ({setActiveNav}) => {
  const pathname = usePathname();
  const [activeNav, setActive] = useState<string>("Dashboard");

  const navItems = useMemo(
    () => [
      { name: "Dashboard", icon: "faTableCells", path: "/en/user" },
      { name: "Plan", icon: "faPersonRunning", path: "/en/user/Plans" },
      { name: "My plans", icon: "faCalendarCheck", path: "/en/user/my-plan" },
      { name: "Profile", icon: "faUser", path: "/en/user/profile" },
    ],
    []
  );

  useEffect(() => {
    const currentItem = navItems.find((item) => item.path === pathname);
    if (currentItem) {
      setActive(currentItem.name);
    }
  }, [pathname, navItems]);

  return (
    <aside className="bg-black w-40 text-white flex flex-col border-r-[0.5px] border-gray-800">
      <div className="p-[0.85rem] border-b-[0.5px] border-gray-800">
        <Image src={logo} alt="logo" className="w-28 mx-auto"/>
      </div>

      <nav className="flex-grow mx-auto flex flex-col gap-4 pt-10 text-sm">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`text-white relative w-full flex items-center px-4 font-extralight py-2 transition-all duration-200 ${
              activeNav === item.name
                ? "text-customBlue"
                : "hover:text-customBlue "
            }`}
          >
            <span
              className={`absolute right-[-2rem] top-0 h-full w-1 bg-customBlue rounded-l-md transition-all duration-200 ${
                activeNav === item.name
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100"
              }`}
            ></span>            <span
              className={`${
                activeNav === item.name ? "text-customBlue" : "text-white"
              }`}
            >
              {item.name}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default UserSidebar;