"use client";
import React from "react";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import {MealPlanType} from "@/src/app/[locale]/user/Plans/MealPlans/page";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export type MealCategory = "breakfast" | "lunch" | "dinner";


interface MyMealPlanPageProps {
  plans: MealPlanType[];
  className?: string;
  userId?: string;
}

const MyMealPlanPage: React.FC<MyMealPlanPageProps> = ({plans, className, userId}) => {

  return (
    <div className={`bg-black text-white h-auto ${className ? className : ""}`}>
      <main className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#252525] rounded-lg">
        {plans.map((plan) => (
          <Link href={`my-plan/MyMealPlan/${plan.id}?userId=${userId}`} key={plan.id}>
            <div className="bg-black p-4 rounded-lg shadow-lg flex flex-row space-y-2">
              <div className="flex flex-col justify-between">
                <div>
                  <h2 className="text-sm font-semibold mb-1">{plan.name}</h2>
                  <div className="space-y-1 text-xs font-extralight">
                    <p className="text-xs font-extralight line-clamp-3">
                      <span className=""></span> {plan.description}
                    </p>
                  </div>
                </div>
                <div className="">
                  <p className="text-xs">
                    <span className=""></span> {plan.mainGoal}
                  </p>
                  <p className="text-xs flex items-center gap-2 font-extralight">
                    <FontAwesomeIcon icon={faClock} className="text-customBlue"/>
                    {plan.duration}
                  </p>
                </div>
              </div>
              <Image
                src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/mealPlans/${plan ? plan.slug : ""}`}
                width={500}
                height={500}
                alt={plan.name}
                className="w-60 justify-end  h-40 object-contain rounded-lg"
              />
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}

export default MyMealPlanPage;