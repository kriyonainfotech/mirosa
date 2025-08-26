import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy = () => (
    <div className="max-w-4xl mx-auto px-4 py-12 mt-30">
        <h1 className="text-4xl font-serif text-maroon mb-6">Privacy Policy</h1>
        <div className="prose prose-lg max-w-none text-gray-700">
            <p>MIROSA ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website.</p>

            <h2 className="text-2xl font-serif text-maroon mt-8">Information We Collect</h2>
            <p>We may collect personal information from you such as your name, shipping address, email address, and phone number when you place an order, subscribe to our newsletter, or contact us.</p>

            <h2 className="text-2xl font-serif text-maroon mt-8">How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Process and fulfill your orders.</li>
                <li>Communicate with you about your orders and provide customer support.</li>
                <li>Send you promotional materials and newsletters, if you opt-in.</li>
                <li>Improve our website and services.</li>
                <li>Comply with legal obligations.</li>
            </ul>

            <h2 className="text-2xl font-serif text-maroon mt-8">Information Sharing</h2>
            <p>We do not sell or trade your personal information to third parties. We may share your information with trusted partners such as payment gateways and shipping providers solely for the purpose of fulfilling your order.</p>

            <h2 className="text-2xl font-serif text-maroon mt-8">Data Security</h2>
            <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal data is contained behind secured networks and is only accessible by a limited number of persons who have special access rights and are required to keep the information confidential.</p>

            <h2 className="text-2xl font-serif text-maroon mt-8">Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal information at any time by accessing your account or contacting us directly.</p>
            <p>For any questions regarding this policy, please contact us at <a href="mailto:info@mirosa.com">info@mirosa.com</a>.</p>
        </div>
    </div>
);