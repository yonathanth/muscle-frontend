"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCart } from "./CartContext";
import { faShoppingCart, faTimesCircle } from "@fortawesome/free-solid-svg-icons";
import { useTranslations } from "next-intl";
import { Link } from "../../../../i18n/routing";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


const CartModal = () => {
  const t = useTranslations("cart");
  const { cartItems, removeFromCart, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const toggleCart = () => setIsOpen(!isOpen);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > window.innerHeight / 1.5); 
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {isOpen && (
        <div
          className="fixed top-0 right-0 bg-black bg-opacity-50 z-20"
          onClick={toggleCart}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 w-full md:w-96 h-full bg-black shadow-xl z-40 transform ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-500 ease-in-out`}
      >
        <button
          className="absolute top-4 right-4 text-white text-2xl"
          onClick={toggleCart}
        >
          ✕
        </button>
        <div className="p-4 h-full flex flex-col">
          <h2 className="text-3xl font-bold mb-6 text-white text-center">
            {t("heading")}
          </h2>
          <div className="flex-grow overflow-y-auto custom-scrollbar">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center mb-4 p-2 bg-black border border-customBlue rounded-sm hover:bg-complimentSeventy transition-all duration-300 ease-in-out relative"
                >
                  <img
                    src={`${NEXT_PUBLIC_API_BASE_URL}${item.image}`}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="ml-4">
                    <h3 className="font-semibold text-customBlue text-lg">
                      {item.name}
                    </h3>
                    <p className="text-customBlue">Qty: {item.quantity}</p>
                    <p className="text-customBlue font-semibold">
                      {item.price}
                    </p>
                  </div>
                  <button
                    className="absolute top-10 right-8 text-white/75 hover:text-white/100"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <FontAwesomeIcon icon={faTimesCircle} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-white text-center">Your cart is empty</p>
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <div className="flex justify-between text-white text-lg font-semibold">
                <span>{t("subtotal")}</span>
                <span>{subtotal.toFixed(2)}</span>
              </div>
              <button
                className="w-full py-3 border-customBlue border-1 text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300 ease-in-out"
                onClick={clearCart}
              >
                {t("buttons.clear_cart")}
              </button>
              <Link href="/Shop/checkout">
                <button className="w-full py-3 bg-customBlue mt-5 text-white rounded-full shadow-lg hover:scale-105 transition-all duration-300 ease-in-out">
                  {t("buttons.proceed_checkout")}
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={toggleCart}
        className={`fixed p-3 text-white rounded-full shadow-lg hover:bg-thirty transition-all z-20 ${
          isScrolled ? "top-4 right-4 bg-black" : "bottom-7 right-2 bg-accentthirty"
        }`}
      >
        <FontAwesomeIcon icon={faShoppingCart} size="xl" />
        {totalItems >= 1 && (
          <span className="absolute -top-2 -right-2 text-xs bg-customBlue text-white rounded-full h-5 w-5 flex items-center justify-center">
            {totalItems}
          </span>
        )}
      </button>
    </>
  );
};

export default CartModal;
