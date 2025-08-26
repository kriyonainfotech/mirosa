import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios'; // 1. Import axios
import { toast } from 'react-toastify'; // 2. Import toast

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ContactUsPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    // 3. Add loading state
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // 4. Update handleSubmit to call the API
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const response = await axios.post(`${backdendUrl}/api/appointments/send-message`, formData);
            toast.success(response.data.message);
            // Reset form on success
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="py-16 sm:py-24 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        className="text-4xl sm:text-5xl font-serif text-maroon mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Get In Touch
                    </motion.h1>
                    <motion.p
                        className="text-lg text-gray-600 nunito max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        We're here to help with any questions you may have about our collections, custom designs, or your order.
                    </motion.p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left Column: Contact Info & Map */}
                    <motion.div
                        className="space-y-8 "
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="bg-white p-8 rounded-lg shadow-sm h-full">
                            <h3 className="text-2xl font-serif text-gray-800 mb-6">Contact Information</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <FiMail className="text-maroon text-xl mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-700">Email Us</h4>
                                        <a href="mailto:mirosajewelry3@gmail.com" className="text-gray-600 hover:text-maroon transition-colors">mirosajewelry3@gmail.com</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <FiPhone className="text-maroon text-xl mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-700">Call Us</h4>
                                        <a href="tel:+919876543210" className="text-gray-600 hover:text-maroon transition-colors">+91 00000 00000</a>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <FiMapPin className="text-maroon text-xl mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-700">Visit Us</h4>
                                        <p className="text-gray-600">123 Diamond Street, CG Road<br />Surat, India, 101010</p>
                                    </div>
                                </div>
                            </div>

                            <div className="border-t mt-6 pt-4">
                                <h4 className="font-semibold text-gray-700">Business Hours</h4>
                                <p className="text-gray-600 text-sm mt-2">Monday - Saturday: 11:00 AM - 8:00 PM</p>
                                <p className="text-gray-600 text-sm">Sunday: Closed</p>
                            </div>
                        </div>
                        {/* <div className="h-64 bg-gray-200 rounded-lg overflow-hidden"> */}
                        {/* Replace with an actual map component or image */}
                        {/* <img src="https://placehold.co/800x400/faf6f2/maroon?text=Our+Location" alt="Map to MIROSA" className="w-full h-full object-cover" /> */}
                        {/* </div> */}
                    </motion.div>

                    {/* Right Column: Contact Form */}
                    <motion.div
                        className="bg-white p-8 rounded-lg shadow-sm"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                    >
                        <h3 className="text-2xl font-serif text-gray-800 mb-6">Send Us a Message</h3>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input type="text" name="name" id="name" required value={formData.name} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon transition" />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input type="email" name="email" id="email" required value={formData.email} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon transition" />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                                <input type="text" name="subject" id="subject" required value={formData.subject} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon transition" />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea name="message" id="message" rows="5" required value={formData.message} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-maroon focus:border-maroon transition"></textarea>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-maroon text-white font-semibold px-8 py-3 rounded-md hover:bg-opacity-90 transition-colors disabled:bg-maroon/60"
                                >
                                    {isSubmitting ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};

export default ContactUsPage;
