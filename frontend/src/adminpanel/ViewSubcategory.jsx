import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ViewSubcategory = () => {
    const navigate = useNavigate();
    const { categoryId } = useParams(); // get categoryName from URL
    const location = useLocation();
    console.log("Category ID from URL:", location);

    const token = localStorage.getItem("token");
    if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        navigate("/login");
    }

    const [subcategories, setSubcategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [categoryTitle, setCategoryTitle] = useState("");
    const [subcategory, setSubcategory] = useState(null);
    const [isFeatured, setIsFeatured] = useState(false);


    useEffect(() => {
        if (subcategory) {
            setIsFeatured(subcategory.isFeatured);
        }
    }, [subcategory]);

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
            console.log(res, 'del')
            if (res.data.success) {
                toast.success(res.data.message);
                setSubcategories((prev) => prev.filter((scat) => scat._id !== id));
            } else {
                toast.error(res.data.message || "Something went wrong");
            }
        } catch (err) {
            toast.error(err.response.data.message || "Something went wrong");
            console.log(err, 'helo');
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        const fetchSubcategories = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${backdendUrl}/api/subcategory/by-category/${categoryId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });

                console.log(res, 'subcat')
                setSubcategories(res.data.subcategories || []);
                setCategoryTitle(res.data.categoryTitle || "");
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to fetch subcategories");
            } finally {
                setLoading(false);
            }
        };
        fetchSubcategories();
    }, [categoryId]);

    const handleToggleFeature = async (subcatId, newState) => {
        // const newValue = !isFeatured;
        console.log("Toggling isFeatured to:", subcatId, newState);
        setIsFeatured(newState);

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

            console.log("Toggle response:", response);
            if (response.data.success) {
                const updatedSub = response.data.updated;
                setSubcategories(prev =>
                    prev.map(sub =>
                        sub._id === updatedSub._id ? { ...sub, isFeatured: updatedSub.isFeatured } : sub
                    )
                );
            }

            if (!response.data.success) {
                toast.error(response.data.message || "Failed to update feature status");
            }
            // console.log("Updated isFeatured:", data.isFeatured);
        } catch (error) {
            console.error("Error updating isFeatured:", error);
            // optional: revert toggle if error
            setIsFeatured(prev => !prev);
        }
    };

    if (loading) return <div className="text-center py-10">Loading...</div>;

    return (
        <div className="p-6">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-semibold montserrat">
                    {categoryTitle
                        ? `Subcategories of "${categoryTitle}"`
                        : "Manage Subcategories"}
                </h1>

                <div>
                    <Link
                        to={`/admin/categories`}
                        className="bg-blue-700 no-underline text-white px-4 py-2 rounded me-5 shadow-md"
                    >
                        Back
                    </Link>
                    <Link
                        to={`/admin/add-subcategory/${categoryId}`}
                        state={{ categoryName: categoryTitle }}
                        className="bg-purple-700 no-underline text-white px-4 py-2 rounded shadow-md"
                    >
                        Add Subcategory
                    </Link>

                </div>

            </div>

            <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-100 text-left text-sm font-semibold">
                            <th className="px-5 py-3 border-b">Image</th>
                            <th className="px-5 py-3 border-b">Subcategory Name</th>
                            <th className="px-5 py-3 border-b">category Name</th>
                            <th className="px-5 py-3 border-b">slug</th>
                            <th className="px-5 py-3 border-b">Show on Home Screen</th>
                            <th className="px-5 py-3 border-b text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subcategories.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-6 text-gray-500">
                                    No subcategories found.
                                </td>
                            </tr>
                        ) : (
                            subcategories.map((subcategory) => (
                                <tr key={subcategory._id} className="text-sm">
                                    <td className="px-6 py-4 border-b">
                                        <img
                                            src={subcategory.image.url}
                                            className="w-14 h-14 object-cover rounded"
                                            alt={subcategory.name}
                                        />
                                    </td>
                                    <td className="px-5 py-3 border-b">{subcategory.name} <br /> <span className="text-sm text-gray-500 "> {subcategory._id}</span></td>
                                    <td className="px-5 py-3 border-b">
                                        {subcategory.category.name} <br /> <span className="text-sm text-gray-500">{subcategory.category._id}</span>
                                    </td>
                                    <td className="px-5 py-3 border-b">{subcategory.slug}</td>
                                    <td key={subcategory._id} className="px-5 py-3 border-b ">
                                        <button
                                            onClick={() => handleToggleFeature(subcategory._id, !subcategory.isFeatured)}
                                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-300 ${subcategory.isFeatured ? 'bg-indigo-600' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-300 ${subcategory.isFeatured ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>

                                        <span className="ml-2 text-sm font-medium">
                                            {subcategory.isFeatured ? 'ON' : 'OFF'}
                                        </span>
                                    </td>

                                    <td className="px-5 py-3 border-b text-center">
                                        <button
                                            className="text-white bg-blue-500 px-3 py-2 rounded hover:text-blue-700 mx-2"
                                            onClick={() =>
                                                navigate(`/admin/edit-subcategory/${subcategory._id}`, {
                                                    state: { subcategory },
                                                })
                                            }
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(subcategory._id)}
                                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                                        >
                                            {isDeleting ? "Deleting..." : "Delete"}
                                        </button>

                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ViewSubcategory;
