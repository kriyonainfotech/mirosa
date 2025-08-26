

// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configure Cloudinary with your credentials (ensure these are in your .env file)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: folder },
            (error, result) => {
                if (result) {
                    resolve(result); // Resolve with the full result object (contains secure_url, public_id, etc.)
                } else {
                    reject(error);
                }
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
};

const deleteFromCloudinary = (publicId) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.destroy(publicId, (error, result) => {
            if (error) {
                return reject(error);
            }
            // The result object contains confirmation, e.g., { result: 'ok' }
            resolve(result);
        });
    });
};

module.exports = { uploadToCloudinary, deleteFromCloudinary, cloudinarySDK: cloudinary }; // Export this reusable function