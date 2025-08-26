const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const categoryCtrl = require("../controller/categoryController");
const { isAdmin } = require("../middlewares/authmiddleware");

// Create Category
router.post("/add-category", isAdmin, upload.single("image"), categoryCtrl.createCategory);
router.get("/allcategories", categoryCtrl.getAllCategories);
router.get("/featured-categories", categoryCtrl.getFeaturedCategories);
router.put("/update-category/:id", isAdmin, upload.single("image"), categoryCtrl.updateCategory);
router.delete("/delete-category/:id", isAdmin, categoryCtrl.deleteCategory);
router.get("/get-category/:id", categoryCtrl.getCategoryById);
router.get("/getCatWithSubCats", categoryCtrl.getCategoriesWithSubcategories);
router.put("/isfeatured/:id", isAdmin, categoryCtrl.isFeatured);


/*
Example cURL command to update a category:

curl -X PUT http://localhost:5000/api/category/category/<CATEGORY_ID> \
    -H "Authorization: Bearer <YOUR_ADMIN_TOKEN>" \
    -F "name=New Category Name" \
    -F "image=@/path/to/image.jpg"
*/

module.exports = router;
