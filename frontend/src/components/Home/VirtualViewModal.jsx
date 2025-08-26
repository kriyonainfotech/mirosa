import React, { useState } from 'react';
import Modal from 'react-modal';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// Make sure to set this in your main App.js or index.js
// Modal.setAppElement('#root');

const VirtualViewModal = ({ isOpen, onRequestClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        date: '',
        time: '',
        material: '',
        budget: '', // This will now hold a text value
        shape: '',
        notes: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // ✅ UPDATED handleSubmit function
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await axios.post(`${backdendUrl}/api/appointments/request-virtual-view`, formData);
            console.log(response, 'result')
            toast.success(response.data.message);
            onRequestClose(); // Close the modal
            // Reset form
            setFormData({ name: '', email: '', date: '', time: '', material: '', budget: '', shape: '', notes: '' });
        } catch (error) {
            console.log(error, 'error')
            toast.error(error || "An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Book a Virtual View"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg"
            overlayClassName="fixed inset-0 bg-black/20 bg-opacity-60 z-50"
        >
            <div className="flex justify-between items-center border-b pb-3 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Book a Virtual Viewing</h2>
                <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800"><FiX size={24} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-sm text-gray-600">
                    Schedule a personalized virtual appointment with one of our diamond experts.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" name="name" placeholder="Full Name" required onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                    <input type="email" name="email" placeholder="Email Address" required onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="date" name="date" required onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                    <input type="time" name="time" required onChange={handleInputChange} className="w-full p-2 border rounded-md" />
                </div>

                <h3 className="text-md font-semibold text-gray-700 pt-2">Your Preferences</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    <select name="material" onChange={handleInputChange} className="w-full p-2 border rounded-md">
                        <option value="">Select Material</option>
                        <option>Yellow Gold</option>
                        <option>Rose Gold</option>
                        <option>White Gold</option>
                        <option>Platinum</option>
                    </select>

                    <select name="shape" onChange={handleInputChange} className="w-full p-2 border rounded-md">
                        <option value="">Select Shape</option>
                        <option>Round</option>
                        <option>Princess</option>
                        <option>Cushion</option>
                        <option>Oval</option>
                        <option>Emerald</option>
                    </select>
                </div>

                {/* --- ✅ UPDATED BUDGET FIELD --- */}
                <input
                    type="text"
                    name="budget"
                    placeholder="Your Budget (e.g., $50,000)"
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                />

                <textarea name="notes" rows="3" placeholder="Any additional notes or specific pieces you're interested in?" onChange={handleInputChange} className="w-full p-2 border rounded-md"></textarea>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2 bg-maroon text-white font-semibold rounded-md shadow-sm hover:bg-opacity-90 transition disabled:opacity-50"
                    >
                        {isSubmitting ? 'Submitting...' : 'Request Appointment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default VirtualViewModal;
