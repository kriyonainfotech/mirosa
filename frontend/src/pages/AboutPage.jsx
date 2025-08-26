// src/components/AboutPage.js
import React from 'react';
import Craftsmanship from '../components/about/Craftsmanship';
import Team from '../components/about/Team';
import Values from '../components/about/Values';

const AboutPage = () => {
    return (
        <div className="font-cormorant min-h-screen bg-white text-gray-900 fraunces">

            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/30 z-10"></div>
                <div className="bg-[url('https://images.unsplash.com/photo-1600003263720-95b45a4035d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')] bg-cover bg-center absolute inset-0"></div>

                <div className="relative z-20 text-center px-4 max-w-4xl">
                    <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 tracking-wider">
                        MIR<span className="text-gold-500">OSA</span>
                    </h1>
                    <div className="h-1 w-32 bg-gold-500 mx-auto mb-8"></div>
                    <p className="text-xl md:text-3xl text-white italic mb-10">
                        Where Timeless Elegance Meets Modern Craftsmanship
                    </p>
                    <button className="bg-transparent border-2 border-gold-500 text-gold-500 px-8 py-3 hover:bg-gold-500 hover:text-white transition-all duration-300">
                        Discover Our Story
                    </button>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Story</h2>
                    <div className="h-1 w-24 bg-gold-500 mx-auto"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="relative">
                        <div className="absolute -inset-4 border-2 border-gold-500/30 transform rotate-3"></div>
                        <div className="bg-gray-200 border-2 border-white aspect-[4/5] relative overflow-hidden">
                            <div className="bg-[url('https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=870&q=80')] bg-cover bg-center absolute inset-0"></div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gold-600">A Legacy of Excellence</h3>
                        <p className="mb-4 text-lg leading-relaxed">
                            Founded in Milan in 1982, Mirosa began as a small family atelier dedicated to creating exquisite jewelry pieces that captured the essence of Italian elegance. Our founder, Isabella Rossi, believed that jewelry should be more than an accessory - it should be a personal treasure, imbued with meaning and crafted to perfection.
                        </p>
                        <p className="mb-6 text-lg leading-relaxed">
                            Today, guided by Isabella's granddaughter Sofia, we continue this tradition while embracing modern techniques and sustainable practices. Each Mirosa piece is a testament to our heritage and our commitment to creating jewelry that will be cherished for generations.
                        </p>
                        <div className="flex items-center">
                            <div className="h-12 w-12 rounded-full bg-gold-500 flex items-center justify-center mr-4">
                                <span className="text-white text-2xl font-bold">S</span>
                            </div>
                            <div>
                                <p className="font-semibold">Sofia Rossi</p>
                                <p className="text-gray-600">Creative Director, Mirosa</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Craftsmanship />
            <Team />
            <Values />

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
                <div className="max-w-4xl mx-auto text-center px-4">
                    <h2 className="text-3xl md:text-5xl font-bold mb-8">Experience the Mirosa Difference</h2>
                    <p className="text-xl mb-10 max-w-2xl mx-auto">
                        Discover our exclusive collections and find the perfect piece that tells your story
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="bg-transparent border-2 border-gold-500 text-gold-500 px-8 py-4 ">
                            Explore Collections
                        </button>
                        <button className="bg-transparent border-2 border-gold-500 text-gold-500 px-8 py-4 ">
                            Book a Private Viewing
                        </button>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default AboutPage;