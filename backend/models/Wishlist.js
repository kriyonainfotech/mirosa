const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
    // A reference to the user who owns this wishlist.
    // This creates a one-to-one relationship between a User and a Wishlist.
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // This should match the name of your User model, e.g., mongoose.model('User', UserSchema)
        required: [true, 'A user is required for a wishlist.'],
        unique: true, // Ensures each user can only have one wishlist document.
        index: true,  // Adds an index for faster queries on the user field.
    },

    // An array containing references to the products in the wishlist.
    // This creates a one-to-many relationship from Wishlist to Products.
    products: [{
        type: Schema.Types.ObjectId,
        ref: 'Product', // This should match the name of your Product model.
    }],

}, {
    // Automatically adds `createdAt` and `updatedAt` fields to the document.
    timestamps: true,
});

// Pre-save hook to log when a new wishlist is created.
WishlistSchema.pre('save', function (next) {
    if (this.isNew) {
        console.log(`✨ A new wishlist is being created for user: ${this.user}`);
    }
    next();
});

const Wishlist = mongoose.model('Wishlist', WishlistSchema);

module.exports = Wishlist;
