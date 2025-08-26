// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { Link } from "react-router-dom";
// const apiurl = import.meta.env.VITE_API_URL;

// const AddProduct = () => {
//     const [title, setTitle] = useState("");
//     const [description, setDescription] = useState("");
//     const [thumbnailPreview, setThumbnailPreview] = useState(null);
//     const [categoryId, setCategoryId] = useState("");
//     const [subCategoryId, setSubCategoryId] = useState("");
//     const [tags, setTags] = useState("");
//     const [status, setStatus] = useState("active");
//     const [thumbnailFile, setThumbnailFile] = useState(null);
//     const [categories, setCategories] = useState([]);
//     const [subcategories, setSubcategories] = useState([]);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const navigate = useNavigate();
//     const [isLoading, setIsLoading] = useState(false);
//     const [isError, setIsError] = useState(false);
//     const [variants, setVariants] = useState([
//         {
//             metalColor: "",
//             purity: "",
//             size: "",
//             diamondDetails: [],
//             priceBreakup: [],
//             totalPrice: "",
//             sku: "",
//             stock: "",
//             weightInGrams: "",
//             images: [],
//         },
//     ]);

//     const addNewVariant = () => {
//         setVariants([
//             ...variants,
//             {
//                 metalColor: "",
//                 carat: "",
//                 size: "",
//                 diamondDetails: [],
//                 priceBreakup: [],
//                 totalPrice: "",
//                 sku: "",
//                 stock: "",
//                 weightInGrams: "",
//                 images: [],
//             },
//         ]);
//     };
//     const handleVariantChange = (index, field, value) => {
//         const updatedVariants = [...variants];
//         updatedVariants[index][field] = value;
//         setVariants(updatedVariants);
//     };

//     const removeVariant = (index) => {
//         const updatedVariants = [...variants];
//         updatedVariants.splice(index, 1);
//         setVariants(updatedVariants);
//     };

//     // Add these handler functions
//     const handleThumbnailChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             setThumbnailFile(file);
//             setThumbnailPreview(URL.createObjectURL(file));
//         }
//     };

//     const handleVariantImageChange = (variantIndex, files) => {
//         const updatedVariants = [...variants];
//         updatedVariants[variantIndex].images = Array.from(files);
//         setVariants(updatedVariants);
//     };
//     // categories and subcategories
//     const fetchCategories = async () => {
//         // ✅ Check localStorage first
//         const cached = localStorage.getItem("categories");
//         if (cached) {
//             console.log("📦 Using cached categories from localStorage");
//             setCategories(JSON.parse(cached));
//             return;
//         }

//         // 🧠 If not cached, fetch from API
//         try {
//             console.log("🌐 Fetching categories from API...");
//             const res = await axios.get(`${apiurl}/category/getallcategories`);
//             if (res.data.success && res.data.categories) {
//                 setCategories(res.data.categories);
//                 localStorage.setItem("categories", JSON.stringify(res.data.categories));
//                 console.log("✅ Categories saved to localStorage");
//             } else {
//                 console.error("⚠️ No categories received from API");
//             }
//         } catch (err) {
//             console.error("❌ Error fetching categories:", err.message);
//         }
//     };

//     useEffect(() => {
//         fetchCategories();
//     }, []);

//     const validateVariants = () => {
//         return variants.every(
//             (v) => v.metalColor && v.carat && v.sku && v.totalPrice
//         );
//     };

