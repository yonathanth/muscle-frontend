"use client";
import React from "react";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface WorkoutPlanType {
  id: string;
  name: string;
  slug: string;
  difficulty: string;
  mainGoal: string;
  workoutType: string;
  duration: number;
  daysPerWeek: number;
  timePerWorkout: number;
  targetGender: string;
  exercises: {
    id: string;
    slug: string;
    name: string;
    description: string;
    reps: number;
    sets: number;
    duration: number;
    videoUrl: string;
    focusArea: string;
  }[];
}


interface WorkoutPlansListProps {
  plans: WorkoutPlanType[];
  className?: string;
  userId?: string;
}

const WorkoutPlanList: React.FC<WorkoutPlansListProps> = ({plans, className, userId}) => {
  return (
    <div className={`bg-black text-white flex flex-col h-full ${className ? className : ""}`}>
      <main className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#252525] rounded-lg">
        {plans.map((plan: WorkoutPlanType) => (
          <Link href={`Plans/workoutPlan/${plan.id}?userId=${userId}`} key={plan.id}>
            <div className="bg-black p-4 rounded-lg shadow-lg flex flex-row space-y-0 gap-4">
              {/* Text Section */}
              <div className="flex flex-col justify-between flex-grow">
                {/* Details */}
                <div className="space-y-1">
                  <h2 className="text-sm font-semibold">{plan.name}</h2>
                  <p className="text-xs font-extralight">{plan.workoutType}</p>
                  <p className="text-xs font-extralight">{plan.difficulty}</p>
                </div>

                {/* Time Section */}
                <p className="text-sm flex items-center gap-2 font-light mt-4">
                  <FontAwesomeIcon icon={faClock} className="text-customBlue"/>
                  {plan.duration}
                </p>
              </div>

              {/* Image Section */}
              <Image
                src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/workouts/${plan ? plan.slug : ""}`}
                alt={plan.name}
                width={500}
                height={500}
                quality={90}
                className="ml-3 w-full h-20 sm:w-36 sm:h-40 object-cover rounded-lg"
              />
            </div>
          </Link>
        ))}
      </main>
    </div>
  );
}

export default WorkoutPlanList;