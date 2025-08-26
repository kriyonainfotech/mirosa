// models/Cart.js
const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variantId: { // Store the _id of the specific variant
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    // Snapshot of key variant info at the time of adding to cart
    name: { type: String, required: true }, // Product Title + Variant description (e.g., "Elegant Ring - Gold 18KT")
    mainImage: { type: String }, // Main image URL for product or variant's first image
    variantDetails: { // Store chosen variant's specific attributes
        material: String,
        purity: String,
        size: String,
        sku: String,
        price: Number // Price at time of adding to cart (important for order consistency)
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
}, { _id: true }); // Cart items don't need their own _id unless you reference them elsewhere

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        unique: true, // Each user has one cart
        sparse: true // Allows multiple null userId, for unassigned carts (if you later want to create temporary server carts for guests)
    },
    items: [cartItemSchema], // Array of cart items
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Update `updatedAt` on each save
cartSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;