//     // Updated handleSubmit function
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (!validateVariants()) {
//             toast.error("Please fill all required variant fields");
//             return;
//         }
//         setIsSubmitting(true);

//         try {
//             const formData = new FormData();

//             // Prepare product data
//             const productData = {
//                 title: title.trim(),
//                 categoryId,
//                 subCategoryId,
//                 tags: tags
//                     .split(",")
//                     .map((t) => t.trim())
//                     .filter((t) => t),
//                 description: description.trim(),
//                 status: status,
//                 variants: variants.map((variant) => ({
//                     ...variant,
//                     // Convert numbers from strings
//                     stock: Number(variant.stock),
//                     totalPrice: Number(variant.totalPrice),
//                     weightInGrams: Number(variant.weightInGrams),
//                     // Remove image files from data (will be sent as files)
//                     images: [],
//                 })),
//             };

//             formData.append("product", JSON.stringify(productData));
//             formData.append("thumbnail", thumbnailFile);

//             // Append variant images
//             variants.forEach((variant, index) => {
//                 variant.images.forEach((file) => {
//                     formData.append(`variants[${index}][images]`, file);
//                 });
//             });

//             // API call
//             const response = await axios.post(
//                 `${apiurl}/product/add-product`,
//                 formData,
//                 {
//                     headers: {
//                         "Content-Type": "multipart/form-data",
//                     },
//                 }
//             );
//             console.log("Response:", response.data);
//             toast.success("Product added successfully!");
//             navigate("/admin/products");
//         } catch (error) {
//             console.error("Submission error:", error);
//             const errorMessage =
//                 error.response?.data?.error ||
//                 error.message ||
//                 "Failed to add product. Please check your inputs.";
//             toast.error(errorMessage);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//     return (
//         <div className="max-w-6xl mx-auto mt-10 px-4">
//             <h2 className="text-2xl font-bold text-cyan-900 mb-6">
//                 Add New Jewelry Product
//             </h2>

//             <form
//                 onSubmit={handleSubmit}
//                 className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6"
//             >
//                 {/* Title */}
//                 <div>
//                     <label className="block mb-1 font-medium">Product Title</label>
//                     <input
//                         type="text"
//                         value={title}
//                         onChange={(e) => setTitle(e.target.value)}
//                         className="w-full border border-gray-300 p-2 rounded-md"
//                         placeholder="e.g. Diamond Ring"
//                         required
//                     />
//                 </div>

//                 {/* Tags */}
//                 <div>
//                     <label className="block mb-1 font-medium">
//                         Tags (comma separated)
//                     </label>
//                     <input
//                         type="text"
//                         value={tags}
//                         onChange={(e) => setTags(e.target.value)}
//                         className="w-full border border-gray-300 p-2 rounded-md"
//                         placeholder="e.g. New, Bestseller, Gift"
//                     />
//                 </div>

//                 {/* Category */}
//                 <div>
//                     <label className="block mb-1 font-medium">Category</label>
//                     <select
//                         value={categoryId}
//                         onChange={(e) => {
//                             const selectedId = e.target.value;
//                             setCategoryId(selectedId);

//                             const selectedCategory = categories.find(
//                                 (cat) => cat._id === selectedId
//                             );
//                             if (selectedCategory && selectedCategory.subcategories) {
//                                 setSubcategories(selectedCategory.subcategories);
//                                 console.log("Subcategories:", selectedCategory.subcategories);
//                             } else {
//                                 setSubcategories([]); // no subcategories
//                             }
//                         }}
//                         className="w-full border border-gray-300 p-2 rounded-md"
//                         required
//                     >
//                         <option value="">Select Category</option>
//                         {categories.map((cat) => (
//                             <option key={cat._id} value={cat._id}>
//                                 {cat.name}
//                             </option>
//                         ))}
//                     </select>
//                 </div>

//                 {/* Subcategory */}
//                 <div>
//                     <label className="block mb-1 font-medium">Subcategory</label>
//                     {subcategories.length > 0 && (
//                         <div className="">
//                             <select
//                                 value={subCategoryId}
//                                 onChange={(e) => setSubCategoryId(e.target.value)}
//                                 className="w-full border border-gray-300 p-2 rounded-md"
//                             >
//                                 <option value="">Select Subcategory</option>
//                                 {subcategories.map((sub) => (
//                                     <option key={sub._id} value={sub._id}>
//                                         {sub.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}
//                 </div>

//                 {/* Status */}
//                 <div>
//                     <label className="block mb-1 font-medium">Status</label>
//                     <select
//                         value={status}
//                         onChange={(e) => setStatus(e.target.value)}
//                         className="w-full border border-gray-300 p-2 rounded-md"
//                     >
//                         <option value="active">Active</option>
//                         <option value="inactive">Inactive</option>
//                     </select>
//                 </div>

//                 {/* Thumbnail Upload */}
//                 <div>
//                     <label className="block mb-1 font-medium">Thumbnail Image</label>
//                     <input
//                         type="file"
//                         accept="image/*"
//                         onChange={handleThumbnailChange}
//                         className="w-full border border-gray-300 p-2 rounded-md"
//                         required
//                     />
//                     {thumbnailPreview && (
//                         <img
//                             src={thumbnailPreview}
//                             alt="Thumbnail"
//                             className="mt-2 w-28 h-28 object-cover rounded-md"
//                         />
//                     )}
//                 </div>

//                 {/* Description - Full width row */}
//                 <div className="md:col-span-2">
//                     <label className="block mb-1 font-medium">Description</label>
//                     <textarea
//                         value={description}
//                         onChange={(e) => setDescription(e.target.value)}
//                         className="w-full border border-gray-300 p-3 rounded-md"
//                         rows="4"
//                         placeholder="Describe the product in detail..."
//                     ></textarea>
//                 </div>

//                 <div className="md:col-span-2">
//                     <h3 className="text-xl font-semibold mb-4 text-cyan-800">
//                         Product Variants
//                     </h3>

//                     {variants.map((variant, index) => (
//                         <div
//                             key={index}
//                             className="border p-4 mb-4 rounded-md shadow-sm space-y-4 bg-gray-50"
//                         >
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
//                                 <div>
//                                     <label className="block mb-1">Metal Color</label>
//                                     <select
//                                         value={variant.metalColor}
//                                         onChange={(e) =>
//                                             handleVariantChange(index, "metalColor", e.target.value)
//                                         }
//                                         className="w-full border border-gray-300 p-2 rounded-md"
//                                     >
//                                         <option value="">Select</option>
//                                         <option value="Yellow Gold">Yellow Gold</option>
//                                         <option value="Rose Gold">Rose Gold</option>
//                                         <option value="White Gold">White Gold</option>
//                                         <option value="Silver">Silver</option>
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block mb-1">Carat</label>
//                                     <select
//                                         value={variant.carat}
//                                         onChange={(e) =>
//                                             handleVariantChange(index, "carat", e.target.value)
//                                         }
//                                         className="w-full border border-gray-300 p-2 rounded-md"
//                                     >
//                                         <option value="">Select</option>
//                                         <option value="14KT">14KT</option>
//                                         <option value="18KT">18KT</option>
//                                         <option value="22KT">22KT</option>
//                                     </select>
//                                 </div>

//                                 <div>
//                                     <label className="block mb-1">Size (for rings)</label>
//                                     <input
//                                         type="text"
//                                         value={variant.size}
//                                         onChange={(e) =>
//                                             handleVariantChange(index, "size", e.target.value)
//                                         }
//                                         className="w-full border border-gray-300 p-2 rounded-md"
//                                         placeholder="e.g. 6, 7, 8..."
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block mb-1">SKU</label>
//                                     <input
//                                         type="text"
//                                         value={variant.sku}
//                                         onChange={(e) =>
//                                             handleVariantChange(index, "sku", e.target.value)
//                                         }
//                                         className="w-full border border-gray-300 p-2 rounded-md"
//                                         placeholder="Unique SKU"
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block mb-1">Stock</label>
//                                     <input
//                                         type="number"
//                                         value={variant.stock}
//                                         onChange={(e) =>
//                                             handleVariantChange(index, "stock", e.target.value)
//                                         }
//                                         className="w-full border border-gray-300 p-2 rounded-md"
//                                         placeholder="Stock quantity"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block mb-1">Total Price</label>
//                                     <input
//                                         type="number"
//                                         value={variant.totalPrice}
//                                         onChange={(e) =>
//                                             handleVariantChange(index, "totalPrice", e.target.value)
//                                         }
//                                         className="w-full border border-gray-300 p-2 rounded-md"
//                                         placeholder="₹ Total price"
//                                         required
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block mb-1">Weight (g)</label>
//                                     <input
//                                         type="number"
//                                         value={variant.weightInGrams}
//                                         onChange={(e) =>
//                                             handleVariantChange(
//                                                 index,
//                                                 "weightInGrams",
//                                                 e.target.value
//                                             )
//                                         }
//                                         className="w-full border border-gray-300 p-2 rounded-md"
//                                         placeholder="Weight in grams"
//                                     />
//                                 </div>

//                                 <div>
//                                     <label className="block mb-1">Upload Variant Images</label>
//                                     <input
//                                         type="file"
//                                         multiple
//                                         onChange={(e) =>
//                                             handleVariantImageChange(index, e.target.files)
//                                         }
//                                         className="w-full border border-gray-300 p-2 rounded-md"
//                                         accept="image/*"
//                                     />
//                                 </div>
//                                 {/* 
//                 <div className="">
//                   <label className="block mb-1 font-medium">
//                     Diamond Details
//                   </label>

//                   {variant.diamondDetails.length === 0 ? (
//                     <button
//                       type="button"
//                       className="text-sm text-orange-600"
//                       onClick={() => {
//                         const updated = [...variants];
//                         updated[index].diamondDetails = [
//                           {
//                             stoneType: "",
//                             color: "",
//                             clarity: "",
//                             shape: "",
//                             weight: 0,
//                           },
//                         ];
//                         setVariants(updated);
//                       }}
//                     >
//                       + Add Diamond Details
//                     </button>
//                   ) : (
//                     <div className="grid grid-cols-3 gap-2 mb-2">
//                       <input
//                         type="text"
//                         placeholder="Stone Type"
//                         value={variant.diamondDetails[0].stoneType}
//                         onChange={(e) => {
//                           const updated = [...variants];
//                           updated[index].diamondDetails[0].stoneType =
//                             e.target.value;
//                           setVariants(updated);
//                         }}
//                         className="p-2 border border-gray-300 rounded"
//                       />
//                       <input
//                         type="text"
//                         placeholder="Color"
//                         value={variant.diamondDetails[0].color}
//                         onChange={(e) => {
//                           const updated = [...variants];
//                           updated[index].diamondDetails[0].color =
//                             e.target.value;
//                           setVariants(updated);
//                         }}
//                         className="p-2 border border-gray-300 rounded"
//                       />
//                       <input
//                         type="text"
//                         placeholder="Clarity"
//                         value={variant.diamondDetails[0].clarity}
//                         onChange={(e) => {
//                           const updated = [...variants];
//                           updated[index].diamondDetails[0].clarity =
//                             e.target.value;
//                           setVariants(updated);
//                         }}
//                         className="p-2 border border-gray-300 rounded"
//                       />
//                       <input
//                         type="text"
//                         placeholder="Shape"
//                         value={variant.diamondDetails[0].shape}
//                         onChange={(e) => {
//                           const updated = [...variants];
//                           updated[index].diamondDetails[0].shape =
//                             e.target.value;
//                           setVariants(updated);
//                         }}
//                         className="p-2 border border-gray-300 rounded"
//                       />
//                       <input
//                         type="number"
//                         placeholder="Weight"
//                         value={variant.diamondDetails[0].weight}
//                         onChange={(e) => {
//                           const updated = [...variants];
//                           updated[index].diamondDetails[0].weight = parseFloat(
//                             e.target.value
//                           );
//                           setVariants(updated);
//                         }}
//                         className="p-2 border border-gray-300 rounded"
//                       />
//                     </div>
//                   )}
//                 </div> */}

//                                 <div className="">
//                                     <label className="block mb-1 font-medium">
//                                         Price Breakup
//                                     </label>
//                                     {variant.priceBreakup?.map((price, pIndex) => (
//                                         <div key={pIndex} className="mb-2 flex gap-2">
//                                             <input
//                                                 type="text"
//                                                 placeholder="Label"
//                                                 value={price.label}
//                                                 onChange={(e) => {
//                                                     const updated = [...variants];
//                                                     updated[index].priceBreakup[pIndex].label =
//                                                         e.target.value;
//                                                     setVariants(updated);
//                                                 }}
//                                                 className="p-2 border rounded w-[60%]"
//                                             />
//                                             <input
//                                                 type="number"
//                                                 placeholder="Amount"
//                                                 value={price.amount}
//                                                 onChange={(e) => {
//                                                     const updated = [...variants];
//                                                     updated[index].priceBreakup[pIndex].amount =
//                                                         parseFloat(e.target.value);
//                                                     setVariants(updated);
//                                                 }}
//                                                 className="p-2 border rounded w-[30%]"
//                                             />
//                                         </div>
//                                     ))}
//                                     <button
//                                         type="button"
//                                         className="mt-2 text-sm text-orange-600"
//                                         onClick={() => {
//                                             const updated = [...variants];
//                                             updated[index].priceBreakup.push({
//                                                 label: "",
//                                                 amount: 0,
//                                             });
//                                             setVariants(updated);
//                                         }}
//                                     >
//                                         + Add Price Breakup
//                                     </button>
//                                 </div>
//                             </div>

//                             {/* 🗑️ Remove Variant (if more than one) */}
//                             {variants.length > 1 && (
//                                 <div className="flex justify-end">
//                                     <button
//                                         type="button"
//                                         onClick={() => removeVariant(index)}
//                                         className="text-sm text-red-600 hover:underline"
//                                     >
//                                         Remove this variant
//                                     </button>
//                                 </div>
//                             )}
//                         </div>
//                     ))}

//                     {/* ➕ Add Variant Button */}
//                     <div className="flex justify-end gap-4">
//                         <button
//                             type="button"
//                             onClick={addNewVariant}
//                             className="bg-violet-800 text-white px-4 py-2 rounded-md hover:bg-violet-700 transition"
//                         >
//                             + Add Another Variant
//                         </button>
//                         {/* Submit Button - Full width row */}
//                         <button
//                             type="submit"
//                             disabled={isSubmitting}
//                             className={`bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition relative ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
//                                 }`}
//                         >
//                             {isSubmitting ? (
//                                 <div className="flex items-center justify-center gap-2">
//                                     {/* Loading spinner */}
//                                     <svg
//                                         className="animate-spin h-5 w-5 text-white"
//                                         xmlns="http://www.w3.org/2000/svg"
//                                         fill="none"
//                                         viewBox="0 0 24 24"
//                                     >
//                                         <circle
//                                             className="opacity-25"
//                                             cx="12"
//                                             cy="12"
//                                             r="10"
//                                             stroke="currentColor"
//                                             strokeWidth="4"
//                                         ></circle>
//                                         <path
//                                             className="opacity-75"
//                                             fill="currentColor"
//                                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                         ></path>
//                                     </svg>
//                                     Adding Product...
//                                 </div>
//                             ) : (
//                                 "Add Product"
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default AddProduct;


// AddProduct.jsx
// import React, { useState } from 'react';
// import axios from 'axios';

// const AddProduct = () => {
//     const [productData, setProductData] = useState({
//         title: '',
//         description: '',
//         category: '',
//         subcategory: '',
//         tags: '',
//         isCustomizable: false,
//         status: 'active',
//         variants: [{
//             sku: '',
//             weight: '',
//             material: '',
//             purity: '',
//             size: '',
//             price: '',
//             inStock: true,
//             images: []
//         }],
//         mainImage: null
//     });

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setProductData((prev) => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value,
//         }));
//     };

//     const handleVariantChange = (index, e) => {
//         const { name, value, type, checked, files } = e.target;
//         const updatedVariants = [...productData.variants];
//         updatedVariants[index][name] =
//             name === 'images' ? Array.from(files) : type === 'checkbox' ? checked : value;
//         setProductData((prev) => ({ ...prev, variants: updatedVariants }));
//     };

//     const handleImageChange = (e) => {
//         setProductData((prev) => ({ ...prev, mainImage: e.target.files[0] }));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const formData = new FormData();
//         const payload = { ...productData };
//         formData.append('title', payload.title);
//         formData.append('description', payload.description);
//         formData.append('category', payload.category);
//         formData.append('subcategory', payload.subcategory);
//         formData.append('tags', payload.tags);
//         formData.append('isCustomizable', payload.isCustomizable);
//         formData.append('status', payload.status);
//         formData.append('mainImage', payload.mainImage);

//         formData.append('variants', JSON.stringify(payload.variants.map((v, i) => {
//             const { images, ...rest } = v;
//             images.forEach((img, idx) => formData.append(`variantImages[${i}]`, img));
//             return rest;
//         })));

//         try {
//             const res = await axios.post('/api/product/add-product', formData);
//             console.log('Product added:', res.data);
//         } catch (err) {
//             console.error('Error adding product:', err);
//         }
//     };

//     return (
//         <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
//             <div className="flex items-center justify-between mb-6">
//                 <h2 className="text-2xl font-bold text-gray-800">Add Product</h2>
//                 <button type="button" onClick={() => window.history.back()} className="text-blue-600 hover:underline">Back</button>
//             </div>

//             <input className="w-full p-2 border border-gray-300 rounded" type="text" name="title" value={productData.title} onChange={handleChange} placeholder="Title" />

//             <textarea className="w-full p-2 border border-gray-300 rounded" name="description" value={productData.description} onChange={handleChange} placeholder="Description" />

//             <input className="w-full p-2 border border-gray-300 rounded" type="text" name="category" value={productData.category} onChange={handleChange} placeholder="Category ID" />

//             <input className="w-full p-2 border border-gray-300 rounded" type="text" name="subcategory" value={productData.subcategory} onChange={handleChange} placeholder="Subcategory ID" />

//             <input className="w-full p-2 border border-gray-300 rounded" type="text" name="tags" value={productData.tags} onChange={handleChange} placeholder="Tags (comma-separated)" />

//             <label className="flex items-center space-x-2">
//                 <input type="checkbox" name="isCustomizable" checked={productData.isCustomizable} onChange={handleChange} />
//                 <span>Customizable</span>
//             </label>

//             <select name="status" value={productData.status} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded">
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//             </select>

//             <input className="w-full p-2 border border-gray-300 rounded" type="file" name="mainImage" onChange={handleImageChange} />

//             {productData.variants.map((variant, index) => (
//                 <div key={index} className="border-t pt-4 space-y-2">
//                     <input className="w-full p-2 border border-gray-300 rounded" type="text" name="sku" value={variant.sku} onChange={(e) => handleVariantChange(index, e)} placeholder="SKU" />
//                     <input className="w-full p-2 border border-gray-300 rounded" type="number" name="weight" value={variant.weight} onChange={(e) => handleVariantChange(index, e)} placeholder="Weight" />
//                     <select className="w-full p-2 border border-gray-300 rounded" name="material" value={variant.material} onChange={(e) => handleVariantChange(index, e)}>
//                         <option value="">Material</option>
//                         <option value="Gold">Gold</option>
//                         <option value="Silver">Silver</option>
//                         <option value="Rose Gold">Rose Gold</option>
//                         <option value="Platinum">Platinum</option>
//                     </select>
//                     <input className="w-full p-2 border border-gray-300 rounded" type="text" name="purity" value={variant.purity} onChange={(e) => handleVariantChange(index, e)} placeholder="Purity" />
//                     <input className="w-full p-2 border border-gray-300 rounded" type="text" name="size" value={variant.size} onChange={(e) => handleVariantChange(index, e)} placeholder="Size" />
//                     <input className="w-full p-2 border border-gray-300 rounded" type="number" name="price" value={variant.price} onChange={(e) => handleVariantChange(index, e)} placeholder="Price" />
//                     <label className="flex items-center space-x-2">
//                         <input type="checkbox" name="inStock" checked={variant.inStock} onChange={(e) => handleVariantChange(index, e)} />
//                         <span>In Stock</span>
//                     </label>
//                     <input className="w-full p-2 border border-gray-300 rounded" type="file" name="images" multiple onChange={(e) => handleVariantChange(index, e)} />
//                 </div>
//             ))}

//             <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Add Product</button>
//         </form>

//     );
// };

// export default AddProduct;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const AddProduct = () => {
    // State management
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        subCategoryId: "",
        tags: "",
        isCustomizable: false,
        status: "active",
    });
    const [mainImageFile, setmainImageFile] = useState(null);
    const [mainImagePreview, setmainImagePreview] = useState(null);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [variants, setVariants] = useState([createEmptyVariant()]);

    const navigate = useNavigate();

    // Helper function for variant creation
    function createEmptyVariant() {
        return {
            metalColor: "",
            purity: "",
            size: "",
            totalPrice: "",
            sku: "",
            stock: "",
            weightInGrams: "",
            images: [],
        };
    }

    // Fetch categories with caching

    useEffect(() => {
        console.log("Fetching categories...");

        const fetchCategories = async () => {
            try {
                const res = await axios.get(`${backdendUrl}/api/category/getCatWithSubCats`);

                console.log("Fetched categories:", res.data);

                if (res.data.success && res.data.categories) {
                    setCategories(res.data.categories);
                    localStorage.setItem("categories", JSON.stringify(res.data.categories));
                }
            } catch (err) {
                toast.error("Failed to load categories");
                console.error("Error fetching categories:", err);
            }
        };

        fetchCategories();
    }, []);

    // Form handlers
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value
        }));
    };

    const handlemainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setmainImageFile(file);
            setmainImagePreview(URL.createObjectURL(file));
        }
    };

    // Variant handlers
    const addNewVariant = () => {
        setVariants(prev => [...prev, createEmptyVariant()]);
    };

    const removeVariant = (index) => {
        if (variants.length <= 1) return;
        setVariants(prev => prev.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
        setVariants(prev => prev.map((v, i) => {
            if (i === index) {
                // If the field being changed is 'size', process it into an array
                if (field === "size") {
                    const sizeArray = value.split(',') // Split the string by commas
                        .map(s => s.trim()) // Trim whitespace from each size
                        .filter(s => s); // Remove any empty strings
                    return { ...v, size: sizeArray };
                }
                // For all other fields, handle as before
                return { ...v, [field]: value };
            }
            return v;
        }));
    };

    const handleVariantImageChange = (index, files) => {
        setVariants(prev => prev.map((v, i) =>
            i === index ? { ...v, images: Array.from(files) } : v
        ));
    };

    // Form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Validate required fields
        if (!formData.title || !mainImageFile || !formData.categoryId) {
            toast.error("Please fill all required fields");
            setIsSubmitting(false);
            return;
        }

        // Validate variants
        const invalidVariant = variants.some(v =>
            !v.metalColor || !v.purity || !v.sku || !v.totalPrice || !v.material
        );

        if (invalidVariant) {
            toast.error("Please fill all required variant fields");
            setIsSubmitting(false);
            return;
        }

        try {
            const formDataObj = new FormData();

            // Prepare product data
            const productData = {
                ...formData,
                tags: formData.tags.split(",").map(t => t.trim()).filter(t => t),
                variants: variants.map(variant => ({
                    ...variant,
                    stock: Number(variant.stock),
                    totalPrice: Number(variant.totalPrice),
                    weightInGrams: Number(variant.weightInGrams),
                    images: [],
                }))
            }
            formDataObj.append("product", JSON.stringify(productData));
            if (mainImageFile) {
                formDataObj.append("mainImage", mainImageFile);
            }
            variants.forEach((variant, index) => {
                variant.images.forEach(file => {
                    formDataObj.append(`variantImages_${index}`, file);
                });
            });

            // API call
            await axios.post(`${backdendUrl}/api/product/add-product`, formDataObj, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            toast.success("Product added successfully!");
            navigate("/admin/products");
        } catch (error) {
            console.error("Submission error:", error);
            const errorMessage = error.response?.data?.error ||
                "Failed to add product. Please check your inputs.";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-10 px-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-cyan-900">
                    Add New Jewelry Product
                </h2>
                <button
                    onClick={() => navigate(-1)}
                    className="text-blue-600 hover:underline"
                >
                    &larr; Back
                </button>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md grid grid-cols-1 md:grid-cols-2 gap-6"
            >
                {/* Basic Information Section */}
                <div className="md:col-span-2 border-b pb-4">
                    <h3 className="text-xl font-semibold mb-4 text-cyan-800">
                        Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Title */}
                        <div>
                            <label className="block mb-1 font-medium">
                                Product Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                placeholder="e.g. Diamond Ring"
                                required
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <label className="block mb-1 font-medium">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                placeholder="e.g. New, Bestseller, Gift"
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block mb-1 font-medium">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={(e) => {
                                    handleChange(e);
                                    const selectedCategory = categories.find(
                                        cat => cat._id === e.target.value
                                    );
                                    setSubcategories(selectedCategory?.subcategories || []);
                                    setFormData(prev => ({ ...prev, subCategoryId: "" }));
                                }}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Subcategory */}
                        <div>
                            <label className="block mb-1 font-medium">Subcategory</label>
                            <select
                                name="subCategoryId"
                                value={formData.subCategoryId}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                disabled={!subcategories.length}
                            >
                                <option value="">Select Subcategory</option>
                                {subcategories.map((sub) => (
                                    <option key={sub._id} value={sub._id}>
                                        {sub.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block mb-1 font-medium">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Customizable */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isCustomizable"
                                name="isCustomizable"
                                checked={formData.isCustomizable}
                                onChange={handleChange}
                                className="mr-2"
                            />
                            <label htmlFor="isCustomizable" className="font-medium">
                                Customizable Product
                            </label>
                        </div>

                        {/* mainImage Upload */}
                        <div>
                            <label className="block mb-1 font-medium">
                                mainImage Image <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handlemainImageChange}
                                className="w-full border border-gray-300 p-2 rounded-md"
                                required
                            />
                            {mainImagePreview && (
                                <img
                                    src={mainImagePreview}
                                    alt="mainImage"
                                    className="mt-2 w-28 h-28 object-cover rounded-md border"
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="md:col-span-2">
                    <label className="block mb-1 font-medium">Description</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-md"
                        rows="4"
                        placeholder="Describe the product in detail..."
                    ></textarea>
                </div>

                {/* Variants Section */}
                <div className="md:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-cyan-800">
                            Product Variants
                        </h3>
                        <button
                            type="button"
                            onClick={addNewVariant}
                            className="bg-violet-800 text-white px-4 py-2 rounded-md hover:bg-violet-700 transition"
                        >
                            + Add Variant
                        </button>
                    </div>

                    {variants.map((variant, index) => (
                        <div
                            key={index}
                            className="border p-4 mb-6 rounded-md shadow-sm space-y-4 bg-gray-50"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                {/* Metal Color */}
                                <div>
                                    <label className="block mb-1">
                                        Material <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={variant.metalColor}
                                        onChange={(e) =>
                                            handleVariantChange(index, "metalColor", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="Yellow Gold">Yellow Gold</option>
                                        <option value="Rose Gold">Rose Gold</option>
                                        <option value="White Gold">White Gold</option>
                                        <option value="Silver">Silver</option>
                                    </select>
                                </div>

                                {/* purity */}
                                <div>
                                    <label className="block mb-1">
                                        Purity <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={variant.purity}
                                        onChange={(e) =>
                                            handleVariantChange(index, "purity", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        required
                                    >
                                        <option value="">Select</option>
                                        <option value="14KT">14KT</option>
                                        <option value="18KT">18KT</option>
                                        <option value="22KT">22KT</option>
                                    </select>
                                </div>

                                {/* Size */}
                                <div>
                                    <label className="block mb-1 text-sm font-medium text-gray-700">
                                        Sizes (comma-separated)
                                    </label>
                                    <input
                                        type="text"
                                        value={
                                            Array.isArray(variant?.size)
                                                ? variant.size.join(', ')
                                                : variant?.size || ''
                                        }
                                        onChange={(e) =>
                                            handleVariantChange(index, "size", e.target.value.split(',').map(s => s.trim()))
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="6, 7, 8"
                                    />
                                </div>

                                {/* SKU */}
                                <div>
                                    <label className="block mb-1">
                                        SKU <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={variant.sku}
                                        onChange={(e) =>
                                            handleVariantChange(index, "sku", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="Unique SKU"
                                        required
                                    />
                                </div>

                                {/* Inside the variant mapping in your AddProduct.jsx */}
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Discount Type */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Discount Type</label>
                                        <select
                                            value={variant.discount?.type || 'percentage'}
                                            onChange={(e) => handleVariantChange(index, "discount", { ...variant.discount, type: e.target.value })}
                                            className="w-full border border-gray-300 p-2 rounded-md"
                                        >
                                            <option value="percentage">Percentage (%)</option>
                                            <option value="fixed">Fixed (₹)</option>
                                        </select>
                                    </div>

                                    {/* Discount Value */}
                                    <div>
                                        <label className="block mb-1 text-sm font-medium">Discount Value</label>
                                        <input
                                            type="number"
                                            value={variant.discount?.value || 0}
                                            onChange={(e) => handleVariantChange(index, "discount", { ...variant.discount, value: Number(e.target.value) })}
                                            className="w-full border border-gray-300 p-2 rounded-md"
                                            placeholder="e.g. 10 or 500"
                                            min="0"
                                        />
                                    </div>
                                </div>


                                {/* Stock */}
                                <div>
                                    <label className="block mb-1">In Stock</label>
                                    <input
                                        type="number"
                                        value={variant.stock}
                                        onChange={(e) =>
                                            handleVariantChange(index, "stock", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="Stock quantity"
                                        min="0"
                                    />
                                </div>

                                {/* Total Price */}
                                <div>
                                    <label className="block mb-1">
                                        Total Price <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        value={variant.totalPrice}
                                        onChange={(e) =>
                                            handleVariantChange(index, "totalPrice", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="₹ Total price"
                                        required
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Weight */}
                                <div>
                                    <label className="block mb-1">Weight (g)</label>
                                    <input
                                        type="number"
                                        value={variant.weightInGrams}
                                        onChange={(e) =>
                                            handleVariantChange(index, "weightInGrams", e.target.value)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        placeholder="Weight in grams"
                                        min="0"
                                        step="0.01"
                                    />
                                </div>

                                {/* Variant Images */}
                                <div>
                                    <label className="block mb-1">Variant Images upto 4</label>
                                    <input
                                        type="file"
                                        multiple
                                        onChange={(e) =>
                                            handleVariantImageChange(index, e.target.files)
                                        }
                                        className="w-full border border-gray-300 p-2 rounded-md"
                                        accept="image/*"
                                    />
                                </div>
                            </div>

                            {/* Remove Variant */}
                            {variants.length > 1 && (
                                <div className="flex justify-end mt-2">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="text-sm text-red-600 hover:underline"
                                    >
                                        Remove Variant
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}

                    {/* Submit Button */}
                    <div className="flex justify-end mt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`bg-blue-900 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                                }`}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-5 w-5 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Adding Product...
                                </div>
                            ) : (
                                "Add Product"
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AddProduct;