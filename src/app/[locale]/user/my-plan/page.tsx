"use client";
import React, {useCallback, useEffect, useState} from "react";
import {jwtDecode} from "jwt-decode";
import MyWorkoutPlanPage from "@/src/app/[locale]/user/my-plan/MyWorkoutPlan/page";
import MyMealPlanPage from "@/src/app/[locale]/user/my-plan/MyMealPlan/page";
import LoadingPage from "@/src/app/[locale]/user/loading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


interface CustomJwtPayload {
  id: string;
}


export default function MyPlansPage() {
  const [view, setView] = useState("workouts");
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);


  const fetchData = useCallback(async (type: string) => {
    try {
      setIsLoading(true);
      setError(null);
      let res, data;
      if (type === "workouts") {
        res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/members/${userId}/getMyWorkouts`, {cache: "no-store"});
        data = await res.json();
        return data.data || [];
      } else if (type === "mealPlans") {
        res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/members/${userId}/getMyMealPlans`, {cache: "no-store"});
        data = await res.json();
        return data.data || [];
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
      return []; // Return an empty array if there's an error
    } finally {
      setIsLoading(false);
    }
  },[userId]);

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
      fetchData(view)
        .then((fetchedData) => {
          setData(fetchedData);
        });
    }
  }, [userId, view, fetchData]);


  return (
    <div className="min-h-screen text-white">
      {/* Navigation */}
      <nav className="flex flex-wrap justify-center md:justify-start gap-2 p-4">
        <button
          onClick={() => setView("workouts")}
          className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
            view === "workouts" ? "bg-customBlue" : "bg-[#252525] hover:bg-[#333]"
          }`}
        >
          My Workout Plans
        </button>
        <button
          onClick={() => setView("mealPlans")}
          className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
            view === "mealPlans" ? "bg-customBlue" : "bg-[#252525] hover:bg-[#333]"
          }`}
        >
          My Meal Plans
        </button>
      </nav>
      <main className="p-4 md:p-8 mx-auto">
        {isLoading ? (
          <LoadingPage/>
        ) : error ? (
          <div className="text-white col-span-3 bg-zinc-900 p-10 rounded-lg m-20">
            <div className="text-4xl font-bold text-red-500">Error</div>
            <div className="text-md">{error}</div>
            <div className="mt-5">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                onClick={() => fetchData(view).then((fetchedData) => setData(fetchedData))}
              >
                Retry
              </button>
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="text-white col-span-3 bg-zinc-900 p-10 rounded-lg m-20">
            <div className="text-4xl font-bold">{view === "workouts" ? "No Workouts Found": "No Meal Plans Found"}</div>
          </div>
        ) : (
          view === "workouts" ?
            <>
              <MyWorkoutPlanPage className="col-span-3" plans={data} userId={userId}/>
            </>
            :
            <MyMealPlanPage className="col-span-3" plans={data} userId={userId}/>
        )}
      </main>
    </div>
  );
}

//   const fetchData = async (type: string) => {
//     try {
//       setIsLoading(true);
//       setError(null); // Reset error
//       let res, data;
//
//       if (type === "workouts") {
//         res = await fetch("${NEXT_PUBLIC_API_BASE_URL}/api/workouts/", {cache: "no-store"});
//         data = await res.json();
//         return data.data.workouts || [];
//       } else if (type === "mealPlans") {
//         res = await fetch("${NEXT_PUBLIC_API_BASE_URL}/api/mealPlans/", {cache: "no-store"});
//         data = await res.json();
//         return data.data.mealPlans || [];
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "An unknown error occurred");
//       return []; // Return an empty array if there's an error
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   useEffect(() => {
//     fetchData(view).then((fetchedData) => {
//       setData(fetchedData); // Always set an array
//     });
//   }, [view]);
//
//   return (
//     <div className="min-h-screen text-white">
//       {/* Navigation */}
//       <nav className="flex flex-wrap justify-center md:justify-start gap-2 p-4">
//         <button
//           onClick={() => setView("workouts")}
//           className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
//             view === "workouts" ? "bg-customBlue" : "bg-[#252525] hover:bg-[#333]"
//           }`}
//         >
//           Workout Plan
//         </button>
//         <button
//           onClick={() => setView("mealPlans")}
//           className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
//             view === "mealPlans" ? "bg-customBlue" : "bg-[#252525] hover:bg-[#333]"
//           }`}
//         >
//           Meal Plan
//         </button>
//         <button
//           onClick={() => setView("exerciseList")}
//           className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
//             view === "exerciseList" ? "bg-customBlue" : "bg-[#252525] hover:bg-[#333]"
//           }`}
//         >
//           Exercise List
//         </button>
//         <button
//           onClick={() => setView("mealList")}
//           className={`text-sm font-light  md:text-sm px-4 py-2 rounded-full transition-colors ${
//             view === "mealList" ? "bg-customBlue" : "bg-[#252525] hover:bg-[#333]"
//           }`}
//         >
//           Meal List
//         </button>
//       </nav>
//
//       <main className="p-4 md:p-8 mx-auto">
//         {isLoading ? (
//           <div className="text-white col-span-3 bg-zinc-900 p-10 rounded-lg m-20">
//             <div className="text-4xl font-bold">Loading...</div>
//           </div>
//         ) : error ? (
//           <div className="text-white col-span-3 bg-zinc-900 p-10 rounded-lg m-20">
//             <div className="text-4xl font-bold text-red-500">Error</div>
//             <div className="text-md">{error}</div>
//             <div className="mt-5">
//               <button
//                 className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
//                 onClick={() => fetchData(view).then((fetchedData) => setData(fetchedData))}
//               >
//                 Retry
//               </button>
//             </div>
//           </div>
//         ) : data.length === 0 ? (
//           <div className="text-white col-span-3 bg-zinc-900 p-10 rounded-lg m-20">
//             <div className="text-4xl font-bold">No Data Found</div>
//           </div>
//         ) : (
//           view === "workouts" ?
//             <>
//               <WorkoutPlanList className="col-span-3" plans={data}/>
//             </>
//             : view === "exerciseList" ?
//               <>
//                 <ExerciseList className="" exercises={data}/>
//               </>
//               : view === "mealPlans" ?
//                 <MealPlanList className="col-span-3" plans={data}/> :
//                 <MealList className="col-span-3" meals={data}/>
//         )}
//       </main>
//     </div>
//   );
// }
