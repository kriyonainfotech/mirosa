const express = require('express');
const { getUserCart, addToCart, updateCartItem, removeFromCart, clearCart } = require('../controller/cartController');
const router = express.Router()
const { isUser } = require('../middlewares/authmiddleware')

router.get("/getUserCart", isUser, getUserCart)
router.post("/addToCart", isUser, addToCart)
router.put("/updateCart/:itemId", isUser, updateCartItem)
router.delete("/remove/:itemId", isUser, removeFromCart)
router.post("/clear", isUser, clearCart)

module.exports = router;