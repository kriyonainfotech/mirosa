// src/components/Team.js
import React from 'react';

const Team = () => {
    const teamMembers = [
        {
            name: "Sofia Rossi",
            role: "Creative Director",
            bio: "Granddaughter of our founder, Sofia brings a modern vision while honoring our heritage."
        },
        {
            name: "Marco Bianchi",
            role: "Master Goldsmith",
            bio: "With 30 years of experience, Marco transforms precious metals into works of art."
        },
        {
            name: "Elena Moretti",
            role: "Gemologist",
            bio: "Elena's expert eye selects only the most exceptional diamonds and gemstones."
        },
        {
            name: "Luca Ferrari",
            role: "Design Director",
            bio: "Luca's innovative designs have won multiple international jewelry awards."
        }
    ];

    return (
        <section className="py-20 px-4 md:px-8 max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">Our Master Artisans</h2>
                <div className="h-1 w-24 bg-gold-500 mx-auto"></div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {teamMembers.map((member, index) => (
                    <div key={index} className="group text-center">
                        <div className="relative mb-6 overflow-hidden rounded-full w-48 h-48 mx-auto">
                            <div className="bg-gray-200 border-2 border-white rounded-full w-full h-full">
                                <div className={`bg-cover bg-center w-full h-full rounded-full ${index === 0 ? 'bg-[url("https://images.unsplash.com/photo-1554151228-14d9def656e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=772&q=80")]' :
                                    index === 1 ? 'bg-[url("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80")]' :
                                        index === 2 ? 'bg-[url("https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80")]' :
                                            'bg-[url("https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80")]'}`}>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gold-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="text-white text-center px-4">
                                    <p className="font-bold">{member.bio}</p>
                                </div>
                            </div>
                        </div>
                        <h3 className="text-xl font-bold">{member.name}</h3>
                        <p className="text-gold-600">{member.role}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Team;