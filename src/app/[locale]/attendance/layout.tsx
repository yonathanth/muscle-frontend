'use client';

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface LayoutProps {
  children: ReactNode;
}

interface CustomJwtPayload {
  role: string;
}

const AttendanceLayout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const { role} = decodedToken;

      if (role !== "moderator" ) {
        router.push("/");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/");
    }
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-3xl">{children}</div>
    </div>
  );
};

export default AttendanceLayout;
