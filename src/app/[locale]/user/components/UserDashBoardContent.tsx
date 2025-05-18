"use client";
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import {
  faBarsProgress,
  faClock,
  faFire,
} from "@fortawesome/free-solid-svg-icons";
import ExtendModal from "./ExtendModal";
import Image from "next/image";
import { User } from "../layout";
import { WorkoutPlanType } from "@/src/app/[locale]/user/Plans/workoutPlan/page";
import { MealType } from "@/src/app/[locale]/user/Plans/Meals/page";
import LoadingPage from "@/src/app/[locale]/user/loading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface AdvertisementType {
  name: string;
  description: string;
  slug: string;
}

interface UserDashboardProps {
  status: string | null;
  userId: string | null;
}

const Dashboard: React.FC<UserDashboardProps> = ({ userId }) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [serviceId, setServiceId] = useState("");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advertisement, setAdvertisement] = useState<AdvertisementType | null>(
    null
  );
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const [recommendedMeals, setRecommendedMeals] = useState<MealType[] | null>(
    null
  );
  const [todayPlans, setTodayPlans] = useState<string[]>([]);
  const token = localStorage.getItem("token");
  const [workout, setWorkout] = useState<WorkoutPlanType | null>(null);
  const fetchAdvertisement = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/advertisement`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      return data.data.advertisements[0] || [];
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      return []; // Return an empty array if there's an error
    } finally {
      setIsLoading(false);
    }
  };

  const getUserDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        ` ${NEXT_PUBLIC_API_BASE_URL}/api/memberManagement/${userId}/profile`,
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
      const user = data?.data;
      if (user?.workouts?.[0]?.workoutId) {
        const workoutRes = await fetch(
          `${NEXT_PUBLIC_API_BASE_URL}/api/workouts/${user.workouts[0].workoutId}`,
          {
            cache: "no-store",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!workoutRes.ok) {
          throw new Error(`Workout fetch failed: ${workoutRes.statusText}`);
        }
        const workoutData = await workoutRes.json();
        const workout = workoutData?.data?.workout;
        setWorkout(workout);
      }
      setServiceId(user?.serviceId);
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

  const fetchRecommendedMeals = async () => {
    try {
      setError(null);
      const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/meals`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      const meals: MealType[] = data?.data?.meals;

      if (meals && meals.length > 0) {
        return meals.sort(() => 0.5 - Math.random()).slice(0, 3);
      } else {
        setRecommendedMeals([]);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
      setRecommendedMeals([]);
    }
  };

  const fetchTodayPlans = useCallback(async () => {
    try {
      const res = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/members/${userId}/getMyWorkouts`,
        {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch today's plans: ${res.statusText}`);
      }
      const data = await res.json();
      const workouts: WorkoutPlanType[] = data?.data || [];
      return workouts
        .flatMap((workout) => workout.exercises || [])
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map((exercise) => exercise.name);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    }
  }, [userId]);

  useEffect(() => {
    fetchAdvertisement().then((fetchedData) => {
      setAdvertisement(fetchedData);
    });
    getUserDetails().then((fetchedData) => {
      setUser(fetchedData);
    });
    fetchRecommendedMeals().then((fetchedData) =>
      fetchedData ? setRecommendedMeals(fetchedData) : setRecommendedMeals([])
    );
    fetchTodayPlans().then((fetchedData) =>
      fetchedData ? setTodayPlans(fetchedData) : setTodayPlans([])
    );
  }, [fetchTodayPlans, getUserDetails]);

  if (isLoading) return <LoadingPage />;

  return (
    <div className="bg-black flex flex-col mt-24 mx-5 h-auto">
      <div className="bg-[#871818] p-6 sm:p-8 max-w-2xl mx-auto  w-full rounded-lg m-4">
        <h1 className="text-lg sm:text-2xl font-extralight">
          Hello{" "}
          <span className="font-bold">
            {user?.fullName ? user.fullName.split(" ")[0] : ""}
          </span>
        </h1>
        <p className="text-sm font-extralight mt-2">
          You have <span className="font-bold">{user?.daysLeft || 0}</span> days
          remaining in your membership
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
