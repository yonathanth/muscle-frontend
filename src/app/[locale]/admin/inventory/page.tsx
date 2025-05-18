"use client";
import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faEdit, faUpload } from "@fortawesome/free-solid-svg-icons";
import AdminSidebar from "../components/AdminSideBar";
import AdminHeader from "../components/AdminHeader";
import SmallLoading from "../components/SmallLoading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface Product {
  category: string;
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number; // Add price field to the product interface
}

const HomePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");

  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // New states for add product form
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    category: "Equipment",
    price: "", // Add price field
  });
  const token = localStorage.getItem("token");

  // Fetch products from backend on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${NEXT_PUBLIC_API_BASE_URL}/api/inventory/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setProducts(data.data); // Update the state with the fetched products
        } else {
          console.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      if (file) {
        setFile(file);
        setPreview(URL.createObjectURL(file)); // Create a preview URL
      }
    }
  };
  const handleDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  // Delete a product
  const confirmDelete = async () => {
    setIsLoading(true);
    if (productToDelete) {
      try {
        const response = await fetch(
          `${NEXT_PUBLIC_API_BASE_URL}/api/inventory/${productToDelete.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const responeData = await response.json();
        if (response.ok) {
          setProducts(
            products.filter((product) => product.id !== productToDelete.id)
          );
        } else {
          console.error(responeData.message || "Failed to delete product");
          setError(responeData.message || "Failed to delete product");
          setTimeout(() => setError(""), 4000); // Clear error after 2 seconds
        }
      } catch (error) {
        console.error("Error deleting product:", error);
        setError("An unexpected error occurred. Please try again.");
        setTimeout(() => setError(""), 4000); // Clear error after 2 seconds
      } finally {
        setIsDeleteModalOpen(false);
        setProductToDelete(null);
        setIsLoading(false);
      }
    }
  };

  // Open the edit modal with product details
  const handleEdit = (product: Product) => {
    setEditProduct(product);
    setIsModalOpen(true);
  };

  // Handle product update
  const handleProductUpdate = async () => {
    setIsLoading(true);

    if (editProduct) {
      const formData = new FormData();
      formData.append("name", editProduct.name);
      formData.append("description", editProduct.description);
      formData.append("category", "Equipment"); // Example, adjust as needed
      formData.append("price", editProduct.price.toString()); // Include price
      if (file) formData.append("image", file);

      try {
        const response = await fetch(
          `${NEXT_PUBLIC_API_BASE_URL}/api/inventory/${editProduct.id}`,
          {
            method: "PUT",
            body: formData,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const updatedProduct = await response.json();
          setProducts((prevProducts) =>
            prevProducts.map((product) =>
              product.id === updatedProduct.data.id
                ? updatedProduct.data
                : product
            )
          );
          setIsModalOpen(false);
        } else {
          console.error("Failed to update product");
        }
      } catch (error) {
        console.error("Error updating product:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle add product
  const handleAddProduct = async () => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("category", newProduct.category);
    formData.append("price", newProduct.price);
    if (file) formData.append("image", file);

    // Log the formData for debugging
    console.log("FormData being sent:", newProduct);

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/inventory/`,
        {
          method: "POST",
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const responseData = await response.json();

      if (response.ok) {
        setProducts((prevProducts) => [...prevProducts, responseData.data]);
        setNewProduct({
          name: "",
          description: "",
          category: "Equipment",
          price: "",
        }); // Reset form state
        setFile(null);
        setPreview(null);
      } else {
        console.error("Failed to add product:", responseData.message);
      }
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col lg:flex-row p-4 lg:space-y-0 lg:space-x-10">
      {/* Product Form Section */}
      <div className="w-full lg:w-1/3 p-2 rounded-lg">
        <h2 className="text-sm font-extralight mb-4">Product name</h2>
        <input
          type="text"
          value={newProduct.name}
          onChange={(e) =>
            setNewProduct({ ...newProduct, name: e.target.value })
          }
          placeholder="Product name"
          className="w-full mb-6 bg-[#121212] text-gray-300 text-sm font-extralight rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
        />

        <h2 className="text-sm font-extralight mb-4">Description</h2>
        <textarea
          value={newProduct.description}
          onChange={(e) =>
            setNewProduct({ ...newProduct, description: e.target.value })
          }
          placeholder="Description"
          className="w-full mb-6 bg-[#121212] text-gray-300 text-sm font-extralight rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue resize-none h-24"
        ></textarea>

        <h2 className="text-sm font-extralight mb-4">Category</h2>
        <select
          value={newProduct.category}
          onChange={(e) =>
            setNewProduct({ ...newProduct, category: e.target.value })
          }
          className="w-full mb-6 bg-[#121212] text-sm font-extralight text-gray-300 rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
        >
          <option>Equipment</option>
          <option>Clothing</option>
          <option>Accessories</option>
        </select>
        <h2 className="text-sm font-extralight mb-4">Price</h2>
        <input
          type="number"
          value={newProduct.price}
          onChange={(e) =>
            setNewProduct({ ...newProduct, price: e.target.value })
          }
          placeholder="Product price"
          className="w-full mb-6 bg-[#121212] text-gray-300 text-sm font-extralight rounded-lg p-3 focus:outline-none focus:ring-[0.5px] focus:ring-customBlue"
        />

        <h2 className="text-sm font-extralight mb-4">Upload Media</h2>
        <div className="w-full h-36 bg-[#121212] rounded-lg flex items-center justify-center border-dashed border-2 border-zinc-500 relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute  inset-0 opacity-0 cursor-pointer"
          />
          <FontAwesomeIcon icon={faUpload} className="text-gray-500 text-2xl" />
          <span className="hidden text-gray-500 text-sm mt-2">
            {file ? file.name : "Upload Media"}
          </span>
        </div>
        {preview && (
          <div className="mt-4">
            <h2 className="text-sm font-extralight mb-2">Image Preview:</h2>
            <img
              src={preview}
              alt="Selected"
              className="w-full h-auto rounded-lg"
            />
          </div>
        )}

        {/* Add Button */}
        <button
          onClick={handleAddProduct}
          className="mt-6 bg-customBlue text-white px-4 py-2 rounded-lg w-full flex justify-center"
          disabled={isLoading}
        >
          {isLoading ? <SmallLoading /> : "Add Product"}{" "}
        </button>
      </div>
      {/* Product List Section */}
      <div className="w-full lg:w-2/3">
        <h2 className="text-sm font-extralight mb-4">Product List</h2>
        <div className="bg-[#121212] p-7 rounded-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#1d1d1d] p-4 rounded-lg relative flex flex-col items-center text-center"
              >
                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(product)}
                  className="absolute top-2 right-2 text-red-500"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>

                <img
                  src={`${NEXT_PUBLIC_API_BASE_URL}${product.imageUrl}`}
                  alt={product.name}
                  className="w-24 h-24 mb-4"
                />
                <p className="text-sm text-gray-200">{product.name}</p>
                <p className="text-xs text-gray-400">{product.description}</p>

                {/* Edit Button */}
                <button
                  onClick={() => handleEdit(product)}
                  className="absolute bottom-2 right-2 text-customBlue"
                >
                  <FontAwesomeIcon icon={faEdit} />
                </button>
              </div>
            ))}
          </div>
        </div>
        {error && (
          <div
            className="fixed top-8 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-md animate-fade-in-out"
            style={{
              animation: "fadeInOut 2s forwards",
            }}
          >
            {error}
          </div>
        )}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#121212] p-6 rounded-lg w-96 text-white">
            <h2 className="text-lg font-extralight mb-4">
              Are you sure you want to delete this product?
            </h2>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-lg flex justify-center"
                disabled={isLoading}
              >
                {isLoading ? <SmallLoading /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {/* Edit Modal */}
      {isModalOpen && editProduct && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#121212] p-6 rounded-lg w-96 text-white">
            <h2 className="text-sm font-extralight mb-4">Edit Product</h2>

            {/* Product Name */}
            <input
              type="text"
              value={editProduct.name}
              onChange={(e) =>
                setEditProduct({ ...editProduct, name: e.target.value })
              }
              className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 focus:ring-customBlue text-sm font-extralight text-gray-300"
            />

            {/* Description */}
            <textarea
              value={editProduct.description}
              onChange={(e) =>
                setEditProduct({ ...editProduct, description: e.target.value })
              }
              className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 h-24 focus:ring-customBlue text-sm font-extralight text-gray-300"
            ></textarea>

            {/* Category */}
            <div className="mb-4">
              <label className="text-sm font-extralight">Category</label>
              <select
                value={editProduct.category || ""}
                onChange={(e) =>
                  setEditProduct({ ...editProduct, category: e.target.value })
                }
                className="w-full bg-[#1d1d1d] rounded-lg p-3 text-sm font-extralight text-gray-300 focus:ring-customBlue"
              >
                <option value="">Select Category</option>
                <option value="Equipment">Equipment</option>
                <option value="Clothing">Clothing</option>
                <option value="Accessories">Accessories</option>
              </select>
            </div>

            {/* Price */}
            <div className="mb-4">
              <label className="text-sm font-extralight">Price</label>
              <input
                type="number"
                value={editProduct.price || ""}
                onChange={(e) =>
                  setEditProduct({
                    ...editProduct,
                    price: parseFloat(e.target.value),
                  })
                }
                className="w-full mb-4 bg-[#1d1d1d] rounded-lg p-3 text-sm font-extralight text-gray-300 focus:ring-customBlue"
              />
            </div>

            {/* Update Image */}
            <div className="mb-4">
              <h3 className="text-sm font-extralight mb-2">Update Image</h3>
              <input
                type="file"
                onChange={handleFileUpload}
                className="w-full bg-[#1d1d1d] text-sm font-extralight text-gray-300 rounded-lg p-2"
              />
              {editProduct.imageUrl && (
                <img
                  src={`${NEXT_PUBLIC_API_BASE_URL}${editProduct.imageUrl}`}
                  alt="Preview"
                  className="w-24 h-24 mt-2"
                />
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleProductUpdate}
                className="bg-customBlue text-white px-4 py-2 rounded-lg"
                disabled={isLoading}
              >
                {isLoading ? <SmallLoading /> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
