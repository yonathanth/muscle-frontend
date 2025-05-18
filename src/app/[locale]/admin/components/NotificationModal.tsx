import { useState } from "react";
import axios from "axios";
const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (name: string, description: string) => void;
  userId: string;
}

const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  onSend,
  userId,
}) => {
  const [name, setName] = useState("");
  const token = localStorage.getItem("token");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"success" | "error" | null>(null);

  if (!isOpen) return null;

  const handleSend = async () => {
    try {
      const response = await axios.post(
        `${NEXT_PUBLIC_API_BASE_URL}/api/members/${userId}/notification`,
        {
          add: [
            {
              name,
              description,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setStatus("success");
        onSend(name, description);
        setName("");
        setDescription("");
        setTimeout(() => setStatus(null), 3000);
        onClose();
      }
    } catch (error) {
      setStatus("error");
      setTimeout(() => setStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-[#121212] text-white p-6 rounded shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Send Notification</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#1d1d1d] text-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-md bg-[#1d1d1d] text-gray-300 focus:outline-none focus:ring-2 focus:ring-customBlue"
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="bg-customBlue hover:bg-customHoverBlue px-4 py-2 rounded text-white"
          >
            Send
          </button>
        </div>
        {status === "success" && (
          <p className="text-green-400 mt-4">Notification sent successfully!</p>
        )}
        {status === "error" && (
          <p className="text-red-400 mt-4">
            Failed to send notification. Please try again.
          </p>
        )}
      </div>
    </div>
  );
};

export default NotificationModal;
