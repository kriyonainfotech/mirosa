const mongoose = require('mongoose');

const virtualAppointmentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    material: { type: String },
    budget: { type: String },
    shape: { type: String },
    notes: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
        default: 'Pending'
    }
}, { timestamps: true });

const VirtualAppointment = mongoose.model('VirtualAppointment', virtualAppointmentSchema);

module.exports = VirtualAppointment;