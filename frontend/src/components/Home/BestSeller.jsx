import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProductCard from '../../pages/cart/ProductCard';

const BestSellerSection = ({ localbestSeller }) => {
    const [bestseller, setBestSeller] = useState([]);
    console.log(localbestSeller, 'bestseller')
    useEffect(() => {
        // Simulating data fetch or processing
        setTimeout(() => {
            setBestSeller(localbestSeller);
        }, 300);
    }, [localbestSeller]);

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
            <div className="absolute top-0 left-0 w-80 h-80 bg-[#f8efe7] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-70"></div>
            <div className="absolute bottom-20 right-0 w-64 h-64 bg-[#f8efe7] rounded-full translate-x-1/2 opacity-60"></div>
            <div className="absolute top-1/3 right-20 w-8 h-8 rounded-full bg-primary/20"></div>

            <div className="max-w-full mx-10 relative z-10">
                {/* Section header */}
                <div className="text-center mb-8">
                    <motion.h2
                        className="text-4xl md:text-5xl font-serif text-black mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Best Sellers
                    </motion.h2>
                    <motion.p
                        className="text-xl md:text-2xl text-primary font-serif italic"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Discover our latest curated pieces
                    </motion.p>

                    {/* Decorative divider */}
                    <motion.div
                        className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6"
                        initial={{ width: 0 }}
                        animate={{ width: "6rem" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    />
                </div>

                {/* Products grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {localbestSeller.map((product) => (
                        <motion.div
                            key={product._id} // Use a stable key like _id
                            variants={itemVariants}
                        >
                            <ProductCard product={product} />
                        </motion.div>
                    ))}
                </motion.div>

                {/* View All Button */}
                <motion.div
                    className="flex justify-center mt-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <Link
                        to="/collections/best-seller"
                        state={{ subcategoryId: '6883495beb446d953a5d8363' }}
                        className="inline-flex items-center px-8 py-3  bg-primary/5 border border-primary/20 bg-primary text-gray-800 font-serif text-lg font-medium rounded-full  transition-all duration-300 group"
                    >
                        Discover All Best Sellers
                        <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </motion.div>
            </div>
        </section>
    );
};

export default BestSellerSection;