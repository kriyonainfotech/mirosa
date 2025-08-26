// src/components/Craftsmanship.js
import React from 'react';

const Craftsmanship = () => {
    const processes = [
        {
            title: "Design",
            description: "Each piece begins as a hand-drawn sketch by our master designers, inspired by nature, architecture, and timeless beauty.",
            icon: "✏️"
        },
        {
            title: "Material Selection",
            description: "We ethically source the finest diamonds, gemstones, and precious metals, ensuring exceptional quality and responsible practices.",
            icon: "💎"
        },
        {
            title: "Handcrafting",
            description: "Our skilled artisans employ traditional techniques alongside modern technology to shape each piece with precision.",
            icon: "🛠️"
        },
        {
            title: "Finishing",
            description: "Every piece undergoes meticulous polishing and quality control to achieve the signature Mirosa brilliance.",
            icon: "✨"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">The Art of Craftsmanship</h2>
                    <div className="h-1 w-24 bg-gold-500 mx-auto mb-6"></div>
                    <p className="text-xl max-w-3xl mx-auto">
                        Discover the meticulous process behind every Mirosa creation, where tradition meets innovation
                    </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {processes.map((process, index) => (
                        <div key={index} className="bg-white p-8 shadow-lg hover:shadow-xl transition-shadow border-t-4 border-gold-500 rounded-lg text-center">
                            <div className="text-4xl mb-4">{process.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{process.title}</h3>
                            <p className="text-gray-700">{process.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-16 grid md:grid-cols-2 gap-12 items-center">
                    <div>
                        <h3 className="text-2xl md:text-3xl font-bold mb-6">Ethical Excellence</h3>
                        <p className="mb-4 text-lg leading-relaxed">
                            At Mirosa, we believe true luxury must be responsible. That's why we're committed to ethical sourcing and sustainable practices throughout our supply chain.
                        </p>
                        <p className="mb-6 text-lg leading-relaxed">
                            All our diamonds are conflict-free, and we use recycled gold and platinum whenever possible. Our workshops maintain fair labor practices and provide exceptional working conditions.
                        </p>
                        <div className="flex items-center space-x-4">
                            <div className="bg-gray-200 border-2 border-white aspect-square w-16 flex items-center justify-center">
                                <span className="text-2xl">♻️</span>
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold">Certified Sustainable</p>
                                <p className="text-gray-600">RJC & SCS certified</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Craftsmanship;