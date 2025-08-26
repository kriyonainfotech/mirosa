import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import ImageGallery from '../../components/product/ImageGallery'; // Import new component
import VariantSelector from '../../components/product/VariantSelector'; // Import new component
import { useCart } from '../../context/CartContext';
import RelatedProductsSection from './RelatedProductsSection';
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";
import { TiArrowBack } from "react-icons/ti";

const Shimmer = () => (
    <div className="px-6 py-8 max-w-7xl mx-auto animate-pulse mt-32">
        {/* Breadcrumb Shimmer */}
        <div className="h-4 bg-gray-200 w-1/4 mb-6 rounded"></div>

        {/* Main Content Row Shimmer */}
        <div className="flex flex-col md:flex-row gap-10">
            {/* Left - Images Shimmer */}
            <div className="w-full md:w-1/2">
                <div className="w-[90%] h-96 bg-gray-200 rounded-md mb-4"></div>
                <div className="flex gap-4 mt-4">
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                    <div className="w-24 h-24 bg-gray-200 rounded-md"></div>
                </div>
            </div>

            {/* Right - Product Info Shimmer */}
            <div className="w-full md:w-1/2 space-y-5">
                <div className="h-10 bg-gray-200 w-3/4 rounded-md"></div> {/* Title */}
                <div className="h-8 bg-gray-200 w-1/4 rounded-md"></div> {/* Price */}

                <div className="space-y-2 text-sm">
                    <div className="h-4 bg-gray-200 w-1/2 rounded"></div> {/* Metal */}
                    <div className="h-4 bg-gray-200 w-2/3 rounded"></div> {/* Gender */}
                    <div className="h-4 bg-gray-200 w-1/3 rounded"></div> {/* Availability */}
                </div>

                {/* Variant Selection Shimmer */}
                <div className="space-y-4">
                    <div className="h-6 bg-gray-200 w-1/3 rounded"></div> {/* Material label */}
                    <div className="h-10 bg-gray-200 w-full rounded-md"></div> {/* Material dropdown */}
                    <div className="h-6 bg-gray-200 w-1/3 rounded"></div> {/* Purity label */}
                    <div className="h-10 bg-gray-200 w-full rounded-md"></div> {/* Purity dropdown */}
                    <div className="h-6 bg-gray-200 w-1/3 rounded"></div> {/* Size label */}
                    <div className="h-10 bg-gray-200 w-full rounded-md"></div> {/* Size dropdown/input */}
                </div>

                {/* Quantity Shimmer */}
                <div className="h-10 bg-gray-200 w-1/4 rounded-md"></div>

                {/* Buttons Shimmer */}
                <div className="flex gap-4">
                    <div className="h-12 bg-gray-200 w-1/2 rounded"></div>
                    <div className="h-12 bg-gray-200 w-1/2 rounded"></div>
                </div>

                {/* Description Shimmer */}
                <div className="h-24 bg-gray-200 w-full rounded-md"></div>
            </div>
        </div>

        {/* Item Details Section Shimmer */}
        <div className="mt-12 space-y-4">
            <div className="h-10 bg-gray-200 w-1/4 rounded-md"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 bg-gray-200 rounded-md"></div>
                <div className="h-10 bg-gray-200 rounded-md"></div>
            </div>
        </div>
    </div>
);

