const User = require('../models/User'); // Adjust the path as needed
const Category = require('../models/Category');
const Subcategory = require('../models/Subcategory');
const Product = require('../models/Product');
const Order = require('../models/Order');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const jwt = require("jsonwebtoken");
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

// Register User API
exports.registerUser = async (req, res) => {
    console.log('📝 [RegisterUser] Received registration request:', req.body);

    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            console.log('⚠️ [RegisterUser] Missing required fields');
            return res.status(400).json({ message: 'Name, email, and password are required.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('🚫 [RegisterUser] User already exists with email:', email);
            return res.status(409).json({ message: 'User already exists.' });
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );


        console.log('✅ [RegisterUser] User registered successfully:', user._id);

        res.status(201).json({
            message: 'User registered successfully.',
            userId: user._id,
            token
        });
    } catch (error) {
        console.error('❌ [RegisterUser] Error during registration:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

User.prototype.comparePassword = async function (candidatePassword) {
    // Use bcrypt for password comparison
    return await bcrypt.compare(candidatePassword, this.password);
};

exports.loginUser = async (req, res) => {

    try {
        const { email, password } = req.body;
        console.log('🔑 [LoginUser] Received login request:', req.body);

        // Input validation
        if (!email || !password) {
            console.log('⚠️ [LoginUser] Missing email or password');
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('🚫 [LoginUser] User not found with email:', email);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            console.log('🚫 [LoginUser] Invalid password for user:', email);
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        console.log("🔐 JWT Payload:", { id: user._id, role: user.role });
        console.log("🔐 JWT Secret:", process.env.JWT_SECRET, typeof process.env.JWT_SECRET);
        console.log("🔐 Expires In:", "1d");

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        console.log('✅ [LoginUser] User logged in successfully:', user._id);

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            user: user,
            token,

        });
    } catch (error) {
        console.error('❌ [LoginUser] Error during login:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.updateUserRole = async (req, res) => {
    console.log('🛠️ [UpdateUserRole] Received role update request:', req.body);

    try {
        const { userId, role } = req.body;

        // Define allowed roles
        const allowedRoles = ['user', 'admin', 'team'];

        // Input validation
        if (!userId || !role) {
            console.log('⚠️ [UpdateUserRole] Missing userId or role');
            return res.status(400).json({ message: 'User ID and role are required.' });
        }

        if (!allowedRoles.includes(role)) {
            console.log('🚫 [UpdateUserRole] Invalid role:', role);
            return res.status(400).json({ message: 'Invalid role value.' });
        }

        // Find and update user
        const user = await User.findByIdAndUpdate(
            userId,
            { role },
            { new: true }
        );

        if (!user) {
            console.log('🚫 [UpdateUserRole] User not found:', userId);
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log('✅ [UpdateUserRole] User role updated:', userId, '->', role);

        res.status(200).json({ message: 'User role updated successfully.', userId: user._id, role: user.role });
    } catch (error) {
        console.error('❌ [UpdateUserRole] Error updating user role:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

// Send Reset Password Email API
exports.sendResetPasswordEmail = async (req, res) => {
    console.log('📧 [SendResetPasswordEmail] Received reset password request:', req.body);

    try {
        const { email } = req.body;

        // Input validation
        if (!email) {
            console.log('⚠️ [SendResetPasswordEmail] Missing email');
            return res.status(400).json({ message: 'Email is required.' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            console.log('🚫 [SendResetPasswordEmail] User not found with email:', email);
            return res.status(404).json({ message: 'User not found.' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour

        // Save token and expiry to user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        // Configure nodemailer
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset Request',
            html: `
            <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 40px 0;">
              <div style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); padding: 32px;">
                <div style="text-align: center; margin-bottom: 24px;">
                  <img src="https://cdn-icons-png.flaticon.com/512/3064/3064197.png" alt="Reset Password" width="64" style="margin-bottom: 12px;" />
                  <h2 style="color: #2d3748; margin: 0;">Password Reset Request</h2>
                </div>
                <p style="color: #4a5568; font-size: 16px;">Hello <strong>${user.name}</strong>,</p>
                <p style="color: #4a5568; font-size: 16px;">
                  We received a request to reset your password for your account. Click the button below to reset your password:
                </p>
                <div style="text-align: center; margin: 32px 0;">
                  <a href="${resetUrl}" style="color: #000; text-decoration: none; padding: 14px 28px;font-size: 16px; font-weight: bold; display: inline-block;">
                Reset Password
                  </a>
                </div>
                <p style="color: #718096; font-size: 14px;">
                  If you did not request a password reset, please ignore this email.<br>
                  This link will expire in 1 hour.
                </p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
                <p style="color: #a0aec0; font-size: 12px; text-align: center;">
                  &copy; ${new Date().getFullYear()} Mirosa Jewelery. All rights reserved.
                </p>
              </div>
            </div>
            `
        };

        await transporter.sendMail(mailOptions);

        console.log('✅ [SendResetPasswordEmail] Reset email sent to:', user.email);

        res.status(200).json({
            success: true,
            message: 'Reset password email sent.',
            email: user.email,
            userId: user._id,
            name: user.name
        });
    } catch (error) {
        console.error('❌ [SendResetPasswordEmail] Error sending reset email:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.resetPassword = async (req, res) => {
    console.log('🔒 [ResetPassword] Received reset password request:', req.body);

    try {
        const { newPassword } = req.body;
        const token = req.params.resetToken;

        // Input validation
        if (!token || !newPassword) {
            console.log('⚠️ [ResetPassword] Missing token or new password');
            return res.status(400).json({ message: 'Token and new password are required.' });
        }

        // Find user by reset token and check expiry
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            console.log('🚫 [ResetPassword] Invalid or expired token');
            return res.status(400).json({ message: 'Invalid or expired reset token.' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        // Clear reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        console.log('✅ [ResetPassword] Password reset successful for user:', user._id);

        res.status(200).json({ message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('❌ [ResetPassword] Error resetting password:', error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        console.log("📥 Fetching all users...");

        const users = await User.find().sort({ createdAt: -1 });

        console.log(`✅ Found ${users.length} users.`);
        res.status(200).json({ success: true, count: users.length, users });

    } catch (error) {
        console.error("❌ Error fetching users:", error.message);
        res.status(500).json({ success: false, message: "Server error while fetching users." });
    }
};

exports.getCounts = async (req, res) => {

    try {
        const [userCount, categoryCount, subcategoryCount, productCount, orderCount] = await Promise.all([
            User.countDocuments(),
            Category.countDocuments(),
            Subcategory.countDocuments(),
            Product.countDocuments(),
            Order.countDocuments()
        ]);

        res.status(200).json({
            success: true,
            data: {
                users: userCount,
                categories: categoryCount,
                subcategories: subcategoryCount,
                products: productCount,
                orders: orderCount
            }
        });
    } catch (error) {
        console.error("❌ Error fetching counts:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }

}

exports.updateProfilePhoto = async (req, res) => {
    console.log('🔄 [updateProfilePhoto] API hit');

    try {
        // 1. Validate file
        if (!req.file) {
            console.warn('⚠️ No file received in request');
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const userId = req.user.id;
        console.log(`🔍 Looking up user: ${userId}`);

        // 2. Fetch user from DB
        const user = await User.findById(userId);
        if (!user) {
            console.error(`❌ User not found with ID: ${userId}`);
            return res.status(404).json({ message: 'User not found.' });
        }

        // 3. Delete existing Cloudinary image if present
        if (user.image?.public_id) {
            console.log(`🧹 Deleting old profile image: ${user.image.public_id}`);
            await deleteFromCloudinary(user.image.public_id);
        }

        // 4. Upload new image
        console.log('📤 Uploading new image to Cloudinary...');
        const uploadResult = await uploadToCloudinary(req.file.buffer, 'profile_photos');
        console.log('✅ Upload successful:', uploadResult.secure_url);

        // 5. Save new image data
        user.image = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
        };
        await user.save();
        console.log('💾 User profile updated with new image.');

        // 6. Send response
        res.status(200).json({
            success: true,
            message: 'Profile photo updated successfully.',
            imageUrl: user.image.url
        });

    } catch (error) {
        console.error('🔥 Error in updateProfilePhoto:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteProfilePhoto = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !user.image || !user.image.public_id) {
            return res.status(400).json({ message: 'No profile photo to delete.' });
        }

        // 1. Delete the image from Cloudinary
        await deleteFromCloudinary(user.image.public_id);

        // 2. Remove the image reference from the user document
        user.image = undefined; // Or set to null
        await user.save();

        res.status(200).json({ message: 'Profile photo deleted successfully.' });
    } catch (error) {
        console.error('Error deleting profile photo:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserById = async (req, res) => {
    const userId = req.params.id;

    console.log(`🔍 [getUserById] Fetching user by ID: ${userId}`);

    try {
        const user = await User.findById(userId).select('-password'); // exclude password field
        if (!user) {
            console.warn(`❌ User not found for ID: ${userId}`);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("✅ User found:", user.name);
        res.status(200).json({ success: true, user });

    } catch (err) {
        console.error("🔥 Error in getUserById:", err.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id; // ✅ Comes from your isUser middleware
        const { name, mobile } = req.body;

        console.log("🛠 Updating profile for:", userId);
        console.log("➡️ New data:", { name, mobile });

        // Basic validation
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ message: "Name is required and must be a string." });
        }

        if (!mobile || typeof mobile !== 'string') {
            return res.status(400).json({ message: "Mobile number is required and must be a string." });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update name and mobile
        user.name = name;
        user.mobile = mobile;

        await user.save();

        console.log("✅ Profile updated:", { name: user.name, mobile: user.mobile });

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                mobile: user.mobile,
                image: user.image,
            }
        });

    } catch (err) {
        console.error("🔥 Error updating profile:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.checkAuth = async (req, res) => {
    try {
        const user = req.user; // Set by isUser middleware from token

        res.status(200).json({
            success: true,
            message: "Authenticated",
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("❌ Auth check failed:", error);
        res.status(401).json({ success: false, message: "Unauthorized" });
    }
};
