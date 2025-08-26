// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product'); // Need Product to check stock and get variant details

// Helper to get variant details from a product document
const getVariantFromProduct = (product, variantId) => {
    if (!product || !product.variants) return null;
    return product.variants.id(variantId); // .id() is a Mongoose Array method for subdocuments
};


// @route   POST /api/cart/add
// @desc    Add item to cart (for authenticated users)
// @access  Private
exports.addToCart = async (req, res) => {
    const { productId, variantId, quantity, selectedSize } = req.body;
    const userId = req.user.id; // From auth middleware

    console.log("🛒 [addToCart] Received request:", {
        userId,
        productId,
        variantId,
        quantity, selectedSize
    });

    if (!productId || !variantId || !quantity || quantity < 1) {
        console.warn("⚠️ Missing or invalid inputs.");
        return res.status(400).json({
            success: false,
            message: 'Product ID, variant ID, and quantity are required.'
        });
    }


    try {

        // ✅ 2. (Optional but Recommended) Validate the selected size
        if (selectedSize && !variant.size.includes(selectedSize)) {
            return res.status(400).json({ success: false, message: 'Selected size is not available for this variant.' });
        }


        console.log("🔍 Fetching product...");
        const product = await Product.findById(productId);

        if (!product) {
            console.warn(`❌ Product not found [ID: ${productId}]`);
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        console.log("✅ Product found:", product.title);

        const variant = getVariantFromProduct(product, variantId);
        if (!variant) {
            console.warn(`❌ Variant not found [variantId: ${variantId}] for product ${product.title}`);
            return res.status(404).json({
                success: false,
                message: 'Variant not found for this product.'
            });
        }

        console.log(`🎯 Variant found: ${variant.material} - Stock: ${variant.stock}`);

        // Stock check
        if (variant.stock < quantity) {
            console.warn(`🚫 Insufficient stock: requested ${quantity}, available ${variant.stock}`);
            return res.status(400).json({
                success: false,
                message: `Insufficient stock for ${product.title} - ${variant.material}. Only ${variant.stock} available.`
            });
        }

        // Fetch or create cart
        console.log("🧾 Fetching user cart...");
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            console.log("🆕 No existing cart found. Creating new cart.");
            cart = new Cart({ userId, items: [] });
        } else {
            console.log(`📦 Existing cart found with ${cart.items.length} items.`);
        }

        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(item =>
            item.productId.toString() === productId &&
            item.variantId.toString() === variantId
        );

        if (existingItemIndex > -1) {
            console.log("🔁 Item already exists in cart. Updating quantity...");

            const currentQty = cart.items[existingItemIndex].quantity;
            const updatedQty = currentQty + quantity;

            if (variant.stock < updatedQty) {
                console.warn(`⚠️ Exceeds stock. Requested total: ${updatedQty}, Available: ${variant.stock}`);
                return res.status(400).json({
                    success: false,
                    message: `Adding ${quantity} exceeds available stock. Current in cart: ${currentQty}. Max available: ${variant.stock}.`
                });
            }

            cart.items[existingItemIndex].quantity = updatedQty;
            console.log(`🔼 Quantity updated to ${updatedQty}`);
        } else {
            console.log("🆕 Adding new item to cart.");
            cart.items.push({
                productId,
                variantId,
                quantity,
                name: `${product.title} - ${variant.material} ${variant.purity}`,
                mainImage: product.mainImage || variant.images?.[0],
                variantDetails: {
                    material: variant.material,
                    purity: variant.purity,
                    size: selectedSize || '',
                    price: variant.price
                }
            });
        }

        console.log("💾 Saving cart...");
        await cart.save();

        console.log("✅ Cart updated successfully!");
        res.status(200).json({
            success: true,
            message: 'Item added to cart successfully!',
            cart
        });

    } catch (error) {
        console.error('💥 Server error in addToCart:', error);
        res.status(500).json({
            success: false,
            message: 'Server error adding item to cart.'
        });
    }
};



// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
exports.getUserCart = async (req, res) => {
    const userId = req.user.id; // From auth middleware

    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(200).json({ success: true, cart: { userId, items: [] } }); // Return empty cart if not found
        }
        res.status(200).json({ success: true, cart });
    } catch (error) {
        console.error('Error getting cart:', error);
        res.status(500).json({ success: false, message: 'Server error getting cart.' });
    }
};