// ✅ NEW: Reusable Accordion Item Component
const AccordionItem = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left text-lg font-semibold text-gray-800"
            >
                <span>{title}</span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}>+</span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen mt-4' : 'max-h-0'}`}
            >
                <div className="text-gray-600 nunito leading-relaxed space-y-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default function ProductDetailPage() {
    // const { productId } = useParams();
    const location = useLocation();
    const productId = location?.state?.productId;

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [materialFilter, setMaterialFilter] = useState(null);
    const [selectedOptions, setSelectedOptions] = useState({});
    const { addToCart, cartLoading } = useCart();
    const [isSelectionComplete, setIsSelectionComplete] = useState(false);

    // Fetch product details
    useEffect(() => {
        const fetchProductDetails = async () => {
            if (!productId) {
                console.log(productId, 'poduct id missing')
                return;
            }
            setLoading(true);
            try {
                const { data } = await axios.get(`${backdendUrl}/api/product/get-product/${productId}`);
                const fetchedProduct = data.product;

                console.log(fetchedProduct, 'product')
                setProduct(fetchedProduct);

                if (fetchedProduct.variants && fetchedProduct.variants.length > 0) {
                    const firstVariant = fetchedProduct.variants[0];
                    setSelectedOptions({
                        material: firstVariant.material || null,
                        purity: firstVariant.purity || null,
                        size: firstVariant.size?.[0] || null,
                    });
                }
            } catch (err) {
                setError("Server error fetching product details.");
            } finally {
                setLoading(false);
            }
        };
        fetchProductDetails();
    }, [productId]);

    // ✅ NEW: Replace your existing validation useEffect with this one.
    useEffect(() => {
        if (!product || !product.variants || product.variants.length === 0) {
            setIsSelectionComplete(true); // No variants to select from, so it's "complete"
            return;
        }

        // 1. Find which attributes are actually used and have options in this product.
        const allMaterials = new Set(product.variants.map(v => v.material).filter(Boolean));
        const allPurities = new Set(product.variants.map(v => v.purity).filter(Boolean));
        const allSizes = new Set(product.variants.flatMap(v => v.size).filter(Boolean));

        let isComplete = true;

        // 2. For each attribute that exists, check if an option has been selected.
        // This works even if there's only one option.
        if (allMaterials.size > 0 && !selectedOptions.material) {
            isComplete = false;
        }
        if (allPurities.size > 0 && !selectedOptions.purity) {
            isComplete = false;
        }

        // 3. Special check for sizes: required for Rings, or if multiple sizes exist for other categories.
        const needsSizeSelection = (product.category?.name === 'Ring' && allSizes.size > 0) || allSizes.size > 1;
        if (needsSizeSelection && !selectedOptions.size) {
            isComplete = false;
        }

        setIsSelectionComplete(isComplete);

    }, [selectedOptions, product]);


    const handleOptionChange = (option, value) => {
        setSelectedOptions(prev => ({ ...prev, [option]: value }));
        // If the user selects a material, activate the image filter
        if (option === 'material') {
            setMaterialFilter(value);
        }
    };

    // ✅ 3. UPDATE this handler to ONLY clear the filter state
    const handleClearMaterialFilter = () => {
        setMaterialFilter(null); // This will show all images
    };

    const handleQuantityChange = (change) => {
        setQuantity(prevQty => {
            const newQty = prevQty + change;

            // Ensure the quantity doesn't go below 1
            if (newQty < 1) {
                return 1;
            }

            // Ensure the quantity doesn't exceed available stock
            if (selectedVariant && newQty > selectedVariant.stock) {
                toast.info(`Only ${selectedVariant.stock} items available.`);
                return selectedVariant.stock;
            }

            return newQty;
        });
    };

    const handleAddToCart = () => {
        if (!selectedVariant) {
            toast.error("Please select a variant.");
            return;
        }
        if (selectedVariant.stock < quantity) {
            toast.error(`Only ${selectedVariant.stock} items available in stock.`);
            return;
        }
        addToCart(product, selectedVariant, quantity, selectedOptions.size);
    };

    // This hook derives the currently selected variant based on the options
    const selectedVariant = useMemo(() => {
        if (!product || !product.variants) return null;

        // Find the best matching variant
        return product.variants.find(v =>
            (!selectedOptions.material || v.material === selectedOptions.material) &&
            (!selectedOptions.purity || v.purity === selectedOptions.purity) &&
            (!selectedOptions.size || v.size?.includes(selectedOptions.size))
        ) || product.variants[0]; // Fallback to the first variant
    }, [product, selectedOptions]);

    const calculateFinalPrice = (variant) => {   // Guard clause for safety
        if (!variant || !variant.price) return 0;
        const originalPrice = variant.price;

        const discount = variant.discount;
        // Return original price if there's no valid discount
        if (!discount || !discount.type || !discount.value || discount.value <= 0) {
            return originalPrice;
        }

        let finalPrice = (discount.type === 'percentage')
            ? originalPrice - (originalPrice * discount.value / 100)
            : originalPrice - discount.value;

        return Math.max(0, finalPrice);
    };

    const handleback = () => {
        window.history.back();
    };

    if (loading) return <Shimmer />;
    if (error || !product) { /* ... your error/not found handling ... */ }

    const finalPrice = calculateFinalPrice(selectedVariant);
    const hasDiscount = finalPrice < selectedVariant.price;

    return (
        <>
            <div className="px-6 py-8 max-w-ful mt-36 md:mt-30 lg:mx-10">

                {/* Breadcrumb */}
                <div className="flex items-center mb-6 gap-3">
                    {/* Back Icon */}
                    <button
                        onClick={() => handleback()}
                        className="cursor-pointer text-gray-800/40 hover:text-maroon text-3xl"
                    >
                        <TiArrowBack />
                    </button>

                    {/* Breadcrumb Nav */}
                    <nav className="text-sm text-gray-500">
                        <Link to="/" className="hover:underline">Home</Link> /
                        {product.category && (
                            <Link
                                to={`/collections/${product.category.slug}`}
                                className="hover:underline"
                            >
                                {" "}{product.category.name}
                            </Link>
                        )} /
                        {product.subcategory && (
                            <Link
                                to={`/collections/${product.subcategory.slug}`}
                                className="hover:underline"
                            >
                                {" "}{product.subcategory.name}
                            </Link>
                        )} /
                        <span className="text-maroon font-semibold"> {product.title}</span>
                    </nav>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">

                    {/* Left - Image Gallery */}
                    <ImageGallery
                        product={product}
                        selectedMaterial={materialFilter} // ✅ 4. Pass the NEW filter state as the prop
                        onClearFilter={handleClearMaterialFilter}
                    />

                    {/* Right - Product Info */}
                    <div className="w-full">
                        <h1 className="text-2xl md:text-4xl font-semibold text-maroon fraunces mb-2 md:mb-4">{product.title}</h1>

                        {/* Price Display */}
                        <div className="flex items-baseline gap-4 mb-2 md:mb-6">
                            <p className="text-2xl md:text-3xl text-gray-900 nunito font-semibold">
                                ${finalPrice.toLocaleString('en-IN')}
                            </p>
                            {hasDiscount && (
                                <p className="text-2xl text-gray-400 fraunces font-normal line-through">
                                    ${selectedVariant.price.toLocaleString('en-IN')}
                                </p>
                            )}
                        </div>

                        {/* Variant Selectors */}
                        <VariantSelector
                            product={product}
                            selectedOptions={selectedOptions}
                            onOptionChange={handleOptionChange}
                        />

                        {/* Quantity & Add to Cart */}
                        <div className="flex items-center gap-4 mt-
                        8">
                            <div className="flex items-center gap-4 mt-4">

                                <label className="text-md font-medium text-gray-700">Qty:</label>

                                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden shadow-sm">
                                    <button
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                        className="px-4 py-2 text-lg text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        −
                                    </button>
                                    <span className="w-10 text-center text-lg">{quantity}</span>
                                    <button
                                        onClick={() => handleQuantityChange(1)}
                                        disabled={selectedVariant && quantity >= selectedVariant.stock}
                                        className="px-4 py-2 text-lg text-gray-700 hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <p className="text-gray-600 nunito leading-relaxed mt-4 mb-8">{product.description}</p>

                        <div className="mt-6">
                            <button
                                onClick={handleAddToCart}
                                // ✅ UPDATED: Disable logic is now much smarter
                                disabled={cartLoading || !selectedVariant?.inStock || !isSelectionComplete}
                                className="w-full bg-maroon text-white py-3.5 rounded-md shadow-lg transition text-lg font-semibold hover:bg-opacity-90 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {cartLoading ? 'Adding...' : (isSelectionComplete ? 'Add to Cart' : 'Select Options')}
                            </button>
                        </div>

                        {/* ✅ NEW: Product Details Accordion */}
                        <div className="mt-10">
                            <AccordionItem title="Product Details" defaultOpen={true}>
                                {selectedVariant ? (
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li>SKU: {selectedVariant.sku}</li>
                                        <li>Approx. Weight: {selectedVariant.weight}g</li>
                                        <li>Material: {selectedVariant.material} ({selectedVariant.purity})</li>
                                        <li>Availability: <span className={selectedVariant.inStock ? 'text-green-600' : 'text-red-600'}>{selectedVariant.inStock ? 'In Stock' : 'Out of Stock'}</span></li>
                                    </ul>
                                ) : <p>Select a variant to see details.</p>}
                            </AccordionItem>
                            <AccordionItem title="Jewelery Care">
                                <p>To keep your jewelery shining, avoid contact with perfumes, lotions, and water. Store it in a soft pouch or box when not in use. Clean gently with a soft, lint-free cloth.</p>
                            </AccordionItem>
                            <AccordionItem title="Shipping & Returns">
                                <p>We offer free insured shipping on all orders within India. Enjoy our 15-day hassle-free return and exchange policy. Please refer to our policy page for more details.</p>
                            </AccordionItem>
                        </div>

                        {/* Product Details Accordion/Tabs could go here */}
                    </div>
                </div>
            </div>

            <RelatedProductsSection currentProductId={productId} />
        </>
    );
}