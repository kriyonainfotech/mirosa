// controllers/productController.js
const Product = require("../models/Product");
const Category = require("../models/Category");
const Subcategory = require("../models/Subcategory");
const { uploadToCloudinary, cloudinarySDK } = require("../config/cloudinary");
const slugify = require("slugify");
const csv = require('csv-parser');
const { Readable } = require('stream');

const getPublicIdFromCloudinaryUrl = (url) => {
    if (!url) return null;
    const parts = url.split('/');
    // Cloudinary URL format is typically:
    // .../upload/v<version>/<folder>/<public_id>.<extension>
    // We want to get '<folder>/<public_id>'
    const filenameWithExtension = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filenameWithExtension.split('.')[0]}`;
    return publicId;
};

exports.addProduct = async (req, res) => {
    // Array to keep track of successfully uploaded public_ids for rollback
    const uploadedPublicIds = [];

    try {
        console.log("📝 Parsing product data...");
        const productData = JSON.parse(req.body.product);

        const {
            title,
            description,
            categoryId,
            subCategoryId,
            tags,
            isFeatured,
            isCustomizable,
            status,
            variants // This `variants` array from frontend contains metadata + new file info
        } = productData;

        console.log("🔎 Checking category existence...");
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            console.log("❌ Invalid category ID");
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }

        let subcategoryDoc = null; // Use subcategoryDoc to store the found subcategory
        if (subCategoryId) {
            console.log("🔎 Checking subcategory existence...");
            subcategoryDoc = await Subcategory.findById(subCategoryId);
            if (!subcategoryDoc) {
                console.log("❌ Invalid subcategory ID");
                return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
            }
        }

        let mainImageUrl = "";
        if (req.files && req.files["mainImage"] && req.files["mainImage"].length > 0) {
            console.log("☁️ Uploading main image to Cloudinary...");
            const file = req.files["mainImage"][0];
            const result = await uploadToCloudinary(file.buffer, "product"); // ✅ Use the shared function
            mainImageUrl = result.secure_url;
            uploadedPublicIds.push(result.public_id); // ✅ Store public_id for rollback
            console.log("✅ Main image uploaded:", mainImageUrl);
        }

        // 📸 Process and upload variant images
        // We'll build the final variants array for Mongoose here
        const finalVariantsForDb = [];
        for (let i = 0; i < variants.length; i++) {
            const currentVariantFromFrontend = variants[i];
            const variantImagesUrls = [];

            // If there are new files for this variant, upload them
            const variantImageFieldName = `variantImages_${i}`;
            if (req.files && req.files[variantImageFieldName]) {
                console.log(`☁️ Uploading images for variant ${i}...`);
                const newVariantFiles = req.files[variantImageFieldName];
                for (const file of newVariantFiles) {
                    const result = await uploadToCloudinary(file.buffer, "product"); // ✅ Use shared function
                    variantImagesUrls.push(result.secure_url);
                    uploadedPublicIds.push(result.public_id); // ✅ Store public_id for rollback
                }
                console.log(`✅ Uploaded ${variantImagesUrls.length} images for variant ${i}`);
            }

            // Construct the variant object to be saved to DB
            finalVariantsForDb.push({
                // _id: currentVariantFromFrontend._id, // Only include if it's an existing variant with an actual _id
                sku: currentVariantFromFrontend.sku,
                weight: Number(currentVariantFromFrontend.weightInGrams), // ✅ Ensure conversion and correct field name
                material: currentVariantFromFrontend.metalColor, // ✅ Ensure mapping from frontend name
                purity: currentVariantFromFrontend.purity,
                size: currentVariantFromFrontend.size,
                price: Number(currentVariantFromFrontend.totalPrice), // ✅ Ensure conversion and correct field name
                stock: Number(currentVariantFromFrontend.stock), // ✅ Use the numeric stock value
                images: variantImagesUrls, // Assign the collected image URLs
                discount: currentVariantFromFrontend.discount
                // inStock will be set automatically by the Mongoose pre-save hook
            });
        }

        console.log("🛠️ Creating new product document...");
        const newProduct = new Product({
            title,
            slug: slugify(title, { lower: true, strict: true }),
            description,
            category: categoryId,
            subcategory: subCategoryId || null, // Use null if no subcategory is selected
            tags: tags,
            mainImage: mainImageUrl,
            variants: finalVariantsForDb, // ✅ Use the constructed variants array
            isFeatured: isFeatured || false,
            isCustomizable: isCustomizable || false,
            status: status || 'active',
        });

        await newProduct.save();

        console.log("🎉 Product created successfully:", newProduct);
        res.status(201).json({ success: true, product: newProduct });
    } catch (err) {
        console.error("💥 Product creation error:", err);

        // --- Rollback: Delete uploaded images from Cloudinary if an error occurred ---
        if (uploadedPublicIds.length > 0) {
            console.log("Cleanup: Deleting uploaded images from Cloudinary due to error...");
            try {
                // Ensure cloudinary is imported as v2 at the top of this file
                await Promise.all(uploadedPublicIds.map(publicId => cloudinarySDK.uploader.destroy(publicId)));
                console.log("✅ Successfully deleted temporary images from Cloudinary.");
            } catch (cleanupError) {
                console.error("❌ Error during Cloudinary cleanup:", cleanupError);
            }
        }
        // --- End Rollback ---

        if (err.name === 'ValidationError') {
            const errors = {};
            for (let field in err.errors) {
                errors[field] = err.errors[field].message;
            }
            return res.status(400).json({ success: false, message: "Validation failed", errors });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getAllProducts = async (req, res) => {
    try {
        console.log("🛒 Fetching all products...");
        const products = await Product.find()
            .populate('category')
            .populate('subcategory');
        console.log("✅ Products fetched successfully:", products.length);
        res.status(200).json({ success: true, products });
    } catch (err) {
        console.error("❌ Error fetching products:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log(`🔍 Fetching product by ID: ${productId}...`);
        const product = await Product.findById(productId)
            .populate('category')
            .populate('subcategory');
        if (!product) {
            console.log("❌ Product not found");
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        console.log("✅ Product fetched successfully:", product.title);
        res.status(200).json({ success: true, product });
    } catch (err) {
        console.error("💥 Error fetching product by ID:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        console.log("📝 Updating Product ID:", productId);

        const productData = JSON.parse(req.body.product);
        const {
            title,
            description,
            categoryId,
            subCategoryId,
            tags,
            isFeatured,
            isCustomizable,
            status,
            variants
        } = productData;

        console.log("📦 Parsed product data:", productData);

        // Find existing product
        const existingProduct = await Product.findById(productId);
        if (!existingProduct) {
            console.log("❌ Product not found with ID:", productId);
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Validate category and subcategory
        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            console.log("🚫 Invalid category ID:", categoryId);
            return res.status(400).json({ success: false, message: "Invalid category ID" });
        }
        let subcategoryDoc = null;
        if (subCategoryId) {
            subcategoryDoc = await Subcategory.findById(subCategoryId);
            if (!subcategoryDoc) {
                console.log("🚫 Invalid subcategory ID:", subCategoryId);
                return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
            }
        }

        // Handle main image update
        let mainImageUrl = existingProduct.mainImage;
        if (req.files && req.files["mainImage"] && req.files["mainImage"].length > 0) {
            console.log("📤 Uploading new main image...");
            const file = req.files["mainImage"][0];
            const result = await uploadToCloudinary(file.buffer, "product");
            mainImageUrl = result.secure_url;
        } else if (productData.mainImage === '') {
            console.log("🗑️ Clearing existing main image...");
            mainImageUrl = '';
        }

        // Prepare updated variants array
        const updatedVariants = [];
        for (let i = 0; i < variants.length; i++) {
            const variantData = variants[i];
            console.log(`🔄 Processing Variant ${i + 1}`);

            const uploadedVariantImageUrls = [];
            if (variantData.images && Array.isArray(variantData.images)) {
                uploadedVariantImageUrls.push(...variantData.images);
            }

            const variantImageFieldName = `variantImages_${i}`;
            if (req.files && req.files[variantImageFieldName]) {
                console.log(`📤 Uploading new images for Variant ${i + 1}`);
                const newVariantFiles = req.files[variantImageFieldName];
                for (const file of newVariantFiles) {
                    const result = await uploadToCloudinary(file.buffer, "product");
                    uploadedVariantImageUrls.push(result.secure_url);
                }
            }

            updatedVariants.push({
                _id: variantData._id,
                sku: variantData.sku,
                weight: Number(variantData.weight),
                material: variantData.material,
                purity: variantData.purity,
                size: variantData.size,
                price: Number(variantData.price),
                stock: Number(variantData.stock),
                inStock: Boolean(variantData.inStock),
                images: uploadedVariantImageUrls,
                discount: variantData.discount
            });
        }

        // Update fields
        existingProduct.title = title;
        existingProduct.slug = slugify(title, { lower: true, strict: true });
        existingProduct.description = description;
        existingProduct.category = categoryId;
        existingProduct.subcategory = subCategoryId || null;
        existingProduct.tags = tags;
        existingProduct.mainImage = mainImageUrl;
        existingProduct.variants = updatedVariants;
        existingProduct.isFeatured = isFeatured || false;
        existingProduct.isCustomizable = isCustomizable || false;
        existingProduct.status = status;

        await existingProduct.save();

        console.log("✅ Product updated successfully");
        res.status(200).json({ success: true, message: "Product updated successfully", product: existingProduct });

    } catch (err) {
        console.error("🔥 Product update error:", err);
        if (err.name === 'ValidationError') {
            const errors = {};
            for (let field in err.errors) {
                errors[field] = err.errors[field].message;
            }
            return res.status(400).json({ success: false, message: "Validation failed", errors });
        }
        res.status(500).json({ success: false, message: "Server error" });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;

        // 1. Find the product
        const productToDelete = await Product.findById(productId);
        if (!productToDelete) {
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        // 2. Collect all Cloudinary public_ids for deletion
        const publicIdsToDelete = [];

        // Main image
        const mainImagePublicId = getPublicIdFromCloudinaryUrl(productToDelete.mainImage);
        if (mainImagePublicId) {
            publicIdsToDelete.push(mainImagePublicId);
        }

        // Variant images
        productToDelete.variants.forEach(variant => {
            if (variant.images && Array.isArray(variant.images)) {
                variant.images.forEach(imageUrl => {
                    const variantImagePublicId = getPublicIdFromCloudinaryUrl(imageUrl);
                    if (variantImagePublicId) {
                        publicIdsToDelete.push(variantImagePublicId);
                    }
                });
            }
        });

        // 3. Delete images from Cloudinary
        if (publicIdsToDelete.length > 0) {
            console.log(`☁️ Deleting ${publicIdsToDelete.length} images from Cloudinary:`, publicIdsToDelete);
            try {
                // Use Promise.all to delete images concurrently
                const deletionResults = await Promise.all(
                    publicIdsToDelete.map(publicId => cloudinary.uploader.destroy(publicId))
                );
                console.log("✅ Cloudinary deletion results:", deletionResults);
            } catch (cloudinaryError) {
                console.error("❌ Error deleting images from Cloudinary:", cloudinaryError);
                // Decide whether to halt deletion or proceed with DB deletion.
                // For a critical app, you might want to fail the whole operation.
                // For now, we'll log and proceed with DB deletion.
            }
        } else {
            console.log("ℹ️ No Cloudinary images to delete for this product.");
        }

        // 4. Delete the product from MongoDB
        await Product.findByIdAndDelete(productId);

        res.status(200).json({ success: true, message: "Product and associated images deleted successfully." });

    } catch (err) {
        console.error("💥 Product deletion error:", err);
        // Log Mongoose/server errors
        res.status(500).json({ success: false, message: "Server error during product deletion." });
    }
};

exports.getProductsByCategorySlugs = async (req, res) => {
    try {
        const { slugs } = req.body; // Expecting an array of category slugs
        console.log("🔎 [Fetch] Products by category slugs:", slugs);

        if (!Array.isArray(slugs) || slugs.length === 0) {
            console.warn("⚠️ Slugs array is missing or empty in request body");
            return res.status(400).json({ message: "Subcategory slugs array is required in body" });
        }

        // 1. Find the Subcategory documents based on the provided slugs
        const foundSubcategories = await Subcategory.find({ slug: { $in: slugs } })
            .populate("category", "name slug image"); // Populate parent category details

        if (!foundSubcategories || foundSubcategories.length === 0) {
            console.warn("⚠️ No subcategories found for the provided slugs:", slugs);
            return res.status(404).json({ message: "No subcategories found for provided slugs" });
        }

        // 2. Prepare an array of promises to fetch products for each subcategory
        const subcategoryProductPromises = foundSubcategories.map(async (sub) => {
            // Find products associated with the current subcategory's _id
            const products = await Product.find({ subcategory: sub._id })
                .populate("category", "name slug") // Populate category name and slug
                .populate("subcategory", "name slug") // Populate subcategory name and slug
                // You might want to select specific fields for products
                .lean(); // Use .lean() for faster query

            return {
                details: sub, // Include the full subcategory object here
                products: products // The array of products for this subcategory
            };
        });

        // 3. Wait for all product fetches for each subcategory to complete
        const subcategoriesWithProducts = await Promise.all(subcategoryProductPromises);

        // 4. Format the output as requested: { "0_": { details: {}, products: [] }, "1_": {...}, ... }
        const formattedOutput = {};
        subcategoriesWithProducts.forEach((data, index) => {
            formattedOutput[`${index}_`] = data;
        });

        console.log(`✅ [Success] Found data for ${subcategoriesWithProducts.length} subcategories`);
        res.status(200).json({ success: true, data: formattedOutput });
    } catch (err) {
        console.error("❌ Error fetching products by category slugs:", err);
        res.status(500).json({ message: "Server error" });
    }
};

exports.getProductsFiltered = async (req, res) => {
    try {
        const { categoryId, subcategoryId, sortBy = 'createdAt', order = -1, limit = 20 } = req.query; // Accept ID and optional sorting/limit
        console.log(`🔎 [Fetch] Products filtered by Category ID: ${categoryId}, Subcategory ID: ${subcategoryId}`);

        let filter = {};
        if (categoryId) {
            filter.category = categoryId;
        }
        if (subcategoryId) {
            filter.subcategory = subcategoryId;
        }

        // Default to fetching all products if no specific ID is provided, or handle as per your site's logic
        // If you want to show nothing by default, you might add: if (!categoryId && !subcategoryId) return res.status(200).json({ success: true, products: [] });

        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
            .sort({ [sortBy]: order }) // Apply sorting
            .limit(parseInt(limit)) // Apply limit
            .lean(); // Use .lean() for faster query

        // if (!products || products.length === 0) {
        //     console.warn("⚠️ No products found matching the provided criteria.");
        //     return res.status(404).json({ success: false, message: "No products found matching criteria.", products: products });
        // }

        console.log(`✅ [Success] Found ${products.length} filtered products`);
        res.status(200).json({ success: true, products });

    } catch (err) {
        console.error("❌ Error fetching filtered products:", err);
        res.status(500).json({ success: false, message: "Server error fetching filtered products." });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id; // Get product ID from URL parameter

        // Find the product by ID and populate its category and subcategory details
        const product = await Product.findById(productId)
            .populate('category', 'name slug')    // Populate category name and slug
            .populate('subcategory', 'name slug') // Populate subcategory name and slug
            .lean(); // Use .lean() for faster query

        if (!product) {
            console.warn(`⚠️ Product with ID ${productId} not found.`);
            return res.status(404).json({ success: false, message: "Product not found." });
        }

        console.log(`✅ [Success] Fetched product: ${product.title}`);
        res.status(200).json({ success: true, product });

    } catch (err) {
        console.error("❌ Error fetching product by ID:", err);
        // Handle CastError for invalid IDs (e.g., non-MongoDB ObjectId format)
        if (err.name === 'CastError') {
            return res.status(400).json({ success: false, message: "Invalid Product ID format." });
        }
        res.status(500).json({ success: false, message: "Server error fetching product." });
    }
};

exports.searchProducts = async (req, res) => {
    const query = req.query.q;
    console.log(`🔍  Live searching for: "${query}"`);

    if (!query || query.trim().length < 2) { // Only search if query is at least 2 characters
        return res.status(400).json({ success: false, message: "Search query must be at least 2 characters long." });
    }

    try {
        // This creates a regex for each word in the search query
        const searchWords = query.split(' ').map(word => new RegExp(word, 'i'));

        // We run queries in parallel for better performance
        const [products, categories] = await Promise.all([
            Product.find({ title: { $all: searchWords } }) // Use $all to match all words
                .select('title slug mainImage variants') // Select only needed fields
                .populate({ path: 'variants', select: 'price' }) // Get price from the first variant
                .limit(5), // Limit to 5 product results for a clean dropdown

            Category.find({
                $or: [
                    { name: { $all: searchWords } },
                    { 'subcategories.name': { $all: searchWords } }
                ]
            }).select('name slug subcategories.name subcategories.slug').limit(4) // Limit to 4 category results
        ]);

        // Filter subcategories that match the search from the found categories
        const matchingSubcategories = categories.flatMap(cat =>
            cat.subcategories.filter(sub => sub.name.match(new RegExp(query, 'i')))
        );

        // Filter categories themselves that match
        const matchingCategories = categories.filter(cat => cat.name.match(new RegExp(query, 'i')));

        const results = {
            products,
            categories: matchingCategories,
            subcategories: matchingSubcategories
        };

        console.log(`✅  Found ${products.length} products, ${matchingCategories.length} categories, ${matchingSubcategories.length} subcategories.`);
        res.status(200).json({ success: true, results });

    } catch (error) {
        console.error("❌  Error during live product search:", error);
        res.status(500).json({ success: false, message: "Server error during search." });
    }
};

// 🔐 Safe number parsing helper with logging
function safeNumber(val, fieldName = "unknown") {
    const parsed = Number(typeof val === 'string' ? val.trim() : val);
    if (isNaN(parsed)) {
        console.warn(`⚠️ Warning: Invalid number for ${fieldName} →`, val);
        return 0;
    }
    return parsed;
}

exports.bulkAddProducts = async (req, res) => {
    console.log("📥 Bulk product upload request received.");

    if (!req.file) {
        console.error("❌ No file uploaded.");
        return res.status(400).json({ message: 'No CSV file uploaded.' });
    }

    const productsMap = new Map();
    const buffer = req.file.buffer;
    const readableFile = new Readable();
    readableFile.push(buffer);
    readableFile.push(null);

    let rowCount = 0;

    readableFile
        .pipe(csv())
        .on('data', (row) => {
            rowCount++;
            console.log(`--- DEBUGGING ROW ${rowCount} ---`, row); // ✅ ADD THIS LINE
            const {
                'Product Title': productTitle,
                'Description': description,
                'Category ID': category,
                'Subcategory ID': subcategory,
                'Tags': tags,
                'Is Featured': isFeatured,
                'Is Customizable': isCustomizable,
                'Status': status,
                'Main Image URL': mainImage,
                'SKU': sku,
                'Weight': weight,
                'Material': material,
                'Purity': purity,
                'Size': size,
                'Price': price,
                'Stock': stock,
                'Discount Type': discountType,
                'Discount Value': discountValue,
                'Variant Image URLs': variantImages,
            } = row;

            if (!productTitle || !sku || !price) {
                console.warn(`⚠️ Skipping row ${rowCount}: missing required fields`);
                return;
            }

            if (!productsMap.has(productTitle)) {
                productsMap.set(productTitle, {
                    title: productTitle,
                    description: description || '',
                    category,
                    subcategory: subcategory || null,
                    tags: tags ? tags.split(',').map(t => t.trim()) : [],
                    isFeatured: isFeatured?.toLowerCase() === 'true',
                    isCustomizable: isCustomizable?.toLowerCase() === 'true',
                    status: status || 'active',
                    mainImage: mainImage || '',
                    variants: [],
                });
            }

            const product = productsMap.get(productTitle);

            product.variants.push({
                sku,
                price: safeNumber(price, 'price'),
                stock: safeNumber(stock, 'stock'),
                weight: safeNumber(weight, 'weight'),
                material: material || '',
                purity: purity || '',
                size: size ? size.split(',').map(s => s.trim()) : [],
                images: variantImages ? variantImages.split(',').map(i => i.trim()) : [],
                discount: {
                    type: discountType || 'percentage',
                    value: safeNumber(discountValue, 'discountValue'),
                },
            });
        })
        .on('end', async () => {
            try {
                const productsToCreate = Array.from(productsMap.values());

                if (productsToCreate.length === 0) {
                    console.warn("⚠️ No valid products found in CSV.");
                    return res.status(400).json({ message: 'CSV file is empty or invalid.' });
                }

                // 🧠 Add slugs to each product
                productsToCreate.forEach(p => {
                    p.slug = slugify(p.title || '', { lower: true, strict: true });
                });

                // 🧾 Log product summary
                console.log(`🧾 Parsed ${productsToCreate.length} products from ${rowCount} row(s):`);
                productsToCreate.forEach((p, i) => {
                    console.log(`  🔹 #${i + 1}: ${p.title} → ${p.slug} (${p.variants.length} variant(s))`);
                });

                const inserted = await Product.insertMany(productsToCreate, { ordered: false });
                console.log(`✅ Successfully inserted ${inserted.length} product(s).`);
                res.status(201).json({ message: `${inserted.length} products added successfully!` });

            } catch (error) {
                console.error("💥 Bulk Add Error:", error);
                res.status(500).json({ message: "Failed to save products.", error: error.message });
            }
        })
        .on('error', (err) => {
            console.error("💀 CSV parsing failed:", err);
            res.status(500).json({ message: "Error parsing CSV file." });
        });
};

exports.getRelatedProducts = async (req, res) => {
    try {
        const currentProduct = await Product.findById(req.params.productId);
        if (!currentProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        const relatedProducts = await Product.find({
            category: currentProduct.category,
            _id: { $ne: currentProduct._id } // Exclude the current product itself
        }).limit(4); // Limit to 4 related products

        res.status(200).json({
            success: true,
            products: relatedProducts,
        });

    } catch (error) {
        console.error("Error fetching related products:", error);
        res.status(500).json({ message: "Server error." });
    }
};