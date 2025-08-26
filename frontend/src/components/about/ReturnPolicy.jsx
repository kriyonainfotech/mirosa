import React from 'react';
import { Link } from 'react-router-dom';

// --- Return Policy Page ---
export const ReturnPolicy = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 mt-30">
        <h1 className="text-4xl font-serif text-maroon mb-6">Return & Exchange Policy</h1>
        <div className="prose prose-lg max-w-none text-gray-700">
            <p>Your satisfaction is our priority. We offer a 15-day, no-questions-asked return and exchange policy for all our products from the date of delivery.</p>

            <h2 className="text-2xl font-serif text-maroon mt-8">Conditions for Return/Exchange</h2>
            <ul>
                <li>The product must be in its original, unused, and unaltered condition.</li>
                <li>All original packaging, certificates, and invoices must be returned with the product.</li>
                <li>Customized or engraved items are not eligible for return or exchange.</li>
                <li>Returns will be processed after a quality check by our expert team.</li>
            </ul>

            <h2 className="text-2xl font-serif text-maroon mt-8">How to Initiate a Return</h2>
            <ol>
                <li>Contact our customer care team at <a href="mailto:info@mirosa.com">info@mirosa.com</a> or call us at +91 98765 43210 to request a return.</li>
                <li>We will arrange for a secure, insured pickup from your address at no extra cost.</li>
                <li>Please ensure the product is packed securely in its original tamper-proof packaging.</li>
            </ol>

            <h2 className="text-2xl font-serif text-maroon mt-8">Refunds</h2>
            <p>Once your returned item is received and passes our quality check, we will process your refund. The amount will be credited to your original payment method within 7-10 business days.</p>
        </div>
    </div>
);
