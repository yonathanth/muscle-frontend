"use client";

import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTshirt,
  faDumbbell,
  faBottleWater,
  faBoxOpen,
} from "@fortawesome/free-solid-svg-icons";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { HeroSection } from "./_components/Hero";
import Cart from "./_components/Cart";
import { Item } from "./_components/Item";
import LoadingPage from "../Register/components/loading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Define the Product type
interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl: string;
  description?: string;
}

// Categories for the Shop Page
const categories = [
  { icon: faBoxOpen, title: "All", value: "" },
  { icon: faTshirt, title: "Clothing", value: "Clothing" },
  { icon: faBottleWater, title: "Supplement", value: "Supplement" },
  { icon: faDumbbell, title: "Equipment", value: "Equipment" },
];

const ShopPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${NEXT_PUBLIC_API_BASE_URL}/api/inventory/`
        );
        const data: { success: boolean; data: Product[] } =
          await response.json();

        if (data.success && Array.isArray(data.data)) {
          setProducts(data.data); // Set fetched products
        } else {
          console.error("Invalid data structure", data);
          throw new Error("Invalid data structure from API");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category === selectedCategory)
    : products;

  return (
    <>
      <Header />
      <HeroSection />

      <div className="w-full px-4 md:px-10 pb-10">
        {/* Filters */}
        <div
          id="next-section"
          className="flex justify-between items-center my-16"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {categories.map((category, idx) => (
              <button
                key={idx}
                onClick={() => handleCategoryClick(category.value)}
                className={`hover:border-white text-sm px-4 py-2 border rounded-full ${
                  selectedCategory === category.value
                    ? "bg-customBlue text-black"
                    : "border-customBlue text-white"
                }`}
              >
                <FontAwesomeIcon icon={category.icon} className="mr-2" />
                {category.title}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full">
          <div className="my-8">
            <h2 className="text-2xl font-bold mb-16 text-white">
              {selectedCategory
                ? `Showing ${selectedCategory} Products`
                : "All Products For You!"}
            </h2>

            {loading ? (
              <div className="text-center">
                <LoadingPage />
              </div>
            ) : error ? (
              <p className="text-center text-red-500">Network Error</p>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Item
                    id={product.id}
                    key={product.id}
                    title={product.name}
                    category={product.category}
                    image={product.imageUrl}
                    price={product.price}
                    description={product.description}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center">No products available.</p>
            )}
          </div>
        </div>

        {/* Cart Component */}
        <Cart />
      </div>
      <Footer />
    </>
  );
};

export default ShopPage;
