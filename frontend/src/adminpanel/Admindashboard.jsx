import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaShoppingCart, FaTags, FaList, FaBox } from "react-icons/fa";
import { toast } from "react-toastify";
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const Admindashboard = () => {
    const [counts, setCounts] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await axios.get(`${backdendUrl}/api/auth/getcounts`, {
                    withCredentials: true,
                });
                console.log(res.data.data, "res");
                setCounts(res.data.data);

            } catch (error) {
                console.error("Failed to fetch dashboard counts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCounts();
    }, []);

    const cards = [
        {
            label: "Users",
            value: counts?.users,
            icon: <FaUsers className="text-blue-600" />,
        },
        {
            label: "Orders",
            value: counts?.orders,
            icon: <FaShoppingCart className="text-green-600" />,
        },
        {
            label: "Categories",
            value: counts?.categories,
            icon: <FaTags className="text-purple-600" />,
        },
        {
            label: "Subcategories",
            value: counts?.subcategories,
            icon: <FaList className="text-yellow-600" />,
        },
        {
            label: "Products",
            value: counts?.products,
            icon: <FaBox className="text-orange-600" />,
        },
    ];

    console.log(counts, 'cards')

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-maroon fraunces">
                Admin Dashboard
            </h1>

            {loading ? (
                <div className="text-gray-500">Loading counts...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {cards.map((card, idx) => (
                        <div
                            key={idx}
                            className="bg-white shadow-md rounded-2xl p-5 flex items-center justify-between border-l-4 border-rose-900"
                        >
                            <div>
                                <div className="text-sm text-gray-500">{card.label}</div>
                                <div className="text-2xl font-bold text-gray-800">
                                    {card.value}
                                </div>
                            </div>
                            <div className="text-3xl">{card.icon}</div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Admindashboard;
