const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    image: {
        public_id: String,
        url: String,
    },
    mobile: {
        type: String,
        require: true,
    },
    password: {
        type: String,
        required: true
    },
    resetPasswordExpires: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'team'],
        default: 'user'
    }
}, { timestamps: true });

// Password hash before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Match password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
