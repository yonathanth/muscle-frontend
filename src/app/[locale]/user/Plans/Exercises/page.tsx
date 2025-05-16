"use client";
import React, { useEffect, useRef, useState } from "react";
import { ExerciseType } from "../workoutPlan/[workoutPlanId]/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import LoadingPage from "@/src/app/[locale]/user/loading";

const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ExerciseListProps {
  exercises: ExerciseType[];
  className?: string;
}

const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  className,
}) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(
    null
  );
  const [filter, setFilter] = useState("all");
  const videoRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isYouTubeLoaderReady, setIsYouTubeLoaderReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const filteredExercises =
    filter === "all"
      ? exercises
      : exercises.filter((exercise: ExerciseType) =>
          exercise.focusArea.toLowerCase().includes(filter)
        );
  useEffect(() => {
    // Set the first meal from the "All" list as default when the page loads
    if (filteredExercises.length > 0 && !selectedExercise) {
      setSelectedExercise(filteredExercises[0]);
    }
  }, [filteredExercises]);

  const handleExerciseClick = (exercise: ExerciseType) => {
    setIsLoading(true); // Start loading when a new exercise is selected

    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }
    setIsPlaying(false); // Reset to thumbnail view
    setSelectedExercise(exercise || null);

    setIsLoading(false); // Stop loading once the exercise is selected
  };

  useEffect(() => {
    //@ts-ignore
    if (!window.YT) {
      // setIsLoading(true); // Start loading when the YouTube API script is being added
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.body.appendChild(script);
      (window as any).onYouTubeIframeAPIReady = () => {
        setIsYouTubeLoaderReady(true);
        // setIsLoading(false); // Stop loading once the API is ready
      };
    } else {
      setIsYouTubeLoaderReady(true);
      // setIsLoading(false); // Stop loading if API is already available
    }
  }, []);

  const initializePlayer = (videoId: string) => {
    // setIsLoading(true); // Start loading before initializing the player

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
            setIsPlaying(true);
            // setIsLoading(false); // Stop loading when video starts playing
          },
          onStateChange: (event: any) => {
            //@ts-ignore
            if (event.data === window.YT.PlayerState.ENDED) {
              setIsPlaying(false);
              //@ts-ignore
            } else if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            }
          },
        },
      });
    } else {
      // setIsLoading(false); // Stop loading if player cannot be initialized
    }
  };

  const handlePlayVideo = () => {
    const videoId = selectedExercise?.videoUrl;
    //@ts-ignore
    if (isYouTubeLoaderReady && window.YT && videoId) {
      initializePlayer(videoId);
    } else {
      console.log("YouTube Player not ready or missing video URL");
    }
  };

  if (isLoading) return <LoadingPage />;
  return (
    <div
      className={`flex flex-col md:flex-row h-auto bg-[#1e1e1e] text-white rounded-3xl ${
        className || ""
      }`}
    >
      {/* Sidebar */}
      <div className="w-72 rounded-3xl sm:rounded-none sm:rounded-tl-3xl  sm:rounded-bl-3xl md:w-1/2 p-4 bg-[#1e1e1e]">
        {/* Filter Buttons */}
        <div className="bg-[#2a2a2a] p-2 rounded-full md:w-full flex lg:flex-nowrap justify-start gap-4 mb-4 overflow-x-auto scrollbar-hide scrollbar-thumb-[#555555] scrollbar-track-transparent scroll-p-4">
          {[
            "All",
            "Chest",
            "Back",
            "Legs",
            "Arms",
            "Core",
            "Shoulders",
            "FullBody",
            "Other",
            "UpperBody",
            "LowerBody",
          ].map((category) => (
            <button
              key={category}
              onClick={() => setFilter(category.toLowerCase())}
              className={`px-5 py-1 text-xs rounded-full ${
                filter === category.toLowerCase()
                  ? "bg-customBlue"
                  : "bg-[#1e1e1e] hover:bg-[#555555]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <ul className="space-y-2 md:w-full h-96 overflow-y-auto pr-5">
          {filteredExercises.map((exercise) => (
            <li
              key={exercise.slug}
              onClick={() => handleExerciseClick(exercise)}
              className={`flex items-center justify-between p-3 cursor-pointer rounded-full ${
                selectedExercise?.slug === exercise.slug
                  ? "bg-customBlue"
                  : "bg-[#2a2a2a] hover:bg-[#333333]"
              }`}
            >
              <div className="flex items-baseline gap-2">
                <h3 className="text-sm">{exercise.name}</h3>
                <p className="text-xs text-gray-300 font-extralight">
                  {exercise.focusArea}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Video Preview */}
      <div className="flex-1 md:flex items-center justify-center p-1">
        <div className="w-full max-w-[480px] min-h-80 my-10 bg-[#1e1e1e] rounded-lg relative">
          {/* Thumbnail and Play Button */}
          {selectedExercise && !isPlaying && (
            <>
              <div className="relative w-full h-full">
                <Image
                  src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/exercises/${
                    selectedExercise ? selectedExercise.slug : ""
                  }`}
                  alt={selectedExercise ? selectedExercise.name : ""}
                  fill={true}
                  quality={90}
                  className="rounded-lg max-w-[480px] min-h-80"
                />
              </div>
              <button
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10"
                onClick={handlePlayVideo}
              >
                <FontAwesomeIcon
                  icon={faPlay}
                  size="3x"
                  className="text-white"
                />
              </button>
            </>
          )}
          {/* Video Player */}
          <div
            ref={videoRef}
            className={`absolute inset-0 w-full h-full rounded-lg`}
          />
        </div>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 md:hidden">
          <div className="bg-[#1e1e1e] p-4 rounded-lg text-center w-11/12 max-w-md">
            <button
              className="absolute top-2 right-4 text-gray-300 hover:text-white"
              onClick={() => setShowModal(false)}
            >
              ✕
            </button>
            <div className="w-full md:w-2/3 max-h-80 h-auto md:h-2/3 bg-black rounded-lg relative">
              {/* Video Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full h-full">
                  <Image
                    src={`${NEXT_PUBLIC_API_BASE_URL}/uploads/exercises/${
                      selectedExercise ? selectedExercise.slug : ""
                    }`}
                    alt={selectedExercise ? selectedExercise.name : ""}
                    layout="intrinsic"
                    fill
                    width={240} // You can provide a width for aspect ratio calculation
                    height={160}
                    // Ensures the image fills the parent container
                    className="rounded-lg h-full w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseList;
