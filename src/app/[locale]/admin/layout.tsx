"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSideBar";
import AdminHeader from "./components/AdminHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  role: string;
}

export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);
        if (
          decodedToken.role === "admin" ||
          decodedToken.role === "moderator" ||
          decodedToken.role === "root"
        ) {
          setIsAuthorized(true);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthorized) {
      router.push("/");
    }
  }, [isLoading, isAuthorized, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="lg:flex h-screen font-jost">
      <div
        className={`${
          sidebarOpen ? "fixed" : "hidden"
        } lg:relative lg:flex z-20`}
      >
        <AdminSidebar setActiveNav={setActiveNav} />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black z-10 opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      <div className="flex-1 flex flex-col justify-start lg:hidden">
        <div className="flex justify-between">
          <button
            className="lg:hidden p-4 w-10"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <FontAwesomeIcon icon={faBars} className="text-white text-2xl" />
          </button>
          <AdminHeader activeNav={activeNav} />
        </div>
        <main className="flex-1 bg-black p-6 overflow-auto">{children}</main>
      </div>
      <div className="hidden lg:flex flex-1 flex-col">
        <AdminHeader activeNav={activeNav} />
        <main className="flex-1 bg-black p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
