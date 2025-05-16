'use client'
import { useState } from "react";
import { useRouter } from "next/navigation";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const LogoutButton = () => {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Show the modal on button click
  const handleShowModal = () => {
    setShowModal(true);
  };

  // Hide the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    setShowModal(false);  
    router.push("/");  
  };

  return (
    <div>
      <button
        onClick={handleShowModal}
        className="bg-red-500 text-black font-light text-sm px-2 py-1 rounded-lg"
      >
              <FontAwesomeIcon icon={faRightFromBracket} className="" />
        
      </button>

      {/* Modal */}
      {showModal && (
         <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
         <div className="bg-[#121212] text-white p-6 rounded-md w-96">
           <h2 className="text-lg font-semibold">Confirm Logout</h2>
           <p className="text-gray-300">
             Are you sure you want to Logout?
           </p>
           <div className="flex justify-end space-x-4 mt-4">
             <button
               className="bg-red-500 text-white px-4 py-2 rounded-md"
               onClick={handleLogout}

             >
                Logout
               </button>
             <button
               className="bg-gray-600 px-4 py-2 rounded-md"
               onClick={handleCloseModal}
             >
               Cancel
             </button>
           </div>
         </div>
       </div>
      )}
    </div>
  );
};

export default LogoutButton;
