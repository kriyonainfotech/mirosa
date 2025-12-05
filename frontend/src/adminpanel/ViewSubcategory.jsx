import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    ArrowLeft,
    Image as ImageIcon,
    Tag,
    Loader2
} from "lucide-react";

// Hardcoded for preview environment compatibility
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ViewSubcategory = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const location = useLocation();

    // Auth Check
    const token = localStorage.getItem("token");
    useEffect(() => {
        if (!token) {
            toast.error("Authentication token not found. Please log in again.");
            navigate("/login");
        }
    }, [token, navigate]);

    // State
    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categoryTitle, setCategoryTitle] = useState("");

    // UI State
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch Data
    useEffect(() => {
        const fetchSubcategories = async () => {
            try {
                const token = localStorage.getItem("token");
                // Guard against missing token before call
                if (!token) return;

                const res = await axios.get(`${backdendUrl}/api/subcategory/by-category/${categoryId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });

                console.log(res, 'subcat');
                setSubcategories(res.data.subcategories || []);
                setCategoryTitle(res.data.categoryTitle || "");
            } catch (err) {
                console.error(err);
                toast.error(err.response?.data?.message || "Failed to fetch subcategories");
            } finally {
                setLoading(false);
            }
        };
        fetchSubcategories();
    }, [categoryId]);

    // Handlers
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
        setIsDeleting(true);
        try {
            const res = await axios.delete(`${backdendUrl}/api/subcategory/delete-subcategory/${id}`, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (res.data.success) {
                toast.success(res.data.message);
                setSubcategories((prev) => prev.filter((scat) => scat._id !== id));
            } else {
                toast.error(res.data.message || "Something went wrong");
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
            console.log(err, 'helo');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleFeature = async (subcatId, currentStatus) => {
        const newState = !currentStatus;

        // Optimistic UI update
        setSubcategories(prev =>
            prev.map(sub => sub._id === subcatId ? { ...sub, isFeatured: newState } : sub)
        );

        try {
            const response = await axios.put(
                `${backdendUrl}/api/subcategory/isfeatured/${subcatId}`,
                { isFeatured: newState },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                    withCredentials: true
                }
            );

            if (response.data.success) {
                const updatedSub = response.data.updated;
                // Confirm state with server response
                setSubcategories(prev =>
                    prev.map(sub =>
                        sub._id === updatedSub._id ? { ...sub, isFeatured: updatedSub.isFeatured } : sub
                    )
                );
                toast.success(`Subcategory ${newState ? "Visible" : "Hidden"}`);
            } else {
                // Revert on failure
                setSubcategories(prev =>
                    prev.map(sub => sub._id === subcatId ? { ...sub, isFeatured: currentStatus } : sub)
                );
                toast.error(response.data.message || "Failed to update feature status");
            }
        } catch (error) {
            console.error("Error updating isFeatured:", error);
            // Revert on error
            setSubcategories(prev =>
                prev.map(sub => sub._id === subcatId ? { ...sub, isFeatured: currentStatus } : sub)
            );
            toast.error("Error updating status");
        }
    };

    // Filter Logic
    const filteredSubcategories = subcategories.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub._id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50/50">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
                <p className="text-gray-500 font-medium">Loading Users...</p>
            </div>
        );
    }

    return (
        <div className="p-6 min-h-screen bg-gray-50/50 font-sans">

            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link
                            to={`/admin/categories`}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm no-underline"
                            title="Back to Categories"
                        >
                            <ArrowLeft size={16} />
                        </Link>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 fraunces m-0">
                            {categoryTitle ? `Subcategories: ${categoryTitle}` : "Manage Subcategories"}
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-11 mt-1">
                        Manage structure and visibility for this category.
                    </p>
                </div>

                <Link
                    to={`/admin/add-subcategory/${categoryId}`}
                    state={{ categoryName: categoryTitle }}
                    className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 font-medium no-underline w-fit"
                >
                    <Plus size={16} /> Add Subcategory
                </Link>
            </div>

            {/* --- Content Card --- */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Toolbar / Search */}
                <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50/30">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Name or ID..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                        Total Items: <strong className="text-gray-900">{filteredSubcategories.length}</strong>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">Image</th>
                                <th className="px-6 py-4">Subcategory Name</th>
                                <th className="px-6 py-4">Parent Category</th>
                                <th className="px-6 py-4">Slug</th>
                                <th className="px-6 py-4 text-center">Featured</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                            {filteredSubcategories.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Tag className="text-gray-300 mb-2" size={32} />
                                            <p>No subcategories found.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredSubcategories.map((subcategory) => (
                                    <tr
                                        key={subcategory._id}
                                        className="hover:bg-indigo-50/30 transition-colors group"
                                    >
                                        {/* Image Column */}
                                        <td className="px-6 py-4">
                                            <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center relative">
                                                {subcategory.image && subcategory.image.url ? (
                                                    <img
                                                        src={subcategory.image.url}
                                                        className="w-full h-full object-cover"
                                                        alt={subcategory.name}
                                                    />
                                                ) : (
                                                    <ImageIcon className="text-gray-300" size={20} />
                                                )}
                                            </div>
                                        </td>

                                        {/* Name Column */}
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 text-base">
                                                {subcategory.name}
                                            </div>
                                            <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                ID: {subcategory._id}
                                            </div>
                                        </td>

                                        {/* Parent Category Column */}
                                        <td className="px-6 py-4">
                                            {subcategory.category ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-700 font-medium bg-gray-100 px-2 py-1 rounded-md">
                                                            {subcategory.category.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-400 font-mono mt-1">
                                                        Parent ID: {subcategory.category._id}
                                                    </div>
                                                </>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">No Parent</span>
                                            )}
                                        </td>

                                        {/* Slug Column */}
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-indigo-600 font-mono bg-indigo-50 px-2 py-1 rounded border border-indigo-100">
                                                /{subcategory.slug}
                                            </span>
                                        </td>

                                        {/* Featured/Status Toggle Column */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleToggleFeature(subcategory._id, subcategory.isFeatured)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${subcategory.isFeatured ? 'bg-indigo-600' : 'bg-gray-200'
                                                    }`}
                                            >
                                                <span
                                                    className={`${subcategory.isFeatured ? 'translate-x-6' : 'translate-x-1'
                                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                                                />
                                            </button>
                                            <div className="text-[10px] text-gray-400 mt-1 font-medium">
                                                {subcategory.isFeatured ? 'VISIBLE' : 'HIDDEN'}
                                            </div>
                                        </td>

                                        {/* Actions Column */}
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                    onClick={() =>
                                                        navigate(`/admin/edit-subcategory/${subcategory._id}`, {
                                                            state: { subcategory },
                                                        })
                                                    }
                                                    title="Edit Subcategory"
                                                >
                                                    <Edit size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDelete(subcategory._id)}
                                                    disabled={isDeleting}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                    title="Delete Subcategory"
                                                >
                                                    {isDeleting ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <Trash2 size={16} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ViewSubcategory;