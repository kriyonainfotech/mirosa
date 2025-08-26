import React from 'react';
import logo from '../../../public/logo/marron_icon.png'; // update with your actual path
import { Link } from 'react-router-dom';
import { useState } from "react";
import axios from "axios";
import { encryptData } from "../../utils/secureStorage"; // assuming you already made this
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
import { toast } from 'react-toastify';

export default function Signup() {

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        password: "",
        confirmPassword: "",
        termsAccepted: false,
    });

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!formData.termsAccepted) {
            return setError("You must agree to the Terms & Conditions.");
        }

        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match.");
        }

        try {
            const res = await axios.post(`${backendUrl}/api/auth/register-user`, {
                name: formData.name,
                phone: formData.phone,
                email: formData.email,
                password: formData.password,
            });

            // Save encrypted user & token
            localStorage.setItem("user", encryptData(res.data.user));
            localStorage.setItem("token", encryptData(res.data.token));

            // setSuccess("Account created successfully!");
            toast.success("Account created successfully!");
            navigate("/login"); // or show modal, etc.
        } catch (err) {
            // toast.error("Someth+ing went wrong!");
            setError(err.response?.data?.message || "Something went wrong");
            console.log(err);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-6">
            <div className="w-full max-w-6xl rounded-xl flex flex-col md:flex-row overflow-hidden">

                {/* Left Side Banner / Image */}
                <div className="md:w-1/2 hidden md:flex items-center justify-center text-white p-8">
                    <Link to={'/'}>
                        <div className="text-center space-y-4">
                            <img src={logo} alt="Mirosa Logo" className="w-84 mx-auto" />
                            <h2 className="text-2xl nunito mb-0 text-gray-900">Join the Elegance</h2>
                            <p className="text-md nunito text-gray-900">Create your Mirosa account and start exploring</p>
                        </div>
                    </Link>
                </div>

                {/* Right Side Signup Form */}
                <div className="md:w-1/2 w-full p-8 border border-gray-100 rounded-xl bg-white">
                    <div className="md:hidden flex justify-center mb-6">
                        <img src={logo} alt="Mirosa Logo" className="w-30" />
                    </div>
                    <h2 className="text-2xl font-semibold text-maroon mb-0 nunito">Create Account</h2>
                    <p className="text-sm text-gray-600 mb-6 nunito">Start your journey with Mirosa.</p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Full Name + Phone in one row */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="md:w-1/2">
                                <label className="block mb-1 text-sm text-maroon nunito">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="Jane Doe"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                                />
                            </div>
                            <div className="md:w-1/2">
                                <label className="block mb-1 text-sm text-maroon nunito">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+91 9876543210"
                                    className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Email (full width) */}
                        <div>
                            <label className="block mb-1 text-sm text-maroon nunito">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm text-maroon nunito">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="********"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-maroon nunito">Confirm Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="********"
                                className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                name="termsAccepted"
                                checked={formData.termsAccepted}
                                onChange={handleChange}
                                className="accent-rose-900" />
                            <label className="text-sm text-gray-700 nunito">
                                I agree to the <a href="#" className="text-maroon underline">Terms & Conditions</a>
                            </label>
                        </div>
                        {error && <p className="text-red-600 nunito text-sm">{error}</p>}
                        {success && <p className="text-green-600 text-sm">{success}</p>}

                        <button
                            type="submit"
                            className="w-full text-white py-2 rounded-lg bg-maroon transition nunito"
                        >
                            Create Account
                        </button>

                        {/* <div className="text-center text-sm text-gray-600">or</div>

                        <button className="w-full nunito border border-red-900 text-maroon py-2 rounded-md hover:bg-wine hover:text-white transition">
                            Continue with Google
                        </button> */}
                    </form>


                    <p className="mt-6 text-sm text-center nunito text-maroon">
                        Already have an account? &nbsp;
                        <a href="login" className="font-medium hover:underline">
                            Login
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
