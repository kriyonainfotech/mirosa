const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const slugify = require("slugify");
const { uploadToCloudinary, cloudinarySDK } = require("../config/cloudinary");
const { Readable } = require("stream");

exports.createCategory = async (req, res) => {
    try {
        const { name } = req.body;
        const file = req.file;

        console.log("📥 Incoming request to create category with name:", name);

        let imageData = null;

        // if (file) {
        //     const bufferStream = new Readable();
        //     bufferStream.push(file.buffer);
        //     bufferStream.push(null); // End the stream

        //     const streamUpload = (buffer) => {
        //         return new Promise((resolve, reject) => {
        //             const stream = cloudinary.uploader.upload_stream(
        //                 { folder: "categories" },
        //                 (error, result) => {
        //                     if (result) {
        //                         console.log("✅ Image uploaded to Cloudinary successfully");
        //                         resolve(result);
        //                     } else {
        //                         console.error("❌ Cloudinary upload failed:", error);
        //                         reject(error);
        //                     }
        //                 }
        //             );
        //             buffer.pipe(stream);
        //         });
        //     };

        //     const result = await streamUpload(bufferStream);
        //     imageData = {
        //         public_id: result.public_id,
        //         url: result.secure_url,
        //     };
        // } else {
        //     console.warn("⚠️ No image file received. Proceeding without image.");
        // }
        if (file) {
            // Use the centralized uploadToCloudinary function
            const result = await uploadToCloudinary(file.buffer, "categories");
            imageData = {
                public_id: result.public_id,
                url: result.secure_url,
            };
            console.log("✅ Image uploaded to Cloudinary successfully");
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
            category
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
        res.status(500).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const file = req.file;
        console.log("📥 Incoming request to update category with ID:", id, "and name:", name);
        console.log(req.params, "this is req.params", "📥 File received for update:", req.file);

        const category = await Category.findById(id);
        if (!category) {
            console.warn("⚠️ Category not found with ID:", id);
            return res.status(404).json({ message: "Category not found" });
        }

        // Handle image update
        let image = category.image;
        if (file) {
            // Delete old image from Cloudinary
            if (image && image.public_id) {
                await cloudinary.uploader.destroy(image.public_id);
            }
            console.log("🔄 Old image deleted from Cloudinary successfully");

            // Upload new image
            const bufferStream = new Readable();
            bufferStream.push(file.buffer);
            bufferStream.push(null);

            const streamUpload = (buffer) => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: "categories" },
                        (error, result) => {
                            if (result) {
                                resolve(result);
                            } else {
                                reject(error);
                            }
                        }
                    );
                    buffer.pipe(stream);
                });
            };

            const result = await streamUpload(bufferStream);
            image = {
                public_id: result.public_id,
                url: result.secure_url,
            };

            console.log("✅ New image uploaded to Cloudinary successfully");
        }

        category.name = name || category.name;
        category.slug = slugify(category.name, { lower: true });
        category.image = image;

        await category.save();
        console.log("🔄 Updating category:", category);
        res.status(200).json({ success: true, message: "category updated successfully", category });
    } catch (err) {
        console.error("🔥 Error editing category:", err);
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

        // Delete image from Cloudinary
        if (category.image && category.image.public_id) {
            await cloudinarySDK.uploader.destroy(category.image.public_id);
        }

        await Category.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Category deleted successfully" });
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
