import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import TrackingModal from "./TrackingModal";
import { useNavigate } from "react-router-dom";

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // --- ✅ ADDED STATE FOR TRACKING MODAL ---
  const [isTracking, setIsTracking] = useState(false);
  const [trackingError, setTrackingError] = useState(null);
  const [trackingData, setTrackingData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // This gets the JWT stored during login

  if (!token) {
    // Handle case where token is missing (e.g., user not logged in or session expired)
    setError("Authentication token not found. Please log in again.");
    toast.error("Authentication token not found. Please log in again.");
    navigate("/login"); // Redirect to login page
    return;
  }

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${backdendUrl}/api/order/my-orders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        });

        console.log(data, "data oreder");
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        setError("Failed to fetch order history.");
        toast.error("Failed to fetch order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleTrackClick = async (trackingNumber) => {
    setIsModalOpen(true); // Open the modal immediately
    setIsTracking(true);
    setTrackingError(null);
    setTrackingData(null);

    try {
      const { data } = await axios.post(
        `${backdendUrl}/api/order/track`,
        { trackingNumber: trackingNumber },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      console.log(
        data.events,
        "data tracking---------------------------------"
      );
      if (data.success) {
        setTrackingData(data.events);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to get tracking info.";
      setTrackingError(message);
    } finally {
      setIsTracking(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500">Loading your order history...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="p-4 rounded-lg border border-black/40"
            >
              {/* --- Order Header --- */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                <div>
                  <p className="font-semibold text-sm">ORDER ID</p>
                  <p className="font-mono text-xs text-gray-600">{order._id}</p>
                </div>
                <div>
                  <p className="font-semibold text-sm">DATE PLACED</p>
                  <p className="text-xs text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-sm">TOTAL</p>
                  <p className="text-xs text-gray-600 font-bold">
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full self-start sm:self-center ${
                    order.status === "Delivered"
                      ? "bg-green-100 text-green-800"
                      : order.status === "Shipped"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* --- Order Items --- */}
              <div className="border-t pt-4 border-black/40">
                {/* ✅ Use order.cartItems to map over items */}
                {order.cartItems.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center gap-4 py-2"
                  >
                    {/* ✅ Use item.mainImageAtPurchase */}
                    <img
                      src={item.mainImageAtPurchase}
                      alt={item.nameAtPurchase}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-grow">
                      {/* ✅ Use item.nameAtPurchase */}
                      <p className="font-semibold text-gray-800">
                        {item.nameAtPurchase}
                      </p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    {/* ✅ Use item.priceAtPurchase */}
                    <p className="ml-auto font-semibold">
                      ₹
                      {(item.priceAtPurchase * item.quantity).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {order.trackingNumber && (
                <div className="border-t pt-4 mt-4 border-black/40">
                  <h4 className="font-semibold text-sm mb-2">
                    Tracking Information
                  </h4>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <div>
                      <p className="text-xs text-gray-600">Carrier: FedEx</p>
                      <p className="font-mono text-sm text-gray-800">
                        {order.trackingNumber}
                      </p>
                    </div>

                    {/* Changed this from an <a> tag to a <button> */}
                    <button
                      onClick={() => handleTrackClick(order.trackingNumber)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 text-center"
                    >
                      Track Package
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TrackingModal
          isLoading={isTracking}
          error={trackingError}
          trackingEvents={trackingData}
          onClose={() => setIsModalOpen(false)} // Close modal function
        />
      )}
    </div>
  );
};

export default OrderHistory;
