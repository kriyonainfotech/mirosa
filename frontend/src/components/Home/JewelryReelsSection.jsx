import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const JewelryReelsSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollContainerRef = useRef(null);

    // --- 1. Added videoUrl to each reel ---
    const reels = [
        {
            id: 1,
            title: "Diamond Collection",
            description: "Explore our timeless diamond pieces",
            views: "24.8K",
            videoUrl: "https://res.cloudinary.com/de939fabp/video/upload/v1722765354/pexels-c-technical-6334251_1080p_b5w07s.mp4"
        },
        {
            id: 2,
            title: "Gold Heritage",
            description: "Traditional craftsmanship meets modern design",
            views: "18.3K",
            videoUrl: "https://res.cloudinary.com/de939fabp/video/upload/v1722765354/pexels-c-technical-6334251_1080p_b5w07s.mp4"
        },
        {
            id: 3,
            title: "Pearl Elegance",
            description: "Discover the beauty of natural pearls",
            views: "32.1K",
            videoUrl: "https://res.cloudinary.com/de939fabp/video/upload/v1722765354/pexels-c-technical-6334251_1080p_b5w07s.mp4"
        },
        {
            id: 4,
            title: "Emerald Treasures",
            description: "Vibrant green gems in contemporary settings",
            views: "15.7K",
            videoUrl: "https://res.cloudinary.com/de939fabp/video/upload/v1722765354/pexels-c-technical-6334251_1080p_b5w07s.mp4"
        },
        {
            id: 5,
            title: "Platinum Modern",
            description: "Sleek designs for the modern individual",
            views: "21.4K",
            videoUrl: "https://res.cloudinary.com/de939fabp/video/upload/v1722765354/pexels-c-technical-6334251_1080p_b5w07s.mp4"
        },
        {
            id: 6,
            title: "Ruby Romance",
            description: "Bold statements for passionate souls",
            views: "28.9K",
            videoUrl: "https://res.cloudinary.com/de939fabp/video/upload/v1722765354/pexels-c-technical-6334251_1080p_b5w07s.mp4"
        }
    ];

    const scrollToIndex = (index) => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const item = container.children[index];
        if (item) {
            const scrollAmount = item.offsetLeft - container.offsetLeft;
            container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const handlePrev = () => {
        const newIndex = (activeIndex - 1 + reels.length) % reels.length;
        setActiveIndex(newIndex);
        scrollToIndex(newIndex);
    };

    const handleNext = () => {
        const newIndex = (activeIndex + 1) % reels.length;
        setActiveIndex(newIndex);
        scrollToIndex(newIndex);
    };


    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#faf6f2] to-light relative overflow-hidden">
            {/* ... decorative elements ... */}
            <div className="max-w-7xl mx-auto relative z-10">
                {/* ... section header ... */}
                <div className="relative">
                    {/* --- 3. Added CSS to hide the scrollbar --- */}
                    <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
                    <div
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-12 scrollbar-hide"
                        style={{ scrollBehavior: 'smooth' }}
                    >
                        {reels.map((reel, index) => (
                            <motion.div
                                key={reel.id}
                                className="flex-shrink-0 w-[300px] snap-center"
                            // ... animation props ...
                            >
                                <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                                    {/* --- 4. Replaced placeholder with actual video --- */}
                                    <video
                                        src={reel.videoUrl}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="aspect-[9/16] w-full h-full object-cover"
                                    />
                                    {/* Info overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
                                        <h3 className="text-xl font-serif text-white mb-1">{reel.title}</h3>
                                        <p className="text-white/80 text-sm">{reel.description}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation controls (now enabled for looping) */}
                    <div className="flex justify-center items-center mt-6 space-x-4">
                        <motion.button
                            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-rose-900 hover:text-white"
                            onClick={handlePrev}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </motion.button>

                        {/* ... indicator dots ... */}

                        <motion.button
                            className="w-12 h-12 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-rose-900 hover:text-white"
                            onClick={handleNext}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </motion.button>
                    </div>
                </div>
                {/* ... CTA ... */}
            </div>
        </section>
    );
};

export default JewelryReelsSection;