import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag } from 'react-icons/fi'; // Assuming you use react-icons
import { toast } from 'react-toastify'

// --- Helper Functions ---
const calculateFinalPrice = (variant) => {
    if (!variant || !variant.price) return 0;
    const { price, discount } = variant;
    if (!discount || !discount.type || !discount.value || discount.value <= 0) {
        return price;
    }
    const finalPrice = discount.type === 'percentage'
        ? price - (price * discount.value / 100)
        : price - discount.value;
    return Math.max(0, finalPrice);
};

const MaterialSwatch = ({ material, onMouseEnter, onMouseLeave, onClick, isSelected }) => {
    const materialColors = {
        "Yellow Gold": "#ceb583", // yellow-400
        "Rose Gold": "#e5bfba", // rose-400
        "White Gold": "#f1ebca", // gray-200
        "Silver": "#dbdbdb", // slate-300
        "Platinum": "#dedddb", // stone-200
    };
    return (
        <button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`w-6 h-6 rounded-full border-2 shadow cursor-pointer transition  ${isSelected ? 'border-maroon scale-110' : 'border-white hover:border-gray-400'}`}
            style={{ backgroundColor: materialColors[material] || '#E5E7EB' }}
            title={material}
        />
    );
};

// ✅ NEW: Size Swatch Component
const SizeSwatch = ({ size, isSelected, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-7 h-7 flex items-center justify-center rounded-full border text-xs transition ${isSelected ? 'bg-maroon text-white border-maroon' : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'}`}
        >
            {size}
        </button>
    );
};

// --- Main Product Card Component ---
const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWishlisted, isLoading }) => {
    const [hoveredMaterial, setHoveredMaterial] = useState(null);
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);

    const firstVariant = product.variants?.[0];
    if (!firstVariant) return null;

    const finalPrice = calculateFinalPrice(firstVariant);
    const hasDiscount = finalPrice < firstVariant.price;

    const uniqueMaterials = [...new Set(product.variants.map(v => v.material).filter(Boolean))];
    const uniqueSizes = [...new Set(product.variants.flatMap(v => v.size).filter(Boolean))];

    // Determine which image to show based on hover state
    const variantForHoveredMaterial = hoveredMaterial
        ? product.variants.find(v => v.material === hoveredMaterial)
        : null;

    // ✅ UPDATED: Image logic now prioritizes the selected material, then the hovered one
    const activeMaterial = selectedMaterial || hoveredMaterial;
    const variantForDisplay = activeMaterial
        ? product.variants.find(v => v.material === activeMaterial)
        : null;

    const displayImage = variantForDisplay?.images?.[0] || product.mainImage || 'https://placehold.co/400x400/E0E0E0/6C6C6C?text=No+Image';
    // Get the URL for the variant image, if it exists
    const variantImage = variantForDisplay?.images?.[0];

    // ✅ NEW: Handler for clicking a swatch
    const handleMaterialSelect = (material) => {
        // If the clicked material is already selected, unselect it. Otherwise, select it.
        if (selectedMaterial === material) {
            setSelectedMaterial(null);
        } else {
            setSelectedMaterial(material);
        }
    };

    const needsMaterialSelection = uniqueMaterials.length > 1;
    const needsSizeSelection = uniqueSizes.length > 0;

    const handleAddToCartClick = () => {
        // This function now has access to the variables above
        if (needsMaterialSelection && !selectedMaterial) {
            toast.info("Please select a material.");
            return;
        }
        if (needsSizeSelection && !selectedSize) {
            toast.info("Please select a size.");
            return;
        }

        const variantToAdd = product.variants.find(v =>
            v.material === (selectedMaterial || v.material) &&
            v.size.includes(selectedSize || v.size[0])
        ) || firstVariant;

        onAddToCart(product, variantToAdd, selectedSize);
    };

    return (
        <div className="relative overflow-hidden group transition-shadow duration-300">
            {/* --- Image Container --- */}
            <div className="relative group z-10">
                <Link to={`/products/${product.slug}`} state={{ productId: product._id }}>
                    {/* ✅ 1. Base Image (Always visible) */}
                    <div className='bg-gray-100'>
                        <img
                            src={product.mainImage || 'https://placehold.co/400x400/E0E0E0/6C6C6C?text=No+Image'}
                            // alt={product.title}
                            className="w-full h-44 sm:h-96 rounded object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        {/* ✅ 2. Variant Image (Fades in on top) */}
                        <img
                            src={variantImage}
                            // alt={product.title}
                            className={`absolute z-10 inset-0 w-full h-96 rounded object-cover transition-opacity duration-300 group-hover:scale-105 ${variantImage && activeMaterial ? 'opacity-100' : 'opacity-0'}`}
                        />
                    </div>
                </Link>

                {/* Wishlist Button */}
                <button
                    onClick={() => onToggleWishlist(product._id)}
                    title="Add to Wishlist"
                    className="absolute bottom-15 right-3 bg-white cursor-pointer rounded-full p-2 z-10 shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50"
                >
                    <FiHeart className={`w-5 h-5 ${isWishlisted ? 'text-red-500 fill-current' : 'text-gray-600'}`} />
                </button>

                {/* Add to Bag Button (appears on hover) */}
                <button
                    onClick={handleAddToCartClick} // Use the new handler
                    disabled={isLoading}
                    title="Add to Bag"
                    className="absolute bottom-3 right-3 bg-white rounded-full cursor-pointer p-2 z-10 shadow-md transition-all duration-300 opacity-0 group-hover:opacity-100 hover:scale-110 disabled:opacity-50"
                >
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-maroon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <FiShoppingBag className="w-5 h-5 text-gray-700" />
                    )}
                </button>
            </div>

            {/* --- Details Section --- */}
            {/* --- Details Section --- */}
            <div className="py-5 z-50">
                <Link to={`/products/${product.slug}`} state={{ productId: product._id }} className="block">
                    {/* Title: Centered by default, left-aligned on medium screens and up */}
                    <h3 className="text-sm font-semibold text-gray-800 nunito text-center md:text-left" title={product.title}>
                        {product.title}
                    </h3>
                </Link>

                {/* Price Display: Centered by default, left-aligned on medium screens and up */}
                <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <p className="text-sm font-bold text-maroon nunito">
                        ${finalPrice.toLocaleString('en-IN')}
                    </p>
                    {hasDiscount && (
                        <p className="text-sm font-normal text-gray-500 line-through">
                            ${firstVariant.price.toLocaleString('en-IN')}
                        </p>
                    )}
                </div>


                {/* ✅ Combined Variant Swatches are now centered */}
                <div className="flex items-center justify-center md:justify-start gap-4 mt-1">
                    {/* Material Swatches */}
                    {uniqueMaterials.length > 0 && (
                        <div
                            className="flex items-center gap-2"
                            onMouseLeave={() => setHoveredMaterial(null)}
                        >
                            {uniqueMaterials.slice(0, 4).map(material => (
                                <MaterialSwatch
                                    key={material}
                                    material={material}
                                    onMouseEnter={() => setHoveredMaterial(material)}
                                    onClick={() => handleMaterialSelect(material)}
                                    isSelected={selectedMaterial === material}
                                />
                            ))}
                        </div>
                    )}

                    {/* Divider */}
                    {uniqueMaterials.length > 0 && uniqueSizes.length > 0 && (
                        <div className="h-5 w-px bg-gray-200"></div>
                    )}

                    {/* Size Swatches */}
                    {uniqueSizes.length > 0 && (
                        <div className="flex items-center gap-2">
                            {uniqueSizes.slice(0, 3).map(size => (
                                <SizeSwatch
                                    key={size}
                                    size={size}
                                    isSelected={selectedSize === size}
                                    onClick={() => setSelectedSize(size)}
                                />
                            ))}
                            {uniqueSizes.length > 3 && (
                                <span className="text-xs text-gray-500 ml-1">+{uniqueSizes.length - 3}</span>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;