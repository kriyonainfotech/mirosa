import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// --- Simplified Product Card for this section ---
const ProductCard = ({ product }) => {
    const firstVariant = product.variants?.[0];
    if (!firstVariant) return null;

    return (
        <Link to={`/products/${product.slug}`} state={{ productId: product._id }}>
            <div className="group">
                <div className="aspect-square w-full bg-gray-100 overflow-hidden">
                    <img
                        src={product.mainImage || 'https://placehold.co/400x400'}
                        alt={product.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <h3 className="mt-4 text-md font-semibold text-gray-800 nunito">{product.title}</h3>
                <p className="mt-1 text-lg font-bold text-maroon nunito">
                    ${firstVariant.price.toLocaleString('en-IN')}
                </p>
            </div>
        </Link>
    );
};


// --- Main Related Products Section ---
const RelatedProductsSection = ({ currentProductId }) => {
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentProductId) return;

        const fetchRelated = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`${backdendUrl}/api/product/${currentProductId}/related`);
                if (data.success) {
                    setRelatedProducts(data.products);
                }
            } catch (error) {
                console.error("Failed to fetch related products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchRelated();
    }, [currentProductId]);

    if (loading || relatedProducts.length === 0) {
        return null; // Don't render anything if loading or no related products
    }

    return (
        <div className="py-16 px-6">
            <h2 className="text-3xl font-serif text-center text-maroon mb-12">You May Also Like</h2>
            <div className="px-4 lg:px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {relatedProducts.map(product => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RelatedProductsSection;