// @route   PUT /api/cart/update/:itemId
// @desc    Update item quantity in cart
// @access  Private
exports.updateCartItem = async (req, res) => {
    const { itemId } = req.params; // _id of the cart item (subdocument)
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 0) { // Allow 0 to effectively remove item
        return res.status(400).json({ success: false, message: 'Quantity must be a positive number or 0 to remove.' });
    }

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found.' });
        }

        const itemToUpdate = cart.items.id(itemId); // Find subdocument by _id
        if (!itemToUpdate) {
            return res.status(404).json({ success: false, message: 'Cart item not found.' });
        }

        // Get product and variant to check stock for new quantity
        const product = await Product.findById(itemToUpdate.productId);
        if (!product) {
            console.warn(`Product ${itemToUpdate.productId} not found for cart item ${itemId}.`);
        }
        const variant = product ? getVariantFromProduct(product, itemToUpdate.variantId) : null;

        if (variant && quantity > variant.stock) {
            return res.status(400).json({ success: false, message: `Requested quantity ${quantity} exceeds available stock of ${variant.stock}.` });
        }

        if (quantity === 0) {
            itemToUpdate.remove(); // Mongoose way to remove subdocument
        } else {
            itemToUpdate.quantity = quantity;
        }

        await cart.save();
        res.status(200).json({ success: true, message: 'Cart item updated successfully!', cart });

    } catch (error) {
        console.error('Error updating cart item:', error);
        res.status(500).json({ success: false, message: 'Server error updating cart item.' });
    }
};


// @route   DELETE /api/cart/remove/:itemId
// @desc    Remove item from cart
// @access  Private
exports.removeFromCart = async (req, res) => {
    const { itemId } = req.params; // _id of the cart item (subdocument)
    const userId = req.user.id;

    try {
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found.' });
        }

        cart.items = cart.items.filter(item => item._id.toString() !== itemId); // Filter out the item
        await cart.save();
        res.status(200).json({ success: true, message: 'Item removed from cart successfully!', cart });

    } catch (error) {
        console.error('Error removing cart item:', error);
        res.status(500).json({ success: false, message: 'Server error removing item from cart.' });
    }
};

// @route   POST /api/cart/merge
// @desc    Merge guest cart (from localStorage) with user's database cart upon login/register
// @access  Private (user must be authenticated)
exports.mergeGuestCart = async (req, res) => {
    const { guestCartItems } = req.body; // Array of guest cart items from frontend
    const userId = req.user.id;

    if (!Array.isArray(guestCartItems)) {
        return res.status(400).json({ success: false, message: 'guestCartItems must be an array.' });
    }

    try {
        let userCart = await Cart.findOne({ userId });
        if (!userCart) {
            userCart = new Cart({ userId, items: [] });
        }

        for (const guestItem of guestCartItems) {
            const { productId, variantId, quantity } = guestItem;

            // Basic validation for guest item
            if (!productId || !variantId || !quantity || quantity < 1) {
                console.warn('Skipping invalid guest cart item:', guestItem);
                continue;
            }

            const product = await Product.findById(productId);
            if (!product) {
                console.warn(`Product ${productId} not found for guest cart item, skipping.`);
                continue;
            }
            const variant = getVariantFromProduct(product, variantId);
            if (!variant) {
                console.warn(`Variant ${variantId} not found for product ${productId}, skipping.`);
                continue;
            }

            // Check stock before merging
            if (variant.stock < quantity) {
                console.warn(`Insufficient stock for guest item ${product.title} - ${variant.material}, skipping or adjusting quantity.`);
                continue; // For now, skip
            }

            const existingUserCartItemIndex = userCart.items.findIndex(item =>
                item.productId.toString() === productId && item.variantId.toString() === variantId
            );

            if (existingUserCartItemIndex > -1) {
                // Update quantity of existing item in user's cart
                userCart.items[existingUserCartItemIndex].quantity += quantity;
                // Re-check combined stock
                if (variant.stock < userCart.items[existingUserCartItemIndex].quantity) {
                    console.warn(`Merged quantity for ${product.title} exceeds stock, adjusting to max available.`);
                    userCart.items[existingUserCartItemIndex].quantity = variant.stock;
                }
            } else {
                // Add new item to user's cart
                userCart.items.push({
                    productId,
                    variantId,
                    quantity,
                    name: `${product.title} - ${variant.material} ${variant.purity}`,
                    mainImage: product.mainImage || variant.images?.[0],
                    variantDetails: {
                        material: variant.material,
                        purity: variant.purity,
                        size: variant.size,
                        sku: variant.sku,
                        price: variant.price
                    }
                });
            }
        }

        await userCart.save();
        res.status(200).json({ success: true, message: 'Guest cart merged successfully!', cart: userCart });

    } catch (error) {
        console.error('Error merging guest cart:', error);
        res.status(500).json({ success: false, message: 'Server error during cart merge.' });
    }
};