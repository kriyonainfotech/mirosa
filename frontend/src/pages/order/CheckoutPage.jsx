// src/pages/CheckoutPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiChevronDown, FiChevronUp } from 'react-icons/fi'; // Icons for steps
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { loadStripe } from "@stripe/stripe-js";
import { HiArrowNarrowLeft } from "react-icons/hi";

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

export default function CheckoutPage() {
    const { cartItems, cartTotal, cartLoading, cartError, clearCart } = useCart();
    const { user, isAuthenticated, login, loadingAuth, logout, authError } = useAuth(); // Get auth state and functions
    const navigate = useNavigate();

    // --- State Management for Checkout Steps ---
    const [currentStep, setCurrentStep] = useState(1); // 1: Auth, 2: Shipping, 3: Order Summary
    const [stepStatus, setStepStatus] = useState({
        1: 'pending',
        2: 'pending',
        3: 'pending',
    });
    const [openStep, setOpenStep] = useState(1); // Controls which accordion is open

    // Auth Step
    const [isRegistering, setIsRegistering] = useState(false); // Toggle between login/register form
    const [authFormData, setAuthFormData] = useState({
        name: '', email: '', password: '', confirmPassword: '' // For register
    });
    const [loginFormData, setLoginFormData] = useState({
        email: '', password: '' // For login
    });
    const [authSubmitting, setAuthSubmitting] = useState(false); // Loading state for auth forms

    // Shipping Step
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '', addressLine1: '', addressLine2: '',
        city: '', state: '', zipCode: '', country: '', phoneNumber: ''
    });
    const [shippingSubmitting, setShippingSubmitting] = useState(false);

    // Order Placement Step
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState("");

    // --- Effects ---

    // Redirect if cart is empty after loading
    useEffect(() => {
        if (!cartLoading && cartItems.length === 0) {
            toast.warn("Your cart is empty. Please add items before checking out.");
            navigate('/cart');
        }
    }, [cartLoading, cartItems, navigate]);

    // Handle initial step based on authentication status
    useEffect(() => {
        if (!cartLoading && cartItems.length > 0) {
            if (isAuthenticated) {
                // If logged in, skip auth step, open shipping, mark auth as complete
                setCurrentStep(2);
                setOpenStep(2);
                setStepStatus(prev => ({ ...prev, 1: 'completed', 2: 'active' }));
                // Attempt to pre-fill address from user profile if available (future enhancement)
                // if (user?.address) setShippingAddress(user.address);
            } else {
                // If not logged in, start at auth step
                setCurrentStep(1);
                setOpenStep(1);
                setStepStatus(prev => ({ ...prev, 1: 'active' }));
            }
        }
    }, [isAuthenticated, cartLoading, cartItems]); // Depend on isAuthenticated and cart data


    // --- Handlers for Authentication Step (Step 1) ---

    const handleAuthFormChange = (e) => {
        const { name, value } = e.target;
        if (isRegistering) {
            setAuthFormData(prev => ({ ...prev, [name]: value }));
        } else {
            setLoginFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setAuthSubmitting(true);
        if (authFormData.password !== authFormData.confirmPassword) {
            toast.error("Passwords do not match.");
            setAuthSubmitting(false);
            return;
        }
        try {
            const response = await axios.post(`${backdendUrl}/api/auth/register`, authFormData); // ✅ Your register API
            if (response.data.success) {
                toast.success("Registration successful! You are now logged in.");
                // login(response.data.user, response.data.token); // Use your auth context login function
                // CartContext's useEffect will handle merging guest cart on isAuthenticated change
                setStepStatus(prev => ({ ...prev, 1: 'completed', 2: 'active' }));
                setOpenStep(2); // Open next step
                setCurrentStep(2);
            } else {
                toast.error(response.data.message || "Registration failed.");
            }
        } catch (error) {
            console.error("Registration error:", error);
            toast.error(error.response?.data?.message || "An error occurred during registration.");
        } finally {
            setAuthSubmitting(false);
        }
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setAuthSubmitting(true);
        try {
            const response = await axios.post(`${backdendUrl}/api/auth/login-user`, loginFormData); // ✅ Your login API
            if (response.data.success) {
                toast.success("Login successful!");
                // login(response.data.user, response.data.token); // Use your auth context login function
                // CartContext's useEffect will handle merging guest cart on isAuthenticated change
                setStepStatus(prev => ({ ...prev, 1: 'completed', 2: 'active' }));
                setOpenStep(2); // Open next step
                setCurrentStep(2);
            } else {
                toast.error(response.data.message || "Login failed.");
            }
        } catch (error) {
            console.error("Login error:", error);
            toast.error(error.response?.data?.message || "An error occurred during login.");
        } finally {
            setAuthSubmitting(false);
        }
    };

    // --- Handlers for Shipping Step (Step 2) ---

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleShippingSubmit = (e) => {
        e.preventDefault();
        setShippingSubmitting(true);
        // Basic validation
        const { fullName, addressLine1, city, state, zipCode, phoneNumber } = shippingAddress;
        if (!fullName || !addressLine1 || !city || !state || !zipCode || !phoneNumber) {
            toast.error("Please fill in all required shipping address fields.");
            setShippingSubmitting(false);
            return;
        }
        // Assuming address is valid, move to next step
        setStepStatus(prev => ({ ...prev, 2: 'completed', 3: 'active' }));
        setOpenStep(3); // Open next step
        setCurrentStep(3);
        setShippingSubmitting(false);
    };

    // --- Handlers for Order Placement (Step 3) ---
    // setIsPlacingOrder(true);
    // toast.info("Processing your order...");

    // // ✅ This is where the actual backend API call to create the order will go
    // // For now, it's simulated.
    // try {
    //     // Replace this with your actual order creation API call
    //     const token = localStorage.getItem('token');
    //     const config = { headers: { Authorization: `Bearer ${token}` } };
    //     const orderData = {
    //         cartItems: cartItems.map(item => ({
    //             productId: item.productId,
    //             variantId: item.variantId,
    //             quantity: item.quantity,
    //             priceAtPurchase: item.variantDetails.price,
    //             nameAtPurchase: item.name,
    //             mainImageAtPurchase: item.mainImage
    //         })),
    //         shippingAddress: shippingAddress,
    //         totalAmount: cartTotal,
    //         paymentMethod: 'Card', // Hardcoded for mock, would come from selection
    //         paymentStatus: 'Paid', // Assuming payment success for mock
    //     };
    //     const response = await axios.post(`${backdendUrl}/api/order/createOrder`, orderData, config);

    //     if (response.data.success) {
    //         toast.success("Order placed successfully!");
    //         clearCart(); // Clear cart after successful order
    //         // navigate(`/order-confirmation/${response.data.orderId}`);
    //     } else {
    //         toast.error(response.data.message || "Failed to place order.");
    //     }

    //     // Simulation of order placement
    //     setTimeout(() => {
    //         // const mockOrderId = `ORD-${Date.now()}`;
    //         // toast.success("Order placed successfully! (Simulated)");
    //         clearCart(); // Clear cart after simulated success
    //         navigate(`/profile?tab=orders`);
    //     }, 2000);

    // } catch (error) {
    //     console.error("Order placement error:", error);
    //     toast.error(error.response?.data?.message || "An error occurred while placing your order.");
    // } finally {
    //     setIsPlacingOrder(false);
    // }
    const handlePlaceOrder = async () => {

        console.log('hello place order')
        const stripe = await loadStripe("pk_test_51RxbBXRyJheFjdaST0Aa5U9fXyvzdAAyO3OvV5Crgs9y7FJ5xbGFtjv9aYYBCa4GZdU9pc79Arcx5Qk5nApi3c0900RRJCemPK")

        const body = {
            products: cartItems,
            paymentMethod: selectedMethod,
            shippingAddress: shippingAddress,
        }

        const response = await axios.post(`${backdendUrl}/api/payment/create-checkout`, body, {
            headers: {
                "Content-type": "application/json"
            }
        })

        console.log(response, 'response')

        const session = response.data;

        const result = stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            console.log(result.error);
        }
    };

    // --- Conditional Rendering for Initial States ---
    if (cartLoading) {
        return (
            <div className="flex justify-center items-center h-screen mt-30">
                <p className="text-xl text-gray-700">Loading cart for checkout...</p>
            </div>
        );
    }

    if (cartError) {
        return (
            <div className="px-6 py-10 mt-30 max-w-7xl mx-auto text-center bg-white shadow-md rounded-lg text-red-600">
                <p className="text-2xl font-semibold mb-4">Error: {cartError}</p>
                <Link to="/cart" className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
                    Back to Cart
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return null; // Will be redirected by useEffect
    }


    // --- Checkout Page Layout ---
    return (
        <div className="px-4 py-8 max-w-7xl mx-auto min-h-screen mt-30">
            {/* 🔙 Back Button */}
            <button
                onClick={() => navigate(-1)} // goes back one step in history
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
                <HiArrowNarrowLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Back</span>
            </button>

            <h1 className="text-4xl font-bold text-center text-gray-800 mb-10 fraunces">
                Checkout
            </h1>

            {/* Progress Timeline */}
            <div className="flex justify-between items-center mb-10 max-w-2xl mx-auto relative">
                {[1, 2, 3].map(step => (
                    <React.Fragment key={step}>
                        {step > 1 && (
                            <div className={`flex-1 h-1 ${stepStatus[step - 1] === 'completed' || stepStatus[step - 1] === 'active' ? 'bg-rose-900' : 'bg-gray-300'}`}></div>
                        )}
                        <div
                            className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold transition-all duration-300
                                ${stepStatus[step] === 'completed' ? 'bg-rose-900' :
                                    stepStatus[step] === 'active' ? 'bg-rose-700' : 'bg-gray-400'
                                }`}
                            onClick={() => setOpenStep(step)} // Allow clicking to open step (if currentStep allows)
                        >
                            {stepStatus[step] === 'completed' ? <FiCheckCircle className="text-white" /> : step}
                            <span className={`absolute -bottom-6 text-xs whitespace-nowrap transition-colors duration-300
                                ${stepStatus[step] === 'active' ? 'text-rose-900 font-semibold' : 'text-gray-600'}`}>
                                {step === 1 && "Authentication"}
                                {step === 2 && "Shipping"}
                                {step === 3 && "Order Summary"}
                            </span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
            <div className="mb-10 max-w-2xl mx-auto relative h-6"></div> {/* Spacer for step labels */}


            <div className="flex flex-col lg:flex-row gap-8">
                {/* Left Section: Step Forms (Authentication & Shipping) */}
                <div className="lg:w-2/3 space-y-6">

                    {/* Step 1: Authentication */}
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenStep(openStep === 1 ? null : 1)}>
                            <h2 className="text-xl font-semibold text-gray-700">
                                {stepStatus[1] === 'completed' ? <FiCheckCircle className="inline mr-2 text-green-500" /> : null}
                                1. Authentication
                            </h2>
                            {isAuthenticated && <span className="text-green-600">Logged in as {user?.email}</span>}
                            {openStep === 1 ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        <div className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${openStep === 1 ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                            {isAuthenticated ? (
                                <div className="text-gray-700 py-4">
                                    <p>You are logged in as **{user?.name}** ({user?.email}).</p>
                                    <button onClick={logout} className="mt-4 text-red-500 hover:underline">
                                        Not {user?.name}? Logout
                                    </button>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <div className="flex justify-center mb-6">
                                        <button
                                            onClick={() => setIsRegistering(false)}
                                            className={`px-4 py-2 border rounded-l-md ${!isRegistering ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            Login
                                        </button>
                                        <button
                                            onClick={() => setIsRegistering(true)}
                                            className={`px-4 py-2 border rounded-r-md ${isRegistering ? 'bg-violet-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                                        >
                                            Register
                                        </button>
                                    </div>

                                    {isRegistering ? (
                                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="regName" className="block text-sm font-medium text-gray-700">Name</label>
                                                <input type="text" id="regName" name="name" value={authFormData.name} onChange={handleAuthFormChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                            </div>
                                            <div>
                                                <label htmlFor="regEmail" className="block text-sm font-medium text-gray-700">Email</label>
                                                <input type="email" id="regEmail" name="email" value={authFormData.email} onChange={handleAuthFormChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                            </div>
                                            <div>
                                                <label htmlFor="regPassword" className="block text-sm font-medium text-gray-700">Password</label>
                                                <input type="password" id="regPassword" name="password" value={authFormData.password} onChange={handleAuthFormChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                            </div>
                                            <div>
                                                <label htmlFor="regConfirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                                <input type="password" id="regConfirmPassword" name="confirmPassword" value={authFormData.confirmPassword} onChange={handleAuthFormChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                            </div>
                                            <button type="submit" disabled={authSubmitting || loadingAuth} className="w-full bg-rose-800 text-white py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                                {authSubmitting || loadingAuth ? 'Processing...' : 'Register'}
                                            </button>
                                        </form>
                                    ) : (
                                        <form onSubmit={handleLoginSubmit} className="space-y-4">
                                            <div>
                                                <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700">Email</label>
                                                <input type="email" id="loginEmail" name="email" value={loginFormData.email} onChange={handleAuthFormChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                            </div>
                                            <div>
                                                <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700">Password</label>
                                                <input type="password" id="loginPassword" name="password" value={loginFormData.password} onChange={handleAuthFormChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                            </div>
                                            <button type="submit" disabled={authSubmitting || loadingAuth} className="w-full bg-rose-800 text-white py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed">
                                                {authSubmitting || loadingAuth ? 'Processing...' : 'Login'}
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Shipping Details */}
                    <div className={`bg-white shadow-md rounded-lg p-6 ${currentStep < 2 ? 'opacity-50 pointer-events-none' : ''}`}> {/* Visually disable if not active step */}
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenStep(openStep === 2 ? null : 2)}>
                            <h2 className="text-xl font-semibold text-gray-700">
                                {stepStatus[2] === 'completed' ? <FiCheckCircle className="inline mr-2 text-green-500" /> : null}
                                2. Shipping Details
                            </h2>
                            {openStep === 2 ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        <div className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${openStep === 2 ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                            <form onSubmit={handleShippingSubmit} className="space-y-6 pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input type="text" id="fullName" name="fullName" value={shippingAddress.fullName} onChange={handleShippingChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                    </div>
                                    <div>
                                        <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <input type="tel" id="phoneNumber" name="phoneNumber" value={shippingAddress.phoneNumber} onChange={handleShippingChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">Address Line 1</label>
                                    <input type="text" id="addressLine1" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleShippingChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" placeholder="House number, Street name" required />
                                </div>
                                <div>
                                    <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">Address Line 2 (Optional)</label>
                                    <input type="text" id="addressLine2" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleShippingChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" placeholder="Apartment, suite, unit, building, floor etc." />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                        <input type="text" id="city" name="city" value={shippingAddress.city} onChange={handleShippingChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                    </div>
                                    <div>
                                        <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                                        <input type="text" id="state" name="state" value={shippingAddress.state} onChange={handleShippingChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                    </div>
                                    <div>
                                        <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
                                        <input type="text" id="zipCode" name="zipCode" value={shippingAddress.zipCode} onChange={handleShippingChange} className="mt-1 block w-full p-2 focus:outline-none border-b border-gray-900/40" required />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={shippingSubmitting || currentStep < 2}
                                    className="w-full bg-rose-800 text-white py-2 rounded-md text-lg font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {shippingSubmitting ? 'Saving Address...' : 'Continue to Order Summary'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Step 3: Order Summary & Placement */}
                    <div className={`bg-white shadow-md rounded-lg p-6 ${currentStep < 3 ? 'opacity-50 pointer-events-none' : ''}`}> {/* Visually disable if not active step */}
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenStep(openStep === 3 ? null : 3)}>
                            <h2 className="text-xl font-semibold text-gray-700">
                                {stepStatus[3] === 'completed' ? <FiCheckCircle className="inline mr-2 text-green-500" /> : null}
                                3. Order Summary & Payment
                            </h2>
                            {openStep === 3 ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        <div className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${openStep === 3 ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                            <div className="py-4">
                                {/* Order Review */}
                                <h3 className="text-lg font-bold text-gray-600 mb-2 nunito">Items in Cart:</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto mb-4 border-b border-gray-900/30 pb-4">
                                    {cartItems.map(item => (
                                        <div key={item._id} className="flex justify-between items-center text-sm text-gray-700">
                                            <div className="flex items-center space-x-2" >
                                                <img src={item.mainImage} alt={item.name} className="w-10 h-10 object-cover rounded" />
                                                <span>{item.name} (x{item.quantity})</span>
                                            </div>
                                            <span>${(item.variantDetails?.price * item.quantity).toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping Address Review */}
                                <h3 className="text-lg font-bold text-gray-600 mb-2 nunito">Shipping To:</h3>
                                {shippingAddress.fullName ? (
                                    <div className="text-sm text-gray-700 space-y-1 mb-4 border-b border-gray-900/30 pb-4">
                                        <p className="font-semibold">{shippingAddress.fullName}</p>
                                        <p>{shippingAddress.addressLine1}</p>
                                        {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                                        <p>{shippingAddress.city}, {shippingAddress.state} - {shippingAddress.zipCode}</p>
                                        <p>{shippingAddress.country}</p>
                                        <p>Phone: {shippingAddress.phoneNumber}</p>
                                        <button onClick={() => { setCurrentStep(2); setOpenStep(2); setStepStatus(prev => ({ ...prev, 2: 'active', 3: 'pending' })); }} className="text-blue-600 hover:underline text-xs mt-2">
                                            Change Address
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-red-500 mb-4">Shipping address not provided. Please complete Step 2.</p>
                                )}

                                {/* Payment Method (Simple placeholder for now) */}
                                <div className="mb-4 pb-4 space-y-2">
                                    <h3 className="text-lg font-bold text-gray-600 mb-2 nunito">Payment Method:</h3>
                                    <div className="text-sm text-gray-700 mb-4 pb-4 space-y-2">
                                        <label className="flex items-center gap-3 p-3 focus:outline-none border-b border-gray-900/40 cursor-pointer hover:bg-gray-50">
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="card"
                                                checked={selectedMethod === "card"}
                                                onChange={(e) => setSelectedMethod(e.target.value)}
                                                className="accent-violet-700 w-4 h-4"
                                            />
                                            <span className="font-medium">Credit / Debit Card</span>

                                            {/* Accepted card logos */}
                                            <div className="flex items-center gap-2 ml-4">
                                                <img src="https://img.icons8.com/color/36/visa.png" alt="Visa" className="h-6" />
                                                <img src="https://img.icons8.com/color/36/mastercard-logo.png" alt="MasterCard" className="h-6" />
                                                <img src="https://img.icons8.com/color/36/amex.png" alt="Amex" className="h-6" />
                                                <img src="https://img.icons8.com/color/36/discover.png" alt="Discover" className="h-6" />
                                            </div>
                                        </label>
                                    </div>

                                    {/* <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="amazon_pay"
                                            checked={selectedMethod === "amazon_pay"}
                                            onChange={(e) => setSelectedMethod(e.target.value)}
                                        />
                                        Amazon Pay
                                    </label>
                                    <label className="flex items-center gap-2">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="apple_pay"
                                            checked={selectedMethod === "apple_pay"}
                                            onChange={(e) => setSelectedMethod(e.target.value)}
                                        />
                                        Apple Pay
                                    </label> */}
                                </div>


                                {/* Final Total */}
                                <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-xl text-gray-800">
                                    <span>Order Total</span>
                                    <span>${cartTotal.toFixed(2)}</span>
                                </div>

                                {/* Place Order Button */}
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={isPlacingOrder || currentStep < 3 || !shippingAddress.fullName || !cartItems.length}
                                    className="w-full bg-rose-900 cursor-pointer text-white py-3 rounded-md text-lg font-semibold hover:bg-rose-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                                >
                                    {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Section: Fixed Order Summary (always visible) */}
                <div className="lg:w-1/3 bg-white shadow-md rounded-lg p-6 h-fit sticky top-24">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-6 border-b border-gray-900/30 pb-4">Order Summary</h2>
                    <div className="space-y-3 text-gray-700">
                        {cartItems.map(item => (
                            <div key={item._id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                                <span className="font-medium">{item.name} (x{item.quantity})</span>
                                <span>${(item.variantDetails?.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t border-gray-200 pt-3 font-bold text-xl">
                            {/* <span>Total ({cartItemCount} items)</span> */}
                            <span>${cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}