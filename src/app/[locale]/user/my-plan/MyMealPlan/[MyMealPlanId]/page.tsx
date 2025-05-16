'use client'
import React, {useEffect, useState} from "react";
import LoadingPage from "../../../loading";
import {MealPlanType, MealType} from "@/src/app/[locale]/user/Plans/Meals/page";
import Image from "next/image";
import {MealCategory} from "@/src/app/[locale]/user/Plans/MealPlans/page";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;



export default function MyMealPlan({params}:{params:{locale:string; MyMealPlanId:string}}) {
  const [plan, setPlan] = useState<MealPlanType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isModalOpen, setModalOpen] = useState(false);

  const getMealPlan = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/mealPlans/${id}`, {cache: "no-store"});
      if (!res.ok) {
        throw new Error(`Failed to fetch meal plan: ${res.statusText}`);
      }
      const data = await res.json();
      setPlan(data.data.mealPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getMealPlan(params.MyMealPlanId);
  }, [params.MyMealPlanId]);

  if (!plan) return <LoadingPage />;


  let totalCalories = 0
  let totalProteins = 0
  let totalCarbs = 0
  let totalFat = 0
  plan.meals.forEach((meal, index) =>{
    totalProteins += meal.protein ? meal.protein : 0
    totalFat += meal.fats ? meal.fats : 0
    totalCarbs += meal.carbs ? meal.carbs : 0
    totalCalories += meal.calories ? meal.calories : 0
  });

  const groupedMealsByCategory = (meals: MealType[]) => {
    const grouped:Record<MealCategory, MealType[]> =
      {
        breakfast: [],
        lunch: [],
        dinner: []
      };
    meals.forEach((meal) => {
      // @ts-ignore
      if (grouped[meal.category]) {
        // @ts-ignore
        grouped[meal.category].push(meal);
      }
    });

    return grouped;
  };

  const groupedMeals = groupedMealsByCategory(plan.meals);

  if (isLoading) {
    return (
      <div className="text-white bg-zinc-900 p-10 rounded-lg m-20">
        <div className="text-4xl font-bold">Loading Workout Plan...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white bg-zinc-900 p-10 rounded-lg m-20">
        <div className="text-4xl font-bold text-red-500">Error</div>
        <div className="text-md">{error}</div>
        <div className="mt-5">
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
            onClick={() => getMealPlan(params.MyMealPlanId)}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="text-white bg-zinc-900 p-10 rounded-lg m-20">
        <div className="text-4xl font-bold">Workout Plan Not Found</div>
      </div>
    );
  }
  return (
    <div className="bg-black text-white min-h-screen p-8 flex flex-col gap-6 h-[80%]">
      {/* Header with Progress Bar */}
      <div className="w-full h-1 bg-gray-700 mt-2">
        <div className="h-1 bg-customBlue" style={{width: "50%"}}></div>
      </div>
      {/* Content Section */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left Sidebar */}
        <div className="flex flex-col justify-start w-full lg:w-2/5">
          {/* Image Section */}
          <div className="relative w-full h-60 rounded-lg">
            {/* Image component with layout 'fill' */}
            <div className="relative w-full h-full">
              <Image
                src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/mealPlans/${plan ? plan.slug : ""}`}
                alt={plan.name}
                layout="fill" // This makes the image fill the container
                objectFit="cover" // Ensures the image behaves like a background (covering the area)
                className="rounded-lg" // Apply rounded corners to the image
              />
              <div className="absolute top-0 left-0 w-full h-full bg-black opacity-70 rounded-lg"></div>
            </div>
            {/* Text overlay */}
            <h1 className="absolute top-4 left-6 text-xl font-bold z-10 text-white">
              {plan.duration} weeks, {plan.mainGoal}
            </h1>
          </div>

          {/* Weight Gain Meal Program */}
          <div className="bg-[#252525] p-4 rounded-lg mt-2 lg:mt-2">
            <h2 className="text-base font-semibold">{plan.mainGoal}</h2>
            <div className="mt-4">
              <h3 className="text-sm text-white font-semibold py-2">Daily Goal</h3>
              <div className="space-y-2 font-extralight">
                <p className="flex text-tiny justify-between">
                  Protein <span>{totalProteins} g</span>
                </p>
                <p className="flex text-tiny justify-between">
                  Carbohydrate <span>{totalCarbs}g</span>
                </p>
                <p className="flex text-tiny justify-between">
                  Fat <span>{totalFat}g</span>
                </p>
                <p className="text-lg text-customBlue font-semibold mt-2 text-right">
                  {totalCalories} KCal
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Center Schedule */}

        <div className="">
          <div className="bg-[#1C1C1C] p-3 rounded-lg h-96 overflow-y-auto">
            <ul className="text-xs space-y-2">
              {Array.from({length: Math.ceil(plan.duration / 4)}).map((_, monthIndex) => (
                <li className="cursor-pointer hover:bg-[#333333] p-2 rounded-md" key={monthIndex}>
                  Month {monthIndex + 1}
                  <ul className="pl-4 mt-2">
                    {Array.from({length: 4}).map((_, weekIndex) => (
                      <li className="cursor-pointer hover:bg-[#444444] p-2 rounded-md" key={weekIndex}>
                        Week {weekIndex + 1}
                        <ul className="pl-4 mt-2 flex flex-col">
                          {Array.from({length: 7}).map((_, dayIndex) => {
                            const uniqueDayIndex = `${monthIndex}-${weekIndex}-${dayIndex}`; // Unique identifier
                            return (
                              <button
                                key={dayIndex}
                                className="cursor-pointer hover:bg-[#555555] p-2 rounded-md"
                                onClick={() => {
                                  setSelectedDay(uniqueDayIndex);
                                  setModalOpen(false);
                                }}
                              >
                                <li className="">
                                  <div>Day {dayIndex + 1}</div>
                                </li>
                              </button>
                            );
                          })}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="md:w-1/3 flex flex-col space-y-3">
          <h3 className="text-sm font-semibold">
            Week {selectedDay ? Number(selectedDay[2]) + 1 : ""} Day{" "}
            {selectedDay ? Number(selectedDay[4]) + 1 : ""} Meals
          </h3>
          {selectedDay !== null ? (
            (() => {
              const [monthIndex, weekIndex, dayIndex] = selectedDay
                .split("-")
                .map(Number);
              return ["breakfast", "lunch", "dinner"].map((category, index) => {
                const mealCategory = category as MealCategory; // Explicitly cast as MealCategory
                const meal = groupedMeals[mealCategory][dayIndex % groupedMeals[mealCategory].length];
                return (
                  <div
                    key={category}
                    className={`relative px-4 py-8 rounded-lg shadow-lg flex flex-col space-y-4 ${
                      index === 0 ? "bg-customBlue" : "bg-[#252525]"
                    }`}
                  >
                <span
                  className="absolute top-0 left-0 bg-customBlue text-white text-sm px-6 py-1 border-r-[4px] border-b-[4px] border-black rounded-tl-md">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </span>

                    {meal ? (
                      <div className="flex justify-between items-center space-x-4">
                        <div className="p-2 mt-4">
                          <p className="flex text-sm justify-between">
                            <span className="pr-5">Protein</span> <span>{meal.protein}g</span>
                          </p>
                          <p className="flex text-sm justify-between">
                            <span className="pr-5">Carbohydrate</span> <span>{meal.carbs}g</span>
                          </p>
                          <p className="flex text-sm justify-between">
                            <span className="pr-5">Fat</span> <span>{meal.fats}g</span>
                          </p>
                          <p className="text-xs font-extralight mt-4">
                            Calorie <span className="font-semibold">{meal.calories}</span> kcal
                          </p>
                        </div>
                        <div className="flex flex-col items-center">
                          <Image
                            src={`/Images/meals/${meal.slug}.jpg`}
                            alt={meal.name}
                            width={500}
                            height={500}
                            className="w-24 h-24 object-cover rounded-lg"
                          />
                          <h3 className="text-tiny font-light">{meal.name}</h3>
                        </div>
                      </div>
                    ) : (
                      <div className="text-gray-400 text-sm">No meals available for {category}.</div>
                    )}
                  </div>
                );
              });
            })()
          ) : (
            <div className="text-gray-400 text-sm">Select a day to view meals.</div>
          )}
        </div>
      </div>
    </div>
  )
    ;
};

