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
                <div className="p-4 text-sm">
                    <h3 className="font-bold text-base mb-4">Ordered Items</h3>
                    <section className="h-72 pr-2">
                        <ul className="space-y-4">
                            {order.cartItems.map((item) => (
                                <li key={item._id} className="flex items-start gap-4">
                                    <img src={item.mainImageAtPurchase} alt="" className="w-16 h-16 rounded object-cover" />
                                    <div>
                                        <p className="font-semibold">{item.nameAtPurchase}</p>
                                        <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                                        <p className="text-gray-600 text-sm">₹{item.priceAtPurchase} each
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>

            {/* Controls */}
            <div className="flex justify-end">
                <button variant="default">Mark as Shipped</button>
            </div>
        </div>
    );
};

export default AdminOrderDetail;
