import React, { useState, useEffect } from "react";
import SmallLoading from "./SmallLoading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface EditItemFormProps {
  item: {
    id: string;
    itemName: string;
    category: string;
    quantity: number;
    packs: number;
  };
  onEditItem: () => void;
  onClose: () => void;
}

const EditItemForm: React.FC<EditItemFormProps> = ({
  item,
  onEditItem,
  onClose,
}) => {
  const [itemName, setItemName] = useState(item.itemName);
  const [category, setCategory] = useState(item.category);
  const [packs, setPacks] = useState(item.packs);
  const [quantity, setQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    const token = localStorage.getItem("token");
    e.preventDefault();
    if (!itemName || !category || quantity <= 0) return;

    setLoading(true); // Start loading

    const updatedItem = { id: item.id, itemName, category, quantity, packs };

    try {
      const response = await fetch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/stock/${item.id}/edit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatedItem),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to edit item");
      }

      const savedItem = await response.json();

      if (savedItem.success) {
        onEditItem(); // Pass the updated item with backend response
        onClose(); // Close the form after editing
      } else {
        console.error("Unexpected response:", savedItem);
      }
    } catch (error) {
      console.error("Error editing item:", error);
      // Optionally, you can display an error message to the user
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="fixed inset-0 bg-[#121212] bg-opacity-50 flex justify-center items-center">
      <div className="bg-[#121212] text-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-lg mb-4 font-extralight">Edit Item</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white font-extralight mb-2">
              Item Name
            </label>
            <input
              type="text"
              className="w-full p-2 rounded bg-[#1d1d1d]"
              placeholder={item.itemName}
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white font-extralight mb-2">
              Category
            </label>
            <input
              type="text"
              className="w-full p-2 rounded bg-[#1d1d1d]"
              placeholder={item.category}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white font-extralight mb-2">
              Pack
            </label>
            <input
              type="number"
              className="w-full p-2 rounded bg-[#1d1d1d]"
              placeholder={item.packs.toString()}
              value={packs}
              onChange={(e) => setPacks(parseInt(e.target.value))}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-white font-extralight mb-2">
              Quantity
            </label>
            <input
              type="number"
              className="w-full p-2 rounded bg-[#1d1d1d]"
              placeholder={item.quantity.toString()}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              required
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="hover:bg-customBlue bg-customHoverBlue text-white px-4 py-2 rounded"
              disabled={loading}
            >
              {loading ? <SmallLoading /> : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemForm;
