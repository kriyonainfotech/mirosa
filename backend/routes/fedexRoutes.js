const express = require("express");
const { createShipment } = require("../controller/fedexShip");
const { trackShipment } = require("../controller/fedexTrack");
const router = express.Router();

router.post("/create", createShipment);
router.get("/track/:trackingNumber", trackShipment);

module.exports = router;
