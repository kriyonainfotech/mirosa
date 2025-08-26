const multer = require("multer");

const storage = multer.memoryStorage(); // since we’re uploading to Cloudinary
const upload = multer({ storage });

module.exports = upload;
