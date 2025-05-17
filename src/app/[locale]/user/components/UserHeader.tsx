import React from "react";
import LogoutButton from "../../admin/components/LogoutButton";
import { User } from "@/src/app/[locale]/user/layout";

interface UserHeaderProps {
  activeNav: string;
  user: User | null;
}

const UserHeader: React.FC<UserHeaderProps> = ({ activeNav }) => {
  return (
    <header className="p-4 pt-[1.5rem] bg-black flex justify-between items-center text-white border-b-[0.5px] border-gray-800 relative z-50">
      <h1 className="text-lg truncate mr-2 sm:mr-0">{activeNav}</h1>
      <div className="flex gap-2 items-center relative">
        <LogoutButton />
      </div>
    </header>
  );
};

export default UserHeader;
