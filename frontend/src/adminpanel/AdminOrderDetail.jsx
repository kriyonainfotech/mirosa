import React from "react";

const AdminOrderDetail = ({ order }) => {
    return (
        <div className="p-6 space-y-6">
            {/* Order Summary */}
            <div>
                <div className="grid grid-cols-2 gap-4 p-4 text-sm">
                    <div>
                        <p className="font-semibold">Order ID:</p>
                        <p>{order._id}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Date:</p>
                        <p>{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Payment:</p>
                        <p>{order.paymentMethod} ({order.paymentStatus})</p>
                    </div>
                    <div>
                        <p className="font-semibold">Total:</p>
                        <p>₹{order.totalAmount}</p>
                    </div>
                </div>
            </div>

            {/* Customer Info */}
            <div>
                <div className="p-4 text-sm">
                    <h3 className="font-bold text-base mb-2">Customer Info</h3>
                    <p><strong>Name:</strong> {order.user.name}</p>
                    <p><strong>Email:</strong> {order.user.email}</p>
                </div>
            </div>

            {/* Shipping Info */}
            <div>
                <div className="p-4 text-sm">
                    <h3 className="font-bold text-base mb-2">Shipping Address</h3>
                    <p>{order.shippingAddress.fullName}, {order.shippingAddress.city}, {order.shippingAddress.state}</p>
                    <p>{order.shippingAddress.country}</p>
                </div>
            </div>

            {/* Item List */}
            <div>
                <div className="p-4 text-sm bg-gray-50 rounded-lg border">
                    <h3 className="font-bold text-base mb-4 text-gray-800">Ordered Items (Customs Data)</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead>
                                <tr className="border-b text-gray-500 text-xs uppercase">
                                    <th className="pb-2">Product</th>
                                    <th className="pb-2">Qty</th>
                                    <th className="pb-2">Price</th>
                                    <th className="pb-2">HS Code</th>
                                    <th className="pb-2">Origin</th>
                                    <th className="pb-2">Weight</th>
                                </tr>
                            </thead>
                            <tbody className="space-y-4">
                                {order.cartItems.map((item) => (
                                    <tr key={item._id} className="border-b last:border-0">
                                        <td className="py-3 flex items-center gap-3">
                                            <img src={item.mainImageAtPurchase} alt="" className="w-10 h-10 rounded object-cover" />
                                            <span className="font-medium text-gray-900">{item.nameAtPurchase}</span>
                                        </td>
                                        <td className="py-3 text-gray-600">{item.quantity}</td>
                                        <td className="py-3 text-gray-600">₹{item.priceAtPurchase}</td>

                                        {/* ✅ NEW FIELDS DISPLAY */}
                                        <td className="py-3 text-gray-600 font-mono text-xs">
                                            {item.hsCodeAtPurchase || "N/A"}
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {item.countryOfOriginAtPurchase || "N/A"}
                                        </td>
                                        <td className="py-3 text-gray-600">
                                            {item.weightAtPurchase ? `${item.weightAtPurchase} ${item.weightUnitAtPurchase}` : "N/A"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Shipment Details Section (If shipped) */}
            {order.trackingNumber && (
                <div className="p-4 bg-green-50 border border-green-200 rounded text-sm">
                    <h3 className="font-bold text-green-800 mb-2">Shipment Created</h3>
                    <p><strong>Tracking:</strong> {order.trackingNumber}</p>
                    {order.shipmentDetails?.labelURL && (
                        <a href={order.shipmentDetails.labelURL} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                            Download Shipping Label
                        </a>
                    )}
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-end">
                <button variant="default">Mark as Shipped</button>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
