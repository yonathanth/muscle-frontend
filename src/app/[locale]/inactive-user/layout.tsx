"use client";
// Layout Component (InactiveAccountLayout)
import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface LayoutProps {
  children: ReactNode;
}

interface CustomJwtPayload {
  role: string;
  status: string;
  id: string; // Add userId to the payload
}

const InactiveAccountLayout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

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
        // If the user role is "root", allow them to pass
        setUserId(id); // Store userId for "root"
      } else if (role !== "user" || status !== "inactive") {
        router.push("/");
      } else {
        setUserId(id); // Store userId in state
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-3xl">
        {userId &&
          React.cloneElement(children as React.ReactElement, { userId })}
      </div>
    </div>
  );
};

export default InactiveAccountLayout;
