import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// Old - using Heroicons (solid)
// import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { FaArrowLeft, FaArrowRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// Helper component for status badges
const StatusBadge = ({ status }) => {
    const baseClasses = "px-3 py-1 text-xs font-medium rounded-full inline-block";
    const styles = {
        active: "bg-green-100 text-green-800",
        inactive: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};


const AdminViewProduct = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState('');


    useEffect(() => {
        // This function will fetch the product data from your API
        const fetchProduct = async () => {
            setLoading(true); // Show loading indicator
            setError(null);   // Clear previous errors

            try {
                // Replace with your actual backend URL variable

                const response = await axios.get(`${backdendUrl}/api/product/get-product/${productId}`);

                if (response.data) {
                    setProduct(response.data.product);
                    setActiveImage(response.data.product.mainImage);
                } else {
                    setError('Product not found.');
                }

            } catch (error) {
                console.error("Failed to fetch product:", error);
                setError("Failed to load product data. Please try again.");
            } finally {
                setLoading(false); // Hide loading indicator
            }
        };

        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    if (loading) return <div className="p-8">Loading...</div>;
    if (error) return <div className="p-8 text-red-500">{error}</div>;
    if (!product) return null;

    console.log(product, 'product null');
    const allImages = [product.mainImage, ...product.variants.flatMap(v => v.images)];

    const calculateFinalPrice = (variant) => {
        const originalPrice = variant.price;
        const discount = variant.discount;

        if (!discount || !discount.type || discount.value <= 0) {
            return originalPrice;
        }

        let finalPrice = (discount.type === 'percentage')
            ? originalPrice - (originalPrice * discount.value / 100)
            : originalPrice - discount.value;

        return Math.max(0, finalPrice);
    };


    return (
        <div className="bg-gray-50 min-h-screen">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex justify-between items-center pb-6 border-b border-gray-200">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Details</h1>
                    <div className='flex gap-x-3'>
                        <Link to="/admin/products" className="inline-flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <FaArrowLeft className="h-4 w-4" />
                            Back
                        </Link>
                        <Link to={`/admin/edit-product/${product._id}`} className="inline-flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                            <FaArrowRight className="h-4 w-4" />
                            Edit Product
                        </Link>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Images */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <img src={activeImage} alt={product.title} className="w-full object-cover rounded-lg aspect-square" />
                            <div className="mt-4 grid grid-cols-4 gap-2">
                                {allImages.map((img, index) => (
                                    <button key={index} onClick={() => setActiveImage(img)} className={`rounded-md overflow-hidden border-2 ${activeImage === img ? 'border-indigo-500' : 'border-transparent'}`}>
                                        <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover aspect-square" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Main Details Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-start">
                                <h2 className="text-2xl font-bold text-gray-800">{product.title}</h2>
                                <StatusBadge status={product.status} />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">/products/{product.slug}</p>
                            <p className="mt-4 text-gray-600">{product.description}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <label htmlFor="">Tags : </label>
                                {product.tags.map(tag => (
                                    <span key={tag} className="bg-gray-200 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full">{tag}</span>
                                ))}
                            </div>
                            <div className="mt-4">
                                <div className="flex flex-wrap gap-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Main Image : </label>

                                    <img
                                        src={product.mainImage}
                                        alt={product.title}
                                        className="w-20 h-20 object-cover rounded-lg border border-gray-300"
                                    />
                                </div>
                            </div>

                        </div>

                        {/* General Info Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">General Information</h3>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                <div className="flex justify-between"><dt className="text-gray-500">Category</dt><dd className="text-gray-800 font-medium">{product.category.name}</dd></div>
                                <div className="flex justify-between"><dt className="text-gray-500">Subcategory</dt><dd className="text-gray-800 font-medium">{product.subcategory.name}</dd></div>
                                <div className="flex justify-between"><dt className="text-gray-500">Date Added</dt><dd className="text-gray-800 font-medium">{new Date(product.createdAt).toLocaleDateString()}</dd></div>
                                <div className="flex justify-between items-center"><dt className="text-gray-500">Featured</dt><dd>{product.isFeatured ? <FaCheckCircle className="h-5 w-5 text-green-500" /> : <FaTimesCircle className="h-5 w-5 text-red-500" />}</dd></div>
                                <div className="flex justify-between items-center"><dt className="text-gray-500">Customizable</dt><dd>{product.isCustomizable ? <FaCheckCircle className="h-5 w-5 text-green-500" /> : <FaTimesCircle className="h-5 w-5 text-red-500" />}</dd></div>
                            </dl>
                        </div>

                        {/* Variants Card */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 border-b pb-3 mb-4">Variants</h3>

                            {product.variants.map((variant, index) => {
                                // --- Logic for this specific variant ---
                                const finalPrice = calculateFinalPrice(variant);
                                const hasDiscount = finalPrice < variant.price;

                                return (
                                    <div key={variant._id || index} className={index > 0 ? "mt-6 pt-6 border-t" : ""}>
                                        {/* SKU and Stock Info */}
                                        <div className="flex justify-between items-center">
                                            <p className="font-semibold text-gray-700">SKU: {variant.sku}</p>
                                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${variant.inStock ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {variant.stock} units in stock
                                            </span>
                                        </div>

                                        {/* Main Details List */}
                                        <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                                            {/* --- Consolidated Price Display --- */}
                                            <div className="sm:col-span-2">
                                                <dt className="font-medium text-gray-900">Price</dt>
                                                <dd className="text-xl mt-1">
                                                    {hasDiscount ? (
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-gray-500 line-through">
                                                                {variant.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                            </span>
                                                            <span className="font-bold text-indigo-600">
                                                                {finalPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-gray-900">
                                                            {variant.price.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                                        </span>
                                                    )}
                                                </dd>
                                            </div>

                                            {/* --- Explicit Discount Info (only if discount exists) --- */}
                                            {hasDiscount && (
                                                <div>
                                                    <dt className="font-medium text-gray-900">Discount</dt>
                                                    <dd className="text-green-600 font-semibold">
                                                        {variant.discount.value}{variant.discount.type === 'percentage' ? '%' : ' INR'} OFF
                                                    </dd>
                                                </div>
                                            )}

                                            {/* --- Other Details --- */}
                                            <div><dt className="font-medium text-gray-900">Weight</dt><dd className="text-gray-600">{variant.weight} g</dd></div>
                                            <div><dt className="font-medium text-gray-900">Purity</dt><dd className="text-gray-600">{variant.purity}</dd></div>
                                            <div><dt className="font-medium text-gray-900">Material</dt><dd className="text-gray-600">{variant.material}</dd></div>
                                            <div>
                                                <dt className="font-medium text-gray-900">Sizes</dt>
                                                <dd className="text-gray-600">{Array.isArray(variant.size) ? variant.size.join(', ') : variant.size}</dd>
                                            </div>


                                        </dl>

                                        {/* Variant Images */}
                                        <div className="mt-4">
                                            <p className="text-sm font-medium text-gray-600 mb-2">Variant Images:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {variant.images.map((img, imgIndex) => (
                                                    <button key={imgIndex} onClick={() => setActiveImage(img)} className={`rounded-md overflow-hidden border-2 ${activeImage === img ? 'border-indigo-500' : 'border-transparent'}`}>
                                                        <img src={img} alt={`Variant ${index + 1} Image ${imgIndex + 1}`} className="w-16 h-16 object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminViewProduct;