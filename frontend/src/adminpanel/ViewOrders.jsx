// import React, { useEffect, useState } from "react";
// import axios from "axios";
// // import OrderDetail from "./OrderDetail"; // Not used currently as modal is inline
// const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
// import { toast } from "react-toastify";

// const ViewOrders = () => {
//   const [orders, setOrders] = useState([]);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const token = localStorage.getItem("token");

//   // Shipping State
//   const [weight, setWeight] = useState(""); // Changed to empty string initially
//   const [isShipping, setIsShipping] = useState(false);
//   const [shipmentResult, setShipmentResult] = useState(null);
//   const [dimensions, setDimensions] = useState({
//     length: "10",
//     width: "10",
//     height: "5",
//   }); // Defaults in CM/IN

//   const fetchOrders = async () => {
//     try {
//       const res = await axios.get(`${backdendUrl}/api/order/getallorders`, {
//         withCredentials: true,
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });
//       setOrders(res.data.orders);
//     } catch (error) {
//       console.error("❌ Failed to fetch orders:", error.message);
//     }
//   };

//   const handleViewOrder = (order) => {
//     setSelectedOrder(order);
//     setShipmentResult(null); // Reset previous shipment result

//     // ✅ AUTO-CALCULATE SUGGESTED WEIGHT
//     // This sums up the weight of all items in the cart to give you a starting point.
//     // Assumes weights in DB are consistent (e.g., all in Grams or LBs).
//     // If your DB has Grams, you might want to convert to LBs here (1 Gram = 0.0022 Lbs)
//     const totalItemWeight = order.cartItems?.reduce((acc, item) => {
//       const itemWeight = item.weightAtPurchase || 0;
//       return acc + itemWeight * item.quantity;
//     }, 0);

//     // Example: If DB is in Grams, convert to LBs for FedEx (optional logic)
//     // const weightInLbs = (totalItemWeight * 0.00220462).toFixed(2);
//     // setWeight(weightInLbs);

//     // For now, setting raw total (Adjust this calculation based on your units)
//     setWeight(totalItemWeight > 0 ? totalItemWeight : "0.5");
//   };

//   const handleCloseModal = () => {
//     setSelectedOrder(null);
//   };

//   const handleStatusChange = async (orderId, newStatus) => {
//     const originalOrders = [...orders];
//     const updated = orders.map((order) =>
//       order._id === orderId ? { ...order, status: newStatus } : order
//     );
//     setOrders(updated);

//     try {
//       const { data } = await axios.put(
//         `${backdendUrl}/api/order/${orderId}/status`,
//         { status: newStatus },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true,
//         }
//       );
//       toast.success(`Status updated to "${data?.status || newStatus}"`);
//     } catch (err) {
//       console.error("❌ Status update failed:", err);
//       setOrders(originalOrders);
//       toast.error("Failed to update order status.");
//     }
//   };

//   const handleCreateShipment = async (orderId) => {
//     if (!weight || parseFloat(weight) <= 0) {
//       toast.error("Please enter a valid package weight.");
//       return;
//     }

//     if (!dimensions.length || !dimensions.width || !dimensions.height) {
//       toast.error("Please enter valid box dimensions.");
//       return;
//     }

//     setIsShipping(true);
//     setShipmentResult(null);

//     try {
//       const { data } = await axios.post(
//         `${backdendUrl}/api/order/${orderId}/ship`,
//         {
//           weight: weight,
//           length: dimensions.length,
//           width: dimensions.width,
//           height: dimensions.height,
//         }, // We only send weight; backend handles the rest!
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );

//       toast.success(data.message);
//       setShipmentResult({
//         trackingNumber: data.trackingNumber,
//         labelUrl: data.labelUrl,
//       });
//       fetchOrders();
//     } catch (err) {
//       console.error("❌ Shipment creation failed:", err);
//       const errorMessage =
//         err.response?.data?.message || "Failed to create shipment.";
//       toast.error(errorMessage);
//     } finally {
//       setIsShipping(false);
//     }
//   };

