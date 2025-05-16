"use client";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock, faPlay} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import LoadingPage from "@/src/app/[locale]/user/loading";
import {useSearchParams} from "next/navigation";
import axios from "axios";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export interface ExerciseType {
  id: string;
  slug: string;
  name: string;
  description: string;
  reps: number;
  sets: number;
  duration: number;
  videoUrl: string;
  focusArea: string;
}

interface WorkoutPlanType {
  id: string;
  name: string;
  slug: string;
  difficulty: string;
  mainGoal: string;
  workoutType: string;
  duration: number;
  daysPerWeek: number;
  exercises: ExerciseType[];
}

interface UserWorkoutType {
  id: string;
  userId: string;
  workoutId: string;
  startedAt: Date;
  progress: number,
  finishedAt: Date,
}

export default function WorkoutPlan({params}: { params: { locale: string; workoutPlanId: string } }) {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [exercise, setExercise] = useState<ExerciseType | null>(null);
  const [plan, setPlan] = useState<WorkoutPlanType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLDivElement | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const playerRef = useRef<any>(null);
  const [isYouTubeLoaderReady, setIsYouTubeLoaderReady] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [doesWorkoutExist, setDoesWorkoutExist] = useState(true);

  const doesWorkoutExistForUser = useCallback(async (workoutId: string, userId: string) =>{
    try {
      const response = await axios.get(`${NEXT_PUBLIC_API_BASE_URL}/api/members/${userId}`);
      const userData = response.data.data.user;
      if (!userData || !Array.isArray(userData.workouts)) {
        throw new Error("Workouts section not found or invalid.");
      }
      const exists = userData.workouts.some((workout: UserWorkoutType) => workout.workoutId === workoutId);
      setDoesWorkoutExist(exists);
      return exists;
    } catch (error) {
      setDoesWorkoutExist(false);
    }
  }, []);

  const selectPlan = async (workoutId: string) => {
    const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/members/addUserWorkout`, {
      cache: "no-store", method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        workoutId: workoutId
      })
    })
    if (!res.ok) {
      // const data = await res.json()
      throw new Error(`Failed to select plan ${res.statusText}`)
    }
    setDoesWorkoutExist(true);
    // const data = await res.json()
  }

  const getWorkoutPlan = async (id: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`${NEXT_PUBLIC_API_BASE_URL}/api/workouts/${id}`, {cache: "no-store"});
      if (!res.ok) {
        throw new Error(`Failed to fetch workout plan: ${res.statusText}`);
      }
      const data = await res.json();
      setPlan(data.data.workout);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    //@ts-ignore
    if (!window.YT) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
      (window as any).onYouTubeIframeAPIReady = () => {
        setIsYouTubeLoaderReady(true);
      };
    } else {
      setIsYouTubeLoaderReady(true);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true); // Keep loading state true until both tasks are done

      try {
        await getWorkoutPlan(params.workoutPlanId); // Fetch workout plan
        if (userId) {
          await doesWorkoutExistForUser(params.workoutPlanId, userId); // Check if workout exists
        }
      } catch (error) {
        console.error("Error during initialization:", error);
      } finally {
        setIsLoading(false); // Set loading to false once everything is done
      }
    };
    fetchData();
  }, [params.workoutPlanId, userId]);

  const initializePlayer = (videoId: string) => {
    if (playerRef.current) {
      playerRef.current.destroy();
    }

    if (videoRef.current) {
      //@ts-ignore
      playerRef.current = new window.YT.Player(videoRef.current, {
        videoId,
        width: "100%",
        height: "100%",
        events: {
          onReady: (event: any) => {
            event.target.playVideo();
            setIsPlaying(true); // Start playing
          },
          onStateChange: (event: any) => {
            //@ts-ignore
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false); // Video ended
              //@ts-ignore
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true); // Video playing
            }
          },
        },
      });
    }
  };

  const handleExerciseClick = (exercise: ExerciseType) => {
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    setIsPlaying(false); // Reset to thumbnail view
    setExercise(exercise || null);
  };

  const handlePlayVideo = () => {
    const videoId = exercise?.videoUrl;
    //@ts-ignore
    if (isYouTubeLoaderReady && window.YT && videoId) {
      initializePlayer(videoId);
    } else {
      console.log("YouTube Player not ready or missing video URL");
    }
  };

  // const  handlePlayVideo = () => {
  //   // @ts-ignore
  //   if (isYouTubeLoaderReady && window.YT && videoRef.current && exercise?.videoUrl) {
  //     // @ts-ignore
  //     new window.YT.Player(videoRef.current, {
  //       videoId: exercise.videoUrl,
  //       events: {
  //         onReady: (event: any) => {
  //           event.target.playVideo();
  //         },
  //       },
  //     });
  //   }
  // };

  if (isLoading) {
    return (
      <LoadingPage/>
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
            onClick={() => getWorkoutPlan(params.workoutPlanId)}
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
    <div className="flex flex-col p-1  md:p-3">
      <div className="bg-[#151515] p-4 rounded-lg shadow-lg flex flex-row justify-between text-white space-y-2">
        <div className="flex flex-col justify-between">
          <div>
            <h2 className="text-sm md:text-lg font-semibold">{plan.name}</h2>
            <p className="text-[11px] md:text-xs font-extralight">{plan.difficulty}</p>
            <p className="text-[11px] md:text-xs font-extralight">{plan.mainGoal}</p>
          </div>
          <div className="flex flex-col gap-y-10">
            <div className="flex items-center pt-2 space-x-2 mt-auto">
              <FontAwesomeIcon icon={faClock} className="text-customBlue"/>
              <span className="text-sm font-extralight">{plan.duration} weeks</span>
            </div>
            {!doesWorkoutExist? (<button
              className=" bg-customBlue text-black px-8 py-2 rounded-lg shadow-lg hover:bg-customHoverBlue"
              onClick={async () => {
                await selectPlan(plan.id);
              }}
            >
              Select Plan
            </button>): <div className="text-sm">Added to Your Plans!</div>}
          </div>
        </div>
        <Image
          src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/workouts/${
            plan ? plan.slug : ""
          }`}
          height={500}
          width={500}
          quality={90}
          alt={plan ? plan.name : ""}
          className="rounded-lg h-20 sm:w-36 sm:h-40"
        />
      </div>

      <div
        className="bg-[#151515] p-4 rounded-lg shadow-lg text-white mt-4 flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="">
          <h3 className="text-sm font-semibold mb-3">Schedule</h3>
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
                          {Array.from({length: plan.daysPerWeek}).map((_, dayIndex) => {
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

                            )
                              ;
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
          <h3
            className="text-sm font-semibold">Week {selectedDay ? Number(selectedDay[2]) + 1 : ""} Day {selectedDay ? Number(selectedDay[4]) + 1 : ""} Exercises</h3>
          {
            selectedDay !== null ? (
              (() => {
                const [monthIndex, weekIndex, dayIndex] = selectedDay
                  .split('-')
                  .map(Number);

                // Calculate starting index for the exercises
                const startIndex =
                  (monthIndex * 4 * plan.daysPerWeek +
                    weekIndex * plan.daysPerWeek +
                    dayIndex) *
                  5;

                // Display exactly 5 exercises for the selected day
                return Array.from({length: 5}).map((_, idx) => {
                  const exerciseIndex = (startIndex + idx) % plan.exercises.length;
                  const exercise = plan.exercises[exerciseIndex];
                  return (
                    <button
                      key={idx} // Unique key for each exercise
                      className="flex justify-between items-center bg-[#1C1C1C] p-3 rounded-lg hover:bg-[#333333]"
                      onClick={() => handleExerciseClick(exercise)} // Set the currently selected exercise
                    >
                      <span className="text-sm">{exercise.name}</span>
                      <FontAwesomeIcon icon={faPlay} className="text-customBlue"/>
                    </button>
                  );
                });

              })()
            ) : (
              <div className="text-gray-400 text-sm">Select a day to view exercises.</div>
            )
          }

        </div>

        <div className="md:block md:w-1/2 bg-[#1C1C1C] p-3 rounded-lg">
          <div className="w-full h-full relative">
            {exercise && !isPlaying && (
              <>
                <div className="h-full w-full relative">
                  <Image
                    src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/exercises/${exercise ? exercise.slug : ""}`}
                    alt={exercise ? exercise.name : ""}
                    fill
                    quality={90}
                    className="rounded-lg"
                  />
                </div>
                <button
                  className="absolute inset-0 flex items-center justify-center rounded-lg z-10"
                  onClick={
                    handlePlayVideo}
                >
                  <FontAwesomeIcon icon={faPlay} size="3x" className="text-white"/>
                </button>

              </>
            )}
            <div ref={videoRef} className="absolute inset-0 w-full h-full rounded-lg"/>
          </div>
        </div>
      </div>

      {/*<>*/}
      {/*  <div className="text-xl">{exercise?.name}</div>*/}
      {/*  <div className="text-md">{exercise?.description}</div>*/}
      {/*  <button*/}
      {/*    onClick={handlePlayVideo}*/}
      {/*    className="mt-3 bg-blue-500 text-white px-4 py-2 rounded-lg"*/}
      {/*  >*/}
      {/*    Play Video*/}
      {/*  </button>*/}
      {/*  <div ref={videoRef} style={{marginTop: "20px"}}/>*/}
      {/*</>*/}
      {/* Modal for Small Screens */}


      {isModalOpen && (
        <div className="fixed  inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
          <div className="bg-[#1C1C1C] p-4 rounded-lg  text-white">
            <button
              className="absolute top-2 right-4 text-gray-300 hover:text-white"
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
            <div className="h-full w-full relative">
              <Image
                src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/exercises/${exercise ? exercise.slug : ""}`}
                alt={exercise ? exercise.name : ""}
                fill
                className="rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
