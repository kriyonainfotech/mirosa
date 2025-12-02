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
import 'react-country-state-city/dist/react-country-state-city.css'; // Import the default styles
import { Country, State, City } from 'country-state-city'; // ✅ Import data source directly
import { FiSearch, FiCheck, FiX } from 'react-icons/fi'; // Import new icons
import { parsePhoneNumberFromString } from "libphonenumber-js";

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// ✅ Helper function to format the suggested address for the confirmation dialog

const formatAddress = (address) => {
    return `${address.addressLine1}${address.addressLine2 ? `, ${address.addressLine2}` : ''}\n${address.city}, ${address.state} ${address.zipCode}\n${address.country}`;
};

function validatePhoneByCountry(phone, countryCode) {
    const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
    return phoneNumber ? phoneNumber.isValid() : false;
}


export default function CheckoutPage() {
    const { cartItems, cartTotal, cartLoading, cartError, clearCart, setShippingAddress } = useCart();
    const { user, isAuthenticated, login, loadingAuth, logout, authError } = useAuth(); // Get auth state and functions
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

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
    const [localShipping, setLocalShipping] = useState({
        fullName: '', addressLine1: '', addressLine2: '',
        city: '', state: '', country: '', zipCode: '', phoneNumber: ''
    });
    const [shippingSubmitting, setShippingSubmitting] = useState(false);
    const [addressSearch, setAddressSearch] = useState('');
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [zipStatus, setZipStatus] = useState('idle');

    // Order Placement Step
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState("");
    const [phoneError, setPhoneError] = useState("");

    const handlePhoneChange = (e) => {
        const value = e.target.value;

        setLocalShipping(prev => {
            const updated = { ...prev, phoneNumber: value };

            // Get country ISO code, not name
            const countryCode = Country.getAllCountries().find(c => c.name === updated.country)?.isoCode;

            if (countryCode && validatePhoneByCountry(`${updated.phoneCountryCode}${value}`, countryCode)) {
                setPhoneError("");
            } else {
                setPhoneError("Invalid phone number");
            }

            return updated;
        });
    };

    // --- Effects ---
    useEffect(() => {
        if (addressSearch.length < 2) {
            setAddressSuggestions([]);
            return;
        }

        const searchTerm = addressSearch.toLowerCase();

        // Find matching countries
        const countryResults = Country.getAllCountries()
            .filter(c => c.name.toLowerCase().includes(searchTerm))
            .map(c => ({
                type: 'Country',
                name: c.name,
                countryCode: c.isoCode,
                display: `${c.name}`,
            }));

        // Find matching states
        const stateResults = State.getAllStates()
            .filter(s => s.name.toLowerCase().includes(searchTerm))
            .map(s => ({
                type: 'State',
                name: s.name,
                stateCode: s.isoCode,
                countryCode: s.countryCode,
                display: `${s.name}, ${s.countryCode}`,
            }));

        // Find matching cities
        const cityResults = City.getAllCities()
            .filter(city => city.name.toLowerCase().includes(searchTerm))
            .map(city => ({
                type: 'City',
                name: city.name,
                stateCode: city.stateCode,
                countryCode: city.countryCode,
                display: `${city.name}, ${city.stateCode}, ${city.countryCode}`,
            }));

        // Combine and limit results
        const combined = [...countryResults, ...stateResults, ...cityResults];
        setAddressSuggestions(combined.slice(0, 7)); // Show top 7 results

    }, [addressSearch]);


    // ✅ --- NEW HANDLER FOR THE UNIFIED SEARCH ---
    const handleSuggestionClick = (suggestion) => {
        let countryCode = '', stateCode = '', cityName = '';

        if (suggestion.type === 'Country') {
            countryCode = suggestion.countryCode;
        } else if (suggestion.type === 'State') {
            countryCode = suggestion.countryCode;
            stateCode = suggestion.stateCode;
        } else if (suggestion.type === 'City') {
            countryCode = suggestion.countryCode;
            stateCode = suggestion.stateCode;
            cityName = suggestion.name;
        }

        // Use the codes to get full names for display if needed
        const countryName = Country.getCountryByCode(countryCode)?.name || '';
        const stateName = State.getStateByCodeAndCountry(stateCode, countryCode)?.name || '';

        setLocalShipping(prev => ({
            ...prev,
            country: countryName, // Storing full name now, can be changed to code if needed
            state: stateName,
            city: cityName,
        }));

        setAddressSearch('');
        setAddressSuggestions([]);
    };

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
                // if (user?.address) setLocalShipping(user.address);
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

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setLocalShipping(prev => ({ ...prev, [name]: value }));
    };

    // ✅ --- NEW SHIPPING SUBMIT HANDLER WITH ADDRESS VALIDATION ---
    const handleShippingSubmit = async (e) => {
        e.preventDefault();
        setShippingSubmitting(true);

        const { fullName, addressLine1, city, state, zipCode, country, phoneNumber } = localShipping;
        if (!fullName || !addressLine1 || !city || !state || !zipCode || !country || !phoneNumber) {
            toast.error("Please fill in all required shipping address fields.");
            setShippingSubmitting(false);
            return;
        }

        // ✅ New - validate based on selected country
        const fullPhone = `${localShipping.phoneCountryCode}${localShipping.phoneNumber}`;
        const countryIso = localShipping.country; // e.g. "IN", "US" etc.

        if (!validatePhoneByCountry(fullPhone, countryIso)) {
            toast.error("Please enter a valid phone number for your country.");
            setShippingSubmitting(false);
            return;
        }


        try {
            // 1. Call your backend endpoint for validation
            const response = await axios.post(
                `${backdendUrl}/api/order/validate-address`,
                { address: localShipping },
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            const validatedData = response.data.validationResult;
            console.log("FedEx validation result:", validatedData);

            const proceedToNextStep = (fedexAddress) => {
                const finalAddress = {
                    // Keep fields from original input
                    fullName: localShipping.fullName,
                    phoneNumber: `${localShipping.phoneCountryCode}${localShipping.phoneNumber}`,

                    // ✅ FIX: Changed streetLines to streetLinesToken
                    addressLine1: fedexAddress.streetLinesToken[0],
                    addressLine2: fedexAddress.streetLinesToken[1] || '',
                    city: fedexAddress.city,
                    state: fedexAddress.stateOrProvinceCode,
                    zipCode: fedexAddress.postalCode,
                    country: Country.getCountryByCode(fedexAddress.countryCode)?.name || localShipping.country,
                };

                setShippingAddress(finalAddress);
                setStepStatus(prev => ({ ...prev, 2: 'completed', 3: 'active' }));
                setOpenStep(3);
                setCurrentStep(3);
            };

            if (validatedData.customerMessages && validatedData.customerMessages.length > 0) {
                const message = validatedData.customerMessages[0]?.message || "Address could not be validated.";
                toast.error(message);
            } else if (validatedData.attributes.StandardizedStatus === 'STANDARDIZED') {
                toast.info("Address has been standardized by FedEx.");
                proceedToNextStep(validatedData);
            } else {
                toast.success("Address validated!");
                proceedToNextStep(validatedData);
            }

        } catch (error) {
            console.error("Address validation error:", error);
            toast.warn("Could not validate address. Please ensure it's correct.");
            // Fallback: Allow user to proceed even if validation service fails
            // setStepStatus(prev => ({ ...prev, 2: 'completed', 3: 'active' }));
            // setOpenStep(3);
            // setCurrentStep(3);
        } finally {
            setShippingSubmitting(false);
        }
    };


    const handlePlaceOrder = async () => {

        console.log('hello place order')
        const stripe = await loadStripe("pk_test_51RxbBXRyJheFjdaST0Aa5U9fXyvzdAAyO3OvV5Crgs9y7FJ5xbGFtjv9aYYBCa4GZdU9pc79Arcx5Qk5nApi3c0900RRJCemPK")
        setShippingAddress(localShipping);
        const body = {
            products: cartItems,
            paymentMethod: selectedMethod,
            shippingAddress: localShipping,
        }
        console.log(body, 'Order body');
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
                    <div className={`bg-white shadow-md rounded-lg p-6 ${currentStep < 2 ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setOpenStep(openStep === 2 ? null : 2)}>
                            <h2 className="text-xl font-semibold text-gray-700">
                                {stepStatus[2] === 'completed' ? <FiCheckCircle className="inline mr-2 text-green-500" /> : null}
                                2. Shipping Details
                            </h2>
                            {openStep === 2 ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        <div className={`mt-2 overflow-hidden transition-all duration-500 ease-in-out ${openStep === 2 ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
                            <form onSubmit={handleShippingSubmit} className="space-y-4 pt-4">

                                {/* --- Contact Information --- */}
                                <div className="relative">
                                    <input type="text" id="fullName" name="fullName" value={localShipping.fullName} onChange={handleShippingChange} className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer" placeholder=" " required />
                                    <label htmlFor="fullName" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">Full Name</label>
                                </div>

                                {/* --- Address Autocomplete --- */}
                                <div className="relative">
                                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <FiSearch className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        id="addressSearch"
                                        value={addressSearch}
                                        onChange={(e) => setAddressSearch(e.target.value)}
                                        className="block px-2.5 pb-2.5 pt-4 ps-10 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer"
                                        placeholder=" "
                                    />
                                    <label htmlFor="addressSearch" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1 ps-10">Find address (Country, State, or City)</label>
                                    {addressSuggestions.length > 0 && (
                                        <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-48 overflow-y-auto shadow-lg">
                                            {addressSuggestions.map((s, index) => (
                                                <li key={index} onClick={() => handleSuggestionClick(s)} className="px-4 py-2 hover:bg-rose-100 cursor-pointer text-sm flex justify-between items-center">
                                                    <span>{s.display}</span>
                                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{s.type}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                {/* --- Manual Address Fields --- */}
                                <div className="relative">
                                    <input type="text" id="addressLine1" name="addressLine1" value={localShipping.addressLine1} onChange={handleShippingChange} className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer" placeholder=" " required />
                                    <label htmlFor="addressLine1" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">Address Line 1</label>
                                </div>

                                {/* ✅ GRID UPDATED TO 3 COLUMNS TO INCLUDE COUNTRY */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="relative">
                                        <input type="text" id="city" name="city" value={localShipping.city} onChange={handleShippingChange} className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer" placeholder=" " required />
                                        <label htmlFor="city" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">City</label>
                                    </div>
                                    <div className="relative">
                                        <input type="text" id="state" name="state" value={localShipping.state} onChange={handleShippingChange} className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer" placeholder=" " required />
                                        <label htmlFor="state" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">State / Province</label>
                                    </div>
                                    {/* ✅ COUNTRY FIELD ADDED BACK */}
                                    <div className="relative">
                                        <input type="text" id="country" name="country" value={localShipping.country} onChange={handleShippingChange} className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer" placeholder=" " required />
                                        <label htmlFor="country" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">Country</label>
                                    </div>
                                </div>

                                <div className="relative">
                                    <input type="text" id="zipCode" name="zipCode" value={localShipping.zipCode} onChange={handleShippingChange} className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer" placeholder=" " required />
                                    <label htmlFor="zipCode" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">Zip Code</label>
                                </div>

                                {/* --- Phone Number --- */}
                                <div className="flex items-end gap-2">
                                    <div className="relative w-32">
                                        <select id="phoneCountryCode" name="phoneCountryCode" value={localShipping.phoneCountryCode} onChange={handleShippingChange} className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer">
                                            {Country.getAllCountries().map((c) => (
                                                <option key={c.isoCode} value={`+${c.phonecode}`}>{c.isoCode} (+{c.phonecode})</option>
                                            ))}
                                        </select>
                                        <label htmlFor="phoneCountryCode" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2">Code</label>
                                    </div>
                                    <div className="relative flex-grow">
                                        <input type="tel" id="phoneNumber" name="phoneNumber" value={localShipping.phoneNumber} onChange={handlePhoneChange} className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-lg border-1 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-rose-600 peer" placeholder=" " required />
                                        <label htmlFor="phoneNumber" className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-rose-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-1">
                                            Phone Number
                                            {phoneError && (
                                                <span className="ml-2 text-red-500 text-xs">({phoneError})</span>
                                            )}
                                        </label>
                                    </div>
                                </div>

                                <button type="submit" disabled={shippingSubmitting || currentStep < 2} className="w-full bg-rose-800 text-white py-3 rounded-md text-lg font-semibold hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    {shippingSubmitting ? 'Validating Address...' : 'Continue to Order Summary'}
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
                                {localShipping.fullName ? (
                                    <div className="text-sm text-gray-700 space-y-1 mb-4 border-b border-gray-900/30 pb-4">
                                        <p className="font-semibold">{localShipping.fullName}</p>
                                        <p>{localShipping.addressLine1}</p>
                                        {localShipping.addressLine2 && <p>{localShipping.addressLine2}</p>}
                                        <p>{localShipping.city}, {localShipping.state} - {localShipping.zipCode}</p>
                                        <p>{localShipping.country}</p>
                                        <p>Phone: {localShipping.phoneNumber}</p>
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
                                    disabled={isPlacingOrder || currentStep < 3 || !localShipping.fullName || !cartItems.length}
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