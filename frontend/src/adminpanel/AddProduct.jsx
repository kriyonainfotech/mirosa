import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaArrowLeft, } from 'react-icons/fa';
import { Link } from "react-router-dom";
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const AddProduct = () => {
    // State management
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        tags: "",
        isCustomizable: false,
        status: "active",
    });
    const [mainImageFile, setmainImageFile] = useState(null);
    const [mainImagePreview, setmainImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [variants, setVariants] = useState([createEmptyVariant()]);

    const navigate = useNavigate();

    // Helper function for variant creation
    function createEmptyVariant() {
        return {
            material: "",       // Was metalColor
            purity: "",
            size: [],          // Default to empty array
            price: "",          // Was totalPrice
            sku: "",
            stock: "",
            weight: "",         // Was weightInGrams
            weightUnit: "G",    // --- NEW --- (Default to 'G' for grams)
            hsCode: "",         // --- NEW ---
            countryOfOrigin: "IN", // --- NEW --- (Set a default, e.g., 'IN' for India)
            images: [],
            discount: { type: 'percentage', value: 0 }
        };
    }

    // Fetch categories with caching

    useEffect(() => {
        console.log("Fetching categories...");

        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${backdendUrl}/api/category/getCatWithSubCats`);

                console.log("Fetched categories:", res.data);

                if (res.data.success && res.data.categories) {
                    setCategories(res.data.categories);
                    localStorage.setItem("categories", JSON.stringify(res.data.categories));
                }
            } catch (err) {
                toast.error("Failed to load categories");
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

    // Form handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handlemainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setmainImageFile(file);
            setmainImagePreview(URL.createObjectURL(file));
        }
    };

    // Variant handlers
    const addNewVariant = () => {
        setVariants(prev => [...prev, createEmptyVariant()]);
    };

    const removeVariant = (index) => {
        if (variants.length <= 1) return;
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
        setVariants(prev => prev.map((v, i) => {
            if (i === index) {
                return { ...v, [field]: value };
            }
            return v;
        }));
    };

    const handleVariantImageChange = (index, files) => {
        setVariants(prev => prev.map((v, i) =>
            i === index ? { ...v, images: Array.from(files) } : v
        ));
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate required fields
        if (!formData.title || !mainImageFile || !formData.categoryId) {
            toast.error("Please fill all required fields");
            setIsSubmitting(false);
            return;
        }

        // Validate variants
        // Now checks the new/renamed fields
        const invalidVariant = variants.some(v =>
            !v.material || // was metalColor
            !v.purity ||
            !v.sku ||
            !v.price ||  // was totalPrice
            !v.weight ||  // was weightInGrams
            !v.weightUnit || // --- NEW ---
            !v.hsCode ||  // --- NEW ---
            !v.countryOfOrigin // --- NEW ---
        );

        if (invalidVariant) {
            toast.error("Please fill all required variant fields");
            setIsSubmitting(false);
            return;
        }

        try {
            const formDataObj = new FormData();

            // This now sends all the correct, standardized field names
            const productData = {
                ...formData,
                tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
                variants: variants.map(variant => ({
                    // Spread all fields from the variant state
                    ...variant,
                    // Ensure numbers are sent as numbers
                    stock: Number(variant.stock),
                    price: Number(variant.price),
                    weight: Number(variant.weight),
                    // explicitly remove images; they are sent separately
                    images: [],
                }))
            }
            formDataObj.append("product", JSON.stringify(productData));
            if (mainImageFile) {
                formDataObj.append("mainImage", mainImageFile);
            }
            variants.forEach((variant, index) => {
                variant.images.forEach(file => {
                    formDataObj.append(`variantImages_${index}`, file);
                });
            });

            // API call
            await axios.post(`${backdendUrl}/api/product/add-product`, formDataObj, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Product added successfully!");
            navigate("/admin/products");
        } catch (error) {
            console.error("Submission error:", error);
            const errorMessage = error.response?.data?.error ||
                "Failed to add product. Please check your inputs.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-900">
                    Add New Jewelry Product
                </h2>
                <div className='flex gap-x-3'>
                    <Link to="/admin/products" className="inline-flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <FaArrowLeft className="h-4 w-4" />
                        Back
                    </Link>

                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* Basic Information Section */}
                <div className="md:col-span-2 border-b pb-4">
                    <h3 className="text-xl font-semibold mb-4 text-cyan-800">
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label className="block mb-1 font-medium">
                                Product Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                placeholder="e.g. Diamond Ring"
                                required
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block mb-1 font-medium">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                placeholder="e.g. New, Bestseller, Gift"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block mb-1 font-medium">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={(e) => {
                                    handleChange(e);
                                    const selectedCategory = categories.find(
                                        cat => cat._id === e.target.value
                                    );
                                    setSubcategories(selectedCategory?.subcategories || []);
                                    setFormData(prev => ({ ...prev, subCategoryId: "" }));
                                }}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subcategory */}
                        <div>
                            <label className="block mb-1 font-medium">Subcategory</label>
                            <select
                                name="subCategoryId"
                                value={formData.subCategoryId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                disabled={!subcategories.length}
                            >
                                <option value="">Select Subcategory</option>
                                {subcategories.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block mb-1 font-medium">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Customizable */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isCustomizable"
                                name="isCustomizable"
                                checked={formData.isCustomizable}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label htmlFor="isCustomizable" className="font-medium">
                                Customizable Product
                            </label>
                        </div>

                        {/* mainImage Upload */}
                        <div>
                            <label className="block mb-1 font-medium">
                                mainImage Image <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlemainImageChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                required
                            />
                            {mainImagePreview && (
                                <img
                                    src={mainImagePreview}
                                    alt="mainImage"
                                    className="mt-2 w-28 h-28 object-cover rounded-md border"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-md"
                        rows="4"
                        placeholder="Describe the product in detail..."
                    ></textarea>
                </div>

                {/* Variants Section */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-cyan-800">
                            Product Variants
                        </h3>
                        <button
                            type="button"
                            onClick={addNewVariant}
                            className="bg-violet-800 text-white px-4 py-2 rounded-md hover:bg-violet-700 transition"
                        >
                            + Add Variant
                        </button>
                    </div>

                    {variants.map((variant, index) => (
                        <div
                            key={index}
                            className="border p-4 mb-6 rounded-md shadow-sm space-y-4 bg-gray-50"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                {/* Metal Color */}
                                <div>
                                    <label className="block mb-1">
                                        Material <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={variant.material}
                                        onChange={(e) =>
                                            handleVariantChange(index, "material", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="Yellow Gold">Yellow Gold</option>
                                        <option value="Rose Gold">Rose Gold</option>
                                        <option value="White Gold">White Gold</option>
                                        <option value="Silver">Silver</option>
                                    </select>
                                </div>

                                {/* Purity (no change) */}
                                <div>
                                    <label className="block mb-1">
                                        Purity <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={variant.purity}
                                        onChange={(e) =>
                                            handleVariantChange(index, "purity", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="14KT">14KT</option>
                                        <option value="18KT">18KT</option>
                                        <option value="22KT">22KT</option>
                                    </select>
                                </div>

                                {/* purity */}
                                <div>
                                    <label className="block mb-1">
                                        Purity <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={variant.purity}
                                        onChange={(e) =>
                                            handleVariantChange(index, "purity", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="14KT">14KT</option>
                                        <option value="18KT">18KT</option>
                                        <option value="22KT">22KT</option>
                                    </select>
                                </div>

                                {/* Size */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Sizes (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={Array.isArray(variant.size) ? variant.size.join(", ") : ""}
                                        onChange={(e) =>
                                            handleVariantChange(
                                                index,
                                                "size",
                                                e.target.value.split(',').map(s => s.trim()).filter(s => s)
                                            )
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="6, 7, 8"
                                    />
                                </div>

                                {/* SKU */}
                                <div>
                                    <label className="block mb-1">
                                        SKU <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) =>
                                            handleVariantChange(index, "sku", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="Unique SKU"
                                        required
                                    />
                                </div>

                                {/* Inside the variant mapping in your AddProduct.jsx */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Discount Type */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Discount Type</label>
                                        <select
                                            value={variant.discount?.type || 'percentage'}
                                            onChange={(e) => handleVariantChange(index, "discount", { ...variant.discount, type: e.target.value })}
                                            className="w-full border border-gray-300 p-2 rounded-md"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed (₹)</option>
                                        </select>
                                    </div>

                                    {/* Discount Value */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Discount Value</label>
                                        <input
                                            type="number"
                                            value={variant.discount?.value || 0}
                                            onChange={(e) => handleVariantChange(index, "discount", { ...variant.discount, value: Number(e.target.value) })}
                                            className="w-full border border-gray-300 p-2 rounded-md"
                                            placeholder="e.g. 10 or 500"
                                            min="0"
                                        />
                                    </div>
                                </div>


                                {/* Stock */}
                                <div>
                                    <label className="block mb-1">In Stock</label>
                                    <input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) =>
                                            handleVariantChange(index, "stock", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="Stock quantity"
                                        min="0"
                                    />
                                </div>

                                {/* Price */}
                                <div>
                                    <label className="block mb-1">
                                        Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) =>
                                            handleVariantChange(index, "price", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="₹ Price"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Variant Images */}
                                <div>
                                    <label className="block mb-1">Variant Images upto 4</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) =>
                                            handleVariantImageChange(index, e.target.files)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            {/* shipping info */}
                            <div className="border-t pt-4 mt-4">
                                <h4 className="text-md font-semibold mb-2 text-gray-700">
                                    Shipping & Customs
                                </h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Weight */}
                                    <div>
                                        <label className="block mb-1">
                                            Weight <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={variant.weight}
                                            onChange={(e) =>
                                                handleVariantChange(index, "weight", e.target.value)
                                            }
                                            className="w-full border border-gray-300 p-2 rounded-md"
                                            placeholder="e.g. 5.5"
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    {/* Weight Unit */}
                                    <div>
                                        <label className="block mb-1">
                                            Unit <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={variant.weightUnit}
                                            onChange={(e) =>
                                                handleVariantChange(index, "weightUnit", e.target.value)
                                            }
                                            className="w-full border border-gray-300 p-2 rounded-md"
                                            required
                                        >
                                            <option value="G">Grams (G)</option>
                                            <option value="KG">Kilograms (KG)</option>
                                            <option value="LB">Pounds (LB)</option>
                                        </select>
                                    </div>

                                    {/* HS Code */}
                                    <div>
                                        <label className="block mb-1">
                                            HS Code <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={variant.hsCode}
                                            onChange={(e) =>
                                                handleVariantChange(index, "hsCode", e.target.value)
                                            }
                                            className="w-full border border-gray-300 p-2 rounded-md"
                                            placeholder="e.g. 7113.19"
                                            required
                                        />
                                    </div>

                                    {/* Country of Origin */}
                                    <div>
                                        <label className="block mb-1">
                                            Country of Origin <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={variant.countryOfOrigin}
                                            onChange={(e) =>
                                                handleVariantChange(index, "countryOfOrigin", e.target.value.toUpperCase())
                                            }
                                            className="w-full border border-gray-300 p-2 rounded-md"
                                            placeholder="e.g. IN (2-letter code)"
                                            required
                                            maxLength="2"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Remove Variant */}
                            {
                                variants.length > 1 && (
                                    <div className="flex justify-end mt-2">
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(index)}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            Remove Variant
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Adding Product...
                                </div>
                            ) : (
                                "Add Product"
                            )}
                        </button>
                    </div>
                </div>
            </form >
        </div >
    );
};

export default AddProduct;