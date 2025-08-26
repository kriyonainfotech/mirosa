// src/components/Values.js
import React from 'react';

const Values = () => {
    const values = [
        {
            title: "Heritage",
            description: "Honoring traditional craftsmanship while embracing innovation",
            icon: "🏛️"
        },
        {
            title: "Excellence",
            description: "Relentless pursuit of perfection in every detail",
            icon: "🔍"
        },
        {
            title: "Integrity",
            description: "Ethical practices from sourcing to creation",
            icon: "🤝"
        },
        {
            title: "Beauty",
            description: "Creating pieces that inspire and endure",
            icon: "💖"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 md:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Core Values</h2>
                    <div className="h-1 w-24 bg-gold-500 mx-auto"></div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {values.map((value, index) => (
                        <div key={index} className="bg-white p-8 text-center rounded-lg shadow-md hover:shadow-lg transition-shadow">
                            <div className="text-5xl mb-4">{value.icon}</div>
                            <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                            <p className="text-gray-700">{value.description}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 max-w-4xl mx-auto text-center">
                    <blockquote className="text-2xl md:text-3xl italic mb-10">
                        "Jewelry is like the perfect spice – it always complements what's already there."
                    </blockquote>
                    <div className="flex items-center justify-center">
                        <div className="h-1 w-16 bg-gold-500 mr-4"></div>
                        <p className="font-semibold">Isabella Rossi, Founder</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Values;