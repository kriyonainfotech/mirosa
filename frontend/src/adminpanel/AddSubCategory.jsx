import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
;
// console.log(apiurl);
import { useLocation, useParams } from "react-router-dom";

const AddSubCategory = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams(); // Optional, auto-select
    // const [categories, setCategories] = useState([]);
    const token = localStorage.getItem("token");
    const [subCategoryName, setSubCategoryName] = useState("");
    const [categoryName, setCategoryName] = useState("");
    const [subCategoryImage, setSubCategoryImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    console.log("Category ID from URL:", categoryId);

    useEffect(() => {
        const fetchCategory = async () => {
            if (!categoryId) return;
            try {
                const res = await axios.get(`${backdendUrl}/api/category/get-category/${categoryId}`, {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    }
                });

                console.log("Fetched category:", res.data);
                if (res.data && res.data.category) {
                    setCategoryName(res.data.category.name);
                }
            } catch (err) {
                console.error("Failed to fetch category:", err);
            }
        };
        fetchCategory();
    }, [categoryId]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSubCategoryImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        console.log(categoryId, subCategoryName, "category id");
        if (!categoryId || !subCategoryName || !subCategoryImage) {
            alert("Please fill all fields.");
            return;
        }

        const formData = new FormData();
        formData.append("name", subCategoryName);
        formData.append("category", categoryId);
        formData.append("image", subCategoryImage);
        // 🔍 Just to debug FormData entries
        for (const [key, value] of formData.entries()) {
            console.log(`${key}:`, value);
        }

        try {
            const res = await axios.post(
                `${backdendUrl}/api/subcategory/add-subcategory`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        "Authorization": `Bearer ${token}`
                    },
                }
            );

            if (res.data.success) {
                toast.success("✅ Subcategory added successfully!");
                setSubCategoryName("");
                setSubCategoryImage(null);
                setImagePreview(null);
                // navigate(`/admin/view-subcategory/${categoryId}`);
            }

        } catch (err) {
            console.error("❌ Error:", err);
            if (err.status === 401) {
                toast.error("❌ Unauthorized! Please log in again.");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center mt-20">
            <div className="w-full max-w-2xl bg-white p-8 rounded-xl shadow-md">
                <div className="flex items-center justify-between mb-6 gap-4">
                    <h2 className="text-2xl font-semibold text-cyan-900">
                        Add New Subcategory
                    </h2>

                    {/* 🔙 Back Button */}
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-white bg-gray-800 px-3 py-2 rounded-lg flex items-center"
                    >
                        ← Back
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Category Select */}
                    <div>
                        <label className="block text-lg font-medium mb-1">
                            Select Category
                        </label>
                        <div className="flex flex-col">
                            <label
                                htmlFor="categoryName"
                                className="text-lg font-medium mb-1"
                            >
                                Category
                            </label>
                            <input
                                type="text"
                                id="categoryName"
                                value={categoryName}
                                disabled
                                className="p-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-lg font-medium mb-1">
                            Subcategory Name
                        </label>
                        <input
                            type="text"
                            value={subCategoryName}
                            onChange={(e) => setSubCategoryName(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Enter subcategory name"
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-lg font-medium mb-1">
                            Subcategory Image
                        </label>
                        <input
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            required
                        />
                        {imagePreview && (
                            <div className="mt-4">
                                <h3 className="text-sm font-medium text-gray-600">
                                    Image Preview:
                                </h3>
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="mt-2 w-32 h-32 object-cover rounded-md border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full py-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition"
                    >
                        {loading ? "Adding..." : "Add Subcategory"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSubCategory;
