// const Stripe = require("stripe");
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // put your secret key in .env

// // ✅ Step 1: Create Payment Intent
// exports.makePayment = async (req, res) => {
//     try {
//         const { amount, currency = "usd" } = req.body;

//         if (!amount) {
//             return res.status(400).json({ success: false, message: "Amount is required" });
//         }

//         // Stripe needs amount in cents
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount * 100),
//             currency,
//             payment_method_types: ["card"],
//         });

//         res.status(200).json({
//             success: true,
//             clientSecret: paymentIntent.client_secret,
//         });
//     } catch (err) {
//         console.error("🔥 Stripe Payment Error:", err);
//         res.status(500).json({
//             success: false,
//             message: "Payment initiation failed",
//             error: err.message,
//         });
//     }
// };

// // ✅ Step 2: Handle Webhook Events
// exports.stripeWebhook = async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//         event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
//     } catch (err) {
//         console.error("⚠️ Webhook signature verification failed:", err.message);
//         return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     // Handle successful payment
//     if (event.type === "payment_intent.succeeded") {
//         const paymentIntent = event.data.object;
//         console.log("✅ Payment successful for:", paymentIntent.id);

//         // 👉 Create Order in DB here, reduce stock, etc.
//     }

//     res.json({ received: true });
// };

const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // put in .env

// ✅ Create Payment Intent
// exports.makePayment = async (req, res) => {
//     try {
//         const { amount, currency = "usd" } = req.body;

//         if (!amount) {
//             return res.status(400).json({ success: false, message: "Amount is required" });
//         }

//         // Stripe needs amount in cents
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: Math.round(amount * 100),
//             currency,
//             payment_method_types: ["card"],
//         });

//         res.status(200).json({
//             success: true,
//             clientSecret: paymentIntent.client_secret,
//         });
//     } catch (err) {
//         console.error("🔥 Stripe Payment Error:", err);
//         res.status(500).json({
//             success: false,
//             message: "Payment initiation failed",
//             error: err.message,
//         });
//     }
// };
// Stripe payment controller
exports.makePayment = async (req, res) => {
    try {
        console.log("🛒 Incoming payment request:", req.body);

        const { products, paymentMethod, shippingAddress } = req.body;

        if (!products || products.length === 0) {
            console.error("❌ No products provided for checkout.");
            return res.status(400).json({ error: "No products provided" });
        }

        const lineItems = products.map(p => {
            const price = Number(p.variantDetails?.price);
            if (isNaN(price)) {
                throw new Error(`Invalid price for product ${p.productId}`);
            }

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: p.name,
                        images: [p.mainImage],
                    },
                    unit_amount: Math.round(price * 100), // Stripe wants cents
                },
                quantity: p.quantity,
            };
        });


        console.log("📝 Line items for Stripe Checkout:", lineItems);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: [paymentMethod || "card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
            metadata: {
                shippingAddress: JSON.stringify(shippingAddress || {})
            },
        });

        console.log("✅ Stripe Checkout Session created:", session.id);

        res.json({ id: session.id });
    } catch (error) {
        console.error("🔥 Stripe payment error:", error);
        res.status(500).json({ error: error.message });
    }
};
