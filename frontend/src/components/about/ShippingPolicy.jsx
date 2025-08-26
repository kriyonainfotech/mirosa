import React from 'react';
import { Link } from 'react-router-dom';

// --- Shipping Policy Page ---
export const ShippingPolicy = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 mt-30">
        <h1 className="text-4xl font-serif text-maroon mb-6">Shipping Policy</h1>
        <div className="prose prose-lg max-w-none text-gray-700">
            <p>At MIROSA, we are committed to ensuring your purchases reach you safely and promptly. We offer complimentary, insured shipping on all orders across India.</p>

            <h2 className="text-2xl font-serif text-maroon mt-8">Order Processing</h2>
            <p>All our jewelery is made-to-order. Please allow 10-15 business days for your piece to be crafted and prepared for shipment. You will receive a confirmation email once your order is dispatched, containing your tracking details.</p>

            <h2 className="text-2xl font-serif text-maroon mt-8">Shipping & Delivery</h2>
            <ul>
                <li><strong>Carrier:</strong> We partner with trusted, insured carriers like Blue Dart, Sequel, and BVC for all our deliveries.</li>
                <li><strong>Estimated Delivery Time:</strong> Once dispatched, please allow 3-5 business days for delivery to metropolitan areas and 5-7 business days for other locations.</li>
                <li><strong>Tracking:</strong> You can track your order using the tracking link provided in your shipping confirmation email.</li>
                <li><strong>Signature Required:</strong> For your security, all deliveries require a signature upon receipt. Please ensure someone is available at the delivery address to sign for the package.</li>
            </ul>

            <h2 className="text-2xl font-serif text-maroon mt-8">Packaging</h2>
            <p>Every piece from MIROSA arrives in our signature discreet packaging, ensuring the contents are secure and the surprise is preserved. The outer packaging is tamper-proof and does not bear any branding that would indicate its valuable contents.</p>

            <h2 className="text-2xl font-serif text-maroon mt-8">International Shipping</h2>
            <p>Currently, we only ship within India. For international inquiries, please contact our customer service team at <a href="mailto:info@mirosa.com">info@mirosa.com</a>.</p>
        </div>
    </div>
);
