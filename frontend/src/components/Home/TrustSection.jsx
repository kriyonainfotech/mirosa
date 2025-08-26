import React from 'react';
import { motion } from 'framer-motion';

const TrustSection = () => {
    const trustPoints = [
        {
            iconPath: '/trust/exchange.png',
            title: 'Mirosa Exchange',
            alt: 'Mirosa Exchange Icon',
            description: 'Seamless exchange policy for your peace of mind'
        },
        {
            iconPath: '/trust/diamond.png',
            title: "Transparent & Fair Pricing",
            description: "By selling directly to you, we eliminate traditional markups to offer exceptional value.",
            alt: 'Purity Guarantee Icon',
        },
        {
            iconPath: '/trust/protection.png',
            title: 'Complete Transparency and Trust',
            alt: 'Transparency and Trust Icon',
            description: 'Detailed craftsmanship disclosure for every piece'
        },
        {
            iconPath: '/trust/trust.png',
            title: "Artisanal Craftsmanship",
            description: "Every piece is meticulously crafted to order by our skilled artisans just for you.",
            alt: 'Lifetime Maintenance Icon',
        },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.7,
                ease: "easeOut"
            }
        },
        hover: {
            y: -10,
            transition: {
                duration: 0.3,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#faf6f2] to-light relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-20 left-10 w-64 h-64 bg-[#f8efe7] rounded-full opacity-50 -z-10"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-[#f8efe7] rounded-full opacity-40 -z-10"></div>
            <div className="absolute top-1/3 right-1/4 w-10 h-10 rounded-full bg-primary/10 -z-10"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section header */}
                <div className="text-center mb-16 relative">
                    <motion.div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1/4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden lg:block"
                        initial={{ width: 0 }}
                        animate={{ width: "25%" }}
                        transition={{ duration: 1, delay: 0.2 }}
                    />
                    <motion.div
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-1/4 h-px bg-gradient-to-l from-transparent via-primary/20 to-transparent hidden lg:block"
                        initial={{ width: 0 }}
                        animate={{ width: "25%" }}
                        transition={{ duration: 1, delay: 0.2 }}
                    />

                    <motion.p
                        className="text-3xl md:text-4xl font-serif text-black italic max-w-4xl mx-auto leading-relaxed"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Trust us to be part of your precious moments and to deliver jewelery that you'll cherish forever.
                    </motion.p>
                </div>

                {/* Trust points grid */}
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {trustPoints.map((point, index) => (
                        <motion.div
                            key={index}
                            className="group"
                            variants={itemVariants}
                            whileHover="hover"
                        >
                            <div className="h-full flex flex-col items-center text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-white hover:border-primary/10 relative overflow-hidden">
                                {/* Shimmer effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />

                                {/* Icon container */}
                                <div className="mb-6 w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-500">
                                    <div className="p-4 rounded-full bg-white shadow-sm transition-all duration-500">
                                        <motion.img
                                            src={point.iconPath}
                                            alt={point.alt}
                                            className="w-16 h-16 object-contain filter drop-shadow-sm"
                                            whileHover={{ rotate: 10, scale: 1.1 }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>

                                    {/* Animated decorative circle */}
                                    {/* <div className="absolute inset-0 rounded-full border border-primary/10 group-hover:border-primary/30 transition-all duration-500" /> */}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-serif font-medium text-gray-800 mb-3 group-hover:text-primary transition-colors">
                                    {point.title}
                                </h3>

                                {/* Description */}
                                <p className="text-gray-600 mt-2">
                                    {point.description}
                                </p>

                                {/* Decorative corner elements */}
                                {/* <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-primary/20" /> */}
                                {/* <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-primary/20" /> */}

                                {/* Floating link */}
                                {/* <div className="mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <button className="text-xs text-primary/80 hover:text-primary flex items-center justify-center gap-1 transition-colors">
                                        Learn more
                                        <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div> */}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Decorative footer */}
                {/* <motion.div
                    className="mt-16 pt-8 border-t border-primary/10 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                        Every MIROSA piece comes with a certificate of authenticity, lifetime maintenance promise,
                        and our commitment to ethical sourcing and craftsmanship.
                    </p>
                </motion.div> */}
            </div>
        </section>
    );
};

export default TrustSection;