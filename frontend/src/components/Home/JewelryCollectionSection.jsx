import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const JewelryCollectionSection = ({ mirosasCollection }) => {

    // Animation variants for framer-motion
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
        scale: 1.03,
        transition: {
            duration: 0.3,
            ease: "easeOut"
        }
    };

    const shineEffect = {
        backgroundPosition: "200% center",
        transition: {
            backgroundPosition: {
                duration: 1.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-20 px-4 bg-[#faf6f2] text-midnight relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#f8efe7] rounded-full -translate-y-1/2 translate-x-1/2 opacity-70"></div>
            <div className="absolute bottom-30 left-0 w-90 h-90 bg-[#f8efe7] rounded-full -translate-x-1/2 opacity-60"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-0">
                    <motion.h2
                        className="text-4xl md:text-5xl font-serif text-black mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        MIROSA's Collection
                    </motion.h2>
                    <motion.p
                        className="text-xl md:text-2xl text-primary font-serif italic"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        A companion for every occasion
                    </motion.p>

                    {/* Decorative divider */}
                    <motion.div
                        className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6"
                        initial={{ width: 0 }}
                        animate={{ width: "6rem" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    ></motion.div>
                </div>

                {mirosasCollection && (
                    <div className="mt-20">
                        <motion.div
                            className="text-center mb-10"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.6 }}
                        >
                            <h3 className="text-3xl md:text-4xl font-serif text-black">{mirosasCollection.title}</h3>
                            <p className="text-xl text-primary font-serif italic mt-3">{mirosasCollection.description}</p>
                        </motion.div>

                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {mirosasCollection.subcategories?.slice(0, 4).map((sub, index) => (
                                <motion.div
                                    key={sub._id}
                                    className={`${index === 0 || index === 3 ? 'md:col-span-1' : 'md:col-span-1'}`}
                                    variants={itemVariants}
                                >
                                    <Link
                                        to={`/mirosas-collection/${sub.slug}`}
                                        state={{ subcategoryId: sub._id }}
                                        className="block h-[500px]"
                                    >
                                        <motion.div
                                            className="h-full flex flex-col"
                                            whileHover={cardHover}
                                        >
                                            <div className="relative overflow-hidden rounded-xl">
                                                {/* Shine effect layer */}
                                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] bg-left opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                                                {/* Image container */}
                                                <div className="aspect-square overflow-hidden mx-auto">

                                                    <motion.img
                                                        src={sub.image?.url || "/images/placeholder.jpg"}
                                                        alt={sub.name}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                        initial={{ scale: 1.1 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.8 }}
                                                    />
                                                </div>

                                                {/* Overlay with title */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                                                    <h3 className="text-white text-2xl font-serif tracking-wide">
                                                        {sub.name}
                                                    </h3>
                                                </div>

                                                {/* Decorative corner */}
                                                {/* <div className="absolute top-4 right-4 w-12 h-12 flex items-center justify-center">
                                                    <div className="w-8 h-8 border-t-2 border-r-2 border-golden"></div>
                                                </div> */}
                                            </div>

                                            {/* Description card (appears on hover) */}
                                            {/* <div className="mt-4 bg-white p-4 rounded-lg shadow-sm transition-all duration-500 group-hover:translate-y-0 translate-y-2 opacity-0 group-hover:opacity-100">
                                                <p className="text-gray-900 text-sm">
                                                    Explore our curated collection of handcrafted pieces
                                                </p>
                                                <div className="mt-2 flex items-center text-primary text-sm">
                                                    <span>Discover now</span>
                                                    <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                        <path d="M5 12H19M12 5L19 12L12 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                </div>
                                            </div> */}
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-1/4 left-10 w-6 h-6 rounded-full bg-golden/20"></div>
            <div className="absolute top-2/3 right-20 w-4 h-4 rounded-full bg-primary/20"></div>
            <div className="absolute bottom-1/4 left-1/3 w-3 h-3 rounded-full bg-golden/30"></div>
        </section>
    );
};

// Add this CSS to your global styles for the shine animation
export const GlobalStyles = () => (
    <style jsx global>{`
    .group:hover .shine-overlay {
      animation: shine 1.5s ease-out;
    }
    
    @keyframes shine {
      0% { background-position: -100% center; }
      100% { background-position: 200% center; }
    }
    
    .fraunces {
      font-family: 'Fraunces', serif;
    }
    
    .font-serif {
      font-family: 'Cormorant Garamond', serif;
    }
  `}</style>
);

export default JewelryCollectionSection;