import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, useNavigation } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import axios from "axios";
import { toast } from "react-toastify";
import ProfilePhotoModal from "./ProfilePhotoModal";
import OrderHistory from "../order/OrderHistory";

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

const TABS = [
    { id: "overview", label: "Profile" },
    { id: "orders", label: "Orders" },
    // { id: 'Home', label: "Home" }
];

const ProfilePage = () => {
    // Get updater and logout function from context
    const { user, logout } = useAuth();
    console.log(user, 'user')
    // const query = useQuery();
    const navigate = useNavigate();
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const token = localStorage.getItem("token"); // This gets the JWT stored during login
    // --- STATE MANAGEMENT ---
    const [activeTab, setActiveTab] = useState("overview");
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    // ... rest of your state hooks ...
    const [isEditing, setIsEditing] = useState(false);
    const [editableData, setEditableData] = useState({ name: '', mobile: '', email: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUser] = useState(user)

    useEffect(() => {
        const tabFromQuery = query.get("tab");
        if (tabFromQuery && TABS.some(t => t.id === tabFromQuery)) {
            setActiveTab(tabFromQuery);
        }

        const fetchUserProfile = async () => {
            const token = localStorage.getItem("token");

            if (!token) {
                toast.error("Authentication token not found. Please log in again.");
                navigate("/login");
                return;
            }

            if (!user?._id) return;

            setIsLoading(true);

            try {
                const { data } = await axios.get(`${backdendUrl}/api/auth/get-user/${user._id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    withCredentials: true,
                });
                setProfileData(data.user);
                setEditableData({ name: data.user.name, email: data.user.email, mobile: data.user.mobile });
            } catch (error) {
                toast.error("Could not fetch profile details.");
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, [user?._id, location.search]); // ✅ NO query here, just location.search

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveChanges = async () => {
        try {
            const response = await axios.put(`${backdendUrl}/api/auth/profile/update-detail`, editableData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            console.log(response, 'data')
            if (response.data.success) {
                setProfileData(response.data.user);
                setUser(response.data.user);
                toast.success("Profile updated successfully!");
                setIsEditing(false);
            }
        } catch (error) {
            console.log(error, 'errorssss')
            toast.error("Failed to update profile.");
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditableData({ name: profileData.name, email: profileData.email, mobile: profileData.mobile });
    };

    return (
        <div className="max-w-full mt-34 mb-20">
            {/* The rest of your JSX remains the same, it will now use the decrypted 'user' object */}
            <div className="flex flex-col md:flex-row overflow-hidden">
                {/* --- SIDEBAR --- */}
                <aside className="w-full md:w-1/5 p-6 border-r">
                    <div className="flex items-center mb-8">
                        <div className="ml-4">
                            <div className="text-base font-semibold text-gray-800">{user?.name}</div>
                            <div className="text-sm text-gray-500 truncate">{user?.email}</div>
                        </div>
                    </div>
                    <nav className="flex flex-col gap-3">
                        {TABS.map(tab => (
                            <button key={tab.id} onClick={() => navigate(`?tab=${tab.id}`)} className={`text-left px-4 py-2 transition text-sm font-medium ${activeTab === tab.id ? ' text-maroon border-1 border-rose-900 bg-rose-900/10 cursor-pointer' : 'text-gray-700 hover:bg-gray-200 border-1 border-gray-900'}`}>
                                {tab.label}
                            </button>
                        ))}
                        <button onClick={logout} className="mt-6 text-left px-4 py-2 text-red-600 border-1 border-red-500 cursor-pointer hover:bg-red-100 text-sm font-medium">
                            Log Out
                        </button>
                    </nav>
                </aside>
                {/* --- MAIN CONTENT --- */}
                <main className="flex-1 p-8">
                    {activeTab === "overview" && (
                        <div>
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Account Details</h2>
                                {isEditing ? (
                                    <div className="flex gap-2">
                                        <button onClick={handleCancelEdit} className="px-4 py-2 text-sm border bg-white hover:bg-gray-100">Cancel</button>
                                        <button onClick={handleSaveChanges} className="px-4 py-2 text-sm bg-maroon text-white hover:bg-opacity-90">Save Changes</button>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsEditing(true)} className="px-4 py-2 text-sm border bg-white hover:bg-gray-100">Edit Profile</button>
                                )}
                            </div>
                            {isLoading ? (
                                <p>Loading profile...</p>
                            ) : profileData && (
                                <div className="space-y-6 text-gray-700">
                                    <div className="flex flex-col sm:flex-row items-center gap-6">
                                        {/* 1. Add 'relative' to the parent container */}
                                        <div className="relative w-24 h-24">
                                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold overflow-hidden">
                                                {profileData.image?.url ? (
                                                    <img src={profileData.image.url} alt={profileData.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    profileData.name?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            {/* 2. Add the absolute positioned pencil button */}
                                            <button
                                                onClick={() => setIsModalOpen(true)}
                                                className="absolute bottom-0 right-0 bg-white p-2 rounded-full border shadow-md hover:bg-gray-100 transition"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-lg font-semibold">Profile Photo</p>
                                            {/* 3. (Optional) Update the descriptive text */}
                                            <p className="text-sm text-gray-500">Click the pencil icon to change your photo.</p>
                                        </div>
                                    </div>
                                    <div className='mb-2'>
                                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                                        {isEditing ? (
                                            <input type="text" name="name" value={editableData.name} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 shadow-sm p-2" />
                                        ) : (
                                            <p className="text-lg">{profileData.name}</p>
                                        )}
                                    </div>
                                    <div className='mb-2'>
                                        <label className="text-sm font-medium text-gray-500">Email Address</label>

                                        {
                                            isEditing ? (
                                                <input type="text" name="email" value={editableData.email} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 shadow-sm p-2" />
                                            ) : (
                                                <p className="text-lg ">{profileData.email}</p>
                                            )
                                        }
                                    </div>
                                    <div className='mb-2'>
                                        <label className="text-sm font-medium text-gray-500">Mobile Number</label>
                                        {isEditing ? (
                                            <input type="tel" name="mobile" value={editableData.mobile} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 shadow-sm p-2" />
                                        ) : (
                                            <p className="text-lg">{profileData.mobile || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    {activeTab === "orders" && (
                        <div>
                            <OrderHistory />
                        </div>
                    )}

                </main>
            </div>
            <ProfilePhotoModal isOpen={isModalOpen} onRequestClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default ProfilePage;