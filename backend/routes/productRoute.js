const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const { addProduct, getAllProducts, updateProduct, getProductById, deleteProduct, getProductsByCategorySlugs, getProductsFiltered, searchProducts, bulkAddProducts, getRelatedProducts } = require('../controller/productController.js');
const { isAdmin } = require("../middlewares/authmiddleware.js");


let productUploadFields = [
    { name: "mainImage", maxCount: 1 },
];

for (let i = 0; i < 10; i++) { // Adjust '10' based on your maximum expected variants
    productUploadFields.push({ name: `variantImages_${i}`, maxCount: 5 }); // Adjust '4' for max images per variant
}

router.post(
    "/add-product",
    upload.fields(productUploadFields),
    addProduct
);
router.get("/getproducts", getAllProducts)
router.get("/getproduct/:id", getProductById); // Assuming you want to fetch by slug as well
router.put("/update-product/:id", upload.fields(productUploadFields), updateProduct); // Use PUT for updates
router.delete("/delete-product/:id", deleteProduct);
router.post("/get-products-by-category-slugs", getProductsByCategorySlugs); // Use POST for body data
router.get("/get-products-filtered", getProductsFiltered);
router.get("/get-product/:id", getProductById);
router.get("/search", searchProducts)
router.post(
    '/bulk-add',
    isAdmin,
    upload.single('productCsv'), // Field name for the CSV file
    bulkAddProducts
);
router.get('/:productId/related', getRelatedProducts);

module.exports = router;