//   useEffect(() => {
//     fetchOrders();
//   }, []);

//   return (
//     <div className="p-6">
//       <div className="mb-6 flex justify-between items-center">
//         <h1 className="text-3xl font-semibold fraunces">Manage Orders</h1>
//       </div>

//       <div className="overflow-x-auto bg-white shadow-md rounded-lg">
//         <table className="min-w-full table-auto">
//           <thead>
//             <tr className="bg-gray-100 text-left text-sm font-semibold">
//               <th className="px-5 py-3 border-b">Sr.no</th>
//               <th className="px-5 py-3 border-b">Order ID</th>
//               <th className="px-5 py-3 border-b">Customer</th>
//               <th className="px-5 py-3 border-b">Date</th>
//               <th className="px-5 py-3 border-b">Status</th>
//               <th className="px-5 py-3 border-b">Total</th>
//               <th className="px-5 py-3 border-b text-center">Actions</th>
//               <th className="px-5 py-3 border-b">Change Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {orders?.map((order, index) => (
//               <tr key={order._id} className="text-sm">
//                 <td className="px-5 py-3 border-b">{index + 1}</td>
//                 <td className="px-5 py-3 border-b text-xs font-mono">
//                   {order._id}
//                 </td>
//                 <td className="px-5 py-3 border-b">
//                   {order.user?.name || "N/A"}
//                 </td>
//                 <td className="px-5 py-3 border-b">
//                   {new Date(order.createdAt).toLocaleDateString()}
//                 </td>
//                 <td className="px-5 py-3 border-b capitalize">
//                   <span
//                     className={`px-2 py-1 rounded-full text-xs font-bold ${
//                       order.status === "Shipped"
//                         ? "bg-green-100 text-green-800"
//                         : order.status === "Cancelled"
//                         ? "bg-red-100 text-red-800"
//                         : "bg-yellow-100 text-yellow-800"
//                     }`}
//                   >
//                     {order.status}
//                   </span>
//                 </td>
//                 <td className="px-5 py-3 border-b">₹{order.totalAmount}</td>
//                 <td className="px-5 py-3 border-b text-center">
//                   <button
//                     className="text-white border border-blue-700 hover:bg-blue-800 mx-2 px-3 py-2 bg-blue-700 rounded-lg text-xs"
//                     onClick={() => handleViewOrder(order)}
//                   >
//                     View Details
//                   </button>
//                 </td>
//                 <td className="px-5 py-3 border-b">
//                   <select
//                     value={order.status}
//                     onChange={(e) =>
//                       handleStatusChange(order._id, e.target.value)
//                     }
//                     className="bg-gray-50 text-sm p-1 rounded border border-gray-300"
//                   >
//                     <option value="Placed">Placed</option>
//                     <option value="Processing">Processing</option>
//                     <option value="Shipped">Shipped</option>
//                     <option value="Delivered">Delivered</option>
//                     <option value="Cancelled">Cancelled</option>
//                   </select>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* View Order Modal */}
//       {selectedOrder && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
//           <div className="bg-white w-full max-w-4xl shadow-2xl h-[90vh] overflow-y-auto flex flex-col">
//             {/* Modal Header */}
//             <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
//               <h2 className="text-2xl font-bold text-gray-800">
//                 Order Details{" "}
//                 <span className="text-sm font-normal text-gray-500">
//                   #{selectedOrder._id}
//                 </span>
//               </h2>
//               <button
//                 onClick={handleCloseModal}
//                 className="text-gray-400 hover:text-gray-600"
//               >
//                 <svg
//                   className="w-6 h-6"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M6 18L18 6M6 6l12 12"
//                   ></path>
//                 </svg>
//               </button>
//             </div>

