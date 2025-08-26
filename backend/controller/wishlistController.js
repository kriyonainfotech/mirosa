const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');

/**
 * @desc    Get user's wishlist
 * @route   GET /api/wishlist
 * @access  Private
 */
exports.getWishlist = async (req, res) => {
    console.log("🛍️  Fetching wishlist for user:", req.user._id);
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'title slug mainImage variants');

        if (!wishlist) {
            console.log("✅  No wishlist found for user, returning empty array.");
            return res.status(200).json({
                success: true,
                message: "Wishlist is empty.",
                wishlist: { products: [] }
            });
        }

        console.log("✅  Successfully fetched wishlist.");
        res.status(200).json({
            success: true,
            wishlist
        });

    } catch (error) {
        console.error("❌  Error fetching wishlist:", error);
        res.status(500).json({ success: false, message: "Server error while fetching wishlist." });
    }
};

/**
 * @desc    Add a product to the wishlist
 * @route   POST /api/wishlist/add
 * @access  Private
 */
exports.addToWishlist = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log("⚠️  Validation error:", errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId } = req.body;
    console.log(productId, req.user, 'whislist add')
    const userId = req.user._id;

    console.log(`➕  Attempting to add product ${productId} to wishlist for user ${userId}`);

    try {
        const productExists = await Product.findById(productId);
        if (!productExists) {
            console.log(`❌  Product with ID ${productId} not found.`);
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            console.log(`✨  No existing wishlist for user ${userId}, creating a new one.`);
            wishlist = new Wishlist({ user: userId, products: [] });
        }

        const isProductInWishlist = wishlist.products.some(p => p.equals(productId));

        if (isProductInWishlist) {
            console.log(`👍  Product ${productId} is already in the wishlist.`);
            return res.status(200).json({ success: true, message: "Product already in wishlist." });
        }

        wishlist.products.push(productId);
        await wishlist.save();

        console.log(`✅  Product ${productId} added to wishlist for user ${userId}.`);
        res.status(200).json({
            success: true,
            message: "Product added to wishlist successfully.",
            wishlist
        });

    } catch (error) {
        console.error("❌  Error adding to wishlist:", error);
        res.status(500).json({ success: false, message: "Server error while adding to wishlist." });
    }
};

/**
 * @desc    Remove a product from the wishlist
 * @route   DELETE /api/wishlist/remove/:productId
 * @access  Private
 */
exports.removeFromWishlist = async (req, res) => {
    const { productId } = req.params;
    const userId = req.user._id;
    console.log(`➖  Attempting to remove product ${productId} from wishlist for user ${userId}`);

    try {
        const wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            console.log(`❌  Wishlist not found for user ${userId}.`);
            return res.status(404).json({ success: false, message: "Wishlist not found." });
        }

        const updateResult = await Wishlist.updateOne(
            { user: userId },
            { $pull: { products: productId } }
        );

        if (updateResult.nModified === 0) {
            console.log(`🤔  Product ${productId} was not found in the wishlist to remove.`);
            return res.status(404).json({ success: false, message: "Product not in wishlist." });
        }

        console.log(`✅  Product ${productId} removed from wishlist for user ${userId}.`);
        res.status(200).json({
            success: true,
            message: "Product removed from wishlist successfully."
        });

    } catch (error) {
        console.error("❌  Error removing from wishlist:", error);
        res.status(500).json({ success: false, message: "Server error while removing from wishlist." });
    }
};


/**
 * @desc    Merge guest wishlist with user's database wishlist
 * @route   POST /api/wishlist/merge
 * @access  Private
 */
exports.mergeGuestWishlist = async (req, res) => {
    const { guestWishlistItems } = req.body;
    const userId = req.user._id;
    console.log(`🔄  Merging guest wishlist for user ${userId}`);

    if (!Array.isArray(guestWishlistItems)) {
        return res.status(400).json({ success: false, message: 'guestWishlistItems must be an array.' });
    }

    try {
        let userWishlist = await Wishlist.findOne({ user: userId });
        if (!userWishlist) {
            userWishlist = new Wishlist({ user: userId, products: [] });
        }

        const guestProductIds = guestWishlistItems.map(item => item._id).filter(Boolean);

        // Find which of the guest products are not already in the user's wishlist
        const newProductIds = guestProductIds.filter(guestId =>
            !userWishlist.products.some(userProductId => userProductId.equals(guestId))
        );

        if (newProductIds.length > 0) {
            userWishlist.products.push(...newProductIds);
            await userWishlist.save();
            console.log(`✅  Merged ${newProductIds.length} new items into user's wishlist.`);
        } else {
            console.log("👍  No new items to merge from guest wishlist.");
        }

        // Populate the products to return the full wishlist
        const finalWishlist = await Wishlist.findById(userWishlist._id).populate('products', 'title slug mainImage variants');

        res.status(200).json({ success: true, message: 'Guest wishlist merged successfully!', wishlist: finalWishlist });

    } catch (error) {
        console.error('❌  Error merging guest wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error during wishlist merge.' });
    }
};
