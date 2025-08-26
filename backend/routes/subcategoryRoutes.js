const express = require("express");
const router = express.Router();
const subcategoryCtrl = require("../controller/subcategoryController");
const { isAdmin } = require("../middlewares/authmiddleware");
const upload = require("../middlewares/multer");

router.post("/add-subcategory", isAdmin, upload.single("image"), subcategoryCtrl.createSubcategory);
router.get("/allsubcategories", subcategoryCtrl.getAllSubcategories);
router.get("/featured-subcategories", subcategoryCtrl.getFeaturedSubcategories);
router.get("/:id", subcategoryCtrl.getSubcategory);
router.put("/update-subcategory/:id", isAdmin, upload.single("image"), subcategoryCtrl.updateSubcategory);
router.delete("/delete-subcategory/:id", isAdmin, subcategoryCtrl.deleteSubcategory);
router.get("/by-category/:categoryId", subcategoryCtrl.getSubcategoriesByCategory);
router.put("/isfeatured/:id", isAdmin, subcategoryCtrl.isFeatured);
router.post("/getsubs-by-slugs", subcategoryCtrl.getSubcategoriesBySlugs);

module.exports = router;