//             <div className="p-8 space-y-8">
//               {/* Top Grid: Customer & Shipping */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
//                     Customer Info
//                   </h3>
//                   <div className="space-y-2 text-sm text-gray-600">
//                     <p>
//                       <span className="font-medium">Name:</span>{" "}
//                       {selectedOrder.user?.name}
//                     </p>
//                     <p>
//                       <span className="font-medium">Email:</span>{" "}
//                       {selectedOrder.user?.email}
//                     </p>
//                     <p>
//                       <span className="font-medium">Payment:</span>{" "}
//                       {selectedOrder.paymentMethod}{" "}
//                       <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
//                         {selectedOrder.paymentStatus}
//                       </span>
//                     </p>
//                   </div>
//                 </div>

//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">
//                     Shipping Address
//                   </h3>
//                   <div className="space-y-2 text-sm text-gray-600">
//                     <p>{selectedOrder.shippingAddress?.fullName}</p>
//                     <p>{selectedOrder.shippingAddress?.addressLine1}</p>
//                     {selectedOrder.shippingAddress?.addressLine2 && (
//                       <p>{selectedOrder.shippingAddress?.addressLine2}</p>
//                     )}
//                     <p>
//                       {selectedOrder.shippingAddress?.city},{" "}
//                       {selectedOrder.shippingAddress?.state} -{" "}
//                       {selectedOrder.shippingAddress?.zipCode}
//                     </p>
//                     <p className="font-bold">
//                       {selectedOrder.shippingAddress?.country}
//                     </p>
//                     <p>📞 {selectedOrder.shippingAddress?.phoneNumber}</p>
//                   </div>
//                 </div>
//               </div>

//               {/* Order Items Table */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-700 mb-4">
//                   Ordered Items
//                 </h3>
//                 <div className="overflow-x-auto border rounded-lg">
//                   <table className="w-full text-sm text-left text-gray-600">
//                     <thead className="bg-gray-100 text-xs uppercase font-semibold">
//                       <tr>
//                         <th className="px-4 py-3">Product</th>
//                         <th className="px-4 py-3">Price</th>
//                         <th className="px-4 py-3">Qty</th>
//                         <th className="px-4 py-3">Total</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {selectedOrder.cartItems?.map((item) => (
//                         <tr
//                           key={item._id}
//                           className="border-b last:border-0 hover:bg-gray-50"
//                         >
//                           <td className="px-4 py-3 flex items-center space-x-3">
//                             <img
//                               src={item.mainImageAtPurchase}
//                               alt={item.nameAtPurchase}
//                               className="w-12 h-12 object-cover rounded border"
//                             />
//                             <div>
//                               <p className="font-medium text-gray-900">
//                                 {item.nameAtPurchase}
//                               </p>
//                               {/* Showing these details here for verification */}
//                               <p className="text-xs text-gray-400">
//                                 HS: {item.hsCodeAtPurchase || "N/A"} | Origin:{" "}
//                                 {item.countryOfOriginAtPurchase || "N/A"}
//                               </p>
//                             </div>
//                           </td>
//                           <td className="px-4 py-3">₹{item.priceAtPurchase}</td>
//                           <td className="px-4 py-3">{item.quantity}</td>
//                           <td className="px-4 py-3 font-medium">
//                             ₹{item.priceAtPurchase * item.quantity}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>

//               {/* FedEx Section */}
//               {selectedOrder.status !== "Shipped" &&
//               selectedOrder.status !== "Delivered" ? (
//                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
//                   <h3 className="text-xl font-bold text-blue-900 mb-2">
//                     Create FedEx Shipment
//                   </h3>
//                   <p className="text-sm text-blue-700 mb-6">
//                     Enter the final package details below to generate the label.
//                   </p>

