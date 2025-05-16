"use client";
import React, { lazy, Suspense, useEffect, useState } from "react";
import LoadingPage from "./loading";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";

interface CustomJwtPayload {
  role: string;
  status: string;
  id: string; // Add userId to the payload
}
const DashboardContent = lazy(
  () => import("./components/UserDashBoardContent")
);

const UserDashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const timeout = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const { role, status, id } = decodedToken;

      if (role === "root") {
        setUserId(id); // Set userId here
      } else if (role !== "user" || status !== "active") {
        router.push("/");
      } else {
        setUserId(id);
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/");
    }
  }, [router]);

  if (isLoading) return <LoadingPage />;

  return (
    <Suspense>
      <DashboardContent userId={userId} status={status} />
    </Suspense>
  );
};

export default UserDashboard;

// import Link from "next/link";
// import React from "react";

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
//         <h2 className="text-center text-lg font-semibold mb-4 text-customBlue">
//           Feature not available for a while{" "}
//         </h2>
//         {/* Modal content */}
//         <p className="text-sm text-center mb-6 leading-relaxed">
//           please contanct the admin for more information.
//         </p>
//         {/* Action button */}
//         <div className="flex justify-center">
//           <Link href="/">
//             <button className="bg-[#1ea7fd] text-black font-semibold px-6 py-2 rounded-full hover:bg-[#1483c4] transition">
//               Back to Home{" "}
//             </button>
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResponsiveModal;
