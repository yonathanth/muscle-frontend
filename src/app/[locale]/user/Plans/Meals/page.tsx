"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface MealPlanType {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  mainGoal: string;
  duration: number;
  meals: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string;
    ingredients: {
      id: string;
      name: string;
      quantity: string;
    }[];
    instructions: string;
    calories?: number;
    vegan: boolean;
    preparationTime: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  }[];
}

export interface MealType {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  ingredients: {
    id: string;
    name: string;
    quantity: string;
  }[];
  instructions: string;
  calories?: number;
  vegan: boolean;
  preparationTime: number;
  protein?: number;
  carbs?: number;
  fats?: number;
}

interface MealListProps {
  meals: MealType[];
  className?: string;
}

const MealList: React.FC<MealListProps> = ({ meals, className }) => {
  const [selectedMeal, setSelectedMeal] = useState<MealType | null>(null);
  const [filter, setFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);

  const filteredMeals: MealType[] =
    filter === "All"
      ? meals
      : meals.filter((meal) =>
          filter === "breakfast"
            ? meal.category.toLowerCase().includes("breakfast")
            : filter === "lunch"
            ? meal.category.toLowerCase().includes("lunch")
            : filter === "dinner"
            ? meal.category.toLowerCase().includes("dinner")
            : filter === "snack"
            ? meal.category.toLowerCase().includes("snack")
            : filter === "other"
            ? meal.category.toLowerCase().includes("other")
            : false
        );

  useEffect(() => {
    // Set the first meal from the "All" list as default when the page loads
    if (filteredMeals.length > 0 && !selectedMeal) {
      setSelectedMeal(filteredMeals[0]);
    }
  }, [filteredMeals, selectedMeal]);

  const handleMealClick = (meal: MealType) => {
    setSelectedMeal(meal);
    setShowModal(true);
  };

  return (
    <div
      className={`flex flex-col md:flex-row text-white rounded-3xl ${
        className || ""
      }`}
    >
      {/* Sidebar */}
      <div className="w-72 rounded-3xl sm:rounded-none sm:rounded-tl-3xl  sm:rounded-bl-3xl md:w-1/2 p-4 bg-[#1e1e1e]">
        <nav className="bg-[#2a2a2a] p-2 rounded-full md:w-full flex lg:flex-nowrap justify-start gap-4 mb-4 overflow-x-auto scrollbar-hide scrollbar-thumb-[#555555] scrollbar-track-transparent scroll-p-4">
          {["All", "breakfast", "lunch", "dinner", "snack", "other"].map(
            (category) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-5 py-1 text-xs rounded-full ${
                  filter === category
                    ? "bg-customBlue"
                    : "bg-[#1e1e1e] hover:bg-[#555555]"
                }`}
              >
                {category}
              </button>
            )
          )}
        </nav>

        {/* Meal List */}
        <ul className="space-y-2 md:w-full h-96 overflow-y-auto pr-5">
          {filteredMeals.map((meal) => (
            <li
              key={meal.slug}
              onClick={() => handleMealClick(meal)}
              className={`flex items-center justify-between p-3 cursor-pointer rounded-full px-4 ${
                selectedMeal?.slug === meal.slug
                  ? "bg-customBlue"
                  : "bg-[#2a2a2a] hover:bg-[#333333]"
              }`}
            >
              <div className="flex items-baseline gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-[#555555] scrollbar-track-transparent scroll-p-4 pr-3">
                <h3 className="text-sm">{meal.name}</h3>
              </div>
              <button className="text-white text-lg font-bold">
                {meal.calories}{" "}
                <span className="text-xs font-extralight">Kcal</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      {/* Modal for Small Screens */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 md:hidden">
          <div className="bg-[#1e1e1e] p-4 rounded-lg text-center w-11/12 max-w-md flex flex-col gap-2">
            <button
              className="absolute top-2 right-4 text-gray-300 hover:text-white"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <div className="relative w-full h-full">
              <Image
                src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/meals/${
                  selectedMeal ? selectedMeal.slug : ""
                }`}
                width={500}
                height={500}
                quality={90}
                alt={selectedMeal?.name || ""}
                className="w-full rounded-md mb-4"
              />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">
              {selectedMeal?.name}
            </h2>
            <p className="text-xs text-gray-300 font-extralight">
              {meals
                .find((meal) => meal.slug === selectedMeal?.slug)
                ?.ingredients.map((ingredient) => ingredient.name)
                .join(", ")}
            </p>
            <button>
              <span className="text-white text-lg font-bold px-5 py-1 rounded-full bg-customBlue">
                {
                  meals.find((meal) => meal.slug === selectedMeal?.slug)
                    ?.calories
                }{" "}
                <span className="text-xs font-extralight">Kcal</span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Image Preview for Larger Screens */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#1e1e1e] p-1 rounded-tr-3xl rounded-br-3xl py-12">
        {selectedMeal ? (
          <div className="w-full md:w-2/3 rounded-lg relative flex flex-col gap-3">
            <div className="relative w-full mb-4 h-60">
              <Image
                src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/meals/${selectedMeal.slug}`}
                alt={selectedMeal.name}
                width={500}
                height={500}
                className="rounded-lg"
              />
            </div>
            <div className="flex flex-col items-center justify-center">
              <h2 className="text-xl md:text-2xl font-bold">
                {selectedMeal.name}
              </h2>
              <div className="text-sm text-gray-300 font-extralight mt-2">
                <p className="text-xs text-gray-300 font-extralight">
                  {meals
                    .find((meal) => meal.slug === selectedMeal?.slug)
                    ?.ingredients.map((ingredient) => ingredient.name)
                    .join(", ")}
                </p>
              </div>
            </div>
            <button>
              <span className="text-white text-lg font-bold px-5 py-1 rounded-full bg-customBlue">
                {
                  meals.find((meal) => meal.slug === selectedMeal?.slug)
                    ?.calories
                }{" "}
                <span className="text-xs font-extralight">Kcal</span>
              </span>
            </button>
          </div>
        ) : (
          <div className="w-full md:w-2/3 h-60 bg-zinc-700 rounded-lg flex justify-center items-center">
            Select a Meal
          </div>
        )}
      </div>
    </div>
  );
};

export default MealList;
