import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from 'react-modal';
import { toast } from 'react-toastify'

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const VariantModal = ({ product, onClose }) => {
    return (

        <div className="fixed inset-0 z-50 bg-black/40 bg-opacity-40 flex items-center justify-center">
            <div className="bg-white max-w-4xl w-full rounded-lg p-6 shadow-lg relative">
                <h2 className="text-xl font-semibold mb-4">
                    Variants of {product.title}
                </h2>
                <button
                    className="absolute top-2 right-4 text-lg font-bold text-gray-700"
                    onClick={onClose}
                >
                    ✕
                </button>

                {product.variants?.length > 0 ? ( // Added check for variants existence
                    product.variants.map((variant, idx) => (
                        <div key={idx} className="border rounded-md p-4 mb-4">
                            {/* Row 1: Material, Purity, Size */}
                            <p className="mb-2 text-gray-700">
                                <strong>Material:</strong> {variant.material} |{" "}
                                <strong>Purity:</strong> {variant.purity} |{" "}
                                <strong>Size:</strong> {variant.size || 'N/A'} {/* Added N/A for clarity if size can be empty */}
                            </p>
                            {/* Row 2: Price, SKU, Weight */}
                            <p className="mb-2 text-gray-700">
                                <strong>Price:</strong> ₹{variant.price} |{" "}
                                <strong>SKU:</strong> {variant.sku} |{" "}
                                <strong>Weight:</strong> {variant.weight ? `${variant.weight}g` : 'N/A'} {/* Show grams */}
                            </p>
                            {/* Row 3: Stock Status */}
                            <p className="mb-2 text-gray-700">
                                <strong>Stock:</strong>{" "}
                                <span className={variant.inStock ? "text-green-600" : "text-red-600"}>
                                    {variant.inStock ? "In Stock" : "Out of Stock"}
                                </span>
                            </p>

                            {/* Images Section */}
                            <div className="flex gap-3 mt-2 flex-wrap">
                                {variant.images?.length > 0 ? ( // Check if images array has items
                                    variant.images.map((img, i) => (
                                        <img
                                            key={i}
                                            src={img}
                                            alt={`Variant-${idx}-Image-${i}`}
                                            className="w-20 h-20 object-cover rounded border border-gray-200"
                                        />
                                    ))
                                ) : (
                                    <p className="text-gray-400">No Images Available for this Variant</p>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-600 text-center py-4">No variants available for this product.</p>
                )}
            </div>
        </div>
    );
};

const BulkAddModal = ({ isOpen, onRequestClose }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const token = localStorage.getItem('token');

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error("Please select a CSV file.");
            return;
        }
        setIsUploading(true);
        const formData = new FormData();
        formData.append('productCsv', selectedFile);

        try {
            const { data } = await axios.post(`${backdendUrl}/api/product/bulk-add`, formData, {
                withCredentials: true, // 🛂 This is what you need
                headers: {
                    "Content-Type": "multipart/form-data", // assuming you're sending a file
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success(data.message);
            setSelectedFile(null);
            onRequestClose(); // Close modal on success
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Bulk Add Products"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg"
            overlayClassName="fixed inset-0 bg-black/50"
        >
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Bulk Add Products</h2>
                <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Download the template, fill it with your product data, and upload the saved CSV file here.
            </p>
            <a
                href="/product_template.csv" // Place this file in your /public folder
                download
                className="inline-block mb-3 text-indigo-600 hover:text-indigo-700 hover:underline font-semibold"
            >
                Download Template
            </a>

            <div className="mt-4">
                <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-2">
                    Select CSV File
                </label>
                <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
            </div>

            <div className="flex justify-end mt-8 border-t pt-4">
                <button onClick={onRequestClose} className="px-4 py-2 text-gray-700 rounded-md mr-2">Cancel</button>
                <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="px-6 py-2 bg-maroon text-white font-semibold rounded-md shadow-sm disabled:opacity-70"
                >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                </button>
            </div>
        </Modal>
    );
};

const ViewProduct = () => {
    const [products, setProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [categoryId, setCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");
    const [allCategories, setAllCategories] = useState([]);
    const [allSubCategories, setAllSubCategories] = useState([]);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

    const navigate = useNavigate()

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    `${backdendUrl}/api/product/getproducts`
                );

                console.log(response.data, "all products");
                if (response.data.success === true) {
                    setProducts(response.data.products);
                    localStorage.setItem("allProducts", JSON.stringify(response.data.products)); // Use response.data.products
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            }
        };

        fetchProducts();
    }, []);

    const handleFilter = () => {
        const allProducts = JSON.parse(localStorage.getItem("allProducts") || "[]");

        let filtered = allProducts;

        if (categoryId) {
            filtered = filtered.filter((p) => p.category?._id === categoryId);
        }

        if (subCategoryId) {
            filtered = filtered.filter((p) => p.subcategory?._id === subCategoryId);
        }

        console.log(filtered, "filtered products")
        setProducts(filtered);
    };

    useEffect(() => {
        handleFilter();
    }, [categoryId, subCategoryId]);

    useEffect(() => {
        const storedCategories = JSON.parse(
            localStorage.getItem("categories") || "[]"
        );
        setAllCategories(storedCategories);
    }, []);

    useEffect(() => {
        console.log(categoryId, "cat id");
        const category = allCategories.find((cat) => cat._id === categoryId);
        console.log(category, "cat");
        if (category) {
            setAllSubCategories(category.subcategories || []);
        } else {
            setAllSubCategories([]);
        }

        handleFilter(); // Automatically filter when category/subcategory changes
    }, [categoryId, subCategoryId]);

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?"))
            return;

        try {
            const res = await axios.delete(`${backdendUrl}/api/product/delete-product/${productId}`);

            console.log(res.data, "product delete");
            if (res.status === 200) {
                alert("Product deleted successfully");

                // ✅ Remove from localStorage
                const stored = JSON.parse(localStorage.getItem("allProducts") || "[]");
                const updated = stored.filter((p) => p._id !== productId);
                localStorage.setItem("allProducts", JSON.stringify(updated));

                // ✅ Update React state
                setProducts((prev) => prev.filter((p) => p._id !== productId));
            } else {
                alert("Failed to delete: " + res.data.message);
            }
        } catch (err) {
            console.error("Delete error:", err);
            // Handle both server and network errors
            if (err.response && err.response.data && err.response.data.message) {
                alert("Failed to delete: " + err.response.data.message);
            } else {
                alert("Something went wrong");
            }
        }
    };

    return (
        <div className="p-6 mt-10 md:mt-0">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-semibold fraunces">Manage Products</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition duration-300"
                    >
                        Add Bulk Products
                    </button>
                    <Link
                        to={"/admin/products/add"}
                        className="bg-violet-800 no-underline text-white px-4 py-2 rounded-md shadow-md hover:bg-violet-700 transition duration-300"
                    >
                        Add Single Product
                    </Link>
                </div>

                <BulkAddModal
                    isOpen={isBulkModalOpen}
                    onRequestClose={() => setIsBulkModalOpen(false)}
                />
            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg p-2">
                <div className="flex justify-start items-center ">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Category
                            </label>
                            <select
                                className="block w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm transition duration-200 ease-in-out hover:border-violet-400"
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    setSubCategoryId(""); // Reset subcategory on category change
                                }}
                            >
                                <option value="">All Categories</option>
                                {allCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Subcategory
                            </label>
                            <select
                                className="block w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500 text-sm transition duration-200 ease-in-out hover:border-violet-400"
                                value={subCategoryId}
                                onChange={(e) => setSubCategoryId(e.target.value)}
                                disabled={!categoryId}
                            >
                                <option value="">All Subcategories</option>
                                {allSubCategories.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Reset Filter Button */}
                    <div className="flex justify-start ps-3">
                        <button
                            onClick={() => {
                                setCategoryId("");
                                setSubCategoryId("");
                                handleFilter(); // Reset the filter to show all products
                            }}
                            className="px-4 py-2 bg-purple-500 text-white rounded-3xl shadow-md hover:bg-violet-600 focus:outline-none transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            Reset Filter
                        </button>
                    </div>
                </div>

                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold">
                            <th className="px-3 py-3 border-b">Thumbnail</th>
                            <th className="px-3 py-3 border-b">Product Title</th>
                            <th className="px-3 py-3 border-b">Category</th>
                            <th className="px-3 py-3 border-b">Subcategory</th>
                            {/* <th className="px-3 py-3 border-b">Description</th> */}
                            {/* <th className="px-3 py-3 border-b">Tags</th> */}
                            <th className="px-3 py-3 border-b text-center">Variants</th>
                            {/* <th className="px-3 py-3 border-b text-center">Status</th> */}
                            <th className="px-3 py-3 border-b text-center">Actions</th>
                        </tr>
                    </thead>

                    {products.length === 0 ? (
                        <tbody>
                            <tr>
                                <td colSpan="6" className="text-center py-12"> {/* colSpan should match number of columns */}
                                    <div className="flex flex-col justify-center rounded-lg">
                                        <div className="text-gray-500 text-xl mb-4">
                                            <svg
                                                className="w-16 h-16 mx-auto text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                        </div>
                                        <p className="text-gray-600 text-lg font-medium">
                                            No products available at the moment
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    ) : (
                        <>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="text-sm">
                                        <td className="px-6 py-4 border-b">
                                            <img
                                                src={product.mainImage || "/no-image.png"}
                                                className="w-14 h-14 object-cover rounded"
                                                alt={product.title}
                                            />
                                        </td>
                                        <td className="px-3 py-2 border-b">{product.title}</td>
                                        <td className="px-3 py-2 border-b">
                                            {product.category?.name}
                                        </td>
                                        <td className="px-3 py-2 border-b">
                                            {product.subcategory?.name || "N/A"}
                                        </td>
                                        {/* 
                                        <td className="px-3 py-2 border-b">
                                            {product?.tags?.join(", ") || "-"}
                                        </td> */}
                                        <td className="px-3 py-2 border-b text-center">
                                            <button
                                                className="text-indigo-600 bg-indigo-100 px-3 py-2 rounded-lg hover:underline"
                                                onClick={() => setSelectedProduct(product)}
                                            >
                                                {product.variants?.length} Variant
                                                {product.variants?.length > 1 ? "s" : ""}
                                            </button>
                                        </td>
                                        {/* <td className="px-3 py-2 border-b text-center capitalize">
                      {product.status?.status ? "Active" : "Inactive"}
                    </td> */}
                                        <td className="px-3 py-2 border-b text-center">
                                            <button
                                                className="bg-gray-500 text-white px-3 py-2 rounded-md mx-2 cursor-pointer"
                                                onClick={() => navigate(`/admin/view-product/${product._id}`, { state: { product } })}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="bg-blue-500 text-white px-3 py-2 rounded-md mx-2 cursor-pointer"
                                                onClick={() => navigate(`/admin/edit-product/${product._id}`, { state: { product } })}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="text-white px-3 py-2 rounded-md bg-red-500 hover:text-red-700 mx-2"
                                                onClick={() => handleDeleteProduct(product._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </>
                    )}
                </table>

                {/* 🔍 Variant Modal */}
                {selectedProduct && (
                    <VariantModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                    />
                )}
            </div>
        </div>
    );
};

export default ViewProduct;
