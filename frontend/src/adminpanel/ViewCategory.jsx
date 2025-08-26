import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ViewCategory = () => {
    const [categories, setCategories] = useState([]);
    const [isFeatured, setIsFeatured] = useState(false);
    const navigate = useNavigate()

    const token = localStorage.getItem("token");
    if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        navigate("/login");
    }

    // Fetch categories from backend
    useEffect(() => {
        const fetchCategories = async () => {
            const token = localStorage.getItem("token"); // This gets the JWT stored during login

            if (!token) {
                // Handle case where token is missing (e.g., user not logged in or session expired)
                setError("Authentication token not found. Please log in again.");
                toast.error("Authentication token not found. Please log in again.");
                navigate("/login"); // Redirect to login page
                return;
            }

            try {
                console.log("Fetching categories...");
                const res = await axios.get(`${backdendUrl}/api/category/allcategories`, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}` // --- THIS IS THE KEY ADDITION ---
                    },
                });
                console.log(res, "categories data");
                if (res.data.success) {
                    setCategories(res.data.categories);
                    localStorage.setItem(
                        "categories",
                        JSON.stringify(res.data.categories)
                    );
                }
                // Make sure your backend returns an array of categories
            } catch (error) {
                console.error("Error fetching categories:", error);
            }
        };

        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        console.log("Deleting category with ID:", id);
        if (!window.confirm("Are you sure you want to delete this category?")) return;

        try {
            const res = await axios.delete(`${backdendUrl}/api/category/delete-category/${id}`, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}` // Ensure you pass the token
                },
            });

            if (res.data.success) {
                toast.success("Category deleted successfully");
                // Remove from UI if using local state:
                setCategories((prev) => prev.filter((cat) => cat._id !== id));

            } else {
                toast.error(res.data.message || "Delete failed");
            }
        } catch (err) {
            console.log(err);
            toast.error(err.response.data.message || "Something went wrong while deleting.");
        }
    };

    const handleToggleFeature = async (catId, newState) => {
        // const newValue = !isFeatured;
        console.log("Toggling isFeatured to:", catId, newState);
        setIsFeatured(newState);

        try {
            const response = await axios.put(
                `${backdendUrl}/api/category/isfeatured/${catId}`,
                { isFeatured: newState },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }
            );

            console.log("Toggle response:", response);
            if (response.data.success) {
                const updatedSub = response.data.updated;
                setCategories(prev =>
                    prev.map(sub =>
                        sub._id === updatedSub._id ? { ...sub, isFeatured: updatedSub.isFeatured } : sub
                    )
                );
            }

            if (!response.data.success) {
                toast.error(response.data.message || "Failed to update feature status");
            }
            // console.log("Updated isFeatured:", data.isFeatured);
        } catch (error) {
            console.error("Error updating isFeatured:", error);
            // optional: revert toggle if error
            setIsFeatured(prev => !prev);
        }
    };

    return (
        <div>
            <div className="p-6">
                {/* Add Category Button */}
                <div className="mb-6 flex justify-between align-center ">
                    <h1 className="text-3xl font-bold text-gray-900 nunito">
                        Manage Categories
                    </h1>
                    <Link
                        to="/admin/categories/add"
                        className="bg-indigo-500 no-underline text-white nunito px-4 py-2 rounded-md shadow-md hover:bg-indigo-600 transition duration-300"
                    >
                        Add Category
                    </Link>
                </div>

                {/* Categories Table */}
                <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
                    <table className="min-w-full table-auto">
                        <thead>
                            <tr className="bg-rose-900 text-white text-sm uppercase tracking-wide">
                                <th className="px-6 py-4 text-left">Image</th>
                                <th className="px-6 py-4 text-left">Category Name</th>
                                <th className="px-6 py-4 text-left">Slug</th>
                                <th className="px-6 py-4 text-left">Featured</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {categories?.map((category) => (
                                <tr
                                    key={category._id}
                                    className="hover:bg-gray-50 transition-all duration-200 border-b"
                                >
                                    <td className="px-6 py-4">
                                        {category?.image?.url ? (
                                            <img
                                                src={category.image.url}
                                                alt={category.name}
                                                className="w-14 h-14 object-cover rounded"
                                            />
                                        ) : (
                                            <span className="text-gray-400 text-xs block mt-2">No image</span>
                                        )}

                                    </td>
                                    <td className="text-gray-900">
                                        {category.name} <br /> <span className="text-gray-500 text-sm">id :{category._id}</span>
                                    </td>
                                    <td className="text-gray-900">
                                        {category.slug}
                                    </td>
                                    <td key={category._id} className="px-5 py-3 border-b ">
                                        <button
                                            onClick={() => handleToggleFeature(category._id, !category.isFeatured)}
                                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${category.isFeatured ? 'bg-indigo-600' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${category.isFeatured ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>

                                        <span className="ml-2 text-sm font-medium">
                                            {category.isFeatured ? 'ON' : 'OFF'}
                                        </span>
                                    </td>
                                    <td className=" text-center space-x-3">
                                        <button
                                            onClick={() => navigate(`/admin/edit-category/${category._id}`)}
                                            className="bg-blue-500 text-white py-3 px-4 rounded-md text-sm "
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(category._id)}
                                            className="bg-red-600 text-white py-3 px-4 rounded-md text-sm"
                                        >
                                            Delete
                                        </button>

                                        <button>
                                            <Link
                                                to={`/admin/categories/${category._id}`}
                                                className="bg-yellow-500 text-white py-3 px-4  rounded-md text-sm no-underline"
                                            >
                                                Manage Subcategories
                                            </Link>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewCategory;
