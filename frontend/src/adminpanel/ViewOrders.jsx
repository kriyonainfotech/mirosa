import React, { useEffect, useState } from "react";
import axios from "axios";
import OrderDetail from "./OrderDetail";
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
import { toast } from 'react-toastify'

const ViewOrders = () => {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const token = localStorage.getItem("token"); // This gets the JWT stored during login

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${backdendUrl}/api/order/getallorders`, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            });
            console.log(res, "orders");
            setOrders(res.data.orders);
        } catch (error) {
            console.error("❌ Failed to fetch orders:", error.message);
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order); // <-- NOT just order._id
    };

    const handleCloseModal = () => {
        setSelectedOrder(null);
    };

    const handleStatusChange = async (orderId, newStatus) => {
        // Optimistically update the UI first for a faster user experience
        const originalOrders = [...orders]; // Backup original state
        const updated = orders.map((order) =>
            order._id === orderId ? { ...order, status: newStatus } : order
        );
        setOrders(updated);

        try {
            const { data } = await axios.put(`${backdendUrl}/api/order/${orderId}/status`, { status: newStatus }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });

            toast.success(`Status updated to "${data?.status || newStatus}"`);
        } catch (err) {
            console.error("❌ Status update failed:", err);
            setOrders(originalOrders);
            toast.error("Failed to update order status. Please try again.");
        }

    };

    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-semibold fraunces">Manage Orders</h1>
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold">
                            <th className="px-5 py-3 border-b">Sr.no</th>
                            <th className="px-5 py-3 border-b">Order ID</th>
                            <th className="px-5 py-3 border-b">Customer Name</th>
                            <th className="px-5 py-3 border-b">Order Date</th>
                            <th className="px-5 py-3 border-b">Status</th>
                            <th className="px-5 py-3 border-b">Total Amount</th>
                            <th className="px-5 py-3 border-b text-center">Actions</th>
                            <th className="px-5 py-3 border-b">Change Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders?.map((order, index) => (
                            <tr key={order._id} className="text-sm">
                                <td className="px-5 py-3 border-b">{index + 1}</td>
                                <td className="px-5 py-3 border-b">{order._id}</td>
                                <td className="px-5 py-3 border-b">{order.user?.name || "N/A"}</td>
                                <td className="px-5 py-3 border-b">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="px-5 py-3 border-b capitalize">{order.status}</td>
                                <td className="px-5 py-3 border-b">₹{order.totalAmount}</td>
                                <td className="px-5 py-3 border-b text-center">
                                    <button
                                        className="text-white border border-blue-700 hover:text-blue-700 mx-2 px-3 py-2 bg-blue-700 rounded-lg"
                                        onClick={() => handleViewOrder(order)}
                                    >
                                        View
                                    </button>
                                </td>
                                <td className="px-5 py-3 border-b">
                                    <select
                                        value={order.status}
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="bg-gray-100 text-sm p-2 rounded-md border border-gray-300"
                                    >
                                        <option value="Placed">Placed</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>

            {/* View Order Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-8 rounded-lg w-full max-w-2xl shadow-lg h-[80vh] overflow-y-auto">
                        <h2 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h2>

                        {/* Customer Info */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Customer Info:</h3>
                            <p className="text-sm text-gray-600 mb-1"><strong>Name:</strong> {selectedOrder.user?.name}</p>
                            <p className="text-sm text-gray-600"><strong>Email:</strong> {selectedOrder.user?.email}</p>
                        </div>

                        {/* Shipping Info */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Shipping Info:</h3>
                            <p className="text-sm text-gray-600 mb-1"><strong>City:</strong> {selectedOrder.shippingAddress?.city}</p>
                            <p className="text-sm text-gray-600 mb-1"><strong>State:</strong> {selectedOrder.shippingAddress?.state}</p>
                            <p className="text-sm text-gray-600 mb-1"><strong>Country:</strong> {selectedOrder.shippingAddress?.country}</p>
                        </div>

                        {/* Cart Items */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Items:</h3>
                            <ul className="space-y-4 ps-1">
                                {selectedOrder.cartItems?.map((item) => (
                                    <li key={item._id} className="flex items-center space-x-4">
                                        <img src={item.mainImageAtPurchase} alt={item.nameAtPurchase} className="w-20 h-20 object-cover rounded-md" />
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{item.nameAtPurchase}</p>
                                            <p className="mb-1 text-sm text-gray-600">Quantity: {item.quantity}</p>
                                            <p className="mb-1 text-sm text-gray-600">Price: ₹{item.priceAtPurchase}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Payment Info */}
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Payment Method:</h3>
                            <p className="text-sm text-gray-600">{selectedOrder.paymentMethod}</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">Payment Status:</h3>
                            <p className="text-sm text-gray-600">{selectedOrder.paymentStatus}</p>
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-end mt-4">
                            <button
                                className="px-6 py-2 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none"
                                onClick={handleCloseModal}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* <OrderDetail order={dummyOrder} onClose={() => console.log("Closed")} /> */}


        </div>
    );
};

export default ViewOrders;
