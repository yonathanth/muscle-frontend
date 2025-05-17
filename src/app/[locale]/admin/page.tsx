"use client";
import React, { lazy, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import LoadingPage from "./loading";
const DashboardContent = lazy(() => import("./components/DashboardContent"));

const AdminDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) return <LoadingPage />;

  return (
    <Suspense fallback={<LoadingPage />}>
      <DashboardContent />
    </Suspense>
  );
};

export default AdminDashboard;

// const ResponsiveModal: React.FC = () => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-black px-4">
//       {/* Modal container */}
//       <div
//         className="bg-[#121212] text-white rounded-lg p-6 w-full max-w-lg sm:max-w-lg lg:max-w-2xl shadow-md"
//         style={{
//           backdropFilter: "blur(10px)",
//           border: "1px solid #fff",
//         }}
//       >
//         {/* Modal title */}
//         <h2
//           className="text-center text-6xl font-bold mb-6
//         "
//         >
//           {" "}
//           ሰላም👋!{" "}
//         </h2>

//         <h2
//           className="text-center text-2xl  mb-2 text-white
//         "
//         >
//           አገልግሎቱን ለማስቀጠል <span className="font-bold ">እባኮት</span> ከታች ባሉት አካውንቶች
//           የቀረቦትን ክፍያ (65,000.00 ብር) ያስገቡ! እናመሰግናለን!
//         </h2>
//         {/* Modal content */}
//         <p className="text-lg  text-center mb-6 leading-9">
//           Leul Derebe - 1000298686418 <br />
//           Yonatan Tenaye - 1000477728147
//         </p>

//         {/* Action button */}
//         <div className="flex justify-center">
//           <Link href="/">
//             <button className="bg-customBlue text-black font-semibold px-6 py-2 rounded-full hover:bg-customHoverBlue transition">
//               Back to Home{" "}
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResponsiveModal;
