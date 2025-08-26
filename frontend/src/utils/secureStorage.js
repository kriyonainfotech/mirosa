// utils/secureStorage.js
import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_ENCRYPT_KEY || "mirosa123"; // put this in .env

export const encryptData = (data) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
    if (!ciphertext) return null; // 🛑 no data, return null

    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (!decrypted) return null; // 🛑 decryption failed
        return JSON.parse(decrypted);

    } catch (err) {
        console.error("🧨 Decryption error:", err);
        return null; // gracefully handle broken JSON
    }
};


export const encryptString = (plainText) => {
    return CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
};