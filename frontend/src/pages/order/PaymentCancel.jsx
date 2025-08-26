import React from "react";
import { Link } from "react-router-dom";
import { FiXCircle } from "react-icons/fi";

export default function PaymentCancel() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 px-4">
            <FiXCircle className="text-red-600 text-6xl mb-4" />
            <h1 className="text-3xl font-bold text-red-600 mb-2">Payment Canceled</h1>
            <p className="text-gray-700 mb-6">
                Your payment was not completed. If this was a mistake, please try again.
            </p>
            <div className="flex gap-2">
                <Link
                    to="/checkout"
                    className="px-6 py-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                >
                    Try Again
                </Link>
                {/* <Link
                    to="/cart"
                    className="px-6 py-3 border border-gray-900/50 bg-gray-200 text-gray-900 rounded-full transition"
                >
                    Back To Cart
                </Link> */}
            </div>
        </div>
    );
}
