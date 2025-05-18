"use client";
import { useTranslations } from "next-intl";
import { Link } from "../../../i18n/routing";
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import styles from "../styles/ButtonStyles.module.css";
import heroImage from "@/assets/images/hero.jpeg";

const Hero = () => {
  const [membersCount, setMembersCount] = useState(0);
  const [servicesCount, setServicesCount] = useState(0);
  const [locationsCount, setLocationsCount] = useState(0);
  const animationRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    const membersTarget = 700;
    const servicesTarget = 5;
    const locationsTarget = 4;

    // Clear any existing intervals on component mount or re-render
    return () => {
      Object.values(animationRef.current).forEach((interval) =>
        clearInterval(interval)
      );
    };
  }, []);

  useEffect(() => {
    const membersTarget = 700;
    const servicesTarget = 5;
    const locationsTarget = 4;

    // Create new counter function that stores intervals in the ref
    const startCounter = (
      target: number,
      setter: React.Dispatch<React.SetStateAction<number>>,
      delay: number,
      key: string
    ) => {
      // Reset counter first
      setter(0);

      let count = 0;
      const interval = setInterval(() => {
        count += 1;
        setter(count);
        if (count >= target) {
          clearInterval(interval);
        }
      }, delay);

      // Store the interval ID in the ref
      animationRef.current[key] = interval;

      // Clean up this specific interval on unmount
      return () => clearInterval(interval);
    };

    // Start all counters
    startCounter(membersTarget, setMembersCount, 5, "members");
    startCounter(servicesTarget, setServicesCount, 200, "services");
    startCounter(locationsTarget, setLocationsCount, 250, "locations");

    // Clean up all intervals on unmount
    return () => {
      Object.values(animationRef.current).forEach((interval) =>
        clearInterval(interval)
      );
    };
  }, []);

  const t = useTranslations("home_Page");
  return (
    <div className="pb-8 lg:pb-28 font-jost">
      <section
        className="bg-cover bg-center h-screen flex flex-col relative"
        style={{
          backgroundImage: `linear-gradient(to right, black 5%, transparent 100%), url(${heroImage.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="container  px-1 sm:px-4  md:px-10 sm:pl-4 flex-grow flex items-center">
          <motion.div
            className="lg:w-1/2 sm:w-full px-[1rem] sm:px-[2.5rem] text-white"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          >
            <motion.h1
              className="text-4xl   sm:text-5xl font-bold mb-6 "
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
            >
              {t("heroSection.title")}
              <br />
              {t("heroSection.titleTwo")}
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg mb-8 leading-normal"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            >
              {t("heroSection.subtitle")}
            </motion.p>
            <Link href="/Register" className={`${styles.customButton} w-full `}>
              <span className="mx-1 sm:mx-8 my-12 text-base sm:text-lg text-white">
                {t("heroSection.ctaButton")}
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Stats Section - Positioned bottom right on all screens */}
        <motion.div
          className="absolute bottom-6 sm:bottom-10 right-6 md:right-16 lg:right-18 text-white"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
        >
          <div className="flex space-x-4 sm:space-x-6">
            <div>
              <motion.span
                className="text-customBlue text-xl md:text-2xl font-bold block text-right"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1, ease: "easeOut" }}
              >
                {membersCount}+
              </motion.span>
              <p className="text-sm md:text-base text-right">
                {t("heroSection.members")}
              </p>
            </div>
            <div>
              <motion.span
                className="text-customBlue text-xl md:text-2xl font-bold block text-right"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 1, ease: "easeOut" }}
              >
                {servicesCount}+
              </motion.span>
              <p className="text-sm md:text-base text-right">
                {t("heroSection.services")}
              </p>
            </div>
            <div>
              <motion.span
                className="text-customBlue text-xl md:text-2xl font-bold block text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4, duration: 1, ease: "easeOut" }}
              >
                {locationsCount}
              </motion.span>
              <p className="text-sm md:text-base text-center">
                {t("heroSection.locations")}
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default Hero;
