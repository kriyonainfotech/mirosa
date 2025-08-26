const Order = require('../models/Order');

exports.createOrder = async (req, res) => {
    try {
        const { cartItems, shippingAddress, totalAmount, paymentMethod, paymentStatus } = req.body;

        const order = new Order({
            user: req.user._id,
            cartItems,
            shippingAddress,
            totalAmount,
            paymentMethod,
            paymentStatus
        });

        const savedOrder = await order.save();
        res.status(201).json({ success: true, message: "Order placed", orderId: savedOrder._id });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error placing order", error: err.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error fetching orders" });
    }
};
// 🚚 GET ALL ORDERS — Admin Access
exports.getAllOrders = async (req, res) => {
    console.log("📦 [GET] Fetching all orders...");

    try {
        const orders = await Order.find()
            .populate('user', 'name email') // only pull what you need
            .sort({ createdAt: -1 });

        console.log(`✅ ${orders.length} orders found.`);

        res.status(200).json({
            success: true,
            count: orders.length,
            orders,
        });

    } catch (err) {
        console.error("❌ Error fetching orders:", err.message);
        res.status(500).json({
            success: false,
            message: "🚨 Server error while fetching orders",
        });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        console.log(req.user, 'req.user')
        const userId = req.user._id
        // req.user.id is added by your 'protect' middleware
        const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });
        console.log(orders, 'orders')
        if (!orders) {
            return res.status(404).json({ message: "No orders found for this user." });
        }

        res.status(200).json({
            success: true,
            orders: orders,
        });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ message: "Server error." });
    }
};

exports.updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ message: "Status is required." });
    }

    try {
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({ message: "Order not found." });
        }

        order.status = status;
        await order.save();

        res.status(200).json({
            success: true,
            message: `Order status updated to ${status}`,
            order: order,
        });

    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Server error." });
    }
};