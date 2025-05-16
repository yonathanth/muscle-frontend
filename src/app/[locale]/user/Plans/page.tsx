"use client";
import React, { useCallback, useEffect, useState } from "react";
import ExerciseList from "@/src/app/[locale]/user/Plans/Exercises/page";
import { ExerciseType } from "@/src/app/[locale]/user/Plans/workoutPlan/[workoutPlanId]/page";
import WorkoutPlanList from "@/src/app/[locale]/user/Plans/workoutPlan/page";
import MealList from "@/src/app/[locale]/user/Plans/Meals/page";
import MealPlanList from "@/src/app/[locale]/user/Plans/MealPlans/page";
import LoadingPage from "@/src/app/[locale]/user/loading";
import { jwtDecode } from "jwt-decode";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface CustomJwtPayload {
  id: string;
}

export default function PlansPage() {
  const [view, setView] = useState("workouts");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  const fetchData = useCallback(
    async (type: string) => {
      try {
        setIsLoading(true);
        setError(null); // Reset error
        let res, data;

        if (type === "workouts") {
          res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/workouts/`, {
            cache: "no-store",
          });
          data = await res.json();
          return data.data.workouts || [];
        } else if (type === "mealPlans") {
          res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/mealPlans/`, {
            cache: "no-store",
          });
          data = await res.json();
          return data.data.mealPlans || [];
        } else if (type === "exerciseList") {
          res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/exercises/`, {
            cache: "no-store",
          });
          data = await res.json();
          console.log(data);
          if (!data.success) {
            return [];
          }
          const exercises: ExerciseType[] = data.data.exercises;
          return exercises || [];
        } else if (type === "mealList") {
          res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/meals/`, {
            cache: "no-store",
          });
          data = await res.json();
          if (!data.success) {
            return [];
          }
          return data.data.meals || [];
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        return []; // Return an empty array if there's an error
      } finally {
        setIsLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      return;
    }
    try {
      const decodedToken: CustomJwtPayload = jwtDecode(token);
      setUserId(decodedToken.id);
    } catch (error) {
      console.error("Error decoding token:", error);
      localStorage.removeItem("token");
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData(view).then((fetchedData) => {
        setData(fetchedData); // Always set an array
      });
    }
  }, [userId, view, fetchData]);

  return (
    <div className="text-white flex flex-col h-auto">
      {/* Navigation */}
      <nav className="flex flex-wrap justify-center md:justify-start gap-2 p-4">
        <button
          onClick={() => setView("workouts")}
          className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
            view === "workouts"
              ? "bg-customBlue"
              : "bg-[#252525] hover:bg-[#333]"
          }`}
        >
          Workout Plans
        </button>
        <button
          onClick={() => setView("mealPlans")}
          className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
            view === "mealPlans"
              ? "bg-customBlue"
              : "bg-[#252525] hover:bg-[#333]"
          }`}
        >
          Meal Plans
        </button>
        <button
          onClick={() => setView("exerciseList")}
          className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
            view === "exerciseList"
              ? "bg-customBlue"
              : "bg-[#252525] hover:bg-[#333]"
          }`}
        >
          Exercises
        </button>
        <button
          onClick={() => setView("mealList")}
          className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
            view === "mealList"
              ? "bg-customBlue"
              : "bg-[#252525] hover:bg-[#333]"
          }`}
        >
          Meals
        </button>
      </nav>

      <main className="p-4 md:p-8 mx-auto">
        {isLoading ? (
          <LoadingPage />
        ) : error ? (
          <div className="text-white col-span-3 bg-zinc-900 p-10 rounded-lg m-20">
            <div className="text-4xl font-bold text-red-500">Error</div>
            <div className="text-md">{error}</div>
            <div className="mt-5">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                onClick={() =>
                  fetchData(view).then((fetchedData) => setData(fetchedData))
                }
              >
                Retry
              </button>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-white col-span-3 bg-zinc-900 p-10 rounded-lg m-20">
            <div className="text-4xl font-bold">No Data Found</div>
          </div>
        ) : view === "workouts" ? (
          <>
            <WorkoutPlanList
              className="col-span-3"
              plans={data}
              userId={userId}
            />
          </>
        ) : view === "mealPlans" ? (
          <MealPlanList className="col-span-3" plans={data} userId={userId} />
        ) : view === "exerciseList" ? (
          <>
            <ExerciseList className="col-span-3" exercises={data} />
          </>
        ) : (
          <MealList className="col-span-3" meals={data} />
        )}
      </main>
    </div>
  );
}
