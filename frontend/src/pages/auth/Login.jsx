import React, { useState } from "react";
import logo from '../../../public/logo/marron_icon.png'; // update with your actual path
import { Link } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { encryptData } from "../../utils/secureStorage";
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
import { toast } from 'react-toastify';

export default function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();



    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await axios.post(`${backdendUrl}/api/auth/login-user`, {
                email,
                password,
            });

            console.log("Login response:", res.data);
            if (res.data.success) {
                // Save encrypted user & token
                localStorage.setItem("token", res.data.token);
                const encrypted = encryptData(res.data.user); // ✅ assign result
                localStorage.setItem("user", encrypted); // ✅ store encrypted user
                console.log("User and token saved to localStorage");
                // toast.success("Login successful...");
                navigate("/");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
            // toast.error(err.response?.data?.message || "Login failed");
            console.error("Login error:", err);
        }

    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-6xl rounded-xl flex flex-col md:flex-row overflow-hidden">

                {/* Left Side Banner / Image */}
                <div className="md:w-1/2 hidden md:flex items-center justify-center bg-wine text-white p-8">
                    <Link to={'/'}>
                        <div className="text-center space-y-4">
                            <img src={logo} alt="Mirosa Logo" className="w-84 mx-auto" />
                            <h2 className="text-2xl text-gray-900 nunito mb-0">Welcome Back</h2>
                            <p className="text-md text-gray-900 nunito">Sign in to access our stunning collections</p>
                        </div>
                    </Link>
                </div>

                {/* Right Side Login Form */}
                <div className="md:w-1/2 w-full p-8 border border-gray-100 rounded-xl bg-white">
                    <div className="md:hidden flex justify-center mb-6" >
                        <img src={logo} alt="Mirosa Logo" className="w-30" />
                    </div>
                    <h2 className="text-2xl font-semibold text-maroon mb-0 nunito">Login to Mirosa</h2>
                    <p className="text-sm text-gray-600 mb-6 nunito">Enter your credentials below.</p>

                    <form className="space-y-4" onSubmit={handleLogin}>
                        <div>
                            <label className="block mb-1 text-sm text-maroon nunito">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block mb-1 text-sm text-maroon nunito">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="********"
                                className="w-full border border-gray-400 rounded-md px-4 py-2 focus:outline-none"
                            />
                            {/* <div className="text-right mt-1">
                                <a href="#" className="text-sm text-maroon hover:underline nunito">
                                    Forgot Password?
                                </a>
                            </div> */}
                        </div>

                        {error && <p className="text-red-600 text-sm">{error}</p>}

                        <button
                            type="submit"
                            className="w-full text-white py-2 rounded-lg bg-maroon transition nunito"
                        >
                            Login
                        </button>
                        {/* 
                        <div className="text-center text-sm text-gray-600">or</div>

                        <button className="w-full nunito border border-red-900 text-maroon py-2 rounded-md hover:bg-wine hover:text-white transition">
                            Continue with Google
                        </button> */}
                    </form>


                    <p className="mt-6 text-sm text-center nunito text-maroon">
                        New to Mirosa ?{' '} &nbsp;
                        <a href="signup" className="font-medium hover:underline ">
                            Create an account
                        </a>
                    </p>
                </div>
            </div >
        </div >
    );
}
