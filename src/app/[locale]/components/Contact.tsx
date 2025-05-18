"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkerAlt,
  faPhoneAlt,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { motion } from "framer-motion";
import NeonLine from "./NeonLine";
import React from "react";

const Branches = () => {
  const branches = [
    {
      name: "Muscle Fitness Gym Megenagna",
      address: "Megenagna Condominium, Addis Ababa",
      map: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d29576.733668891455!2d38.82654693509191!3d9.01364426982539!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b9b000c8cb0c7%3A0x32bf6dafaf55e797!2sMuscle%20Fitness%20Gym!5e0!3m2!1sen!2set!4v1747427730260!5m2!1sen!2set",
    },
    {
      name: "Muscle Fitness Gym Figa",
      address: "Figa, Addis Ababa",
      map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31524.632326533385!2d38.80209035896094!3d9.01082536991462!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b9b000e6221f5%3A0x4184f6d5916dcf06!2sMuscle%20Fitness%20Gym%20%7C%20Figa!5e0!3m2!1sen!2set!4v1747427762981!5m2!1sen!2set",
    },
    {
      name: "Muscle Fitness Gym Gerji",
      address: "Gerji, Addis Ababa",
      map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d68109.72494483474!2d38.73194320298524!3d9.006391058754263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85003dddf465%3A0x22a4d2b528a74c27!2sMuscle%20fitness%20gerji!5e0!3m2!1sen!2set!4v1747427788416!5m2!1sen!2set",
    },
    {
      name: "Muscle Fitness Gym Hayat",
      address: "Hayat 72, Addis Ababa",
      map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d68109.72494483474!2d38.73194320298524!3d9.006391058754263!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85001714cd11%3A0x4fa3ec965fd7b82c!2sMuscle%20Fitness%20Gym!5e0!3m2!1sen!2set!4v1747427808142!5m2!1sen!2set",
    },
  ];

  return (
    <section className="bg-black text-white pb-12 px-8 sm:px-6 lg:px-[7rem] mb-12 md:mb-24 font-jost">
      <div className="container mx-auto  max-w-7xl">
        {/* Heading Section - Side by side */}
        <div className="flex flex-col  lg:flex-row items-start justify-between gap-6 mb-12 md:mb-24">
          <div className="lg:w-1/2">
            <h2 className="text-3xl leading-snug md:text-4xl font-bold text-wrap">
              Find Your Nearest <br /> Muscle Fitness
            </h2>
          </div>
          <div className="lg:w-1/2">
            <div className="flex  sm:justify-end items-center mb-3">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-customBlue text-2xl mr-3"
              />
              <p className="text-gray-200 text-base sm:text-xl">
                musclefitnessaddis@gmail.com
              </p>
            </div>
            <div className="flex sm:justify-end items-center">
              <FontAwesomeIcon
                icon={faPhoneAlt}
                className="text-customBlue text-2xl mr-3"
              />
              <p className="text-gray-200 text-base sm:text-xl">0945511884</p>
            </div>
          </div>
        </div>

        {/* Red Divider */}
        <NeonLine />

        {/* Branches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
          {branches.map((branch, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] rounded-lg overflow-hidden"
            >
              {/* Map Preview */}
              <div className="h-32 w-full">
                <iframe
                  src={branch.map}
                  className="w-full h-full"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Branch Info */}
              <div className="p-4">
                <h3 className="text-customBlue font-semibold mb-2">
                  {branch.name}
                </h3>
                <div className="flex items-center mb-2">
                  <FontAwesomeIcon
                    icon={faMapMarkerAlt}
                    className="text-[#871818] text-xl mr-2"
                  />
                  <div>
                    <p className="text-white text-sm">{branch.address}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Branches;
