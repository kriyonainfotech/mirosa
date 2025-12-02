const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cartItems: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            variantId: { type: String, required: true },
            quantity: { type: Number, required: true },
            priceAtPurchase: { type: Number, required: true },
            nameAtPurchase: { type: String },
            mainImageAtPurchase: { type: String },
            weightAtPurchase: { type: Number },
            weightUnitAtPurchase: { type: String },
            hsCodeAtPurchase: { type: String },
            countryOfOriginAtPurchase: { type: String }
        }
    ],
    shippingAddress: {
        fullName: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String }, // optional
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
        zipCode: { type: String, required: true },
        phoneNumber: { type: String, required: true },
    },
    paymentMethod: { type: String, default: 'COD' },
    paymentStatus: { type: String, enum: ['Paid', 'Pending'], default: 'Pending' },
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Placed' },
    trackingNumber: { type: String, default: null },

    shipmentDetails: {
        shippingService: { type: String }, // e.g., 'FEDEX_PRIORITY_OVERNIGHT'
        shippingCost: { type: Number },     // The cost of the label (for your client's records)
        labelURL: { type: String },        // URL to the PDF/PNG label (e.g., stored in S3)
        trackingURL: { type: String },     // A direct link for the customer

        // Details of the *physical box* the admin ships
        package: {
            weight: { type: Number, required: true },
            weightUnit: { type: String, enum: ['LB', 'KG'], required: true },
            length: { type: Number, required: true },
            width: { type: Number, required: true },
            height: { type: Number, required: true },
            dimensionsUnit: { type: String, enum: ['IN', 'CM'], required: true }
        }
    }

}, { timestamps: true });

module.exports =

    mongoose.model("Order", OrderSchema);
