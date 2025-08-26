import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify"; // Optional for better alerts
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ViewUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Handle Edit User functionality
    const handleEditUser = (id) => {
        alert(`Editing user with ID: ${id}`);
        // You could open a modal or navigate to an edit page here
    };
    const handleDeleteUser = async (id) => {
        try {
            console.log("🗑️ Deleting user with ID:", id);
            const res = await axios.delete(`${apiurl}/auth/deleteUser/${id}`);

            if (res.data.success) {
                console.log("✅ User deleted successfully");
                setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
                toast.success("User deleted successfully!"); // or alert
            } else {
                console.error("❌ Deletion failed:", res.data);
                toast.error("Failed to delete user.");
            }
        } catch (error) {
            console.error("🚨 Error deleting user:", error.message);
            toast.error("Something went wrong while deleting user.");
        }
    };

    // Toggle User Status functionality
    const handleToggleStatus = (id) => {
        const updatedUsers = users.map((user) =>
            user.id === id
                ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
                : user
        );
        setUsers(updatedUsers);
    };

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await axios.get(`${backdendUrl}/api/auth/allusers`, {
                    withCredentials: true,
                });
                console.log(res.data, "res");
                if (res.data?.success && Array.isArray(res.data.users)) {
                    setUsers(res.data.users);
                } else {
                    setUsers([]);
                }
            } catch (error) {
                console.error("Failed to fetch dashboard counts", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold mb-6 fraunces">Manage Users</h1>

            {/* Users Table */}
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                        <table className="min-w-full table-auto">
                            <thead>
                                <tr className="bg-gray-100 text-left text-sm font-semibold">
                                    <th className="px-5 py-3 border-b">ID</th>
                                    <th className="px-5 py-3 border-b">Name</th>
                                    <th className="px-5 py-3 border-b">Email</th>
                                    <th className="px-5 py-3 border-b">Role</th>
                                    <th className="px-5 py-3 border-b">Created At</th>
                                    <th className="px-5 py-3 border-b text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users?.map((user, index) => (
                                    <tr key={user._id} className="text-sm">
                                        <td className="px-6 py-4 border-b">{++index}</td>
                                        <td className="px-5 py-3 border-b">{user.name}</td>
                                        <td className="px-5 py-3 border-b">{user.email}</td>
                                        <td className="px-5 py-3 border-b capitalize">{user.role}</td>
                                        <td className="px-5 py-3 border-b">
                                            {new Date(user.createdAt).toLocaleDateString()} {/* Or .toLocaleString() */}
                                        </td>
                                        <td className="px-5 py-3 border-b text-center">
                                            <button
                                                className="text-white bg-red-500 py-2 px-3 rounded-lg hover:bg-red-600"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                    </div>
                </>
            )}
        </div>
    );
};

export default ViewUsers;
