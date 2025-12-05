import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
    Search,
    Trash2,
    Edit,
    User,
    Mail,
    Shield,
    Calendar,
    Loader2,
    Check,
    X,
    MoreVertical
} from "lucide-react";

// Hardcoded for preview environment compatibility
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ViewUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Handle Edit User functionality
    // const handleEditUser = (id) => {
    //     // Placeholder for edit functionality
    //     toast.info(`Edit mode for user ID: ${id}`);
    // };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            console.log("🗑️ Deleting user with ID:", id);
            // Fixed: Changed 'apiurl' to 'backdendUrl' to match defined constant
            const res = await axios.delete(`${backdendUrl}/api/auth/delete-user/${id}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (res.data.success) {
                console.log("✅ User deleted successfully");
                setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
                toast.success("User deleted successfully!");
            } else {
                console.error("❌ Deletion failed:", res.data);
                toast.error("Failed to delete user.");
            }
        } catch (error) {
            console.error("🚨 Error deleting user:", error.message);
            toast.error("Something went wrong while deleting user.");
        }
    };

    // Toggle User Status functionality (Local state update only based on your snippet)
    const handleToggleStatus = (id) => {
        const updatedUsers = users.map((user) =>
            user._id === id
                ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
                : user
        );
        setUsers(updatedUsers);
        toast.success("User status updated (Local)");
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${backdendUrl}/api/auth/allusers`, {
                    withCredentials: true,
                });
                console.log(res.data, "res");
                if (res.data?.success && Array.isArray(res.data.users)) {
                    // Ensure status exists for the toggle to work
                    const usersWithStatus = res.data.users.map(u => ({
                        ...u,
                        status: u.status || "Active"
                    }));
                    setUsers(usersWithStatus);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error("Failed to fetch users", error);
                toast.error("Failed to load users");
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Helper: Get initials for avatar
    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    };

    // Helper: Filter users
    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 fraunces">
                        User Management
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        View, manage, and organize system users.
                    </p>
                </div>
                <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-sm text-gray-600">
                    Total Users: <strong className="text-indigo-600">{users.length}</strong>
                </div>
            </div>

            {/* Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Search Toolbar */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by Name or Email..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto text-left">
                        <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-semibold border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role</th>
                                {/* <th className="px-6 py-4">Status</th> */}
                                <th className="px-6 py-4">Joined Date</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-12 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <User className="text-gray-300 mb-2" size={32} />
                                            <p>No users found matching your search.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user._id} className="hover:bg-indigo-50/30 transition-colors group">
                                        {/* User Info */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold border border-indigo-200">
                                                    {getInitials(user.name)}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-gray-900 text-sm">
                                                        {user.name}
                                                    </div>
                                                    <div className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Mail size={10} /> {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role */}
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'admin'
                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                : 'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                <Shield size={10} />
                                                <span className="capitalize">{user.role || 'User'}</span>
                                            </span>
                                        </td>

                                        {/* Status Toggle */}
                                        {/* <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(user._id)}
                                                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${user.status === "Active" ? "bg-green-500" : "bg-gray-300"
                                                    }`}
                                            >
                                                <span
                                                    className={`${user.status === "Active" ? "translate-x-4" : "translate-x-1"
                                                        } inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform`}
                                                />
                                            </button>
                                            <span className="ml-2 text-xs text-gray-500">
                                                {user.status === "Active" ? "Active" : "Inactive"}
                                            </span>
                                        </td> */}

                                        {/* Joined Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(user.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric'
                                                })}
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-start">
                                            <div className="flex items-center gap-2">
                                                {/* <button
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors tooltip"
                                                    onClick={() => handleEditUser(user._id)}
                                                    title="Edit User"
                                                >
                                                    <Edit size={16} />
                                                </button> */}
                                                <button
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors tooltip"
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={16} />
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

export default ViewUsers;