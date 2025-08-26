const express = require('express');
const { createAppointment, handleContactForm, getAllAppointments } = require('../controller/appointmentController');
const router = express.Router();

// Route to handle the virtual view form submission
router.post('/request-virtual-view', createAppointment);
router.post('/send-message', handleContactForm);
router.get('/get-appointments', getAllAppointments)

module.exports = router;