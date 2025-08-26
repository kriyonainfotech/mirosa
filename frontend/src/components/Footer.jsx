import React from 'react';
import { Link } from 'react-router-dom';
import { IoDiamondOutline } from 'react-icons/io5';
import { FaEnvelope, FaPhone, FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa';

export default function Footer() {
    return (
        <footer className="bg-maroon text-cream pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center gap-3 mb-4">
                            <img src="/logo/cream_icon.png" className='w-auto h-24' alt="" />
                        </Link>
                        <p className="text-gold-300 text-sm mb-6 max-w-md">
                            Crafting sustainable luxury with the world's finest lab-grown diamonds.
                        </p>
                        <div className="flex items-center gap-4 text-xl text-gold-300">
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-500 transition-colors"><FaInstagram /></a>
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-500 transition-colors"><FaFacebook /></a>
                            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="hover:text-gold-500 transition-colors"><FaYoutube /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-gold-300 text-lg mb-4 pb-2 border-b border-gold-500/30">Shop</h4>
                        <ul className="space-y-3">
                            <li><Link to="/collections/rings" state={{ categoryId: '6878e62c0569bb02c96812dc' }} className="hover:text-gold-300 transition-colors">Rings</Link></li>
                            <li><Link to="/collections/earrings" state={{ categoryId: '6879ff1a5e9c3fd23dcb95b1' }} className="hover:text-gold-300 transition-colors">Earrings</Link></li>
                            <li><Link to="/collections/necklaces" state={{ categoryId: '6879ffb75e9c3fd23dcb95b7' }} className="hover:text-gold-300 transition-colors">Necklaces</Link></li>
                            <li><Link to="/collections/bracelets" state={{ categoryId: '6879ff855e9c3fd23dcb95b4' }} className="hover:text-gold-300 transition-colors">Bracelets</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-gold-300 text-lg mb-4 pb-2 border-b border-gold-500/30">Support</h4>
                        <ul className="space-y-3">
                            <li><Link to="/contact" className="hover:text-gold-300 transition-colors">Contact Us</Link></li>
                            <li><Link to="/faq" className="hover:text-gold-300 transition-colors">FAQ</Link></li>
                            <li><Link to="/shipping-policy" className="hover:text-gold-300 transition-colors">Shipping Policy</Link></li>
                            <li><Link to="/return-policy" className="hover:text-gold-300 transition-colors">Return Policy</Link></li>
                            <li><Link to="/privacy-policy" className="hover:text-gold-300 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold text-gold-300 text-lg mb-4 pb-2 border-b border-gold-500/30">Get in Touch</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3">
                                <FaEnvelope className="text-gold-300" />
                                <a href="mailto:mirosajewelry3@gmail.com" className="hover:text-gold-300">mirosajewelry3@gmail.com</a>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaPhone className="text-gold-300" />
                                <a href="tel:+919876543210" className="hover:text-gold-300">+91 98765 43210</a>
                            </li>
                        </ul>
                        {/* <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-3">Join Our Newsletter</h3>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="Your email"
                                    className="py-2 px-4 rounded-l-lg bg-maroon-light text-cream border border-gold-500 focus:outline-none w-full"
                                />
                                <button className="bg-gold-500 text-maroon font-semibold py-2 px-4 rounded-r-lg hover:bg-gold-600 transition-colors">
                                    Subscribe
                                </button>
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-6 text-sm border-t border-gold-500/30">
                    <p className="text-gold-300">© 2025 MIROSA Jewelry. All rights reserved.</p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link to="/privacy-policy" className="hover:text-gold-300 transition-colors">Privacy Policy</Link>
                        <Link to="/terms-and-conditions" className="hover:text-gold-300 transition-colors">Terms & Conditions</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
