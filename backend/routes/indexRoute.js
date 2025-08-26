const express = require('express')
const router = express.Router()

router.use('/auth', require('../routes/authRoute'))
router.use('/category', require('../routes/categoryRoute'))
router.use('/subcategory', require('../routes/subcategoryRoutes'))
router.use('/product', require('../routes/productRoute'))
router.use("/cart", require('../routes/cartRoute'))
router.use('/order', require('../routes/orderRoute'));
router.use('/wishlist', require('../routes/wishlistRoute'));
router.use('/appointments', require('../routes/appointmentRoutes'));
router.use('/payment', require('../routes/paymentRoutes'))

module.exports = router;