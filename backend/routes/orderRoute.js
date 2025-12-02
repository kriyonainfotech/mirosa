const express = require('express');
const router = express.Router();
const { isUser, isAdmin } = require('../middlewares/authmiddleware.js');
const { createOrder, getMyOrders, getAllOrders, getUserOrders, updateOrderStatus, createFedexShipment, validateAddress, trackShipment } = require('../controller/orderController.js');

router.post('/createOrder', isUser, createOrder);
router.get('/myOrders', isUser, getMyOrders);

// Optional: Admin only route for viewing all orders
router.get('/getallorders', isAdmin, getAllOrders); // You can later protect with isAdmin middleware
router.get('/my-orders', isUser, getUserOrders);
router.put('/:orderId/status', isAdmin, updateOrderStatus);
router.post('/:id/ship', createFedexShipment);
router.post('/validate-address', isUser, validateAddress);
router.post('/track', trackShipment);

module.exports = router;
