// components/UpdateProfile.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext'; // Assuming this has setUser
import { toast } from 'react-toastify';

const UpdateProfile = () => {
    const { user, setUser } = useAuth(); // We need setUser to update the UI instantly
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Set initial preview if user has an image
    useEffect(() => {
        if (user?.image?.url) {
            setPreview(user.image.url);
        }
    }, [user]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            toast.error('Please select an image to upload.');
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('profilePhoto', file);

        try {
            const response = await axios.put('/api/users/profile/update-photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // Update user in context to show new photo everywhere immediately
            setUser({ ...user, image: { url: response.data.imageUrl } });

            toast.success('Profile photo updated!');
        } catch (error) {
            toast.error('Failed to update photo. Please try again.');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Update Profile Photo</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center gap-4">
                    {preview && (
                        <img src={preview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover" />
                    )}
                    <label htmlFor="photo-upload" className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Choose Photo
                    </label>
                    <input
                        id="photo-upload"
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isSubmitting || !file}
                    className="px-6 py-2 bg-maroon text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Uploading...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
};

export default UpdateProfile;