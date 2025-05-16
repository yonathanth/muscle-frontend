"use client";

import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";

interface LayoutProps {
  children: ReactNode;
}

interface CustomJwtPayload {
  role: string;
  status: string;
}

const PendingUserLayout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/"); // Redirect to home if no token found
      return;
    }

    try {
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      const { role, status } = decodedToken;

      // If the role is not user or status is not pending, redirect to home
      if (role !== "user" || status !== "pending") {
        router.push("/"); // Redirect to home page
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      router.push("/"); // Redirect to home if there's an error decoding the token
    }
  }, [router]);

  return (
    <div className="bg-black">
      <div>{children}</div>
    </div>
  );
};

export default PendingUserLayout;
