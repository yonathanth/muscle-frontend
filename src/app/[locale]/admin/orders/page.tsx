"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import SmallLoading from "../components/SmallLoading";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface OrderItem {
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
}

interface Order {
  id: string;
  customerName: string;
  phoneNumber: string;
  status: string;
  orderItems: OrderItem[];
}

interface Stats {
  totalSales: number;
  totalOrders: number;
  totalDelivered: number;
  totalPending: number;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [ordertoDelete, setOrdertoDelete] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = (order: Order) => {
    setOrdertoDelete(order);
    setIsDeleteModalOpen(true);
  };
  const token = localStorage.getItem("token");

  const confirmDelete = async () => {
    setIsLoading(true);
    if (ordertoDelete) {
      try {
        const response = await fetch(
          `${NEXT_PUBLIC_API_BASE_URL}/api/orders/${ordertoDelete.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const responeData = await response.json();
        if (response.ok) {
          setOrders(orders.filter((order) => order.id !== ordertoDelete.id));
        } else {
          console.error(responeData.message || "Failed to delete order");
          setError(responeData.message || "Failed to delete Order");
          setTimeout(() => setError(""), 4000); // Clear error after 2 seconds
        }
      } catch (error) {
        console.error("Error deleting orer:", error);
        setError("An unexpected error occurred. Please try again.");
        setTimeout(() => setError(""), 4000); // Clear error after 2 seconds
      } finally {
        setIsDeleteModalOpen(false);
        setOrdertoDelete(null);
        setIsLoading(false);
      }
    }
  };

  // Function to fetch orders and stats
  const fetchOrders = async () => {
    try {
      const response = await axios.get(
        `${NEXT_PUBLIC_API_BASE_URL}/api/orders/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = response.data.data;

      setOrders(data.orders);
      setStats({
        totalSales: data.totalSales,
        totalOrders: data.totalOrders,
        totalDelivered: data.totalDelivered,
        totalPending: data.totalPending,
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  // Fetch orders initially on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const toggleOrderStatus = async (orderId: string, currentStatus: string) => {
    try {
      // Make the API call to update the order status on the backend
      const updatedStatus =
        currentStatus === "Pending" ? "Delivered" : "Pending";

      // Update the status on the backend
      await axios.patch(
        `${NEXT_PUBLIC_API_BASE_URL}/api/orders/${orderId}/toggleStatus`,
        { status: updatedStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Re-fetch the orders and stats after the status update
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      // Handle error (maybe show a notification or alert)
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="md:p-8 bg-black min-h-screen text-white flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-6">
        {stats &&
          Object.entries(stats).map(([label, value]) => (
            <div
              key={label}
              className="bg-[#121212] border border-[#23363f] hover:border hover:border-customBlue py-6 px-2 rounded-lg text-center text-white flex-1"
            >
              <p className="text-4xl font-bold">{value}</p>
              <p className="text-sm font-light pt-2 capitalize text-customBlue">
                {label.replace(/([A-Z])/g, " $1").trim()}
              </p>
            </div>
          ))}
      </div>
      {/* Error Message Display */}
      {errorMessage && (
        <div className="mt-4 text-red-500 text-center">{errorMessage}</div>
      )}

      <div className="bg-black md:p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Orders</h2>

        {/* Table Layout for Large Screens */}
        <div className="overflow-x-auto overflow-y-auto">
          <table className="table-auto overflow-scroll w-full">
            <thead>
              <tr>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Name
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Phone Number
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Items
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3">
                  Status
                </th>
                <th className="px-2 text-left text-gray-200 font-bold text-sm py-3 "></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => (
                <tr
                  key={order.id}
                  className={`${
                    index % 2 === 0 ? "bg-[#ffffff12]" : "bg-black"
                  }`}
                >
                  <td className="text-gray-400 py-2 px-2 font-extralight text-sm">
                    {order.customerName}
                  </td>
                  <td className="text-gray-400 py-2 px-2 font-extralight text-sm">
                    {order.phoneNumber}
                  </td>
                  <td className="text-gray-400 py-2 px-2 font-extralight text-sm">
                    {order.orderItems.map((item) => (
                      <div key={item.product.id}>
                        {item.product.name} (x{item.quantity})
                      </div>
                    ))}
                  </td>
                  <td className="py-2 px-2 font-extralight text-sm text-gray-400">
                    {order.status}
                  </td>
                  <td className="py-2 flex items-center gap-5 ">
                    <input
                      type="checkbox"
                      className="form-checkbox w-5 h-5 border-2 border-blue-500 rounded text-blue-500"
                      checked={order.status === "Delivered"}
                      onChange={() => toggleOrderStatus(order.id, order.status)}
                    />
                    <button
                      onClick={() => handleDelete(order)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#121212] p-6 rounded-lg w-96 text-white">
            <h2 className="text-lg font-extralight mb-4">
              Are you sure you want to delete this Order?
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
    </div>
  );
};

export default Orders;
