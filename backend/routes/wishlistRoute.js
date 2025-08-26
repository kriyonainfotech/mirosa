const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist
} = require('../controller/wishlistController');
const { isUser } = require('../middlewares/authmiddleware');

router.get('/', isUser, getWishlist);

router.post(
    '/add', isUser,
    [
        body('productId', 'Product ID is required').not().isEmpty(),
        body('productId', 'Invalid Product ID').isMongoId()
    ],
    addToWishlist
);

router.delete('/remove/:productId', isUser, removeFromWishlist);


module.exports = router;
