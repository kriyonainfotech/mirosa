import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const LuxuryBanner = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden">
            {/* Background image with overlay */}
            <div className="absolute inset-0 bg-black/70 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('https://i.pinimg.com/1200x/d3/9e/b7/d39eb774d560130e3eba45b0212f6a88.jpg')"
                    }}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col justify-center px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mb-6">
                            <motion.div
                                className="inline-block border border-white px-4 py-2 mb-6"
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                <span className="text-white text-sm tracking-widest font-light">NEW COLLECTION</span>
                            </motion.div>
                        </div>

                        <motion.h1
                            className="text-4xl sm:text-5xl md:text-6xl font-serif text-white mb-6 leading-tight"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                        >
                            Timeless Elegance<br />
                            <span className="text-golden font-light italic">Redefined</span>
                        </motion.h1>

                        <motion.p
                            className="text-xl text-white/90 max-w-xl mx-auto mb-10 font-light tracking-wider"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8, duration: 1 }}
                        >
                            Handcrafted pieces that celebrate your unique beauty
                        </motion.p>

                        <motion.div
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1, duration: 0.8 }}
                        >
                            <Link to='/shop' className="px-8 py-3 bg-golden text-black font-serif text-lg rounded-sm shadow-lg hover:bg-white transition-all duration-300 hover:shadow-xl">
                                Discover Collection
                            </Link>
                            <Link to='/contact-us' className="px-8 py-3 border border-white/30 text-white font-serif text-lg rounded-sm hover:bg-white/10 transition-all duration-300">
                                Book Appointment
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 flex flex-col items-center">
                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                </motion.div>
            </div>

            {/* Floating jewelry elements */}
            <motion.div
                className="absolute top-1/4 right-16 w-16 h-16 rounded-full border border-golden/30 flex items-center justify-center hidden lg:block"
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear"
                }}
            >
                <div className="w-10 h-10 rounded-full border border-golden/20"></div>
            </motion.div>

            <motion.div
                className="absolute bottom-1/3 left-16 w-12 h-12 rounded-full border border-golden/20 flex items-center justify-center hidden lg:block"
                animate={{
                    rotate: -360,
                }}
                transition={{
                    duration: 40,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />
        </div>
    );
};

export default LuxuryBanner;