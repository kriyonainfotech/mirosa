import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext'; // Or your context path
const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ProfilePhotoModal = ({ isOpen, onRequestClose }) => {
    const { user, setUser } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // Set initial preview when modal opens
        setPreview(user?.image?.url || '');
    }, [isOpen, user]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const token = localStorage.getItem("token"); // This gets the JWT stored during login

    if (!token) {
        // Handle case where token is missing (e.g., user not logged in or session expired)
        setError("Authentication token not found. Please log in again.");
        toast.error("Authentication token not found. Please log in again.");
        navigate("/login"); // Redirect to login page
        return;
    }

    // const handleUpload = async () => {
    //     if (!file) return;
    //     setIsUploading(true);

    //     const formData = new FormData();
    //     formData.append('profilePhoto', file);

    //     console.log('API TOUCHED!!!!!!!!!!!!!')
    //     try {
    //         const response = await axios.put(`${backdendUrl}/api/auth/profile/update-photo`, formData, {
    //             withCredentials: true,
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         });

    //         console.log(response, 'data')
    //         if (response.data.success) {
    //             // setUser({ ...user, image: { url: response.data.imageUrl } });

    //             toast.success('Photo updated!');
    //         }
    //         onRequestClose(); // Close modal on success
    //     } catch (error) {
    //         console.log(error, 'error')
    //         toast.error('Upload failed. Please try again.');
    //     } finally {
    //         setIsUploading(false);
    //     }
    // };

    const handleUpload = async () => {
        if (!file) return;
        setIsUploading(true);

        const formData = new FormData();
        formData.append('profilePhoto', file);

        try {
            const response = await axios.put(`${backdendUrl}/api/auth/profile/update-photo`, formData, {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.data.success) {
                // ✅ Fetch updated user data
                const { data } = await axios.get(`${backdendUrl}/api/auth/check-auth`, {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                });

                // 🔁 Update context with fresh user
                setUser(prev => ({ ...prev, image: { ...data.user.image } }));
                toast.success('Photo updated!');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
                onRequestClose(); // Close modal on success
            }
        } catch (error) {
            console.error(error);
            toast.error('Upload failed. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };


    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete your photo?')) return;
        setIsUploading(true);
        try {
            await axios.delete('/api/users/profile/delete-photo');
            setUser({ ...user, image: null });
            toast.success('Photo deleted!');
            onRequestClose(); // Close modal on success
        } catch (error) {
            toast.error('Failed to delete photo.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Update Profile Photo"
            className="absolute top-100 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl p-8 w-full max-w-md z-50"
            overlayClassName="fixed inset-0 bg-black/60 bg-opacity-60"
        >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profile Photo</h2>
            <div className="flex flex-col items-center gap-6">
                {/* Image Preview */}
                <div className="w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {preview ? (
                        <img src={preview} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-gray-400">Image Preview</span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex w-full gap-4">
                    <label htmlFor="photo-upload" className="flex-1 text-center cursor-pointer bg-gray-100 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200">
                        Choose Photo
                    </label>
                    <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />

                    {user?.image?.url && (
                        <button onClick={handleDelete} disabled={isUploading} className="flex-1 bg-red-100 text-red-700 px-4 py-2 rounded-md font-semibold hover:bg-red-200 transition disabled:opacity-50">
                            Delete
                        </button>
                    )}
                </div>

                {/* Main Action and Cancel Buttons */}
                <div className="flex w-full justify-end gap-4 border-t pt-6 mt-4">
                    <button onClick={onRequestClose} className="px-4 py-2 text-gray-700">Cancel</button>
                    <button
                        onClick={handleUpload}
                        disabled={!file || isUploading}
                        className="px-6 py-2 bg-maroon text-white rounded-md font-semibold disabled:bg-maroon/50"
                    >
                        {isUploading ? 'Uploading...' : 'Save'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default ProfilePhotoModal;