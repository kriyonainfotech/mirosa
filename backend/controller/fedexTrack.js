const axios = require("axios");
const { getFedexToken } = require("./fedexAuth");

async function trackShipment(req, res) {
    try {
        const { trackingNumber } = req.params;
        const token = await getFedexToken();

        const response = await axios.post(
            `${process.env.FEDEX_BASE_URL}/track/v1/trackingnumbers`,
            { trackingInfo: [{ trackingNumberInfo: { trackingNumber } }] },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        res.json({
            success: true,
            data: response.data,
        });
    } catch (error) {
        console.error("FedEx Tracking Error:", error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: "Failed to track shipment",
            error: error.response?.data || error.message,
        });
    }
}

module.exports = { trackShipment };
