import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaLayerGroup,
  FaImage,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ViewCategory = () => {
  const [categories, setCategories] = useState([]);
  const [isFeatured, setIsFeatured] = useState(false); // Kept your original state logic
  const [searchTerm, setSearchTerm] = useState(""); // Added for UI filtering
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Logic: Redirect if no token (kept from your code)
  useEffect(() => {
    if (!token) {
      toast.error("Authentication token not found. Please log in again.");
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Authentication token not found. Please log in again.");
        navigate("/login");
        return;
      }

      try {
        console.log("Fetching categories...");
        const res = await axios.get(
          `${backdendUrl}/api/category/allcategories`,
          {
            withCredentials: true,
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log(res, "categories data");
        if (res.data.success) {
          setCategories(res.data.categories);
          localStorage.setItem(
            "categories",
            JSON.stringify(res.data.categories)
          );
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    console.log("Deleting category with ID:", id);
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      const res = await axios.delete(
        `${backdendUrl}/api/category/delete-category/${id}`,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.data.success) {
        toast.success("Category deleted successfully");
        setCategories((prev) => prev.filter((cat) => cat._id !== id));
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message || "Something went wrong while deleting."
      );
    }
  };

  const handleToggleFeature = async (catId, newState) => {
    console.log("Toggling isFeatured to:", catId, newState);
    setIsFeatured(newState); // Keeping your logic

    try {
      const response = await axios.put(
        `${backdendUrl}/api/category/isfeatured/${catId}`,
        { isFeatured: newState },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      console.log("Toggle response:", response);
      if (response.data.success) {
        const updatedSub = response.data.updated;
        setCategories((prev) =>
          prev.map((sub) =>
            sub._id === updatedSub._id
              ? { ...sub, isFeatured: updatedSub.isFeatured }
              : sub
          )
        );
        toast.success(`Category ${newState ? "Featured" : "Un-featured"}`);
      } else {
        toast.error(response.data.message || "Failed to update feature status");
      }
    } catch (error) {
      console.error("Error updating isFeatured:", error);
      setIsFeatured((prev) => !prev); // Revert logic
      toast.error("Error updating status");
    }
  };

  // UI Helper: Filter categories based on search
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat._id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 fraunces">
            Categories
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage your product categories and structure.
          </p>
        </div>
        <Link
          to="/admin/categories/add"
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 font-medium no-underline"
        >
          <FaPlus size={14} /> Add Category
        </Link>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Toolbar / Search */}
        <div className="p-5 border-b border-gray-100 flex items-center bg-gray-50/30">
          <div className="relative w-full max-w-md">
            <FaSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Name, Slug or ID..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-auto text-sm text-gray-500">
            Total: <strong>{filteredCategories.length}</strong>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto text-left">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b">
              <tr>
                <th className="px-6 py-4">Image</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">Slug</th>
                <th className="px-6 py-4 text-center">Featured</th>
                <th className="px-6 py-4 text-center">Subcategories</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-gray-500">
                    No categories found.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category._id}
                    className="hover:bg-indigo-50/30 transition-colors group"
                  >
                    {/* Image */}
                    <td className="px-6 py-4">
                      <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                        {category?.image?.url ? (
                          <img
                            src={category.image.url}
                            alt={category.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <FaImage className="text-gray-300 text-xl" />
                        )}
                      </div>
                    </td>

                    {/* Name & ID */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 text-base">
                        {category.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        ID: {category._id}
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        /{category.slug}
                      </span>
                    </td>

                    {/* Featured Toggle */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          handleToggleFeature(
                            category._id,
                            !category.isFeatured
                          )
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                          category.isFeatured ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      >
                        <span
                          className={`${
                            category.isFeatured
                              ? "translate-x-6"
                              : "translate-x-1"
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </button>
                      <div className="text-[10px] text-gray-400 mt-1 font-medium">
                        {category.isFeatured ? "VISIBLE" : "HIDDEN"}
                      </div>
                    </td>

                    {/* Manage Subcategories */}
                    <td className="px-6 py-4 text-center">
                      <Link
                        to={`/admin/categories/${category._id}`}
                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-md hover:bg-yellow-100 border border-yellow-200 transition-colors no-underline"
                      >
                        <FaLayerGroup /> Manage Subs
                      </Link>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/admin/edit-category/${category._id}`)
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash size={16} />
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

export default ViewCategory;
