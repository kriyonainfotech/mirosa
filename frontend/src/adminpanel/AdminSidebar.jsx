import React, { useState } from "react";
import { FiMenu } from "react-icons/fi";
import { Link } from "react-router-dom";

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Mobile Menu Icon */}
            <div className="sm:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsOpen(true)}
                    className={`flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded shadow-sm ${isOpen ? "hidden" : ""
                        }`}
                >
                    <FiMenu className="text-xl" />
                    <span className="text-sm uppercase tracking-wide">Menu</span>
                </button>
            </div>

            {/* Sidebar (Desktop) */}
            <div className="hidden sm:block w-64 bg-maroon text-white h-screen p-4 fraunces">
                <nav>
                    <ul className="ps-0">
                        <li className="mb-5 flex justify-center items-center">
                            <img src="/logo/cream_icon.png" className="w-auto h-15" alt="" />
                        </li>
                        <li className="py-2  hover:bg-rose-900/30 my-1 px-3 rounded">
                            <Link className="text-white" to="/admin">Dashboard</Link>
                        </li>

                        <li className="py-2  hover:bg-rose-900/30 my-1 px-3 rounded">
                            <Link className="text-white" to="/admin/categories">Manage Categories</Link>
                        </li>
                        <li className="py-2  hover:bg-rose-900/30 my-1 px-3 rounded">
                            <Link className="text-white" to="/admin/products">Manage Products</Link>
                        </li>
                        <li className="py-2  hover:bg-rose-900/30 my-1 px-3 rounded">
                            <Link className="text-white" to="/admin/orders">Manage Orders</Link>
                        </li>
                        <li className="py-2  hover:bg-rose-900/30 my-1 px-3 rounded">
                            <Link className="text-white" to="/admin/users">View Users</Link>
                        </li>
                        <li className="py-2  hover:bg-rose-900/30 my-1 px-3 rounded">
                            <Link className="text-white" to="/admin/appointments">View Appointments</Link>
                        </li>
                        <li className="py-2  hover:bg-rose-900/30 my-1 px-3 rounded">
                            <Link className="text-white" to="/">Home</Link>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* Mobile Slide-in Menu */}
            {isOpen && (
                <div className="fixed inset-0 z-40 bg-black bg-opacity-50">
                    <div className="fixed top-0 left-0 w-2/3 sm:w-1/2 h-screen bg-white p-6 shadow-md transition-transform duration-300 z-50">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-800 items-center mb-0">Menu</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-2xl text-gray-500"
                            >
                                &times;
                            </button>
                        </div>
                        <nav>
                            <ul className="space-y-4 ps-0">
                                <li>
                                    <Link
                                        to="/admin"
                                        className="block text-gray-800 hover:text-violet-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Dashboard
                                    </Link>
                                </li>

                                <li>
                                    <Link
                                        to="/admin/categories"
                                        className="block text-gray-800 hover:text-violet-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Manage Categories
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/products"
                                        className="block text-gray-800 hover:text-violet-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Manage Products
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/orders"
                                        className="block text-gray-800 hover:text-violet-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Manage Orders
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/admin/users"
                                        className="block text-gray-800 hover:text-violet-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        View Users
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        to="/"
                                        className="block text-gray-800 hover:text-violet-600"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Home
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;