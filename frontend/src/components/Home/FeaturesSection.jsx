import React from 'react';
import { motion } from 'framer-motion';
// import {
//     TruckIcon,
//     ShieldCheckIcon,
//     GiftIcon,
//     HeartIcon,
//     CurrencyDollarIcon,
//     ChatBubbleLeftRightIcon,
//     SparklesIcon
// } from '@heroicons/react/24/outline';
import { FiTruck, FiGift, FiHeart } from 'react-icons/fi';
import { BsShieldCheck, BsCurrencyDollar } from 'react-icons/bs';
import { IoChatbubblesOutline, IoSparklesOutline } from 'react-icons/io5';

const FeaturesSection = () => {
    const features = [
        {
            icon: <FiTruck className="w-8 h-8 text-primary" />,
            title: "Free Shipping",
            description: "On orders over $1000"
        },
        {
            icon: <IoSparklesOutline className="w-8 h-8 text-primary" />,
            title: "Expert Certified Quality",
            description: "Top quality, guaranteed by our team of GIA-certified diamond experts."
        },
        {
            icon: <BsShieldCheck className="w-8 h-8 text-primary" />,
            title: "24/7 Support",
            description: "Dedicated jewelry specialists"
        },

        {
            icon: <FiTruck className="w-8 h-8 text-primary" />,
            title: "Easy Returns",
            description: "30-day hassle-free returns"
        }
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6,
                ease: "easeOut"
            }
        }
    };

    return (
        <section className="py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#faf6f2] to-light relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#f8efe7] rounded-full opacity-50 -z-10"></div>
            <div className="absolute bottom-20 left-10 w-32 h-32 bg-[#f8efe7] rounded-full opacity-40 -z-10"></div>
            <div className="absolute top-1/3 left-1/4 w-12 h-12 rounded-full bg-primary/10 -z-10"></div>

            <div className="max-w-7xl mx-auto">
                {/* Section header */}
                <div className="text-center">
                    {/* <motion.h2
                        className="text-3xl md:text-4xl font-serif text-black mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        Our Premium Services
                    </motion.h2> */}


                    {/* Decorative divider */}
                    <motion.div
                        className="w-24 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-6"
                        initial={{ width: 0 }}
                        animate={{ width: "6rem" }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                    />
                    {/* 
                    <motion.p
                        className="text-lg text-primary font-serif italic max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                    >
                        Experience luxury at every step with our exceptional services
                    </motion.p> */}
                </div>

                {/* Features grid */}
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-white hover:border-primary/20 relative overflow-hidden"
                            variants={itemVariants}
                            whileHover={{
                                y: -5,
                                transition: { duration: 0.3 }
                            }}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />

                            {/* Icon container */}
                            <div className="mb-5 w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center group">
                                <motion.div
                                    className="p-4 rounded-full bg-white shadow-sm group-hover:bg-primary/5 transition-colors duration-300"
                                    whileHover={{ rotate: 10 }}
                                >
                                    {feature.icon}
                                </motion.div>

                                {/* Animated decorative circle */}
                                <div className="absolute inset-0 rounded-full transition-all duration-500" />
                            </div>

                            <h3 className="text-lg font-serif font-medium text-gray-800 mb-2">{feature.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{feature.description}</p>

                            {/* Decorative corner elements */}
                            {/* <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-primary/30" /> */}
                            {/* <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-primary/30" /> */}
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
                        Every MIROSA purchase includes complimentary luxury packaging, a certified authenticity card,
                        and our lifetime commitment to jewelry care and maintenance.
                    </p>
                </motion.div> */}
            </div>
        </section>
    );
};

export default FeaturesSection;