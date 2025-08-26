import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import { toast } from "react-toastify";
import { useCart } from "../../context/CartContext";
// adjust import path to your cart context

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const navigate = useNavigate();
    const { cartItems, clearCart, cartTotal, shippingAddress } = useCart();

    const [countdown, setCountdown] = useState(5);
    const [orderCreated, setOrderCreated] = useState(false);
    const hasCreatedOrder = useRef(false);

    useEffect(() => {
        const createOrder = async () => {
            try {
                const token = localStorage.getItem("token");
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const orderData = {
                    cartItems: cartItems.map(item => ({
                        productId: item.productId,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        priceAtPurchase: item.variantDetails.price,
                        nameAtPurchase: item.name,
                        mainImageAtPurchase: item.mainImage,
                    })),
                    shippingAddress,
                    totalAmount: cartTotal,
                    paymentMethod: "Card",
                    paymentStatus: "Paid",
                    stripeSessionId: sessionId,
                };

                const res = await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/order/createOrder`,
                    orderData,
                    config
                );

                if (res.data.success) {
                    toast.success("Order placed successfully!");
                    clearCart();
                    setOrderCreated(true);
                } else {
                    toast.error(res.data.message || "Order failed to save.");
                }
            } catch (err) {
                console.error("Error creating order:", err);
                toast.error("Failed to create order after payment.");
            }
        };

        if (sessionId && cartItems.length > 0 && !hasCreatedOrder.current) {
            hasCreatedOrder.current = true; // 🚫 block future calls
            createOrder();
        }
    }, [sessionId, cartItems, cartTotal, shippingAddress, clearCart, navigate]);


    // Countdown once order is created
    useEffect(() => {
        if (!orderCreated) return;

        if (countdown === 0) {
            navigate("/profile?tab=orders");
        }

        const timer = setTimeout(() => {
            setCountdown(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown, orderCreated, navigate]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 px-4">
            <FiCheckCircle className="text-green-600 text-6xl mb-4" />
            <h1 className="text-3xl font-bold text-green-800 mb-2">Payment Successful!</h1>
            <p className="text-gray-700 mb-6">
                Thank you for your purchase. Your order is being processed.
            </p>

            {sessionId && (
                <p className="text-sm text-gray-500 mb-6">
                    Stripe Session ID: <span className="font-mono">{sessionId}</span>
                </p>
            )}

            {orderCreated ? (
                <p className="text-gray-500">
                    Redirecting you to your orders in{" "}
                    <span className="font-bold">{countdown}</span> seconds...
                </p>
            ) : (
                <p className="text-gray-500">Creating your order...</p>
            )}
        </div>
    );
}
