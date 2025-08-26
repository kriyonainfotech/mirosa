// src/adminpanel/EditCategory.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const EditCategory = () => {
    const { categoryId } = useParams(); // Get category ID from URL
    console.log("🔍 Editing category with ID:", categoryId);
    const navigate = useNavigate();

    const [categoryName, setCategoryName] = useState("");
    const [categoryImage, setCategoryImage] = useState(null); // New image file
    const [currentImageUrl, setCurrentImageUrl] = useState(""); // URL of the existing image
    const [imagePreview, setImagePreview] = useState(null); // Preview for new image
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Effect to fetch existing category data when the component mounts
    useEffect(() => {
        const fetchCategory = async () => {

            setLoading(true);
            setError("");
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Authentication token not found. Please log in again.");
                navigate("/login");
                return;
            }

            try {
                const response = await axios.get(
                    `${backdendUrl}/api/category/get-category/${categoryId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                console.log("📦 Fetched category data:", response.data);
                const categoryData = response.data.category; // Adjust based on your API response structure
                setCategoryName(categoryData.name || categoryData.categoryName); // Use 'name' or 'categoryName'
                setCurrentImageUrl(categoryData.image?.url || categoryData.image); // Use 'imageUrl' or 'image'
                setLoading(false);
            } catch (err) {
                console.log("❌ Error fetching category:", err || err.message);
                setError(err.response?.data?.message || "Failed to load category data.");
                toast.error(err.response?.data?.message || "Failed to load category data.");
                setLoading(false);
            }
        };

        if (categoryId) {
            fetchCategory();
        } else {
            setError("No category ID provided for editing.");
            setLoading(false);
        }
    }, [categoryId, navigate]); // Re-run if categoryId or navigate changes

    const handleNameChange = (e) => {
        setCategoryName(e.target.value);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setCategoryImage(file); // Set the new file
        if (file) {
            setImagePreview(URL.createObjectURL(file)); // Create URL for preview
        } else {
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!categoryName) {
            setError("Category name cannot be empty.");
            toast.error("Category name cannot be empty.");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            setError("Authentication token not found. Please log in again.");
            toast.error("Authentication token not found. Please log in again.");
            navigate("/login");
            return;
        }

        try {
            const formData = new FormData();
            formData.append("name", categoryName); // Always send updated name

            if (categoryImage) {
                formData.append("image", categoryImage); // Only append new image if selected
            }
            // Note: No need to send currentImageUrl if not changing the image,
            // the backend should handle retaining the old image if no new one is provided.

            const response = await axios.put(
                `${backdendUrl}/api/category/update-category/${categoryId}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.category) {
                toast.success("✅ Category updated successfully!");
                navigate("/admin/categories"); // Redirect back to category list
            } else {
                setError(response.data?.message || "Failed to update category due to an unknown reason.");
                toast.error(response.data?.message || "Failed to update category due to an unknown reason.");
            }
        } catch (err) {
            console.error("❌ Error updating category:", err.response?.data || err.message);
            setError(
                err.response?.data?.message ||
                "Something went wrong while updating category."
            );
            toast.error(
                err.response?.data?.message ||
                "Something went wrong while updating category."
            );
            if (err.response?.status === 401 || err.response?.data?.message === 'Invalid or expired token') {
                // Optionally handle re-authentication here
            }
        }
    };

    if (loading) {
        return <div className="text-center p-8">Loading category data...</div>;
    }

    if (error && !categoryName) { // Only show full error if we failed to load initial data
        return <div className="text-center p-8 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg p-8">
                <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800 nunito">Edit Category</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow"
                    >
                        Back
                    </button>
                </div>

                {error && (
                    <p className="bg-red-100 text-red-700 px-4 py-2 rounded-md mb-4 border border-red-300">
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Name */}
                    <div>
                        <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
                            Category Name
                        </label>
                        <input
                            type="text"
                            id="categoryName"
                            value={categoryName}
                            onChange={handleNameChange}
                            placeholder="e.g. Rings, Bracelets"
                            className="w-full border border-gray-300 rounded-md px-4 py-2 shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label htmlFor="categoryImage" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Image & New Image Upload
                        </label>

                        <div className="flex items-center gap-4 mb-4">
                            {/* Display current image */}
                            {currentImageUrl && !imagePreview && (
                                <div className="relative">
                                    <img
                                        src={currentImageUrl}
                                        alt="Current Category"
                                        className="w-24 h-24 rounded-md object-cover border border-gray-200"
                                    />
                                    <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-bl-md">Current</span>
                                </div>
                            )}

                            {/* Display new image preview if selected */}
                            {imagePreview && (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="New Category Preview"
                                        className="w-24 h-24 rounded-md object-cover border border-purple-400"
                                    />
                                    <span className="absolute top-0 right-0 bg-purple-500 text-white text-xs px-1 rounded-bl-md">New Preview</span>
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            id="categoryImage"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-sm text-gray-500 mt-1">Upload a new image to replace the current one. Leave blank to keep existing.</p>
                    </div>

                    {/* Submit */}
                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition font-semibold"
                        >
                            💾 Update Category
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCategory;