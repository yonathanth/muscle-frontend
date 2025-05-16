import Link from "next/link";
import React from "react";

const ResponsiveModal: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      {/* Modal container */}
      <div
        className="bg-[#121212] text-white rounded-lg p-6 w-full max-w-lg sm:max-w-lg lg:max-w-2xl shadow-md"
        style={{
          backdropFilter: "blur(10px)",
          border: "1px solid #fff",
        }}
      >
        {/* Modal title */}
        <h2 className="text-center text-lg font-semibold mb-4 text-customBlue">
          Your Account is Dormant
        </h2>
        {/* Modal content */}
        <p className="text-sm text-center mb-6 leading-relaxed">
          Your account has been marked as dormant due to prolonged inactivity or
          other specific reasons. To resolve this issue, please contact the
          Facility Manager or Gym Administrator for assistance. They will help
          you review and update your account status.
        </p>
        {/* Action button */}
        <div className="flex justify-center">
          <Link href="/">
            <button className="bg-[#1ea7fd] text-black font-semibold px-6 py-2 rounded-full hover:bg-[#1483c4] transition">
              Back to Home{" "}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveModal;
