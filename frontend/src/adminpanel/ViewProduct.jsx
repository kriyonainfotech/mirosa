import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Upload,
    FileDown,
    X,
    Filter,
    RotateCcw,
    Package,
    Layers,
    ChevronDown,
    Image as ImageIcon,
    Loader2
} from "lucide-react";

// Hardcoded for preview environment compatibility
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// --- Components ---

// Custom Modal Component to replace react-modal
const CustomModal = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                {children}
            </div>
        </div>
    );
};

const VariantModal = ({ product, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            ></div>
            <div className="bg-white max-w-3xl w-full rounded-xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] z-10">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Product Variants
                        </h2>
                        <p className="text-sm text-gray-500">
                            {product.title}
                        </p>
                    </div>
                    <button
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                        onClick={onClose}
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto">
                    {product.variants?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            {product.variants.map((variant, idx) => (
                                <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${variant.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {variant.inStock ? "In Stock" : "Out of Stock"}
                                        </span>
                                        <span className="text-sm font-mono text-gray-500">
                                            SKU: {variant.sku}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm text-gray-700 mb-4">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Price:</span>
                                            <span className="font-semibold text-gray-900">₹{variant.price}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Material:</span>
                                            <span>{variant.material}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Purity:</span>
                                            <span>{variant.purity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Size:</span>
                                            <span>{variant.size || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Weight:</span>
                                            <span>{variant.weight ? `${variant.weight}g` : 'N/A'}</span>
                                        </div>
                                    </div>

                                    {/* Images Section */}
                                    <div className="border-t border-gray-100 pt-3">
                                        <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Variant Images</p>
                                        <div className="flex gap-2 overflow-x-auto pb-1">
                                            {variant.images?.length > 0 ? (
                                                variant.images.map((img, i) => (
                                                    <img
                                                        key={i}
                                                        src={img}
                                                        alt={`Variant-${idx}-Image-${i}`}
                                                        className="w-16 h-16 object-cover rounded border border-gray-200"
                                                    />
                                                ))
                                            ) : (
                                                <span className="text-xs text-gray-400 italic">No images</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                            <Package className="mx-auto text-gray-300 mb-3" size={48} />
                            <p className="text-gray-600 font-medium">No variants available for this product.</p>
                        </div>
                    )}
                </div>
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
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success(data.message);
            setSelectedFile(null);
            onRequestClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Upload failed.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <CustomModal isOpen={isOpen} onClose={onRequestClose}>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Bulk Import</h2>
                        <p className="text-sm text-gray-500">Upload multiple products via CSV</p>
                    </div>
                    <button onClick={onRequestClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <FileDown className="text-indigo-600 mt-1 shrink-0" size={20} />
                    <div>
                        <h3 className="font-semibold text-indigo-900 text-sm">Step 1: Get the template</h3>
                        <p className="text-sm text-indigo-700 mb-2">
                            Download the official CSV template to structure your data correctly.
                        </p>
                        <a
                            href="/product_template.csv"
                            download
                            className="text-xs font-semibold text-white bg-indigo-600 px-3 py-1.5 rounded hover:bg-indigo-700 transition-colors inline-flex items-center gap-1 no-underline"
                        >
                            <FileDown size={12} /> Download Template
                        </a>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-semibold text-gray-900 text-sm mb-2">Step 2: Upload CSV</h3>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-3 text-gray-400" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-gray-500">CSV files only</p>
                        </div>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                    {selectedFile && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded border border-green-100">
                            <FileDown size={16} />
                            <span className="truncate flex-1">{selectedFile.name}</span>
                            <button onClick={() => setSelectedFile(null)} className="text-green-800 hover:text-green-950"><X size={14} /></button>
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        onClick={onRequestClose}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className={`px-4 py-2 text-white font-medium rounded-lg flex items-center gap-2 shadow-sm ${!selectedFile || isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'}`}
                    >
                        {isUploading ? (
                            <>
                                <Loader2 className="animate-spin" size={16} /> Uploading...
                            </>
                        ) : 'Start Import'}
                    </button>
                </div>
            </div>
        </CustomModal>
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
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    `${backdendUrl}/api/product/getproducts`
                );

                console.log(response.data, "all products");
                if (response.data.success === true) {
                    setProducts(response.data.products);
                    localStorage.setItem("allProducts", JSON.stringify(response.data.products));
                }
            } catch (err) {
                console.error("Error fetching products:", err);
            } finally {
                setLoading(false);
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
        const category = allCategories.find((cat) => cat._id === categoryId);
        if (category) {
            setAllSubCategories(category.subcategories || []);
        } else {
            setAllSubCategories([]);
        }
        handleFilter();
    }, [categoryId, subCategoryId]);

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?"))
            return;

        try {
            const res = await axios.delete(`${backdendUrl}/api/product/delete-product/${productId}`);

            if (res.status === 200) {
                toast.success("Product deleted successfully");
                const stored = JSON.parse(localStorage.getItem("allProducts") || "[]");
                const updated = stored.filter((p) => p._id !== productId);
                localStorage.setItem("allProducts", JSON.stringify(updated));
                setProducts((prev) => prev.filter((p) => p._id !== productId));
            } else {
                toast.error("Failed to delete: " + res.data.message);
            }
        } catch (err) {
            console.error("Delete error:", err);
            if (err.response && err.response.data && err.response.data.message) {
                toast.error("Failed to delete: " + err.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                <p className="text-gray-500 font-medium">Loading Inventory...</p>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50/50 font-sans">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 fraunces">
                        Product Inventory
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Manage your catalog, prices, and stock levels.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsBulkModalOpen(true)}
                        className="bg-white text-gray-700 border border-gray-300 px-4 py-2.5 rounded-lg shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 font-medium text-sm"
                    >
                        <Upload size={16} /> Bulk Import
                    </button>
                    <Link
                        to={"/admin/products/add"}
                        className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 font-medium no-underline text-sm"
                    >
                        <Plus size={16} /> Add Product
                    </Link>
                </div>

                <BulkAddModal
                    isOpen={isBulkModalOpen}
                    onRequestClose={() => setIsBulkModalOpen(false)}
                />
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Filters Toolbar */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-medium mr-2">
                            <Filter size={16} /> Filters:
                        </div>

                        {/* Category Dropdown */}
                        <div className="relative w-full md:w-48">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Package className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                className="block w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none"
                                value={categoryId}
                                onChange={(e) => {
                                    setCategoryId(e.target.value);
                                    setSubCategoryId("");
                                }}
                            >
                                <option value="">All Categories</option>
                                {allCategories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Subcategory Dropdown */}
                        <div className="relative w-full md:w-48">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Layers className="h-4 w-4 text-gray-400" />
                            </div>
                            <select
                                className="block w-full pl-10 pr-8 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none disabled:bg-gray-100 disabled:text-gray-400"
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
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <ChevronDown className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Reset Button */}
                        {(categoryId || subCategoryId) && (
                            <button
                                onClick={() => {
                                    setCategoryId("");
                                    setSubCategoryId("");
                                    handleFilter();
                                }}
                                className="ml-auto text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 hover:bg-indigo-50 px-3 py-1.5 rounded transition-colors"
                            >
                                <RotateCcw size={14} /> Reset
                            </button>
                        )}

                        <div className="ml-auto text-sm text-gray-500 hidden md:block">
                            Showing <strong>{products.length}</strong> products
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Thumbnail</th>
                                <th className="px-6 py-4">Product Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4 text-center">Variants</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-16">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                                <Package className="text-gray-400" size={32} />
                                            </div>
                                            <h3 className="text-gray-900 font-medium mb-1">No products found</h3>
                                            <p className="text-gray-500 text-sm">Try adjusting your filters or add a new product.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => (
                                    <tr key={product._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        {/* Image */}
                                        <td className="px-6 py-4">
                                            <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative">
                                                {product.mainImage ? (
                                                    <img
                                                        src={product.mainImage}
                                                        className="w-full h-full object-cover"
                                                        alt={product.title}
                                                    />
                                                ) : (
                                                    <ImageIcon className="text-gray-300" size={20} />
                                                )}
                                            </div>
                                        </td>

                                        {/* Title & SKU */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-sm">
                                                {product.title}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1 truncate max-w-[200px]">
                                                ID: {product._id}
                                            </div>
                                        </td>

                                        {/* Category Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center w-fit px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                    {product.category?.name || "Uncategorized"}
                                                </span>
                                                {product.subcategory && (
                                                    <span className="text-xs text-gray-500 pl-1 border-l-2 border-gray-200 ml-1">
                                                        {product.subcategory.name}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Variants Badge */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium rounded-full hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                                onClick={() => setSelectedProduct(product)}
                                            >
                                                <Layers size={12} />
                                                {product.variants?.length || 0} Variant{(product.variants?.length !== 1) && "s"}
                                            </button>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip"
                                                    onClick={() => navigate(`/admin/view-product/${product._id}`, { state: { product } })}
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                    onClick={() => navigate(`/admin/edit-product/${product._id}`, { state: { product } })}
                                                    title="Edit Product"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    title="Delete Product"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Variant Modal */}
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