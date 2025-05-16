"use client";

import Image from "next/image";
import loginImage from "./login.jpeg";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { jwtDecode } from "jwt-decode";
import { Link } from "@/src/i18n/routing";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

interface CustomJwtPayload {
  role: string;
  status: string;
}

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const Login = () => {
  const t = useTranslations("login_page");
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loader state

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    const loginData = { phoneNumber, password };

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(loginData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        const decodedToken = jwtDecode<CustomJwtPayload>(data.token);

        const { role, status } = decodedToken;

        if (role === "admin") {
          router.push("/en/admin");
        } else if (role === "moderator") {
          router.push("/en/attendance");
        } else if (role === "root") {
          router.push("/en/admin");
        } else if (role === "user") {
          if (status === "inactive") {
            router.push("/en/inactive-user");
          } else if (status === "pending") {
            router.push("/en/pending-user");
          } else if (status === "dormant") {
            router.push("/en/dormant-user");
          } else {
            router.push("/en/user");
          }
        }
      } else {
        setErrorMessage(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("An error occurred. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:block md:w-1/2 h-full md:relative">
        <Image
          src={loginImage}
          alt="Login Background"
          fill
          className="object-cover"
        />
      </div>
      <div className="lg:w-1/2 w-full my-auto p-8 sm:p-20 bg-black">
        <div className="text-white bg-black bg-opacity-75 p-8 rounded-md">
          <h2 className="text-3xl mb-2 text-left">{t("heading")}</h2>
          <p className="text-sm text-gray-400 mb-8">{t("motivational_text")}</p>
          <form
            className="flex flex-col items-center w-full"
            onSubmit={handleLogin}
          >
            <div className="mb-4 w-full">
              <input
                type="number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full p-2 placeholder-white/40 rounded-lg border-2 border-white/20 bg-black focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
                placeholder={t("fields.phone_number")}
              />
            </div>
            <div className="mb-6 w-full relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 placeholder-white/40 rounded-lg border-2 border-white/20 bg-black focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
                placeholder={t("fields.password")}
              />
              <FontAwesomeIcon
                icon={showPassword ? faEyeSlash : faEye}
                className="absolute top-1/2 right-8 transform -translate-y-1/2 text-white cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>
            <button
              type="submit"
              className="w-full p-2 font-semibold rounded-lg bg-customBlue hover:bg-customHoverBlue text-black flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                t("buttons.login")
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-400">
              {t("no_account")}{" "}
              <Link href="/Register" className="text-customBlue">
                {t("buttons.signup")}
              </Link>
            </p>
          </div>
          {errorMessage && (
            <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;

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