//                   {!shipmentResult ? (
//                     <div className="flex flex-col gap-4">
//                       {/* 1. ROW FOR WEIGHT AND DIMENSIONS */}
//                       <div className="flex flex-col md:flex-row gap-4">
//                         {/* Weight */}
//                         <div className="w-full md:w-1/4">
//                           <label className="block text-xs font-bold text-gray-700 mb-1">
//                             Weight (LB)
//                           </label>
//                           <input
//                             type="number"
//                             value={weight}
//                             onChange={(e) => setWeight(e.target.value)}
//                             className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             placeholder="0.5"
//                           />
//                         </div>

//                         {/* Dimensions */}
//                         <div className="w-full md:w-3/4 grid grid-cols-3 gap-2">
//                           <div>
//                             <label className="block text-xs font-bold text-gray-700 mb-1">
//                               Length (IN)
//                             </label>
//                             <input
//                               type="number"
//                               value={dimensions.length}
//                               onChange={(e) =>
//                                 setDimensions({
//                                   ...dimensions,
//                                   length: e.target.value,
//                                 })
//                               }
//                               className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               placeholder="L"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-xs font-bold text-gray-700 mb-1">
//                               Width (IN)
//                             </label>
//                             <input
//                               type="number"
//                               value={dimensions.width}
//                               onChange={(e) =>
//                                 setDimensions({
//                                   ...dimensions,
//                                   width: e.target.value,
//                                 })
//                               }
//                               className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               placeholder="W"
//                             />
//                           </div>
//                           <div>
//                             <label className="block text-xs font-bold text-gray-700 mb-1">
//                               Height (IN)
//                             </label>
//                             <input
//                               type="number"
//                               value={dimensions.height}
//                               onChange={(e) =>
//                                 setDimensions({
//                                   ...dimensions,
//                                   height: e.target.value,
//                                 })
//                               }
//                               className="w-full p-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                               placeholder="H"
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       {/* 2. SUBMIT BUTTON */}
//                       <button
//                         onClick={() => handleCreateShipment(selectedOrder._id)}
//                         disabled={isShipping}
//                         className={`w-full py-3 rounded-lg text-white font-bold shadow-sm transition-all
//                         ${
//                           isShipping
//                             ? "bg-gray-400 cursor-not-allowed"
//                             : "bg-blue-700 hover:bg-blue-800"
//                         }`}
//                       >
//                         {isShipping
//                           ? "Generating Label..."
//                           : "Generate FedEx Label"}
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="bg-green-100 border border-green-300 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
//                       <div>
//                         <h4 className="font-bold text-green-800 flex items-center gap-2">
//                           <svg
//                             className="w-5 h-5"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth="2"
//                               d="M5 13l4 4L19 7"
//                             ></path>
//                           </svg>
//                           Shipment Created!
//                         </h4>
//                         <p className="text-sm text-green-700 mt-1">
//                           Tracking #:{" "}
//                           <span className="font-mono font-bold select-all">
//                             {shipmentResult.trackingNumber}
//                           </span>
//                         </p>
//                       </div>
//                       <a
//                         href={shipmentResult.labelUrl}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         className="px-5 py-2 bg-green-700 text-white text-sm font-bold rounded-lg hover:bg-green-800 shadow-md flex items-center gap-2"
//                       >
//                         <svg
//                           className="w-4 h-4"
//                           fill="none"
//                           stroke="currentColor"
//                           viewBox="0 0 24 24"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth="2"
//                             d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
//                           ></path>
//                         </svg>
//                         Print Label
//                       </a>
//                     </div>
//                   )}
//                 </div>
//               ) : (
//                 <div className="bg-gray-100 p-6 rounded-xl border border-gray-200">
//                   <h3 className="text-lg font-bold text-gray-800 mb-2">
//                     Shipment Details
//                   </h3>
//                   <div className="grid grid-cols-2 gap-4 text-sm">
//                     <div>
//                       <p className="text-gray-500">Carrier</p>
//                       <p className="font-semibold">FedEx</p>
//                     </div>
//                     <div>
//                       <p className="text-gray-500">Tracking Number</p>
//                       <p className="font-mono font-bold text-blue-600">
//                         {selectedOrder.trackingNumber || "N/A"}
//                       </p>
//                     </div>
//                     {selectedOrder.shipmentDetails?.labelURL && (
//                       <div className="col-span-2 mt-2">
//                         <a
//                           href={selectedOrder.shipmentDetails.labelURL}
//                           target="_blank"
//                           className="text-blue-600 hover:underline flex items-center gap-1"
//                         >
//                           Reprint Label{" "}
//                           <svg
//                             className="w-3 h-3"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                           >
//                             <path
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               strokeWidth="2"
//                               d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//                             ></path>
//                           </svg>
//                         </a>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Footer Actions */}
//             <div className="p-6 border-t bg-gray-50 flex justify-end">
//               <button
//                 className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
//                 onClick={handleCloseModal}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ViewOrders;

