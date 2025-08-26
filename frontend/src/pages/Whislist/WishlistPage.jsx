import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { FiHeart, FiShoppingBag, FiLoader } from 'react-icons/fi';
import { toast } from 'react-toastify';

const WishlistPage = () => {
    const { wishlist, wishlistLoading, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();
    const [loadingProductId, setLoadingProductId] = useState(null); // For 'Add to Bag' loading state

    const handleAddToCart = async (product) => {
        const variantToAdd = product.variants?.[0];
        if (!variantToAdd) {
            toast.error("This product has no selectable variants.");
            return;
        }
        if (variantToAdd.stock < 1) {
            toast.error("This item is currently out of stock.");
            return;
        }

        setLoadingProductId(product._id);
        try {
            await addToCart(product, variantToAdd, 1);
            toast.success("Added to your bag!");
            // Optionally remove from wishlist after adding to cart
            // removeFromWishlist(product._id); 
        } catch (err) {
            toast.error("Failed to add item to bag.");
        } finally {
            setLoadingProductId(null);
        }
    };

    return (
        <div className="min-h-screen mt-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 nunito">My Wishlist</h1>
                    <Link to="/shop" className="text-maroon hover:text-violet-700 font-semibold transition">
                        &larr; Continue Shopping
                    </Link>
                </div>

                {wishlistLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <FiLoader className="animate-spin text-4xl text-maroon" />
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="mb-4 text-5xl text-black/40">
                            <FiHeart className="inline-block" />
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Your Wishlist is Empty</h2>
                        <p className="text-gray-500 mb-6">
                            Looks like you haven’t added anything to your wishlist yet.
                        </p>
                        <Link
                            to="/shop"
                            className="bg-maroon text-white px-6 py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors duration-300"
                        >
                            Explore Products
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {wishlist.map(product => (
                            <div
                                key={product._id}
                                className="bg-white rounded-lg shadow-md overflow-hidden group transition-shadow duration-300 hover:shadow-xl"
                            >
                                <div className="relative">
                                    <Link to={`/products/${product.slug}`} state={{ productId: product._id }}>
                                        <img
                                            src={product.mainImage || 'https://placehold.co/400x400/E0E0E0/6C6C6C?text=No+Image'}
                                            alt={product.title}
                                            className="w-full h-64 object-cover"
                                        />
                                    </Link>
                                    {/* Remove from Wishlist Button */}
                                    <button
                                        onClick={() => removeFromWishlist(product._id)}
                                        className="absolute top-3 right-3 bg-white rounded-full p-2 text-gray-700 hover:text-red-500 transition-colors"
                                        aria-label="Remove from wishlist"
                                    >
                                        <FiHeart className="w-5 h-5 fill-current text-red-500" />
                                    </button>
                                </div>
                                <div className="p-4 flex flex-col">
                                    <Link to={`/products/${product.slug}`} className="block flex-grow">
                                        <h3 className="text-lg font-semibold text-gray-800 truncate nunito mb-1">
                                            {product.title}
                                        </h3>
                                        {product.variants && product.variants.length > 0 && (
                                            <p className="text-xl font-bold text-gray-900 nunito">
                                                ${product.variants[0].price}
                                            </p>
                                        )}
                                    </Link>
                                    <button
                                        onClick={() => handleAddToCart(product)}
                                        disabled={loadingProductId === product._id}
                                        className="mt-4 w-full bg-maroon text-white py-2 rounded-md hover:bg-violet-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loadingProductId === product._id ? (
                                            <FiLoader className="animate-spin h-5 w-5" />
                                        ) : (
                                            <>
                                                <FiShoppingBag />
                                                <span>Add to Bag</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WishlistPage;
