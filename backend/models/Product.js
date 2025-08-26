// models/Product.js
const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    sku: { type: String, required: true },
    weight: { type: Number },
    material: { type: String }, // 👈 Check this enum!
    purity: { type: String },
    size: {
        type: [String], // Changed from String to [String]
        default: []     // Good practice to set a default empty array
    },
    price: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0, min: 0 }, inStock: { type: Boolean, default: true },
    images: [String],
    discount: {
        type: {
            type: String,
            enum: ['percentage', 'fixed'],
            default: 'percentage'
        },
        value: {
            type: Number,
            default: 0
        }
    }
}, { _id: true });

variantSchema.pre('save', function (next) {
    this.inStock = this.stock > 0;
    next();
});

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subcategory",
    },
    tags: [String],
    mainImage: { type: String },
    variants: [variantSchema],
    isFeatured: { type: Boolean, default: false },
    isCustomizable: { type: Boolean, default: false },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now },
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;

/*
Example cURL request to add a product:

curl -X POST http://localhost:3000/api/products \
-H "Content-Type: application/json" \
-d '{
    "title": "Elegant Gold Ring",
    "slug": "elegant-gold-ring",
    "description": "A beautiful gold ring for special occasions.",
    "category": "Ring",
    "tags": ["gold", "ring", "jewellery"],
    "mainImage": "https://example.com/images/gold-ring.jpg",
    "variants": [
        {
            "sku": "GR001",
            "weight": 5,
            "material": "Gold",
            "purity": "18K",
            "size": "7",
            "price": 299.99,
            "inStock": true,
            "images": ["https://example.com/images/gold-ring-1.jpg"]
        }
    ],
    "isFeatured": true,
    "isCustomizable": false,
    "status": "active"
}'
*/