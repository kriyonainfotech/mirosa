const Subcategory = require("../models/Subcategory");
const slugify = require("slugify");
const cloudinary = require("cloudinary").v2;
const cloudinaryConfig = require("../config/cloudinary0");
cloudinary.config(cloudinaryConfig);
const { Readable } = require("stream");
const Category = require("../models/Category");
const SubCategory = require("../models/Subcategory");
const { uploadToS3, deleteFromS3 } = require("../config/s3");
/*
Example cURL commands for Subcategory APIs:

# 1. Create Subcategory (with image)
curl -X POST http://localhost:3000/api/subcategories \
    -H "Content-Type: multipart/form-data" \
    -F "name=Sample Subcategory" \
    -F "category=<CATEGORY_ID>" \
    -F "image=@/path/to/image.jpg"

# 2. Get All Subcategories
curl http://localhost:3000/api/subcategories

# 3. Get Single Subcategory
curl http://localhost:3000/api/subcategories/<SUBCATEGORY_ID>

# 4. Update Subcategory (with image)
curl -X PUT http://localhost:3000/api/subcategories/<SUBCATEGORY_ID> \
    -H "Content-Type: multipart/form-data" \
    -F "name=Updated Name" \
    -F "category=<CATEGORY_ID>" \
    -F "image=@/path/to/new-image.jpg"

# 5. Delete Subcategory
curl -X DELETE http://localhost:3000/api/subcategories/<SUBCATEGORY_ID>
*/

