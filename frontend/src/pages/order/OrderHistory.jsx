import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

                console.log(data, 'data oreder')
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
                        <div key={order._id} className="p-4 rounded-lg border border-black/40">
                            {/* --- Order Header --- */}
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                                <div>
                                    <p className="font-semibold text-sm">ORDER ID</p>
                                    <p className="font-mono text-xs text-gray-600">{order._id}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">DATE PLACED</p>
                                    <p className="text-xs text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-semibold text-sm">TOTAL</p>
                                    <p className="text-xs text-gray-600 font-bold">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                                </div>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full self-start sm:self-center ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                                    order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* --- Order Items --- */}
                            <div className="border-t pt-4 border-black/40">
                                {/* ✅ Use order.cartItems to map over items */}
                                {order.cartItems.map((item) => (
                                    <div key={item.variantId} className="flex items-center gap-4 py-2">
                                        {/* ✅ Use item.mainImageAtPurchase */}
                                        <img src={item.mainImageAtPurchase} alt={item.nameAtPurchase} className="w-16 h-16 rounded-md object-cover" />
                                        <div className="flex-grow">
                                            {/* ✅ Use item.nameAtPurchase */}
                                            <p className="font-semibold text-gray-800">{item.nameAtPurchase}</p>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        {/* ✅ Use item.priceAtPurchase */}
                                        <p className="ml-auto font-semibold">₹{(item.priceAtPurchase * item.quantity).toLocaleString('en-IN')}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;