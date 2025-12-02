const axios = require("axios");
const qs = require("qs"); // <-- Add this to handle form data
require("dotenv").config();

async function getFedexToken() {
    try {
        const data = qs.stringify({
            grant_type: "client_credentials",
            client_id: process.env.FEDEX_CLIENT_ID,
            client_secret: process.env.FEDEX_CLIENT_SECRET,
        });

        const response = await axios.post(
            `${process.env.FEDEX_BASE_URL}/oauth/token`,
            data,
            {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );

        return response.data.access_token;
    } catch (error) {
        console.error(
            "FedEx Auth Error:",
            error.response?.data || error.message
        );
        throw new Error("Failed to get FedEx token");
    }
}

module.exports = { getFedexToken };
