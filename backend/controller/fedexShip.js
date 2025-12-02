const axios = require("axios");
const { getFedexToken } = require("./fedexAuth");

async function createShipment(req, res) {
    try {
        const order = req.body;
        const token = await getFedexToken();

        const shipmentData = {
            labelResponseOptions: "URL_ONLY",
            accountNumber: {
                value: "210162165s" // <-- Your FedEx TEST Account Number
            },
            requestedShipment: {
                shipper: {
                    address: {
                        streetLines: ["Kriyona Infotech, Surat"],
                        city: "Surat",
                        postalCode: "395003",
                        countryCode: "IN",
                    },
                    contact: {
                        personName: "Kriyona Infotech",
                        phoneNumber: "8401366742",
                    },
                },

                // ✅ FedEx requires 'recipients' as an ARRAY
                recipients: [
                    {
                        address: {
                            streetLines: [order.customerAddress],
                            city: order.city,
                            postalCode: order.pincode,
                            countryCode: "IN",
                        },
                        contact: {
                            personName: order.customerName,
                            phoneNumber: order.phone,
                        },
                    },
                ],

                packages: [
                    {
                        weight: { units: "KG", value: order.weight || 0.5 },
                        dimensions: { length: 10, width: 10, height: 5, units: "CM" },
                    },
                ],

                serviceType: "STANDARD_OVERNIGHT",
                packagingType: "YOUR_PACKAGING",
                pickupType: "DROPOFF_AT_FEDEX_LOCATION", // ✅ Required field
                shipDatestamp: new Date().toISOString().split("T")[0],

                // ✅ Who pays the shipment charges
                shippingChargesPayment: {
                    paymentType: "SENDER",
                },
            },
        };

        const response = await axios.post(
            `${process.env.FEDEX_BASE_URL}/ship/v1/shipments`,
            shipmentData,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const output = response.data.output.transactionShipments[0];
        res.json({
            success: true,
            trackingNumber: output.masterTrackingNumber,
            labelUrl:
                output.pieceResponses[0].packageDocuments[0].url ||
                "No label generated",
            data: response.data,
        });
    } catch (error) {
        console.error("FedEx Shipment Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create shipment",
            error: error.response?.data || error.message,
        });
    }
}

module.exports = { createShipment };
