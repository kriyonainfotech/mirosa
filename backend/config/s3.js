const { S3Client, PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
require("dotenv").config();

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const uploadToS3 = async (fileBuffer, folder, mimeType) => {
    // Generate a unique filename
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
        // ACL: 'public-read', // Not strictly needed if Bucket Policy is set, but good for explicit visibility
    };

    try {
        const command = new PutObjectCommand(params);
        await s3Client.send(command);
        
        // Construct the Public URL
        // Format: https://BUCKET-NAME.s3.REGION.amazonaws.com/KEY
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        
        return {
            secure_url: url,
            public_id: fileName // In S3, the "Key" acts as the public ID
        };
    } catch (error) {
        console.error("S3 Upload Error:", error);
        throw new Error("Failed to upload image to S3");
    }
};

const deleteFromS3 = async (publicId) => {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: publicId,
    };

    try {
        const command = new DeleteObjectCommand(params);
        await s3Client.send(command);
        return true;
    } catch (error) {
        console.error("S3 Deletion Error:", error);
        return false;
    }
};

module.exports = { uploadToS3, deleteFromS3 };