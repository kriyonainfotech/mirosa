const Order = require('../models/Order');
const { Country, State } = require('country-state-city');
const axios = require('axios');
exports.createOrder = async (req, res) => {
    try {
        const { cartItems, shippingAddress, paymentMethod, paymentStatus } = req.body;
        console.log(req.body, "req.body");

        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            return res.status(400).json({ success: false, message: "Cart is empty" });
        }

        // 1️⃣ Calculate total
        const calculatedTotal = cartItems.reduce((acc, item) => {
            const price = item.priceAtPurchase;
            return acc + (price * item.quantity);
        }, 0);

        // 2️⃣ Logs
        console.log("🛒 Creating order for user:", req.user._id);
        console.log("Total Amount:", calculatedTotal);
        console.log("Payment Method:", paymentMethod);
        console.log("Payment Status:", paymentStatus);

        console.log("📦 Shipping Address:", shippingAddress);
        console.log("🛍️ Cart Items:", cartItems);

        // 3️⃣ Map DB fields
        const orderItems = cartItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            priceAtPurchase: item.priceAtPurchase,
            nameAtPurchase: item.nameAtPurchase,
            mainImageAtPurchase: item.mainImageAtPurchase
        }));

        // 4️⃣ Create order
        const order = new Order({
            user: req.user._id,
            cartItems: orderItems,
            shippingAddress,
            totalAmount: calculatedTotal,
            paymentMethod,
            paymentStatus: paymentStatus || "Pending",
        });

        const savedOrder = await order.save();
        console.log("✅ Order saved:", savedOrder._id);

        res.status(201).json({
            success: true,
            message: "Order placed successfully",
            orderId: savedOrder._id
        });

    } catch (err) {
        console.error("❌ Error placing order:", err);
        res.status(500).json({
            success: false,
            message: "Error placing order",
            error: err.message
        });
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

const getFedexAuthToken = async () => {
    try {
        // Using 'application/x-www-form-urlencoded' is required by FedEx for auth
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', process.env.FEDEX_CLIENT_ID);
        params.append('client_secret', process.env.FEDEX_CLIENT_SECRET);

        const res = await axios.post(
            `${process.env.FEDEX_BASE_URL}/oauth/token`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return res.data.access_token;

    } catch (error) {
        console.error("❌ Error getting FedEx token:", error.response ? error.response.data : error.message);
        throw new Error("Could not get FedEx Auth Token");
    }
}

const getFedexAuthTokenToTrack = async () => {
    try {
        // Using 'application/x-www-form-urlencoded' is required by FedEx for auth
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', process.env.FEDEX_CLIENT_ID_TRACK);
        params.append('client_secret', process.env.FEDEX_CLIENT_SECRET_TRACK);

        const res = await axios.post(
            `${process.env.FEDEX_BASE_URL}/oauth/token`,
            params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        return res.data.access_token;

    } catch (error) {
        console.error("❌ Error getting FedEx token:", error.response ? error.response.data : error.message);
        throw new Error("Could not get FedEx Auth Token");
    }
}

exports.validateAddress = async (req, res) => {
    try {
        const { address } = req.body;
        if (!address) {
            return res.status(400).json({ message: "Address object not provided." });
        }

        // ... (rest of your validation logic is here) ...
        const {
            addressLine1: street,
            city,
            state,
            zipCode: postalCode,
            country,
        } = address;

        if (!street || !city || !state || !postalCode || !country) {
            return res.status(400).json({ message: "Incomplete address provided." });
        }
        const countryInfo = Country.getAllCountries().find(c => c.name.toLowerCase() === country.toLowerCase());
        if (!countryInfo) {
            return res.status(400).json({ message: `Invalid country name provided: ${country}` });
        }
        const countryCode = countryInfo.isoCode;

        const authToken = await getFedexAuthToken();

        const validationData = {
            "addressesToValidate": [{
                "address": {
                    "streetLines": [street],
                    "city": city,
                    "stateOrProvinceCode": state,
                    "postalCode": postalCode,
                    "countryCode": countryCode
                }
            }]
        };

        // ✅ FIXED: Using FEDEX_BASE_URL
        const validationUrl = `${process.env.FEDEX_BASE_URL}/address/v1/addresses/resolve`;
        const fedexResponse = await axios.post(validationUrl, validationData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            }
        });

        const result = fedexResponse.data.output.resolvedAddresses[0];
        res.status(200).json({
            success: true,
            validationResult: result,
            validationData: validationData
        });

    } catch (error) {
        console.error('FedEx Address Validation Error:', error.response ? error.response.data : error.message);
        res.status(500).json({
            success: false,
            message: 'Address validation failed.',
            error: error.response ? error.response.data.errors : "An unknown error occurred."
        });
    }
};

exports.createFedexShipment = async (req, res) => {
    try {
        console.log("🚚 Creating FedEx shipment...");

        console.log("📦 Order ID:", req.params.id);
        console.log("📥 Body Received:", req.body);

        const orderId = req.params.id;
        const { weight, length, width, height } = req.body;

        console.log("🔍 Raw Weight & Dimensions:",
            weight, length, width, height,
            "Types:", typeof weight, typeof length, typeof width, typeof height
        );

        if (!weight || !length || !width || !height) {
            return res.status(400).json({ message: 'Weight and Dimensions (L,W,H) are required.' });
        }

        const parsedWeight = parseFloat(weight);
        const parsedLength = parseInt(length, 10);
        const parsedWidth = parseInt(width, 10);
        const parsedHeight = parseInt(height, 10);

        console.log("🔢 Parsed:", parsedWeight, parsedLength, parsedWidth, parsedHeight);

        if ([parsedWeight, parsedLength, parsedWidth, parsedHeight].some(v => isNaN(v))) {
            return res.status(400).json({ message: 'Weight and Dimensions must be numeric.' });
        }

        // ===== Fetch Order =====
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        console.log("🧾 Order loaded");

        const {
            addressLine1, addressLine2, city, state,
            country, zipCode, phoneNumber, fullName
        } = order.shippingAddress || {};

        // Address splitter
        const splitAddressSmart = (text) => {
            if (!text) return [];
            const maxLength = 35;
            const words = text.split(/([, ]+)/);
            const lines = [];
            let currentLine = "";

            for (let word of words) {
                if ((currentLine + word).length <= maxLength) {
                    currentLine += word;
                } else {
                    if (currentLine.trim()) lines.push(currentLine.trim());
                    currentLine = word;
                }
            }
            if (currentLine.trim()) lines.push(currentLine.trim());
            return lines;
        };

        // Build up to 3 street lines
        let streetLines = splitAddressSmart(addressLine1 || "");
        if (addressLine2) streetLines.push(...splitAddressSmart(addressLine2));
        streetLines = streetLines.slice(0, 3);

        // COUNTRY CODE
        let countryCode = "IN";
        try {
            const cInfo = Country.getAllCountries().find(
                c => c.name.toLowerCase() === (country || "").toLowerCase()
            );
            if (cInfo) countryCode = cInfo.isoCode;
        } catch { }

        // PHONE cleanup
        let cleanPhone = (phoneNumber || "").replace(/\D/g, "");
        if (countryCode === "IN" && cleanPhone.startsWith("0") && cleanPhone.length === 11)
            cleanPhone = cleanPhone.substring(1);
        if (cleanPhone.length < 10) cleanPhone = "9999999999";

        // STATE CODE
        let stateCode = state;
        try {
            const sInfo = State.getStatesOfCountry(countryCode)
                .find(s => s.name.toLowerCase() === state.toLowerCase());
            if (sInfo) stateCode = sInfo.isoCode;
        } catch { }

        // ===== Financial Calculations =====
        const cartItems = order.cartItems;
        if (!cartItems?.length) {
            return res.status(400).json({ message: 'No cart items found on order.' });
        }

        const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

        const INR_TO_USD = 0.012;

        // Build commodities for FedEx
        const commodities = cartItems.map(item => {
            const origin = (item.countryOfOriginAtPurchase || "IN").slice(0, 2);

            const priceUSD = Number((item.priceAtPurchase * INR_TO_USD).toFixed(2));
            let customsValueUSD = Number((priceUSD * item.quantity).toFixed(2));
            if (customsValueUSD < 1) customsValueUSD = 1; // FedEx requirement

            let weightLB = Number(item.weightAtPurchase) || 0;
            const unit = item.weightUnitAtPurchase || "G";

            if (unit === "G") weightLB *= 0.00220462;
            else if (unit === "KG") weightLB *= 2.20462;
            if (weightLB < 0.001) weightLB = 0.001;

            const c = {
                description: (item.nameAtPurchase || "Jewelry").substring(0, 450),
                countryOfManufacture: origin,
                quantity: item.quantity,
                quantityUnits: "EA",
                unitPrice: { amount: priceUSD, currency: "USD" },
                customsValue: { amount: customsValueUSD, currency: "USD" },
                weight: { units: "LB", value: Number(weightLB.toFixed(3)) },
            };

            if (item.hsCodeAtPurchase) c.harmonizedCode = item.hsCodeAtPurchase;

            return c;
        });

        let totalCustomsValueUSD = commodities.reduce((sum, c) => sum + c.customsValue.amount, 0);
        if (totalCustomsValueUSD < 1) totalCustomsValueUSD = 1;

        // ===== AUTH =====
        const authToken = await getFedexAuthToken();

        // ===== BUILD SHIPMENT PAYLOAD =====
        const shipmentData = {
            labelResponseOptions: "URL_ONLY",

            requestedShipment: {
                shipper: {
                    contact: {
                        personName: process.env.SHIPPER_NAME,
                        phoneNumber: process.env.SHIPPER_PHONE
                    },
                    address: {
                        streetLines: [
                            process.env.SHIPPER_ADDRESS_LINE1,
                            process.env.SHIPPER_ADDRESS_LINE2
                        ],
                        city: process.env.SHIPPER_CITY,
                        stateOrProvinceCode: process.env.SHIPPER_STATE_CODE,
                        postalCode: process.env.SHIPPER_POSTAL_CODE,
                        countryCode: process.env.SHIPPER_COUNTRY
                    }
                },

                recipients: [
                    {
                        contact: {
                            personName: fullName,
                            phoneNumber: cleanPhone
                        },
                        address: {
                            streetLines,
                            city,
                            stateOrProvinceCode: stateCode,
                            postalCode: zipCode,
                            countryCode: countryCode
                        }
                    }
                ],

                serviceType: "INTERNATIONAL_PRIORITY",
                packagingType: "YOUR_PACKAGING",
                pickupType: "DROPOFF_AT_FEDEX_LOCATION",

                customsClearanceDetail: {
                    dutiesPayment: {
                        paymentType: "SENDER",
                        payor: {
                            responsibleParty: {
                                accountNumber: { value: process.env.FEDEX_SANDBOX_ACCOUNT_NUMBER }
                            }
                        }
                    },
                    commercialInvoice: {
                        shipmentPurpose: "SOLD"
                    },
                    commodities: commodities,
                    totalCustomsValue: {
                        amount: totalCustomsValueUSD,
                        currency: "USD"
                    }
                },

                shippingChargesPayment: {
                    paymentType: "SENDER",
                    payor: {
                        responsibleParty: {
                            accountNumber: { value: process.env.FEDEX_SANDBOX_ACCOUNT_NUMBER }
                        }
                    }
                },

                labelSpecification: {
                    labelFormatType: "COMMON2D",
                    imageType: "PDF",
                    labelStockType: "PAPER_4X6"
                },

                requestedPackageLineItems: [
                    {
                        weight: { units: "LB", value: parsedWeight },
                        dimensions: {
                            length: parsedLength,
                            width: parsedWidth,
                            height: parsedHeight,
                            units: "IN"
                        }
                    }
                ]
            },

            accountNumber: {
                value: process.env.FEDEX_SANDBOX_ACCOUNT_NUMBER
            }
        };

        console.log("� Commodities:", JSON.stringify(commodities, null, 2));
        console.log("💰 Calculated Total Customs Value:", totalCustomsValueUSD);
        console.log("�🔥 Final Payload:", JSON.stringify(shipmentData, null, 2));

        // ---- ACTUAL FEDEX API CALL ----
        const shipmentUrl = `${process.env.FEDEX_BASE_URL}/ship/v1/shipments`;
        console.log("🌐 FedEx URL:", shipmentUrl);

        let fedexResponse;
        try {
            fedexResponse = await axios.post(shipmentUrl, shipmentData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                timeout: 30000
            });
            console.log("📦 FedEx Response Status:", fedexResponse.status);
            console.log("📦 FedEx Response Data:", fedexResponse.data);
        } catch (err) {
            console.error("❌ FedEx API call failed:", err.response ? err.response.data : err.message);
            throw err;
        }

        // ---- PARSE RESPONSE ----
        const results = fedexResponse.data?.output;
        if (!results?.transactionShipments?.length) {
            console.error("❌ FedEx response missing transactionShipments:", fedexResponse.data);
            return res.status(500).json({
                message: 'Failed to create shipment - unexpected FedEx response.',
                raw: fedexResponse.data
            });
        }

        const trackingNumber = results.transactionShipments[0].masterTrackingNumber;
        const labelUrl = results.transactionShipments[0].pieceResponses?.[0]?.packageDocuments?.[0]?.url;

        console.log("✅ Tracking Number:", trackingNumber);
        console.log("✅ Label URL:", labelUrl);

        // ---- UPDATE ORDER ----
        // Use parsedWeight instead of undefined grossWeightVal
        order.trackingNumber = trackingNumber;
        order.shipmentDetails = {
            labelURL: labelUrl,
            package: {
                weight: parsedWeight, // ✅ fixed
                weightUnit: 'LB',
                length: parsedLength,
                width: parsedWidth,
                height: parsedHeight,
                dimensionsUnit: 'IN'
            }
        };
        order.status = 'Shipped';
        await order.save();
        console.log("💾 Order updated with shipment details.");

        // SUCCESS RESPONSE
        res.status(200).json({
            success: true,
            message: 'Shipment created successfully!',
            trackingNumber: trackingNumber,
            labelUrl: labelUrl
        });

    } catch (error) {
        // Detailed logging for debugging
        console.error("❌ FedEx Shipment Error - message:", error.message);
        if (error.response) {
            console.error("❌ FedEx Error Response Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("❌ Error (no response):", error);
        }

        // If FedEx returned structured errors, include them; otherwise send message
        const responseErrors = error.response?.data?.errors || error.response?.data || error.message;

        let userMessage = 'Failed to create shipment.';
        if (Array.isArray(responseErrors) && responseErrors.length > 0 && responseErrors[0]?.code) {
            userMessage = `FedEx Error: ${responseErrors[0].code}`;
            if (responseErrors[0].message && !responseErrors[0].message.includes("not able to retrieve")) {
                userMessage += ` - ${responseErrors[0].message}`;
            }
        } else if (error.message) {
            userMessage = error.message;
        }

        res.status(500).json({
            message: userMessage,
            errors: responseErrors
        });
    }
};

exports.trackShipment = async (req, res) => {
    try {
        console.log("🚚 Tracking FedEx shipment...");

        const { trackingNumber } = req.body;
        if (!trackingNumber) {
            console.log("❌ No tracking number provided");
            return res.status(400).json({ message: "Tracking number is required" });
        }
        console.log("🔢 Tracking Number:", trackingNumber);

        // Get FedEx auth token
        console.log("🔐 Fetching FedEx Auth Token for tracking...");
        const authToken = await getFedexAuthTokenToTrack();
        console.log("✅ Auth token received");

        // Build request payload
        const payload = {
            trackingInfo: [
                { trackingNumberInfo: { trackingNumber } }
            ],
            includeDetailedScans: true
        };

        // Call FedEx Track API
        const trackUrl = `${process.env.FEDEX_BASE_URL}/track/v1/trackingnumbers`;
        const fedexResponse = await axios.post(trackUrl, payload, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
            timeout: 30000
        });

        const result = fedexResponse.data?.output?.completeTrackResults?.[0];
        if (!result) {
            console.error("❌ Invalid FedEx response:", fedexResponse.data);
            return res.status(500).json({
                message: "Failed to retrieve FedEx tracking details",
                raw: fedexResponse.data
            });
        }

        console.log("✅ FedEx Tracking Result:", result);

        // Simplify scan events for frontend
        const rawEvents = (result.scanEvents && result.scanEvents.length > 0)
            ? result.scanEvents
            : (result.trackResults?.[0]?.scanEvents || []);

        const simplifiedEvents = rawEvents.map(event => ({
            date: event.date,
            description: event.eventDescription,
            exception: event.exceptionDescription || null,
            location: {
                city: event.scanLocation?.city || "",
                state: event.scanLocation?.stateOrProvinceCode || "",
                country: event.scanLocation?.countryCode || ""
            }
        }));

        console.log(JSON.stringify(result, null, 2));

        res.status(200).json({
            success: true,
            trackingNumber: result.trackingNumber,
            latestStatus: result.latestStatusDetail,
            events: simplifiedEvents
        });

    } catch (error) {
        console.error("❌ FedEx Track Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Error tracking FedEx shipment",
            error: error.response?.data || error.message
        });
    }
};
