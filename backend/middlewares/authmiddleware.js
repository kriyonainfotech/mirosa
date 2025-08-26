const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
        console.log("🔐 [isAdmin] Token received:", token);
        if (!token) return res.status(401).json({ message: "Access token missing" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        console.log("🔐 [isAdmin] Decoded user:", decoded);

        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "You are not authorized as admin" });
        }

        req.user = user; // attach user for further use
        next();
    } catch (err) {
        console.log("🔐 [isAdmin] Error verifying token:", err);
        return res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }
};

const isUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
        console.log("🔐 [isUser] Token:", token);
        if (!token) {
            return res.status(401).json({ message: "Access token missing" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("🔐 [isUser] Decoded:", decoded);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = user; // attach full user doc
        next();
    } catch (err) {
        console.error("❌ [isUser] Error:", err);
        return res.status(401).json({ message: "Invalid or expired token", error: err.message });
    }
};

module.exports = { isAdmin, isUser };