import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaFilter,
  FaBoxOpen,
  FaShippingFast,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaPrint,
  FaFileInvoice,
  FaClipboardList,
  FaRulerCombined,
  FaWeightHanging,
} from "react-icons/fa";

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ViewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Shipping State
  const [weight, setWeight] = useState("");
  const [dimensions, setDimensions] = useState({
    length: "10",
    width: "10",
    height: "5",
  }); // Default box size
  const [isShipping, setIsShipping] = useState(false);
  const [shipmentResult, setShipmentResult] = useState(null);

  const token = localStorage.getItem("token");

  // --- 1. Fetch Data ---
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${backdendUrl}/api/order/getallorders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setOrders(res.data.orders);
      }
    } catch (error) {
      console.error("❌ Failed to fetch orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- 2. Stats Calculation ---
  const stats = useMemo(() => {
    const total = orders.length;
    const revenue = orders.reduce(
      (acc, order) =>
        acc + (order.paymentStatus === "Paid" ? order.totalAmount : 0),
      0
    );
    const pending = orders.filter(
      (o) => o.status === "Placed" || o.status === "Processing"
    ).length;
    const shipped = orders.filter((o) => o.status === "Shipped").length;
    return { total, revenue, pending, shipped };
  }, [orders]);

  // --- 3. Filtering Logic ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || order.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  // --- 4. Handlers ---
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShipmentResult(null);

    // Auto-calculate suggested weight from cart items (assuming DB has grams, convert to LB)
    // 1 Gram = 0.00220462 LB
    const totalWeightGrams = order.cartItems?.reduce((acc, item) => {
      let w = item.weightAtPurchase || 0;
      // Normalize to Grams if unit exists, otherwise assume Grams
      if (item.weightUnitAtPurchase === "KG") w = w * 1000;
      if (item.weightUnitAtPurchase === "LB") w = w * 453.592;
      return acc + w * item.quantity;
    }, 0);

    // Convert total grams to LB for FedEx, add 0.2lb for box padding
    const suggestedWeightLB = totalWeightGrams * 0.00220462 + 0.2;
    setWeight(suggestedWeightLB.toFixed(2));
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const originalOrders = [...orders];
    setOrders(
      orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
    );

    try {
      await axios.put(
        `${backdendUrl}/api/order/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Order #${orderId.slice(-6)} updated to ${newStatus}`);
    } catch (error) {
      setOrders(originalOrders);
      console.log(error, "error");
      toast.error("Failed to update status");
    }
  };

  const handleCreateShipment = async () => {
    if (!weight || parseFloat(weight) <= 0)
      return toast.warning("Enter valid weight");
    if (!dimensions.length || !dimensions.width || !dimensions.height)
      return toast.warning("Enter valid dimensions");

    setIsShipping(true);
    try {
      const { data } = await axios.post(
        `${backdendUrl}/api/order/${selectedOrder._id}/ship`,
        {
          weight: weight,
          length: dimensions.length,
          width: dimensions.width,
          height: dimensions.height,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Label Generated Successfully! ✈️");
      setShipmentResult({
        trackingNumber: data.trackingNumber,
        labelUrl: data.labelUrl,
      });

      // Refresh orders to show new status
      fetchOrders();

      // Update local modal state to show "Shipped" immediately
      setSelectedOrder((prev) => ({
        ...prev,
        status: "Shipped",
        trackingNumber: data.trackingNumber,
      }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Shipment creation failed");
    } finally {
      setIsShipping(false);
    }
  };

  // --- 5. Helper Components ---
  const StatusBadge = ({ status }) => {
    const styles = {
      Placed: "bg-blue-100 text-blue-800 border-blue-200",
      Processing: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Shipped: "bg-purple-100 text-purple-800 border-purple-200",
      Delivered: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold border ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50/50">
      {/* Header & Stats */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 fraunces mb-6">
          Order Management
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-full">
              <FaClipboardList size={20} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">
                ₹{stats.revenue.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-full">
              <FaFileInvoice size={20} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Shipments</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="p-3 bg-yellow-50 text-yellow-600 rounded-full">
              <FaBoxOpen size={20} />
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Shipped Orders</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.shipped}
              </p>
            </div>
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full">
              <FaShippingFast size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 bg-gray-50/30">
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID, Customer Name..."
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <FaFilter className="text-gray-400" />
            <select
              className="py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Placed">Placed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-gray-500">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">
                      #{order._id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {order.user?.name || "Guest"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      ₹{order.totalAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          order.paymentStatus === "Paid"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                      >
                        {order.paymentMethod} ({order.paymentStatus})
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors tooltip"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  <StatusBadge status={selectedOrder.status} />
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* 1. Status & Customer Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Order Status Control */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaClipboardList className="text-blue-500" /> Order Status
                  </h3>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                    value={selectedOrder.status}
                    onChange={(e) =>
                      handleStatusChange(selectedOrder._id, e.target.value)
                    }
                    disabled={selectedOrder.status === "Cancelled"}
                  >
                    <option value="Placed">Placed</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <button className="w-full py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium flex items-center justify-center gap-2">
                    <FaPrint /> Print Invoice (Coming Soon)
                  </button>
                </div>

                {/* Customer Details */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Customer Details
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>
                      <span className="font-medium text-gray-900">Name:</span>{" "}
                      {selectedOrder.user?.name}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Email:</span>{" "}
                      {selectedOrder.user?.email}
                    </p>
                    <p>
                      <span className="font-medium text-gray-900">Phone:</span>{" "}
                      {selectedOrder.shippingAddress?.phoneNumber}
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Shipping Address
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p className="font-medium text-gray-900">
                      {selectedOrder.shippingAddress?.fullName}
                    </p>
                    <p>{selectedOrder.shippingAddress?.addressLine1}</p>
                    {selectedOrder.shippingAddress?.addressLine2 && (
                      <p>{selectedOrder.shippingAddress?.addressLine2}</p>
                    )}
                    <p>
                      {selectedOrder.shippingAddress?.city},{" "}
                      {selectedOrder.shippingAddress?.state}{" "}
                      {selectedOrder.shippingAddress?.zipCode}
                    </p>
                    <p className="font-bold text-blue-600">
                      {selectedOrder.shippingAddress?.country}
                    </p>
                  </div>
                </div>
              </div>

              {/* 2. Items List */}
              <div>
                <h3 className="font-bold text-gray-800 mb-4">Ordered Items</h3>
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold border-b">
                      <tr>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Customs Data</th>
                        <th className="px-5 py-3">Price</th>
                        <th className="px-5 py-3">Qty</th>
                        <th className="px-5 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.cartItems?.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-50">
                          <td className="px-5 py-3 flex items-center gap-4">
                            <img
                              src={item.mainImageAtPurchase}
                              alt=""
                              className="w-12 h-12 rounded border object-cover"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {item.nameAtPurchase}
                              </p>
                              <p className="text-xs text-gray-400">
                                Variant ID: {item.variantId}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-xs space-y-1">
                              <span className="block px-2 py-0.5 bg-gray-100 rounded w-fit">
                                HS: {item.hsCodeAtPurchase || "N/A"}
                              </span>
                              <span className="block px-2 py-0.5 bg-gray-100 rounded w-fit">
                                Origin:{" "}
                                {item.countryOfOriginAtPurchase || "N/A"}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            ₹{item.priceAtPurchase.toLocaleString()}
                          </td>
                          <td className="px-5 py-3">{item.quantity}</td>
                          <td className="px-5 py-3 text-right font-medium text-gray-900">
                            ₹
                            {(
                              item.priceAtPurchase * item.quantity
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t">
                      <tr>
                        <td
                          colSpan="4"
                          className="px-5 py-3 text-right font-bold text-gray-700"
                        >
                          Total Amount
                        </td>
                        <td className="px-5 py-3 text-right font-bold text-gray-900 text-lg">
                          ₹{selectedOrder.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* 3. FedEx Shipment Section */}
              <div className="border-t pt-6">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaShippingFast className="text-purple-600" /> Shipment
                  Management
                </h3>

                {selectedOrder.status === "Shipped" ||
                selectedOrder.trackingNumber ||
                shipmentResult ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h4 className="text-lg font-bold text-green-800 flex items-center gap-2">
                        <FaCheckCircle /> Shipment Active
                      </h4>
                      <p className="text-green-700 mt-1">
                        Carrier: <strong>FedEx Express</strong>
                      </p>
                      <p className="text-green-700">
                        Tracking #:{" "}
                        <span className="font-mono font-bold select-all">
                          {selectedOrder.trackingNumber ||
                            shipmentResult?.trackingNumber}
                        </span>
                      </p>
                    </div>
                    {(selectedOrder.shipmentDetails?.labelURL ||
                      shipmentResult?.labelUrl) && (
                      <a
                        href={
                          selectedOrder.shipmentDetails?.labelURL ||
                          shipmentResult?.labelUrl
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition-transform hover:-translate-y-1 flex items-center gap-2"
                      >
                        <FaPrint /> Download Label
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-purple-900 mb-2">
                      Create New Shipment Label
                    </h4>
                    <p className="text-sm text-purple-700 mb-6">
                      This will generate a label via FedEx API. HS Codes and
                      Origin Country are pulled automatically from the order
                      items.
                    </p>

                    <div className="flex flex-col md:flex-row gap-6 items-end">
                      {/* Weight Input */}
                      <div className="w-full md:w-1/3">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <FaWeightHanging /> Total Weight (LB)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                          placeholder="0.00"
                        />
                      </div>

                      {/* Dimensions Input */}
                      <div className="w-full md:w-1/2">
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <FaRulerCombined /> Dimensions (L x W x H in Inches)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                            type="number"
                            placeholder="L"
                            className="p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            value={dimensions.length}
                            onChange={(e) =>
                              setDimensions({
                                ...dimensions,
                                length: e.target.value,
                              })
                            }
                          />
                          <input
                            type="number"
                            placeholder="W"
                            className="p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            value={dimensions.width}
                            onChange={(e) =>
                              setDimensions({
                                ...dimensions,
                                width: e.target.value,
                              })
                            }
                          />
                          <input
                            type="number"
                            placeholder="H"
                            className="p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                            value={dimensions.height}
                            onChange={(e) =>
                              setDimensions({
                                ...dimensions,
                                height: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={handleCreateShipment}
                        disabled={isShipping}
                        className={`w-full md:w-auto px-8 py-3 rounded-lg font-bold text-white shadow-md transition-all flex items-center justify-center gap-2
                                                    ${
                                                      isShipping
                                                        ? "bg-gray-400 cursor-not-allowed"
                                                        : "bg-purple-600 hover:bg-purple-700 hover:shadow-lg"
                                                    }`}
                      >
                        {isShipping ? <>Processing...</> : <>Generate Label</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewOrders;
