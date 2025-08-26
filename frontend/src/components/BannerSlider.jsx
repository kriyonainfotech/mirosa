// import React, { useState, useEffect } from 'react';
// import { FiChevronLeft, FiChevronRight, } from 'react-icons/fi';

// const banners = [
//     '/banner/banner1.png',
//     '/banner/banner2.png',
//     '/banner/banner3.png'
// ];

// export default function BannerSlider() {
//     const [current, setCurrent] = useState(0);
//     const total = banners.length;

//     const nextSlide = () => setCurrent((current + 1) % total);
//     const prevSlide = () => setCurrent((current - 1 + total) % total);

//     useEffect(() => {
//         const interval = setInterval(() => {
//             setCurrent((prev) => (prev + 1) % total);
//         }, 5000); // changes slide every 5 sec

//         return () => clearInterval(interval); // cleanup on unmount
//     }, [total]);


//     return (
//         <section className="w-full aspect-[13/6] overflow-hidden relative">
//             {/* Slide */}
//             <div
//                 className="w-full h-full bg-cover bg-[center_50%] transition-all duration-700"
//                 style={{ backgroundImage: `url(${banners[current]})` }}
//             />

//             {/* Arrows */}
//             <button
//                 className="absolute top-1/2 left-4 transform -translate-y-1/2 text-3xl text-white bg-black/30 hover:bg-black/50 p-2 rounded-full z-10"
//                 onClick={prevSlide}
//             >
//                 <FiChevronLeft />
//             </button>

//             <button
//                 className="absolute top-1/2 right-4 transform -translate-y-1/2 text-3xl text-white bg-black/30 hover:bg-black/50 p-2 rounded-full z-10"
//                 onClick={nextSlide}
//             >
//                 <FiChevronRight />
//             </button>
//         </section>
//     );
// }
import React, { useState, useEffect, useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const slides = [
    {
        title: "Timeless Elegance",
        subtitle: "Handcrafted jewelry that tells your story",
        cta: "Discover Collection",
        video: '/34590-402333480_small.mp4',
        link: 'shop'
    },
    {
        title: "Modern Heirlooms",
        subtitle: "Pieces destined to be treasured",
        cta: "New Arrivals",
        video: '/34590-402333480_small.mp4',
        link: '/new-arrivals'
    },
    {
        title: "Artisan Crafted",
        subtitle: "Ethically sourced, meticulously designed",
        cta: "Meet Our Makers",
        video: '/videos/jewelry-hero-3.mp4',
        link: '/about'
    }
];

export default function BannerSlider() {
    const [current, setCurrent] = useState(0);
    const total = slides.length;
    const videoRef = useRef(null);
    const containerRef = useRef(null);

    const nextSlide = () => setCurrent((current + 1) % total);
    const prevSlide = () => setCurrent((current - 1 + total) % total);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % total);
        }, 7000);

        return () => clearInterval(interval);
    }, [total]);

    return (
        <>
            {/* Video Hero Section */}
            <section
                ref={containerRef}
                className="relative h-screen overflow-hidden"
            >
                {/* Video Background */}
                <div className="absolute inset-0 z-0">
                    <video
                        ref={videoRef}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={slides[current].video} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                </div>

                {/* Content overlay */}
                <div className="relative z-10 h-full flex flex-col">
                    <div className="flex-grow flex flex-col items-center justify-center px-4 text-center">
                        <div className="max-w-4xl space-y-6 transition-all duration-1000 transform">
                            <h1 className="text-4xl md:text-6xl font-serif font-light text-white tracking-wide">
                                {slides[current].title}
                            </h1>
                            <p className="text-xl md:text-2xl text-white/90 font-light max-w-2xl mx-auto">
                                {slides[current].subtitle}
                            </p>
                            {/* <Link href={slides[current].link} className="mt-8 bg-transparent border border-white text-white px-8 py-3 hover:bg-white hover:text-black transition duration-300 text-sm tracking-widest">
                                {slides[current].cta}
                            </Link> */}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="absolute inset-y-0 w-full flex items-center justify-between px-4">
                        <button
                            className="text-xl text-white bg-black/30 hover:bg-black/50 p-3 rounded-full backdrop-blur-sm"
                            onClick={prevSlide}
                        >
                            <FiChevronLeft size={24} />
                        </button>
                        <button
                            className="text-xl text-white bg-black/30 hover:bg-black/50 p-3 rounded-full backdrop-blur-sm"
                            onClick={nextSlide}
                        >
                            <FiChevronRight size={24} />
                        </button>
                    </div>

                    {/* Slide Indicator */}
                    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                className={`w-2.5 h-2.5 rounded-full transition-all ${index === current
                                    ? 'bg-white w-6'
                                    : 'bg-white/50'
                                    }`}
                                onClick={() => setCurrent(index)}
                                aria-label={`Go to slide ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Spacer to push content below */}
            {/* <div className="h-screen"></div> */}
        </>
    );
}