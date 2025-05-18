import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

interface ServiceCardProps {
  title: string;
  price: string;
  benefits: string[];
  isPremium?: boolean;
  isPerDay?: boolean;
  onClick: () => void;
  className?: string;
  isFromAdmin: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  isFromAdmin,
  title,
  price,
  benefits = [],
  isPremium,
  isPerDay,
  onClick,
  className = "",
}) => {
  return (
    <div
      className={`p-8 rounded-lg shadow-lg space-y-6 border transition-all duration-300 transform hover:scale-10 hover:border-[#871818] h-[29rem] w-[20rem] flex flex-col justify-between ${className} ${
        isPremium
          ? "bg-gradient-to-r from-[#871818] to-[#00BFFF] text-black"
          : "bg-gray-800 text-white"
      } ${className}`}
      style={{ transform: className ? `scale(${className})` : "scale(1)" }}
    >
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p
          className={`text-4xl font-bold ${
            isPremium ? "text-black" : "text-[#871818]"
          }`}
        >
          {price}
        </p>
        <div className="space-y-4 pt-9">
          {Array.isArray(benefits) &&
            benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-2 text-left">
                <FontAwesomeIcon
                  icon={faCheck}
                  className={`text-[#871818] w-5 h-5 ${
                    isPremium ? "text-black" : "text-[#871818]"
                  }`}
                />
                <p
                  className={`${
                    isPremium ? "text-[#000000]" : "text-gray-400"
                  }`}
                >
                  {benefit}
                </p>
              </div>
            ))}
        </div>
      </div>
      {!isFromAdmin && (
        <button
          onClick={onClick}
          className={`p-2 transition-all duration-300 transform hover:scale-110 ${
            isPremium
              ? "bg-black text-white hover:bg-gray-700"
              : "bg-[#871818] hover:bg-[#007EA7]"
          }`}
        >
          {isPerDay ? "In Person" : "Purchase"}
        </button>
      )}
    </div>
  );
};

export default ServiceCard;
