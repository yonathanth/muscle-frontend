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
import {User} from "../layout";
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

  const [workout, setWorkout] = useState<WorkoutPlanType | null>(null);
  const fetchAdvertisement = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/advertisement`, {
        cache: "no-store",
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
        { cache: "no-store" }
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
          { cache: "no-store" }
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
        { cache: "no-store" }
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

  if (isLoading) return <LoadingPage/>

  return (
    <div className=" bg-black flex flex-col h-auto">
      {/* Header Section */}
      <header className="text-black flex flex-wrap lg:flex-nowrap gap-3 items-center px-4 lg:px-0">
        <div className="bg-[#2596BE] p-6 sm:p-8 w-full lg:w-[68%] rounded-lg">
          <h1 className="text-lg sm:text-2xl font-extralight">
            Hello{" "}
            <span className="font-bold">
              {user?.fullName ? user.fullName.split(" ")[0] : ""}
            </span>
          </h1>
          <p className="text-sm font-extralight">
            You have already achieved <br />{" "}
            <span className="font-bold">
              {workout && user?.exercisesCompleted
                ? (user.exercisesCompleted.length / workout.exercises.length) *
                100
                : 0}
              %
            </span>{" "}
            of your Goal. Keep pushing!
          </p>
        </div>
        <div className="bg-[#2596BE] p-6 sm:p-9 w-full lg:w-1/3 rounded-lg relative">
          <div
            className={`absolute top-[-0.5px] right-[-0.5px] ${
              user
                ? user.status === "active"
                  ? "bg-green-500"
                  : "bg-red-500"
                : ""
            } rounded-bl-full px-4 sm:px-6 py-1 sm:py-2 flex items-center justify-center border-black border-l-5 border-b-5`}
          >
            <span className="flex items-center text-black text-xs sm:text-sm font-semibold">
              <span className="w-[8px] sm:w-[10px] h-[8px] sm:h-[10px] bg-black rounded-full mr-2"></span>
              {user?.status
                ? user?.status.charAt(0).toUpperCase() + user?.status.slice(1)
                : "Not Found"}
            </span>
          </div>

          <div className="flex items-baseline gap-1">
            <h2
              className={`text-2xl sm:text-4xl ${
                user ? (user.daysLeft < 5 ? "text-red-600" : "") : ""
              } font-bold`}
            >
              {user?.daysLeft}
            </h2>
            <p className="text-xs sm:text-sm font-extralight">
              Working days left
            </p>
          </div>
          {user?.status === "expired" ? (
            <button
              onClick={openModal}
              className="font-extralight underline text-xs sm:text-tiny mt-1 block hover:text-white"
            >
              Extend your subscription
            </button>
          ) : (
            <div>Glad we&apos;re family!</div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-wrap lg:flex-nowrap gap-3 pt-3 text-white px-4 lg:px-0">
        {/* Left Sidebar: Today's Plans */}
        <section className="w-full lg:w-1/3 bg-[#1e1e1e] p-4 rounded-lg">
          <h3 className="text-sm sm:text-base font-light mb-4">
            Today&apos;s Exercises
          </h3>
          {/*<div className="flex bg-[#2a2a2a] p-1 space-x-2 rounded-full mb-4 overflow-x-auto">*/}
          {/*<button className="bg-[#1e1e1e] px-6 sm:px-8 py-1 rounded-full text-sm hover:bg-customHoverBlue">*/}
          {/*  All*/}
          {/*</button>*/}
          {/*<button className="px-4 sm:px-6 bg-[#1e1e1e] py-1 rounded-full text-sm hover:bg-customHoverBlue">*/}
          {/*  Exercise*/}
          {/*</button>*/}
          {/*<button className="px-4 sm:px-6 py-1 bg-[#1e1e1e] rounded-full text-sm hover:bg-customHoverBlue">*/}
          {/*  Meal*/}
          {/*</button>*/}
          {/*</div>*/}
          <ul>
            {todayPlans ? (
              todayPlans.length != 0 ? (
                todayPlans.map((exercise, idx) => (
                  <li
                    key={idx}
                    className="flex justify-between items-center py-3 px-4 mb-2 bg-[#292929] rounded-full text-xs sm:text-sm font-light"
                  >
                    <span>{exercise}</span>
                    {/*<button className="text-[#2596BE]">▶</button>*/}
                  </li>
                ))
              ) : (
                <div className="text-sm text-[#6a6a6a]">No Plans Found</div>
              )
            ) : (
              <></>
            )}
          </ul>
        </section>

        {/* Center Section: Recommended Foods */}
        <section className="w-full lg:w-1/3">
          <div className="bg-[#1e1e1e] p-4 rounded-lg">
            <h3 className="text-sm sm:text-lg font-light mb-4">
              Recommended Foods
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommendedMeals ? (
                recommendedMeals.length !== 0 ? (
                  recommendedMeals.map((recommendedMeal: MealType, idx) => (
                    <div key={idx}>
                      <h4 className="text-xs font-extralight px-3 py-2 text-[#6a6a6a]">
                        {recommendedMeal.category}
                      </h4>
                      <div className="bg-[#292929] flex flex-col justify-between gap-4 py-3 px-3 rounded-lg">
                        <p className="font-light text-xs">{recommendedMeal.name}</p>
                        <p className="text-xs">
                          {recommendedMeal.calories}{" "}
                          <span className="text-[#6a6a6a]">kcal</span>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-[#6a6a6a]">No meals Found</div>
                )
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="bg-[#1e1e1e] mt-2 p-4 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-rows-3 gap-4">
              {[
                { label: `${user?.highestStreak ? user.highestStreak : "-"} Days Streak`, icon: faFire },
                {
                  label: `${user?.exercisesCompleted ? user?.exercisesCompleted?.length : "-"} Exercises Completed`,
                  icon: faClock,
                },
                {
                  label: `${
                    workout && user?.exercisesCompleted
                      ? (user.exercisesCompleted.length /
                        workout.exercises.length) *
                      100
                      : 0
                  } % Progress`,
                  icon: faBarsProgress,
                },
              ].map(({ label, icon }, idx) => (
                <div
                  key={idx}
                  className="bg-[#292929] flex justify-between px-4 py-3 rounded-lg items-baseline"
                >
                  <h4 className="font-light text-xs sm:text-sm">
                    <span className="text-[#06bdff] text-xl sm:text-2xl font-bold">
                      {label.split(" ")[0]}
                    </span>{" "}
                    {label.split(" ").slice(1).join(" ")}
                  </h4>
                  <FontAwesomeIcon className="text-sm" icon={icon} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Section: Metrics and Promo */}
        {/* Right Section: Metrics and Promo */}
        <section className="w-full lg:w-1/3 bg-[#1e1e1e] p-4 rounded-lg flex flex-col space-y-6">
          <div className="bg-[#292929] p-4 rounded-lg">
            {/* Image Container */}
            <div>
              <div className="relative h-[300px] w-full bg-cover bg-center rounded-lg mb-4">
                {advertisement ? (<Image
                  src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/advertisement/${
                    advertisement ? advertisement.slug : ""
                  }`}
                  fill={true}
                  quality={90}
                  alt={advertisement ? advertisement.name : ""}
                  className="rounded-lg"
                />) : <div className=""></div>}
              </div>
            </div>
            {/* Paragraph */}
            <div className="text-xs text-white">
              {advertisement?.description}
            </div>
          </div>
        </section>
      </main>
      {/* Modal Component */}
      <ExtendModal
        user={user!}
        serviceId={serviceId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

export default Dashboard;
