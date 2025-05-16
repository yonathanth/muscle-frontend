import React from 'react';
import Link from 'next/link';
import LogoutButton from '../components/LogoutButton'
import { faHouse } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

interface AdminHeaderProps {
  activeNav: string;
}
const AdminHeader: React.FC<AdminHeaderProps> = ({ activeNav }) => {
  return (
    <header className="p-4 pt-[1.5rem] bg-black flex justify-between items-center gap-5 lg:gap-0 text-white border-b-[0.5px] border-gray-800">
      <h1 className="text-lg">{activeNav}</h1>
      <div className='flex gap-3'>
        <Link href="/">
          <button className="bg-customBlue text-black font-light px-2 text-sm py-1 rounded-lg " ><FontAwesomeIcon icon={faHouse}/></button>
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
};

export default AdminHeader;
