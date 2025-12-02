const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const slugify = require("slugify");
const { uploadToCloudinary, cloudinarySDK } = require("../config/cloudinary");
const { Readable } = require("stream");
const { uploadToS3, deleteFromS3 } = require("../config/s3");

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;

        console.log("📥 Incoming request to create category with name:", name);

        let imageData = null;

        if (file) {
            console.log("📤 Uploading category image to S3...");

            const result = await uploadToS3(
                file.buffer,
                "categories",
                file.mimetype
            );

            imageData = {
                public_id: result.public_id, // S3 key
                url: result.secure_url,      // S3 URL
            };

            console.log("✅ Image uploaded to S3 successfully");
        } else {
            console.warn("⚠️ No image file received. Proceeding without image.");
        }

        const category = new Category({
            name,
            slug: slugify(name, { lower: true, strict: true }),
            image: imageData,
        });

        await category.save();
        console.log("🎉 Category created and saved to DB:", category);

        res.status(201).send({
            success: true,
            category,
        });

    } catch (err) {
        console.error("🔥 Error creating category:", err);
        res.status(500).json({ error: err.message });
    }
};


exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        console.log("📦 Fetched all categories:", categories.length);
        res.status(200).send({ success: true, categories });
    } catch (err) {
        console.error("🔥 Error fetching categories:", err);

     // 🛑 Duplicate key handling
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: `Category "${err.keyValue.name}" already exists`,
            });
        }
       // Other errors
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message,
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const file = req.file;

        console.log("📥 Incoming request to update category with ID:", id, "and name:", name);

        const category = await Category.findById(id);
        if (!category) {
            console.warn("⚠️ Category not found with ID:", id);
            return res.status(404).json({ message: "Category not found" });
        }

        let image = category.image;

        // 🔄 If new image is uploaded
        if (file) {
            console.log("🖼️ Updating category image...");

            // 🧹 Delete old image from S3
            if (image?.public_id) {
                console.log("🧹 Deleting old S3 image:", image.public_id);
                await deleteFromS3(image.public_id);
            }

            // 📤 Upload new image to S3
            const result = await uploadToS3(
                file.buffer,
                "categories",
                file.mimetype
            );

            image = {
                public_id: result.public_id, // this is the S3 key
                url: result.secure_url,
            };

            console.log("✅ New image uploaded to S3 successfully");
        }

        // 🔄 Update text fields
        category.name = name || category.name;
        category.slug = slugify(category.name, { lower: true });
        category.image = image;

        await category.save();

        console.log("🔄 Category updated:", category);
        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category,
        });

    } catch (err) {
        console.error("🔥 Error updating category:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await Category.findById(id);
        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        // 🧹 Delete image from S3 if exists
        if (category.image?.public_id) {
            console.log("🧹 Deleting category image from S3:", category.image.public_id);
            await deleteFromS3(category.image.public_id);
        }

        // 🗑️ Delete DB record
        await Category.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (err) {
        console.error("🔥 Error deleting category:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const categoryId = req.params.id;
        console.log("📥 Fetching category by ID:", req.params);
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json({ success: true, category });
    } catch (err) {
        console.error("🔥 Error fetching category by ID:", err);
        res.status(500).json({ error: err.message });
    }
};


// exports.getCategoriesWithSubcategories = async (req, res) => {

//     try {
//         const categories = await Category.find()
//             .sort({ createdAt: -1 })
//             .lean();

//         const categoryIds = categories.map(cat => cat._id);
//         const subcategories = await Subcategory.find({ category: { $in: categoryIds } }).lean();

//         const subcategoriesByCategory = subcategories.reduce((acc, sub) => {
//             const catId = sub.category.toString();
//             if (!acc[catId]) acc[catId] = [];
//             acc[catId].push(sub);
//             return acc;
//         }, {});

//         const categoriesWithSubs = categories.map(cat => ({
//             ...cat,
//             subcategories: subcategoriesByCategory[cat._id.toString()] || []
//         }));

//         res.status(200).json({ success: true, categories: categoriesWithSubs });
//     } catch (err) {
//         console.error("🔥 Error fetching categories with subcategories:", err);
//         res.status(500).json({ error: err.message });
//     }
// };


exports.getCategoriesWithSubcategories = async (req, res) => {
    try {
        console.log("📥 Fetching all categories with their subcategories...");
        const categories = await Category.find().sort({ createdAt: -1 }).lean();
        console.log(`📦 Found ${categories.length} categories`);

        const categoryIds = categories.map(cat => cat._id);

        const subcategories = await Subcategory.find({ category: { $in: categoryIds } }).lean();
        console.log(`📦 Found ${subcategories.length} subcategories`);

        const subcategoriesByCategory = subcategories.reduce((acc, sub) => {
            const catId = sub.category.toString();
            if (!acc[catId]) acc[catId] = [];
            acc[catId].push(sub);
            return acc;
        }, {});

        const categoriesWithSubs = categories.map(cat => ({
            ...cat,
            subcategories: subcategoriesByCategory[cat._id.toString()] || []
        }));

        console.log("✅ Categories with subcategories prepared successfully");
        res.status(200).json({ success: true, categories: categoriesWithSubs });
    } catch (err) {
        console.error("🔥 Error fetching categories with subcategories:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.isFeatured = async (req, res) => {
    try {
        const { isFeatured } = req.body;

        const updated = await Category.findByIdAndUpdate(
            req.params.id,
            { isFeatured },
            { new: true }
        );

        if (!updated) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.json({ success: true, updated });
    } catch (error) {
        console.error("Error updating featured:", error);
        res.status(500).json({ message: "Server error" });
    }
}

exports.getFeaturedCategories = async (req, res) => {
    console.log("📥 Fetching featured subcategories...");
    try {
        console.log("🔎 [Fetch] All Featured Categories");

        const categories = await Category.find({ isFeatured: true }).lean(); // ⬅️ Use lean here
        console.log(`📦 Found ${categories.length} categories`);

        const categoryIds = categories.map(cat => cat._id);

        const subcategories = await Subcategory.find({ category: { $in: categoryIds } }).lean();
        console.log(`📦 Found ${subcategories.length} subcategories`);

        const subcategoriesByCategory = subcategories.reduce((acc, sub) => {
            const catId = sub.category.toString();
            if (!acc[catId]) acc[catId] = [];
            acc[catId].push(sub);
            return acc;
        }, {});

        const categoriesWithSubs = categories.map(cat => {
            return {
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
                image: cat.image, // { public_id, url }
                isFeatured: cat.isFeatured,
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt,
                subcategories: subcategoriesByCategory[cat._id.toString()] || []
            };
        });

        console.log("✅ Categories with subcategories prepared successfully");
        res.status(200).json({ success: true, categories: categoriesWithSubs });

    } catch (err) {
        console.error("❌ Error fetching categories:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