exports.createSubcategory = async (req, res) => {
    try {
        const { name, category } = req.body;
        const file = req.file;

        console.log("🧾 [Create] Subcategory:", name);

        let image = {};

        // 📤 Upload image to S3
        if (file) {
            console.log("📤 Uploading subcategory image to S3...");

            const result = await uploadToS3(
                file.buffer,
                "subcategories",
                file.mimetype
            );

            image = {
                public_id: result.public_id,  // S3 key
                url: result.secure_url,       // S3 URL
            };

            console.log("✅ Image uploaded to S3 successfully");
        } else {
            console.warn("⚠️ No image provided. Creating subcategory without image.");
        }

        const subcategory = new Subcategory({
            name,
            slug: slugify(name, { lower: true, strict: true }),
            category,
            image,
        });

        console.log("📦 [Create] Subcategory object:", subcategory);

        await subcategory.save();

        res.status(201).json({
            success: true,
            subcategory,
        });

    } catch (err) {
        console.error("❌ Error creating subcategory:", err);
        res.status(500).json({ message: "Server error" });
    }
};
exports.getAllSubcategories = async (req, res) => {
    try {
        console.log("🔎 [Fetch] All Subcategories");
        const subcategories = await Subcategory.find().populate("category", "name slug image");
        console.log("📦 All subcategories fetched:", subcategories.length);
        res.status(200).json({ success: true, subcategories });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

exports.getSubcategory = async (req, res) => {
    try {
        const subcategory = await Subcategory.findById(req.params.id).populate("category");
        if (!subcategory) return res.status(404).json({ message: "Not found" });
        res.status(200).json(subcategory);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// exports.updateSubcategory = async (req, res) => {
//     try {
//         const { name, category } = req.body;
//         const file = req.file;
//         const sub = await Subcategory.findById(req.params.id);
//         if (!sub) return res.status(404).json({ message: "Subcategory not found" });

//         let image = sub.image;

//         if (file) {
//             if (image?.public_id) {
//                 await cloudinary.uploader.destroy(image.public_id);
//             }

//             const bufferStream = new Readable();
//             bufferStream.push(file.buffer);
//             bufferStream.push(null);

//             const result = await new Promise((resolve, reject) => {
//                 const upload = cloudinary.uploader.upload_stream(
//                     { folder: "subcategories" },
//                     (err, result) => {
//                         if (err) reject(err);
//                         else resolve(result);
//                     }
//                 );
//                 bufferStream.pipe(upload);
//             });

//             image = { public_id: result.public_id, url: result.secure_url };
//         }

//         sub.name = name || sub.name;
//         sub.slug = slugify(sub.name, { lower: true });
//         sub.category = category || sub.category;
//         sub.image = image;

//         await sub.save();
//         res.status(200).json(sub);
//     } catch (err) {
//         res.status(500).json({ message: "Server error" });
//     }
// };

exports.updateSubcategory = async (req, res) => {
    try {
        const { name, category } = req.body;
        const file = req.file;

        console.log("📝 [Update] Subcategory:", req.params.id, "File:", !!file);

        const sub = await Subcategory.findById(req.params.id);
        if (!sub) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        let image = sub.image;

        // 🔄 Handle image update
        if (file) {
            console.log("📤 Updating subcategory image...");

            // 🧹 Delete old image from S3
            if (image?.public_id) {
                console.log("🧹 Deleting old S3 image:", image.public_id);
                await deleteFromS3(image.public_id);
            }

            // 📤 Upload new image to S3
            const result = await uploadToS3(
                file.buffer,
                "subcategories",
                file.mimetype
            );

            image = {
                public_id: result.public_id, // S3 key
                url: result.secure_url,      // S3 URL
            };

            console.log("✅ New image uploaded to S3");
        }

        // 🔤 Update Name & Slug
        if (name) {
            sub.name = name;
            sub.slug = slugify(name, { lower: true });
        }

        // 🔗 Update Category (validate)
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return res.status(400).json({ message: "Invalid category ID" });
            }
            sub.category = category;
        }

        // 🖼️ Update Image
        sub.image = image;

        await sub.save();

        res.status(200).json({
            success: true,
            sub,
        });

    } catch (err) {
        console.error("❌ Update Subcategory Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.deleteSubcategory = async (req, res) => {
    try {
        console.log("🔎 [Delete] Subcategory:", req.params.id);

        const subcategory = await Subcategory.findById(req.params.id);

        if (!subcategory) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        // 🧹 Delete image from S3 (if exists)
        if (subcategory.image?.public_id) {
            console.log("🧹 Deleting image from S3:", subcategory.image.public_id);
            await deleteFromS3(subcategory.image.public_id);
        }

        // 🗑️ Delete subcategory from DB
        await Subcategory.findByIdAndDelete(req.params.id);

        console.log("✅ Subcategory deleted successfully");

        res.status(200).json({
            success: true,
            message: "Subcategory deleted",
        });

    } catch (err) {
        console.error("❌ Error deleting subcategory:", err);
        res.status(500).json({ message: "Server error" });
    }
};


exports.getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        console.log("🔎 [Fetch] Subcategories for Category:", categoryId);
        if (!categoryId) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        const subcategories = await Subcategory.find({ category: categoryId }).populate("category", "name slug image");
        console.log("📦 Subcategories fetched:", subcategories);

        res.status(200).json({ success: true, message: "subcategory fetched successfully", subcategories });
    } catch (err) {
        console.error("❌ Error fetching subcategories by category:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.isFeatured = async (req, res) => {
    try {
        const { isFeatured } = req.body;

        const updated = await SubCategory.findByIdAndUpdate(
            req.params.id,
            { isFeatured },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Subcategory not found" });
        }

        res.json({ success: true, updated });
    } catch (error) {
        console.error("Error updating featured:", error);
        res.status(500).json({ message: "Server error" });
    }
}

exports.getFeaturedSubcategories = async (req, res) => {
    // try {
    //     const featuredSubs = await Subcategory.find({ isFeatured: true }).populate('category');
    //     console.log(`✅ [SUCCESS] - Found ${featuredSubs.length} featured subcategories`);

    //     res.status(200).json({
    //         success: true,
    //         data: featuredSubs,
    //     });
    // } catch (err) {
    //     console.error("❌ [ERROR] - Failed to fetch featured subcategories", err);
    //     res.status(500).json({
    //         success: false,
    //         message: "Server error. Unable to fetch featured subcategories.",
    //     });
    // }
    try {
        console.log("🔎 [Fetch] All Subcategories");
        const subcategories = await Subcategory.find({ isFeatured: true }).populate("category", "name slug image");
        console.log("📦 All subcategories fetched:", subcategories.length);
        res.status(200).json({ success: true, subcategories });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};


exports.getSubcategoriesBySlugs = async (req, res) => {
    try {
        const { slugs } = req.body;
        console.log("🔎 [Fetch] Subcategories by slugs:", slugs);

        if (!Array.isArray(slugs) || slugs.length === 0) {
            console.warn("⚠️ Slugs array is missing or empty in request body");
            return res.status(400).json({ message: "Slugs array is required in body" });
        }

        // 1. Find the Category documents based on the provided slugs
        const foundCategories = await Category.find({ slug: { $in: slugs } });

        if (!foundCategories || foundCategories.length === 0) {
            console.warn("⚠️ No categories found for the provided slugs:", slugs);
            return res.status(404).json({ message: "No categories found for provided slugs" });
        }

        // 2. Extract the _ids of the found categories
        const categoryIds = foundCategories.map(cat => cat._id);
        console.log("Found category IDs:", categoryIds);

        // 2. Prepare an array to hold promises for fetching subcategories
        const categoryPromises = foundCategories.map(async (cat) => {
            // Find all subcategories associated with the current category's _id
            const subcategories = await Subcategory.find({ category: cat._id })
                .select("name slug image _id") // Select necessary fields for subcategory
                .sort({ name: 1 }); // Optional: sort subcategories by name

            // Return the category object with its fetched subcategories
            return {
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
                image: cat.image,
                subcategories: subcategories // Attach the subcategories
            };
        });

        // 3. Wait for all subcategory fetches to complete
        const categoriesWithSubcategories = await Promise.all(categoryPromises);


        // 4. Format the output as requested: { "0_": {...}, "1_": {...}, ... }
        const formattedOutput = {};
        categoriesWithSubcategories.forEach((catData, index) => {
            formattedOutput[`${index}_`] = catData;
        });

        console.log(`✅ [Success] Found ${categoriesWithSubcategories.length} categories with subcategories`);
        res.status(200).json({ success: true, categories: formattedOutput });
    } catch (err) {
        console.error("❌ Error fetching subcategories by slugs:", err);
        res.status(500).json({ message: "Server error" });
    }
};