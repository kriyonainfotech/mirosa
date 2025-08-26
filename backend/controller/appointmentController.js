const VirtualAppointment = require('../models/VirtualAppointment');
const nodemailer = require('nodemailer');
// Make sure to load environment variables
require('dotenv').config();

exports.createAppointment = async (req, res) => {
    const { name, email, date, time, material, budget, shape, notes } = req.body;

    if (!name || !email || !date || !time) {
        return res.status(400).json({ message: 'Name, email, date, and time are required.' });
    }

    try {
        // 1. Save the appointment request to the database
        const newAppointment = new VirtualAppointment({
            name, email, date, time, material, budget, shape, notes
        });
        await newAppointment.save();

        // 2. Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            // ✅ FIX 1: Uncommented and added the 'host' and 'port' from your .env file.
            // This is required for Nodemailer to know which email server to use.
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: false, // For TLS on port 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 3. Send notification email to admin (Your code here is correct)
        await transporter.sendMail({
            from: `"${name}" <${email}>`, // It's better to show the user's details here
            to: process.env.EMAIL_USER,
            replyTo: email, // This allows you to directly reply to the user
            subject: `New Virtual Viewing Request from ${name}`,
            html: `
                <h3>New Virtual Viewing Request Details:</h3>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Preferred Date:</strong> ${new Date(date).toLocaleDateString()}</li>
                    <li><strong>Preferred Time:</strong> ${time}</li>
                    <li><strong>Material:</strong> ${material || 'Not specified'}</li>
                    <li><strong>Budget:</strong> ${budget || 'Not specified'}</li>
                    <li><strong>Shape:</strong> ${shape || 'Not specified'}</li>
                    <li><strong>Notes:</strong> ${notes || 'None'}</li>
                </ul>
            `
        });

        // 4. Send confirmation email to the user (Your code here is correct)
        await transporter.sendMail({
            from: `"MIROSA Jewelry" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Your Virtual Viewing Request has been received!",
            html: `
                <h3>Hello ${name},</h3>
                <p>Thank you for your interest in a virtual viewing with MIROSA. We have received your request for the following date and time:</p>
                <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${time}</p>
                <p>Our team will review your request and send you a confirmation email with the meeting link shortly.</p>
                <p>Sincerely,<br/>The MIROSA Team</p>
            `
        });

        res.status(201).json({ success: true, message: "Appointment request submitted successfully!" });

    } catch (error) {
        console.error("Error creating appointment:", error);
        res.status(500).json({ message: "Server error. Please try again." });
    }
};

exports.handleContactForm = async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        // --- Email to Company ---
        await transporter.sendMail({
            from: `"${name}" <${email}>`,
            to: process.env.EMAIL_USER, // Your company's email
            replyTo: email,
            subject: `New Contact Form Message: ${subject}`,
            html: `
                <h2>New Message from ${name}</h2>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
            `
        });

        // --- Confirmation Email to User ---
        await transporter.sendMail({
            from: `"MIROSA Jewelry" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "We've received your message!",
            html: `
                <h3>Hello ${name},</h3>
                <p>Thank you for contacting MIROSA. We have received your message and a member of our team will get back to you within 24 hours.</p>
                <p><strong>Your Message Summary:</strong><br/><em>"${message}"</em></p>
                <p>Sincerely,<br/>The MIROSA Team</p>
            `
        });

        res.status(200).json({ success: true, message: "Thank you! Your message has been sent." });

    } catch (error) {
        console.error("Error sending contact email:", error);
        res.status(500).json({ message: "Failed to send message. Please try again later." });
    }
};

exports.getAllAppointments = async (req, res) => {
    console.log("📅 [getAllAppointments] Fetching all appointments...");
    try {
        const appointments = await VirtualAppointment.find().sort({ date: -1, time: -1 });
        console.log(`✅ [getAllAppointments] Fetched ${appointments.length} appointments.`);
        res.status(200).json({ success: true, data: appointments });
    } catch (error) {
        console.error("❌ [getAllAppointments] Error fetching appointments:", error);
        res.status(500).json({ message: "Failed to fetch appointments.", error: error.message });
    }
};