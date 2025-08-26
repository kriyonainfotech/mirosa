import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// --- Individual Image Tile with Zoom (No changes needed) ---
const ImageTile = ({ imageUrl, alt }) => {
    const [zoomStyle, setZoomStyle] = useState({ opacity: 0 });

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setZoomStyle({
            backgroundPosition: `${x}% ${y}%`,
            backgroundImage: `url(${imageUrl})`,
            opacity: 1,
        });
    };

    const handleMouseLeave = () => {
        setZoomStyle({ opacity: 0 });
    };

    return (
        <div
            className="relative aspect-square bg-gray-100 overflow-hidden cursor-zoom-in group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <img src={imageUrl} alt={alt} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div
                className="absolute inset-0 pointer-events-none transition-opacity duration-300 bg-white"
                style={{ ...zoomStyle, backgroundRepeat: 'no-repeat', backgroundSize: '250%' }}
            />
        </div>
    );
};


// --- Redesigned Main Gallery Component ---
const ImageGallery = ({ product, selectedMaterial, onClearFilter }) => {
    const [displayImages, setDisplayImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollRef = useRef(null);

    // Filter images based on selected material
    useEffect(() => {
        const allUniqueImages = [...new Set([
            product.mainImage,
            ...product.variants.flatMap(v => v.images)
        ].filter(Boolean))];

        if (selectedMaterial) {
            const materialImages = product.variants
                .filter(v => v.material === selectedMaterial)
                .flatMap(v => v.images);
            setDisplayImages([...new Set([product.mainImage, ...materialImages].filter(Boolean))]);
        } else {
            setDisplayImages(allUniqueImages);
        }
        setCurrentIndex(0); // Reset to first image on filter change
    }, [product, selectedMaterial]);

    // --- Navigation Handlers for Mobile Slider ---
    const handlePrev = () => {
        const newIndex = currentIndex === 0 ? displayImages.length - 1 : currentIndex - 1;
        setCurrentIndex(newIndex);
        scrollToIndex(newIndex);
    };

    const handleNext = () => {
        const newIndex = currentIndex === displayImages.length - 1 ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
        scrollToIndex(newIndex);
    };

    const scrollToIndex = (index) => {
        if (scrollRef.current) {
            const scrollWidth = scrollRef.current.scrollWidth / displayImages.length;
            scrollRef.current.scrollTo({ left: index * scrollWidth, behavior: 'smooth' });
        }
    };

    return (
        <div className="w-full">
            {/* "Show All" Button (Desktop only) */}
            {selectedMaterial && (
                <div className="mb-4 text-right hidden md:block">
                    <button onClick={onClearFilter} className="text-sm text-gray-600 underline hover:text-maroon transition">
                        Show All Images
                    </button>
                </div>
            )}

            {/* --- Main Image Container --- */}
            <div className="relative">
                {/* Mobile Slider */}
                <div
                    ref={scrollRef}
                    className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
                    style={{ scrollBehavior: 'smooth' }}
                >
                    {displayImages.map((img, index) => (
                        <div key={index} className="w-full flex-shrink-0 snap-center">
                            <ImageTile imageUrl={img} alt={`${product.title} view ${index + 1}`} />
                        </div>
                    ))}
                </div>

                {/* Desktop Grid */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-4">
                    {displayImages.map((img, index) => (
                        <ImageTile key={index} imageUrl={img} alt={`${product.title} view ${index + 1}`} />
                    ))}
                </div>

                {/* --- Navigation Arrows (Mobile Only) --- */}
                <div className="md:hidden absolute inset-0 flex items-center justify-between px-2">
                    <button onClick={handlePrev} className="">
                        <FiChevronLeft className="h-6 w-6 text-gray-800" />
                    </button>
                    <button onClick={handleNext} className="">
                        <FiChevronRight className="h-6 w-6 text-gray-800" />
                    </button>
                </div>
            </div>

            {/* --- Slide Indicators (Mobile Only) --- */}
            <div className="md:hidden flex justify-center items-center gap-2 mt-4">
                {displayImages.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setCurrentIndex(index);
                            scrollToIndex(index);
                        }}
                        className={`w-2 h-2 rounded-full transition ${currentIndex === index ? 'bg-maroon' : 'bg-gray-300'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
