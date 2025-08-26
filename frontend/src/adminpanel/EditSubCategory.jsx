import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const EditSubCategory = () => {
    const navigate = useNavigate();
    const params = useParams();
    const token = localStorage.getItem("token");
    const [subcategoryId, setSubcategoryId] = useState(params.id || "");
    const [categoryId, setCategoryId] = useState("");
    const [subcategory, setSubcategory] = useState(null);
    const [name, setName] = useState("");
    const [categories, setCategories] = useState([]);
    const [currentImageUrl, setCurrentImageUrl] = useState(null);
    const [newImageFile, setNewImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const location = useLocation();
    useEffect(() => {
        const passedSubcategory = location.state?.subcategory;

        if (passedSubcategory) {
            setSubcategory(passedSubcategory);

            // Break it down into editable parts
            setName(passedSubcategory.name || "");
            setSubcategoryId(passedSubcategory._id || "");
            setImagePreview(passedSubcategory.image?.url || null);
            setCategoryId(passedSubcategory.category?._id || "");
            setCurrentImageUrl(passedSubcategory.image.url || "");
        }
    }, [location.state]);



    // Fetch subcategory and all categories
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch subcategory details
                const allcates = await axios.get(`${backdendUrl}/api/category/allcategories`);
                console.log("Fetched categories:", allcates.data);
                setCategories(allcates.data.categories);

            } catch (err) {
                toast.error("Failed to fetch data");
                console.log(err);
            } finally {
                setFetching(false);
            }
        };

        fetchData();
    }, [subcategoryId]);

    // 🖼️ Handle image preview
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // 🔄 Submit update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        console.log("Submitting update for subcategory:", subcategoryId);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("category", categoryId);
            if (newImageFile) {
                formData.append("image", newImageFile);
            }

            await axios.put(`${backdendUrl}/api/subcategory/update-subcategory/${subcategoryId}`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            });

            toast.success("Subcategory updated successfully");
            navigate("/admin/categories");
        } catch (err) {
            toast.error("Update failed");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <p className="p-6">Loading subcategory...</p>;

    return (
        <div className="p-6">
            <div className="max-w-xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <h1 className="text-2xl font-semibold nunito">Edit Subcategory</h1>
                    <button
                        onClick={() => navigate(-1)}
                        className="bg-blue-600 text-white px-4 py-2 rounded shadow"
                    >
                        Back
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-white p-6 rounded-lg shadow-md max-w-xl mx-auto"
            >
                {/* Category Dropdown */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Select Category</label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full border px-4 py-2 rounded focus:outline-none"
                        required
                    >
                        <option value="">-- Choose Category --</option>
                        {categories?.map((cat) => (
                            <option key={cat._id} value={cat._id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Subcategory Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border px-4 py-2 rounded focus:outline-none focus:ring"
                        required
                    />
                </div>

                {/* Image section */}
                <div className="mb-4">
                    <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 mb-1">
                        Image (current + new)
                    </label>
                    <div className="flex items-center gap-4 mb-3">
                        {currentImageUrl && !imagePreview && (
                            <img
                                src={currentImageUrl}
                                alt="Current"
                                className="w-24 h-24 object-cover rounded border"
                            />
                        )}

                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="New Preview"
                                className="w-24 h-24 object-cover rounded border border-purple-400"
                            />
                        )}
                    </div>
                    <input
                        type="file"
                        id="imageUpload"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`bg-purple-700 text-white px-6 py-2 rounded w-full ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                >
                    {loading ? "Updating..." : "Update Subcategory"}
                </button>
            </form>
        </div>
    );
};

export default EditSubCategory;
