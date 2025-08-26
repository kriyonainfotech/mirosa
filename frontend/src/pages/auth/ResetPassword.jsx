import React, { useState } from "react";
import { useSearchParams, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
const backendUrl = import.meta.env.VITE_BACKEND_URL;;

const ResetPassword = () => {
    const { resetToken: token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    console.log("Reset Token:", token);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!password || !confirmPassword) {
            setError("Please fill in all fields.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        try {
            // Replace with your API endpoint
            await axios.post(`${backendUrl}/api/auth/reset-password/${token}`, {
                newPassword: password,
            });
            setSuccess("Password reset successfully. Redirecting to login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to reset password. Try again."
            );
        }
    };

    if (!token || token.length < 30) {
        return <div className="text-center py-20 text-red-600 text-lg">Invalid or expired reset link.</div>;
    }

    return (
        <div className="min-h-screen bg-cream flex items-center justify-center px-4">
            <div className="w-full max-w-6xl rounded-xl flex flex-col md:flex-row overflow-hidden">

                {/* Left Side Banner */}
                <div className="md:w-1/2 hidden md:flex items-center justify-center bg-wine text-white p-8">
                    <div className="text-center space-y-4">
                        <img src='/logo/marron_icon.png' alt="Mirosa Logo" className="w-84 mx-auto" />
                        <h2 className="text-2xl fraunces">Reset Your Password</h2>
                        <p className="text-md nunito">We’ll get you back into your account in no time.</p>
                    </div>
                </div>

                {/* Right Side Form */}
                <div className="md:w-1/2 w-full p-8 border border-gray-100 rounded-xl bg-gray-200">
                    <div className="md:hidden flex justify-center mb-6">
                        <img src='/logo/marron_icon.png' alt="Mirosa Logo" className="w-20" />
                    </div>

                    <h2 className="text-2xl font-semibold text-maroon mb-2 fraunces">Reset Password</h2>
                    <p className="text-sm text-gray-600 mb-6 nunito">Enter your new password below.</p>

                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block mb-1 text-sm text-maroon fraunces">New Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block mb-1 text-sm text-maroon fraunces">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                                required
                            />
                        </div>

                        {error && <div className="text-red-600 text-sm">{error}</div>}
                        {success && <div className="text-green-600 text-sm">{success}</div>}

                        <button
                            type="submit"
                            className="w-full text-white py-2 rounded-lg bg-maroon transition fraunces"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;