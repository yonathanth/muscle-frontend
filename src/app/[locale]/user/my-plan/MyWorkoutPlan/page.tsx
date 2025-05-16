import React from "react";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image"
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
  }[]
}

interface MyWorkoutPlanPageProps {
  plans: WorkoutPlanType[];
  className?: string;
  userId?: string;
}

const MyWorkoutPlanPage: React.FC<MyWorkoutPlanPageProps> = ({plans, className, userId}) => {
  return (
    <>
      <div className={`bg-black text-white min-h-screen ${className ? className : ""}`}>
        <main className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-[#252525] rounded-lg">
          {plans.map((plan, index) => (
            <Link key={index} href={`my-plan/MyWorkoutPlan/${plan.id}?userId=${userId}`}>
              <div className="bg-black p-4 rounded-lg shadow-lg flex flex-row  space-y-2"
              >
                <div className="flex flex-col justify-between">
                  <div>
                    <h2 className="text-sm font-semibold">{plan.name}</h2>
                    <p className="text-xs font-extralight">{plan.workoutType}</p>
                    <p className="text-xs font-extralight">
                      <span className="font-semibold"></span> {plan.difficulty}
                    </p>
                  </div>

                  <p className="text-xs flex items-center gap-2 font-extralight">
                    <FontAwesomeIcon icon={faClock} className="text-customBlue"/>
                    {plan.duration}
                  </p>


                </div>
                <Image
                  src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/workouts/${plan ? plan.slug : ""}`}
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
    </>
  )
}

export default MyWorkoutPlanPage
// const fetchWorkouts = async () => {
//   try{
//     const response = await axios.get("${NEXT_PUBLIC_API_BASE_URL}/api/workouts");
//     const workoutPlans = response.data.data;
//     workoutPlans.forEach((workoutPlan:WorkoutPlanType) => {
//       const
//     })
//   } catch (error) {
//     console.error("Error fetching workout plans:", error)
//   }
// }

