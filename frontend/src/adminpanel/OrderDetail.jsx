import React from "react";

export default function OrderDetail({ order, onClose }) {
    if (!order) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <section className="w-full max-w-5xl max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold">Order Details - #{order._id}</h2>
                    <button variant="outline" onClick={onClose}>
                        Close
                    </button>
                </div>

                <div className="h-[75vh] p-6 space-y-8">
                    {/* Order Summary */}
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                            <div><strong>Status:</strong> {order.status}</div>
                            <div><strong>Placed On:</strong> {new Date(order.createdAt).toLocaleString()}</div>
                            <div><strong>Total Amount:</strong> ₹{order.totalAmount}</div>
                            <div><strong>Payment:</strong> {order.paymentMethod} ({order.paymentStatus})</div>
                        </div>
                    </section>

                    {/* Customer Info */}
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Customer Info</h3>
                        <div className="text-sm text-gray-700">
                            <p><strong>Name:</strong> {order.user?.name}</p>
                            <p><strong>Email:</strong> {order.user?.email}</p>
                        </div>
                    </section>

                    {/* Shipping Info */}
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Shipping Address</h3>
                        <div className="text-sm text-gray-700">
                            <p>{order.shippingAddress?.fullName}</p>
                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.country}</p>
                        </div>
                    </section>

                    {/* Items Ordered */}
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Items Ordered</h3>
                        <div className="space-y-4">
                            {order.cartItems.map((item) => (
                                <div key={item._id} className="flex items-start space-x-4 border p-4 rounded-xl">
                                    <img
                                        src={item.mainImageAtPurchase}
                                        alt={item.nameAtPurchase}
                                        className="w-20 h-20 object-cover rounded-md"
                                    />
                                    <div className="text-sm text-gray-700">
                                        <p className="font-medium">{item.nameAtPurchase}</p>
                                        <p>Quantity: {item.quantity}</p>
                                        <p>Price: ₹{item.priceAtPurchase}</p>
                                        <p className="text-xs text-gray-500">Variant ID: {item.variantId}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Admin Actions */}
                    <section>
                        <h3 className="text-lg font-semibold mb-2">Admin Actions</h3>
                        <div className="flex gap-4">
                            <select
                                className="border border-gray-300 p-2 rounded-md"
                                value={order.status}
                                onChange={(e) => console.log("Change Status to:", e.target.value)}
                            >
                                <option value="placed">Placed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <button variant="outline" onClick={() => console.log("Refund Initiated")}>Refund</button>
                            <button variant="destructive" onClick={() => console.log("Cancel Order")}>Cancel</button>
                        </div>
                    </section>
                </div>
            </section>
        </div>
    );
}
