// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { FaUsers, FaShoppingCart, FaTags, FaList, FaBox } from "react-icons/fa";
// import { toast } from "react-toastify";
// const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// const Admindashboard = () => {
//   const [counts, setCounts] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchCounts = async () => {
//       try {
//         const res = await axios.get(`${backdendUrl}/api/auth/getcounts`, {
//           withCredentials: true,
//         });
//         console.log(res.data.data, "res");
//         setCounts(res.data.data);
//       } catch (error) {
//         console.error("Failed to fetch dashboard counts", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCounts();
//   }, []);

//   const cards = [
//     {
//       label: "Users",
//       value: counts?.users,
//       icon: <FaUsers className="text-blue-600" />,
//     },
//     {
//       label: "Orders",
//       value: counts?.orders,
//       icon: <FaShoppingCart className="text-green-600" />,
//     },
//     {
//       label: "Categories",
//       value: counts?.categories,
//       icon: <FaTags className="text-purple-600" />,
//     },
//     {
//       label: "Subcategories",
//       value: counts?.subcategories,
//       icon: <FaList className="text-yellow-600" />,
//     },
//     {
//       label: "Products",
//       value: counts?.products,
//       icon: <FaBox className="text-orange-600" />,
//     },
//   ];

//   console.log(counts, "cards");

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6 text-maroon fraunces">
//         Admin Dashboard
//       </h1>

//       {loading ? (
//         <div className="text-gray-500">Loading counts...</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//           {cards.map((card, idx) => (
//             <div
//               key={idx}
//               className="bg-white shadow-md rounded-2xl p-5 flex items-center justify-between border-l-4 border-rose-900"
//             >
//               <div>
//                 <div className="text-sm text-gray-500">{card.label}</div>
//                 <div className="text-2xl font-bold text-gray-800">
//                   {card.value}
//                 </div>
//               </div>
//               <div className="text-3xl">{card.icon}</div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Admindashboard;

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaShoppingBag,
  FaMoneyBillWave,
  FaUsers,
  FaBoxOpen,
  FaArrowRight,
  FaExclamationTriangle,
  FaClipboardList,
  FaPlus,
  FaShippingFast,
  FaChartLine,
} from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const Admindashboard = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    ordersCount: 0,
    productsCount: 0,
    usersCount: 0,
    avgOrderValue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [ordersRes, productsRes, usersRes] = await Promise.all([
        axios.get(`${backdendUrl}/api/order/getallorders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${backdendUrl}/api/product/getproducts`),
        // Assuming you have a user endpoint, if not, we handle it gracefully
        axios
          .get(`${backdendUrl}/api/auth/allusers`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: { users: [] } })),
      ]);

      const orders = ordersRes.data.orders || [];
      const products = productsRes.data.products || [];
      const users = usersRes.data.users || [];
      console.log(orders, products, users, "-----------------------------");
      // --- 1. Calculate Financials ---
      // Only count 'Paid' orders or all valid orders depending on your logic.
      // Here taking all non-cancelled for general view.
      const validOrders = orders.filter((o) => o.status !== "Cancelled");
      const totalRevenue = validOrders.reduce(
        (acc, order) => acc + (order.totalAmount || 0),
        0
      );
      const avgOrderVal =
        validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

      // --- 2. Low Stock Logic ---
      const lowStock = products
        .flatMap((p) =>
          p.variants
            .filter((v) => v.stock < 5)
            .map((v) => ({
              productId: p._id,
              title: p.title,
              variantSku: v.sku,
              stock: v.stock,
              image: v.images?.[0] || p.mainImage,
            }))
        )
        .slice(0, 5); // Top 5 critical items

      setStats({
        revenue: totalRevenue,
        ordersCount: orders.length,
        productsCount: products.length,
        usersCount: users.length,
        avgOrderValue: avgOrderVal,
      });

      setRecentOrders(orders.slice(0, 5)); // Latest 5
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const StatCard = ({ title, value, icon, color, subtext }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        {subtext && (
          <p
            className={`text-xs mt-2 ${
              color === "green" ? "text-green-600" : "text-gray-400"
            }`}
          >
            {subtext}
          </p>
        )}
      </div>
      <div
        className={`p-4 rounded-xl ${
          color === "green"
            ? "bg-green-50 text-green-600"
            : color === "blue"
            ? "bg-blue-50 text-blue-600"
            : color === "purple"
            ? "bg-purple-50 text-purple-600"
            : "bg-orange-50 text-orange-600"
        }`}
      >
        {icon}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* <AdminSidebar /> */}

      <main className="flex-1 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 fraunces">
                Dashboard
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Welcome back, Admin! Here's what's happening today.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/admin/products/add"
                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 flex items-center gap-2 shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <FaPlus size={12} /> Add Product
              </Link>
              <Link
                to="/admin/orders"
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-2 shadow-sm"
              >
                <FaClipboardList /> View Orders
              </Link>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Revenue"
              value={`₹${stats.revenue.toLocaleString()}`}
              icon={<FaMoneyBillWave size={22} />}
              color="green"
              subtext="+12% from last month"
            />
            <StatCard
              title="Total Orders"
              value={stats.ordersCount}
              icon={<FaShoppingBag size={22} />}
              color="blue"
              subtext={`${
                recentOrders.filter((o) => o.status === "Placed").length
              } New Orders`}
            />
            <StatCard
              title="Total Products"
              value={stats.productsCount}
              icon={<FaBoxOpen size={22} />}
              color="orange"
              subtext={`${lowStockProducts.length} items Low Stock`}
            />
            <StatCard
              title="Registered Users"
              value={stats.usersCount}
              icon={<FaUsers size={22} />}
              color="purple"
              subtext="Active Customer Base"
            />
          </div>

          {/* Main Content Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Recent Orders Table */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FaShippingFast className="text-blue-500" /> Recent Orders
                </h3>
                <Link
                  to="/admin/orders"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View All <FaArrowRight size={10} />
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 text-xs uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan="4" className="p-6 text-center">
                          Loading...
                        </td>
                      </tr>
                    ) : recentOrders.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="p-6 text-center">
                          No orders yet.
                        </td>
                      </tr>
                    ) : (
                      recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-xs">
                            #{order._id.slice(-6).toUpperCase()}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            {order.user?.name || "Guest"}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2 py-1 rounded text-xs font-bold ${
                                order.status === "Delivered"
                                  ? "bg-green-100 text-green-700"
                                  : order.status === "Cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            ₹{order.totalAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right: Alerts & Quick Actions */}
            <div className="space-y-8">
              {/* Low Stock Alert */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaExclamationTriangle className="text-amber-500" /> Low Stock
                  Alerts
                </h3>
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm bg-green-50 rounded-lg border border-green-100">
                    All stock levels healthy ✅
                  </div>
                ) : (
                  <div className="space-y-3">
                    {lowStockProducts.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors border border-transparent hover:border-gray-100"
                      >
                        <img
                          src={item.image}
                          alt=""
                          className="w-10 h-10 rounded-md object-cover bg-gray-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            SKU: {item.variantSku}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                          {item.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Analytics Preview (Static/Placeholder for now) */}
              <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                    <FaChartLine /> Monthly Goal
                  </h3>
                  <p className="text-indigo-200 text-sm mb-6">
                    Revenue Target: ₹5,00,000
                  </p>

                  <div className="w-full bg-indigo-950/50 h-2 rounded-full mb-2">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(
                          (stats.revenue / 500000) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-indigo-300 text-right">
                    {((stats.revenue / 500000) * 100).toFixed(1)}% Achieved
                  </p>
                </div>
                {/* Decorative Circles */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admindashboard;
