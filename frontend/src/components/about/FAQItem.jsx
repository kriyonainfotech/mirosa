import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- FAQ Data ---
const faqData = [
    {
        question: "What are lab-grown diamonds?",
        answer: "Lab-grown diamonds are real diamonds, identical to mined diamonds in every way, including their chemical, physical, and optical properties. The only difference is their origin. They are created in a controlled laboratory environment using advanced technological processes that replicate the natural diamond growing conditions."
    },
    {
        question: "Are lab-grown diamonds certified?",
        answer: "Yes, absolutely. Every MIROSA lab-grown diamond above 0.50 carats is independently certified by leading gemological labs like IGI or GIA. Your purchase will be accompanied by a certificate detailing its specifications, including cut, color, clarity, and carat weight."
    },
    {
        question: "How do I care for my MIROSA jewelery?",
        answer: "Caring for your lab-grown diamond jewelery is the same as caring for natural diamond pieces. Clean it gently with a soft-bristled brush, warm water, and mild soap. We also recommend professional cleaning and inspection once a year. Avoid harsh chemicals and store your pieces separately to prevent scratching."
    },
    {
        question: "What is your return and exchange policy?",
        answer: "We offer a 15-day, no-questions-asked return and exchange policy on all our jewelery. The item must be in its original, unworn condition with all accompanying documentation. Please visit our Return Policy page for detailed instructions on how to initiate a return."
    },
    {
        question: "How long will it take to receive my order?",
        answer: "As our jewelery is crafted to order, please allow 10-15 business days for production. Once shipped, delivery typically takes 3-5 business days within metropolitan areas in India. You will receive a tracking number as soon as your order is dispatched."
    },
    {
        question: "Do you offer customization?",
        answer: "Yes, we specialize in creating bespoke pieces. If you have a specific design in mind or wish to customize one of our existing pieces, please contact our design consultants through our Contact Us page. We would be delighted to help bring your vision to life."
    }
];

// --- Reusable Accordion Item Component ---
const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    const contentVariants = {
        collapsed: { height: 0, opacity: 0, marginTop: 0 },
        open: { height: "auto", opacity: 1, marginTop: '1rem' }
    };

    return (
        <div className="border-b border-gray-200 py-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left"
            >
                <h3 className="text-xl font-medium text-gray-800 nunito">{question}</h3>
                <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
                    <span className={`w-4 h-0.5 bg-maroon absolute transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}></span>
                    <span className="w-4 h-0.5 bg-maroon absolute transition-transform duration-300 rotate-90"></span>
                </div>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={contentVariants}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <p className="text-gray-600 leading-relaxed">{answer}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


// --- Main FAQ Page Component ---
const FAQPage = () => {
    return (
        <div className="mt-30 py-16 sm:py-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl sm:text-5xl font-serif text-maroon mb-4">Frequently Asked Questions</h1>
                    <p className="text-lg text-gray-600 nunito">
                        Your guide to understanding our craft, products, and policies.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="bg-white p-8 sm:p-12 rounded-lg shadow-sm">
                    {faqData.map((faq, index) => (
                        <FAQItem key={index} question={faq.question} answer={faq.answer} />
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="text-center mt-16 bg-white p-8 rounded-lg">
                    <h3 className="text-2xl font-serif text-gray-800 mb-3">Still have questions?</h3>
                    <p className="text-gray-600 mb-6 max-w-xl mx-auto">
                        Our dedicated team is here to help. Reach out to us for any inquiries or assistance you may need.
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block bg-maroon text-white font-semibold px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors"
                    >
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
