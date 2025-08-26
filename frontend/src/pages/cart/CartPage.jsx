// src/pages/CartPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash } from 'react-icons/fa'; // For the delete icon
import { FiMinus, FiPlus } from 'react-icons/fi'; // For quantity buttons
import { useCart } from '../../context/CartContext';

export default function CartPage() {
    // ✅ Get cart state and functions from your CartContext
    const {
        cartItems,
        cartLoading,
        cartError,
        updateCartItemQuantity,
        removeFromCart,
        cartTotal,
        cartItemCount,
    } = useCart();

    // Helper for quantity change
    const handleQuantityChange = (itemId, currentQuantity, change, stock) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity < 1) {
            // If new quantity is 0 or less, confirm removal
            if (window.confirm("Are you sure you want to remove this item from your cart?")) {
                removeFromCart(itemId);
            }
        } else if (newQuantity > stock) {
            toast.error(`Only ${stock} items are available in stock.`);
        } else {
            updateCartItemQuantity(itemId, newQuantity);
        }
    };

    // Helper to calculate item subtotal
    const calculateItemSubtotal = (item) => {
        return (item.quantity * (item.variantDetails?.price || 0)).toFixed(2);
    };

    console.log('cartitems', cartItems)

    // --- Conditional Rendering for Loading, Error, Empty Cart ---
    if (cartLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-rose-900 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-xl text-gray-700">Loading your cart...</p>
                </div>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="px-6 py-10 max-w-7xl mx-auto text-center shadow-md rounded-lg mt-10 text-red-600">
                <p className="text-2xl font-semibold mb-4">Error Loading Cart</p>
                <p className="text-gray-700 mb-6">{cartError}</p>
                <Link to="/shop" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="px-6 py-10 max-w-7xl mx-auto text-center h-96 mt-40 nunito">
                <svg className="w-20 h-20 text-gray-400 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.182 1.769.707 1.769H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <p className="text-2xl font-semibold text-gray-700 mb-4">Your Cart is Empty</p>
                <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet. Start exploring!</p>
                <Link to="/shop" className="bg-maroon text-white px-6 py-3 rounded-md transition">
                    Start Shopping
                </Link>
            </div>
        );
    }

    // --- Main Cart Display ---
    return (
        <div className="px-4 py-10 max-w-full mx-5 min-h-screen mt-30">
            <h1 className="text-4xl font-semibold text-center text-maroon mb-12 fraunces">Your Shopping Bag</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-3">
                    {cartItems.map(item => (
                        <div
                            key={item._id || item.variantId}
                            className=" border border-rose-900/30 bg-white/50 rounded flex flex-col sm:flex-row p-4 gap-6"
                        >
                            {/* Image */}
                            <div className="flex-shrink-0">
                                <Link to={`/products/${item.productId}`}>
                                    <img
                                        src={item.mainImage || 'https://placehold.co/100x100/E0E0E0/6C6C6C?text=No+Img'}
                                        alt={item.name}
                                        className="w-30 h-30 object-cover"
                                    />
                                </Link>
                            </div>

                            {/* Details */}
                            <div className="flex-grow nunito py-2">
                                <Link to={`/products/${item.productId}`}>
                                    <h2 className="text-lg font-semibold text-gray-700">
                                        {item.name}
                                    </h2>
                                </Link>
                                <p className="text-sm text-gray-600 mt-1">
                                    Material: {item.variantDetails?.material || 'N/A'} <br />
                                    Purity: {item.variantDetails?.purity || 'N/A'} |
                                    {item.variantDetails?.selectedSize && ` Size: ${item.variantDetails.selectedSize}`}
                                    {/* {item.variantDetails?.selectedSize && ` SKU: ${item.variantDetails.sku}`} */}
                                </p>
                                <p className="text-md font-semibold text-gray-800 mt-2">
                                    Price : ${item.variantDetails?.price || '0.00'}
                                </p>
                            </div>

                            {/* Quantity & Remove */}
                            <div className="flex sm:flex-col justify-between items-center sm:items-end gap-4">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => handleQuantityChange(item._id || item.variantId, item.quantity, -1, item.stock)}
                                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={item.quantity <= 1}
                                    >
                                        <FiMinus />
                                    </button>
                                    <span className="w-8 text-center text-lg font-medium">
                                        {item.quantity}
                                    </span>
                                    <button
                                        onClick={() => handleQuantityChange(item._id || item.variantId, item.quantity, 1, item.stock)}
                                        className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={item.quantity >= (item.stock || Infinity)}
                                    >
                                        <FiPlus />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item._id || item.variantId)}
                                    className="text-sm text-red-500 hover:text-red-700 flex items-center nunito gap-1"
                                >
                                    <FaTrash className="w-4 h-4" /> Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 bg-white/50 border border-rose-900/30 rounded p-6 h-fit sticky top-28 nunito">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>

                    <div className="space-y-4 text-gray-700">
                        <div className="flex justify-between">
                            <span>Items ({cartItemCount})</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>

                    <Link to={'/checkout'} className="block text-center mt-8 w-full nunito bg-maroon text-white py-3 rounded font-semibold hover:opacity-90 transition">
                        Proceed to Checkout
                    </Link>
                </div>
            </div>
        </div>
    );

}