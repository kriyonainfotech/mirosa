const express = require("express");
const router = express.Router();
const { makePayment, stripeWebhook } = require("../controller/paymentController");

// Stripe Payment Intent (checkout)
router.post("/create-checkout", makePayment);

// Stripe Webhook (to verify payment events)
// router.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

module.exports = router;
