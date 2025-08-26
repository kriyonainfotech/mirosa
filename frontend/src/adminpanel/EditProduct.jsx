// src/pages/admin/EditProduct.jsx (or wherever you store your admin pages)
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa'; // Icons for add/remove/delete
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const EditProduct = () => {
    const { productId } = useParams(); // Get product ID from URL
    console.log("Editing product with ID:", productId);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        tags: "",
        isCustomizable: false,
        status: "active",
    });
    const [mainImageFile, setMainImageFile] = useState(null); // New file for main image
    const [mainImagePreview, setMainImagePreview] = useState(null); // Preview for new main image
    const [existingMainImageUrl, setExistingMainImageUrl] = useState(''); // Current main image URL

    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // State for variants
    const [variants, setVariants] = useState([]); // Will be populated with existing variants
    // To track new images for existing variants: Map variant._id to { files: [], previews: [] }
    const [newVariantImages, setNewVariantImages] = useState({});

    // Helper to create an empty variant for new additions
    const createEmptyVariant = () => ({
        _id: `new-${Date.now()}-${Math.random().toString(36).substring(7)}`, // Temporary ID for new variants
        material: "", // Changed from metalColor
        purity: "",
        size: "",
        price: "", // Changed from totalPrice
        sku: "",
        stock: "",
        weight: "", // Changed from weightInGrams
        images: [], // Existing image URLs (empty for new variant)
        newFiles: [], // Files selected for upload for this variant
        newPreviews: [],
    });

    // --- Data Fetching ---

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${backdendUrl}/api/category/getCatWithSubCats`);
                if (res.data.success && res.data.categories) {
                    setCategories(res.data.categories);
                }
            } catch (err) {
                toast.error("Failed to load categories");
                console.error("Error fetching categories:", err);
            }
        };
        fetchCategories();
    }, []);

    // Fetch product data when ID changes or on mount
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${backdendUrl}/api/product/getproduct/${productId}`);
                console.log("Fetched product data:", response.data);
                const productData = response.data.product; // Assuming your API returns { success: true, product: {} }

                setFormData({
                    title: productData.title || "",
                    description: productData.description || "",
                    categoryId: productData.category?._id || "",
                    subCategoryId: productData.subcategory?._id || "",
                    tags: productData.tags?.join(", ") || "",
                    isCustomizable: productData.isCustomizable || false,
                    status: productData.status || "active",
                });
                setExistingMainImageUrl(productData.mainImage || "");

                // Map existing variants to include `newFiles` and `newPreviews` state
                const mappedVariants = productData.variants.map(v => ({
                    ...v,
                    newFiles: [],
                    newPreviews: [],
                }));
                setVariants(mappedVariants);

                // Set subcategories based on fetched product's category
                if (productData.category?._id) {
                    const selectedCategory = categories.find(cat => cat._id === productData.category._id);
                    if (selectedCategory) {
                        setSubcategories(selectedCategory.subcategories || []);
                    }
                }

            } catch (error) {
                console.error("Error fetching product:", error);
                toast.error("Failed to load product data.");
                // navigate('/admin/products'); // Redirect if product not found or error
            }
        };

        if (productId && categories.length > 0) { // Fetch product only after categories are loaded
            fetchProduct();
        }
    }, [productId, categories, navigate]); // Add categories to dependency array

    // Update subcategories when categoryId in formData changes
    useEffect(() => {
        const selectedCategory = categories.find(cat => cat._id === formData.categoryId);
        setSubcategories(selectedCategory?.subcategories || []);
        // Reset subcategory if it's no longer valid for the new category
        if (formData.subCategoryId && !selectedCategory?.subcategories.some(sub => sub._id === formData.subCategoryId)) {
            setFormData(prev => ({ ...prev, subCategoryId: "" }));
        }
    }, [formData.categoryId, categories]);


    // --- Form & Image Handlers ---

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            setMainImagePreview(URL.createObjectURL(file));
        } else {
            setMainImageFile(null);
            setMainImagePreview(null);
        }
    };

    const handleRemoveExistingMainImage = () => {
        setExistingMainImageUrl(''); // Clear existing image URL
        setMainImageFile(null); // Ensure no new file is pending either
        setMainImagePreview(null); // Clear preview too
    };

    // --- Variant Handlers ---

    const addNewVariant = () => {
        setVariants(prev => [...prev, createEmptyVariant()]);
    };

    const removeVariant = (index) => {
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
        setVariants(prev => prev.map((v, i) => {
            if (i === index) {
                if (field === "size") {
                    // Ensure value is a string before splitting.
                    const sizeArray = typeof value === 'string'
                        ? value.split(',').map(s => s.trim())
                        : [];
                    return { ...v, size: sizeArray };
                }
                return { ...v, [field]: value };
            }
            return v;
        }));
    };

    // Handle new image files for a specific variant
    const handleNewVariantImageChange = (index, files) => {
        setVariants(prev => prev.map((v, i) => {
            if (i === index) {
                const newFilesArray = Array.from(files);
                const newPreviewsArray = newFilesArray.map(file => URL.createObjectURL(file));
                return {
                    ...v,
                    newFiles: newFilesArray,
                    newPreviews: newPreviewsArray
                };
            }
            return v;
        }));
    };

    // Handle removal of an *existing* image URL from a variant
    const handleRemoveExistingVariantImage = (variantIndex, imageUrlToRemove) => {
        setVariants(prevVariants => prevVariants.map((v, i) => {
            if (i === variantIndex) {
                return {
                    ...v,
                    images: v.images.filter(imgUrl => imgUrl !== imageUrlToRemove)
                };
            }
            return v;
        }));
    };

    // --- Form Submission ---

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        console.log("Submitting form data:", formData);

        // Basic validation
        if (!formData.title || (!existingMainImageUrl && !mainImageFile) || !formData.categoryId) {
            toast.error("Please fill all required fields and ensure a main image is present.");
            setIsSubmitting(false);
            return;
        }

        console.log("Form data before submission:", variants);
        const invalidVariant = variants.some(v => {
            const isInvalid =
                !v.material ||
                !v.purity ||
                !v.sku ||
                v.price == null || isNaN(v.price) ||
                v.weight == null || isNaN(v.weight) ||
                !v.discount ||
                ((!v.images || v.images.length === 0) && (!v.newFiles || v.newFiles.length === 0));

            if (isInvalid) {
                console.log("🚨 Missing fields in variant:", {
                    material: v.material,
                    purity: v.purity,
                    sku: v.sku,
                    price: v.price,
                    weight: v.weight,
                    discount: v.discount,
                    images: v.images,
                    newFiles: v.newFiles
                });
            }

            return isInvalid;
        });


        if (invalidVariant) {
            toast.error("Please ensure all variant required fields are filled and each variant has at least one image.");
            setIsSubmitting(false);
            return;
        }

        try {
            const formDataObj = new FormData();

            // Prepare product data for backend
            const productDataForBackend = {
                ...formData,
                tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
                mainImage: existingMainImageUrl, // Keep existing URL if no new file is uploaded
                variants: variants.map(v => ({
                    _id: v._id.startsWith('new-') ? undefined : v._id, // Don't send temp IDs for new variants
                    material: v.material, // Map frontend field to schema
                    purity: v.purity,
                    size: Array.isArray(v.size) ? v.size.filter(Boolean) : [],  // ✅ Fix here
                    price: Number(v.price), // Map frontend field to schema
                    sku: v.sku,
                    stock: Number(v.stock), // Send the numeric stock value
                    inStock: Number(v.stock) > 0, // Map frontend field to schema
                    weight: Number(v.weight), // Map frontend field to schema
                    images: v.images, // Send existing image URLs
                    discount: v.discount
                })),
            };

            formDataObj.append("product", JSON.stringify(productDataForBackend));

            // Append new main image file if selected
            if (mainImageFile) {
                formDataObj.append("mainImage", mainImageFile);
            }

            // Append new variant image files
            variants.forEach((variant, index) => {
                variant.newFiles.forEach(file => {
                    formDataObj.append(`variantImages_${index}`, file);
                });
            });

            // API call to update product
            await axios.put(`${backdendUrl}/api/product/update-product/${productId}`, formDataObj, {
                headers: {
                    "Content-Type": "multipart/form-data",

                }
            });

            toast.success("Product updated successfully!");
            navigate("/admin/products");
        } catch (error) {
            console.error("Submission error:", error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || "Failed to update product. Please check your inputs.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-900">
                    Edit Product
                </h2>
                <div className='flex gap-x-3'>
                    <Link to="/admin/products" className="inline-flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <FaArrowLeft className="h-4 w-4" />
                        Back
                    </Link>
                    <Link to={`/admin/view-product/`} className="inline-flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <FaArrowRight className="h-4 w-4" />
                        Edit Product
                    </Link>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Information Section */}
                <div className="md:col-span-2 border-b pb-4">
                    <h3 className="text-xl font-semibold mb-4 text-cyan-800">
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label className="block mb-1 font-medium">Product Title <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                required
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block mb-1 font-medium">Tags (comma separated)</label>
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
                            <label className="block mb-1 font-medium">Category <span className="text-red-500">*</span></label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>{cat.name}</option>
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
                                    <option key={sub._id} value={sub._id}>{sub.name}</option>
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
                            <label htmlFor="isCustomizable" className="font-medium">Customizable Product</label>
                        </div>

                        {/* Main Image Upload */}
                        <div>
                            <label className="block mb-1 font-medium">Main Image <span className="text-red-500">*</span></label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleMainImageChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                            />
                            {(mainImagePreview || existingMainImageUrl) && (
                                <div className="mt-2 relative inline-block">
                                    <img
                                        src={mainImagePreview || existingMainImageUrl}
                                        alt="Main Product"
                                        className="w-28 h-28 object-cover rounded-md border"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveExistingMainImage}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                        title="Remove Image"
                                    >
                                        <FaTimes />
                                    </button>
                                </div>
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
                            <FaPlus className="inline-block mr-1" /> Add Variant
                        </button>
                    </div>

                    {variants.map((variant, index) => (
                        <div key={variant._id || index} className="border p-4 mb-6 rounded-md shadow-sm space-y-4 bg-gray-50">
                            <h4 className="font-bold text-gray-700">Variant {index + 1}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                {/* Metal Color */}
                                <div>
                                    <label className="block mb-1">Material <span className="text-red-500">*</span></label>
                                    <select
                                        value={variant.material}
                                        onChange={(e) => handleVariantChange(index, "material", e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="Yellow Gold">Yellow Gold</option>
                                        <option value="Rose Gold">Rose Gold</option>
                                        <option value="White Gold">White Gold</option>
                                        <option value="Silver">Silver</option>
                                        <option value="Platinum">Platinum</option> {/* Added Platinum as per schema */}
                                    </select>
                                </div>

                                {/* Purity */}
                                <div>
                                    <label className="block mb-1">Purity <span className="text-red-500">*</span></label>
                                    <select
                                        value={variant.purity}
                                        onChange={(e) => handleVariantChange(index, "purity", e.target.value)}
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
                                        // Show the array as a comma-separated string
                                        value={variant.size}
                                        // Just pass the string from the input to the handler
                                        onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="6, 7, 8"
                                    />
                                </div>

                                {/* SKU */}
                                <div>
                                    <label className="block mb-1">SKU <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
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
                                        onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="Stock quantity"
                                        min="0"
                                    />
                                </div>

                                {/* Total Price */}
                                <div>
                                    <label className="block mb-1">Total Price <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={variant.price}
                                        onChange={(e) => handleVariantChange(index, "totalPrice", e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="₹ Total price"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Weight */}
                                <div>
                                    <label className="block mb-1">Weight (g)</label>
                                    <input
                                        type="number"
                                        value={variant.weight}
                                        onChange={(e) => handleVariantChange(index, "weightInGrams", e.target.value)}
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="Weight in grams"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Variant Images */}
                                <div className="md:col-span-full">
                                    <label className="block mb-1">Variant Images (Max 4 per variant)</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) => handleNewVariantImageChange(index, e.target.files)}
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        accept="image/*"
                                    />
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {/* Existing Images */}
                                        {variant.images && variant.images.map((imgUrl, imgIdx) => (
                                            <div key={`existing-${imgIdx}`} className="relative">
                                                <img
                                                    src={imgUrl}
                                                    alt={`Existing Variant Image ${imgIdx + 1}`}
                                                    className="w-20 h-20 object-cover rounded border"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExistingVariantImage(index, imgUrl)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 text-xs"
                                                    title="Remove Image"
                                                >
                                                    <FaTimes />
                                                </button>
                                            </div>
                                        ))}
                                        {/* New Image Previews */}
                                        {variant.newPreviews && variant.newPreviews.map((previewUrl, previewIdx) => (
                                            <div key={`new-${previewIdx}`} className="relative">
                                                <img
                                                    src={previewUrl}
                                                    alt={`New Variant Image ${previewIdx + 1}`}
                                                    className="w-20 h-20 object-cover rounded border"
                                                />
                                                {/* No direct remove for new previews as it's part of the file input */}
                                            </div>
                                        ))}
                                    </div>
                                    {(!variant.images?.length && !variant.newFiles?.length) && (
                                        <p className="text-red-500 text-sm mt-1">At least one image is required for each variant.</p>
                                    )}
                                </div>
                            </div>

                            {/* Remove Variant Button */}
                            {variants.length > 1 && (
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="text-sm text-red-600 hover:underline flex items-center gap-1"
                                    >
                                        <FaTrash /> Remove Variant
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`bg-blue-900 text-white cursor-pointer px-6 py-3 rounded-md hover:bg-blue-800 transition ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Updating Product...
                                </div>
                            ) : (
                                "Update Product"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditProduct;