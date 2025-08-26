import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; // Assuming you have an AuthContext

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const WishlistContext = createContext();

export const useWishlist = () => {
    return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);

    // Get authentication status from your AuthContext
    const { isAuthenticated, token, loading: authLoading } = useAuth();

    const getAuthHeaders = useCallback(() => {
        return token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
    }, [token]);

    // --- Fetch Wishlist (Handles both users and guests) ---
    const fetchWishlist = useCallback(async () => {
        // Wait for authentication check to complete
        if (authLoading) return;

        setLoading(true);
        if (isAuthenticated) {
            // User is logged in, fetch from server
            try {
                const response = await axios.get(`${backdendUrl}/api/wishlist`, getAuthHeaders());
                if (response.data.success) {
                    // The API returns the full wishlist object, which has a 'products' array
                    setWishlist(response.data.wishlist.products || []);
                }
            } catch (error) {
                console.error("Failed to fetch user wishlist", error);
                // Don't show an error toast on initial load, it can be intrusive
                setWishlist([]);
            } finally {
                setLoading(false);
            }
        } else {
            // User is a guest, load from localStorage
            const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist') || '[]');
            setWishlist(guestWishlist);
            setLoading(false);
        }
    }, [isAuthenticated, authLoading, getAuthHeaders]);

    useEffect(() => {
        fetchWishlist();
    }, [fetchWishlist]);


    // --- Add to Wishlist ---
    const addToWishlist = async (product) => {
        console.log(product, 'product in addtowhislist')
        if (!product || !product._id) {
            toast.error("Invalid product data.");
            return;
        }

        const productId = product._id;

        // Prevent duplicates
        if (wishlist.some(item => item._id === productId)) {
            toast.info("This item is already in your wishlist.");
            return;
        }

        if (isAuthenticated) {
            // Authenticated user: Add to server
            try {
                const response = await axios.post(`${backdendUrl}/api/wishlist/add`, { productId }, getAuthHeaders());
                if (response.data.success) {
                    // Add the full product object to local state for immediate UI update
                    setWishlist(prev => [...prev, product]);
                    toast.success("Added to wishlist!");
                } else {
                    toast.error(response.data.message || "Failed to add to wishlist.");
                }
            } catch (error) {
                console.error("Error adding to wishlist:", error);
                toast.error(error.response?.data?.message || "Server error.");
            }
        } else {
            // Guest user: Add to localStorage
            const newGuestWishlist = [...wishlist, product];
            localStorage.setItem('guestWishlist', JSON.stringify(newGuestWishlist));
            setWishlist(newGuestWishlist);
            toast.success("Added to wishlist!");
        }
    };

    // --- Remove From Wishlist ---
    const removeFromWishlist = async (productId) => {
        if (isAuthenticated) {
            // Authenticated user: Remove from server
            try {
                const response = await axios.delete(`${backdendUrl}/api/wishlist/remove/${productId}`, getAuthHeaders());
                if (response.data.success) {
                    setWishlist(prev => prev.filter(item => item._id !== productId));
                    toast.warn("Removed from wishlist.");
                } else {
                    toast.error(response.data.message || "Failed to remove from wishlist.");
                }
            } catch (error) {
                console.error("Error removing from wishlist:", error);
                toast.error(error.response?.data?.message || "Server error.");
            }
        } else {
            // Guest user: Remove from localStorage
            const newGuestWishlist = wishlist.filter(item => item._id !== productId);
            localStorage.setItem('guestWishlist', JSON.stringify(newGuestWishlist));
            setWishlist(newGuestWishlist);
            toast.warn("Removed from wishlist.");
        }
    };

    const isProductInWishlist = (productId) => {
        return wishlist.some(item => item._id === productId);
    };

    // When a user logs in, clear the guest wishlist from localStorage
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.removeItem('guestWishlist');
        }
    }, [isAuthenticated]);


    const value = {
        wishlist,
        addToWishlist,
        removeFromWishlist,
        isProductInWishlist,
        wishlistLoading: loading,
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
