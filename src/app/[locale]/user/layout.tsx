"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserHeader from "./components/UserHeader";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import UserSidebar from "./components/UserSideBar";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface User {
  id: string; // UUID
  fullName: string;
  gender: string;
  phoneNumber: string;
  email?: string;
  address: string;
  dob: Date;
  emergencyContact: string;
  firstRegisteredAt: Date;
  startDate: Date;
  totalAttendance: number;
  countDown?: number;
  height?: number;
  weight?: number;
  healthConditions: {
    condition: string;
    medications: string;
  };
  level: string;
  goal: string;
  status: string;
  freezeDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  serviceId: string;
  service?: Array<Object>; // Optional relation with Service model
  attendance: Array<Object>; // Array of Attendance models
  profileImageUrl?: string | null;
  daysLeft: number;
  lastWorkoutDate?: Date;
  currentStreak: number;
  highestStreak: number;
  exercisesCompleted: Array<Object>; // Array of ExerciseCompletion models
  notifications: Notification[]; // Array of Notification models
  workouts: Array<Object>; // Array of UserWorkout models
  bmis: Array<Object>; // Array of bmi models
  mealPlans: Array<Object>; // Array of UserMealPlan models
}

// interface LayoutProps {
//   children: ReactNode;
// }

interface CustomJwtPayload {
  role: string;
  status: string;
  id: string;
}

export const dynamic = "force-dynamic";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const getUserDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/members/${userId}`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error("User not found (404)");
        } else if (res.status === 500) {
          throw new Error("Internal server error (500)");
        } else {
          throw new Error(
            `Unexpected error occurred: ${res.statusText} (${res.status})`
          );
        }
      }

      const data = await res.json();
      const user = data?.data?.user;
      return user || {};
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/");
      return;
    }

    try {
      const decodedToken: CustomJwtPayload = jwtDecode(token);
      const { role, status, id } = decodedToken;
      if (
        role === "user" &&
        !["pending", "dormant", "inactive"].includes(status)
      ) {
        setIsAuthorized(true);
        setUserId(id); // Set userId here
      } else if (role === "root") {
        setIsAuthorized(true);
        setUserId(id); // Set userId here
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
      router.push("/");
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      getUserDetails().then((fetchedData) => {
        setUser(fetchedData);
      });
    }
  }, [userId, getUserDetails]); // Add userId as a dependency

  if (!isAuthorized) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen font-jost">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <UserHeader activeNav={activeNav} user={user} />
        {/* Main content */}
        <main className="flex-1 bg-black overflow-auto">{children}</main>
      </div>
    </div>
  );
}
