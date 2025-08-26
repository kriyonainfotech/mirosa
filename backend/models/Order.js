const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cartItems: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantId: { type: String, required: true },
            quantity: { type: Number, required: true },
            priceAtPurchase: { type: Number, required: true },
            nameAtPurchase: String,
            mainImageAtPurchase: String
        }
    ],
    shippingAddress: {
        fullName: String,
        address: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        phone: String,
    },
    paymentMethod: { type: String, default: 'COD' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
}, { timestamps: true });

module.exports = mongoose.model("Order", OrderSchema);
