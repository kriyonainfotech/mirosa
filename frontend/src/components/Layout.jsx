import React, { useState } from 'react'; // 1. Import useState
import { FiVideo } from 'react-icons/fi'; // 2. Import the icon
import ScrollToTopButton from "../utils/ScrollToTopButton";
import Footer from "./Footer";
import Header from "./Header";
import VirtualViewModal from './Home/VirtualViewModal';

const Layout = ({ children }) => {
    // 4. Add state to control the modal's visibility
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Header />
            <main>{children}</main>
            <Footer />
            <ScrollToTopButton />

            {/* --- 5. Add the Floating Button --- */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="fixed bottom-6 right-6 z-40 flex items-center gap-3 bg-maroon text-white px-5 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
                aria-label="Book a Virtual View"
            >
                <FiVideo size={20} />
                <span className="font-semibold text-sm hidden sm:inline">Book a Virtual View</span>
            </button>

            {/* --- 6. Add the Modal Component --- */}
            <VirtualViewModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default Layout;