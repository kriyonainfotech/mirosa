// src/components/ScrollToTopButton.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FiArrowUp } from 'react-icons/fi'; // You'll need to install react-icons: npm install react-icons

const ScrollToTopButton = () => {
    const [isVisible, setIsVisible] = useState(false);

    // Callback to handle scroll event
    // This function will be called frequently on scroll, so useCallback is good here
    const handleScroll = useCallback(() => {
        // Show button if page scroll position is greater than 300px
        if (window.scrollY > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, []); // Empty dependency array means this callback won't change

    // Effect to add and remove the scroll event listener
    useEffect(() => {
        // Add event listener when component mounts
        window.addEventListener('scroll', handleScroll);

        // Clean up the event listener when component unmounts
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]); // Dependency on handleScroll callback

    // Function to scroll the page to the top
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Smooth scrolling animation
        });
    };

    return (
        <button
            onClick={scrollToTop}
            // Fixed positioning at bottom-right, with responsive padding
            // Transition for opacity to make it smoothly appear/disappear
            // opacity-0 and pointer-events-none when not visible to fully hide and disable clicks
            className={`fixed bottom-6 right-6 md:bottom-20 md:right-8 bg-maroon cursor-pointer border border-gray-100 text-white p-3 md:p-4 rounded-full shadow-lg transition-opacity duration-300 z-50
            ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            aria-label="Scroll to top" // Accessibility for screen readers
        >
            <FiArrowUp className="w-6 h-6" /> {/* Up arrow icon */}
        </button>
    );
};

export default ScrollToTopButton;