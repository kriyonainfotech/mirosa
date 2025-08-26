import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ShopByCategory = ({ categories }) => {
    const [localCategories, setLocalCategories] = useState([]);

    useEffect(() => {
        // Simulating data fetch or processing
        setTimeout(() => {
            setLocalCategories(categories);
        }, 300);
    }, [categories]);

    console.log(localCategories, 'lc')
    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
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
        }
    };

    const cardHover = {
        scale: 1.05,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    };

    return (
        <section className="py-20 px-4 bg-gradient-to-b from-light to-[#faf6f2] text-midnight relative">
            {/* Decorative background elements */}
            <div className="absolute top-10 right-0 w-80 h-80 bg-[#f8efe7] rounded-full -translate-y-1/2 translate-x-1/2 -z-10 opacity-30"></div>
            <div className="absolute bottom-10 left-0 w-40 h-40 bg-[#f8efe7] rounded-full -translate-x-1/2 opacity-60"></div>
            <div className="absolute top-1/3 left-10 w-8 h-8 rounded-full bg-primary/10"></div>
            <div className="absolute bottom-1/4 right-20 w-6 h-6 rounded-full bg-golden/20"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-4xl md:text-5xl font-serif text-black mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Shop by Category
                    </motion.h2>
                    <motion.p
                        className="text-xl md:text-2xl text-primary font-serif italic"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Discover our curated collections
                    </motion.p>

                    {/* Decorative divider */}
                    <motion.div
                        className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6"
                        initial={{ width: 0 }}
                        animate={{ width: "6rem" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    ></motion.div>
                </div>

                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 md:gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate={localCategories.length ? "visible" : "hidden"}
                >
                    {localCategories.map((cat) => (
                        <motion.div
                            key={cat._id}
                            className="flex flex-col items-center"
                            variants={itemVariants}
                        >
                            <motion.div
                                className="relative w-full aspect-square rounded-full overflow-hidden group"
                                whileHover={cardHover}
                            >
                                <Link to={`/collections/${cat.slug}`}>
                                    {/* Shine effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                    {/* Image container with actual image */}
                                    <div className="w-full h-full flex items-center justify-center">
                                        <img
                                            src={cat.image?.url || "/images/placeholder.jpg"}
                                            alt={cat.name}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>

                                    {/* Floating badge (if count exists) */}
                                    {cat.count && (
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary shadow-sm">
                                            {cat.count} items
                                        </div>
                                    )}

                                    {/* Fancy borders */}
                                    <div className="absolute inset-0 rounded-full border border-gray-300 group-hover:border-primary/50 transition-colors duration-500"></div>
                                    <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-primary/20 transition-all duration-700 pointer-events-none"></div>
                                </Link>
                            </motion.div>

                            {/* Name and CTA */}
                            <div className="mt-5 text-center">
                                <h3 className="font-serif text-lg md:text-xl text-gray-800 group-hover:text-primary transition-colors">
                                    <Link to={`/collections/${cat.slug}`}>{cat.name}</Link>
                                </h3>
                                <div className="mt-1">
                                    <Link
                                        to={`/collections/${cat.slug}`}
                                        state={{ categoryId: cat._id }}
                                        className="text-xs text-primary/80 hover:text-primary flex items-center justify-center gap-1 transition-colors"
                                    >
                                        Explore collection
                                        <svg className="w-3 h-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                </motion.div>

                {/* View All Button */}
                {/* <motion.div
                    className="mt-16 text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Link
                        to="/collections"
                        className="inline-flex items-center px-8 py-3 bg-primary/5 border border-primary/20 text-primary font-medium rounded-full hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 group"
                    >
                        View All Categories
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </motion.div> */}
            </div>
        </section>
    );
};

export default ShopByCategory;