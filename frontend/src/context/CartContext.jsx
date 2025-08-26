// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]); // This holds the current cart items
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);

    const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

    // Helper to get auth token
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    // --- Core Fetch Cart Function ---
    const fetchUserCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            // If no token, load guest cart from localStorage
            const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            setCartItems(guestCart);
            return;
        }

        setCartLoading(true);
        setCartError(null);
        try {
            const response = await axios.get(`${backdendUrl}/api/cart/getUserCart`, getAuthHeaders());
            if (response.data.success) {
                setCartItems(response.data.cart.items || []);
            } else {
                setCartError(response.data.message || 'Failed to fetch cart.');
                toast.error(response.data.message || 'Failed to fetch cart.');
                setCartItems([]); // Clear cart on error
            }
        } catch (error) {
            console.error('Error fetching user cart:', error);
            setCartError(error.response?.data?.message || 'Server error fetching cart.');
            toast.error(error.response?.data?.message || 'Server error fetching cart.');
            setCartItems([]); // Clear cart on error
        } finally {
            setCartLoading(false);
        }
    }, [backdendUrl]); // Memoize fetchUserCart

    // --- Add to Cart ---
    const addToCart = async (productData, variantData, quantity, selectedSize) => {
        if (!productData || !variantData || !quantity || quantity < 1) {
            toast.error("Invalid product or variant data to add to cart.");
            return;
        }

        const itemToAdd = {
            productId: productData._id,
            variantId: variantData._id,
            quantity: quantity,
            name: `${productData.title}`, // Example name
            mainImage: productData.mainImage || variantData.images?.[0], // Image URL
            variantDetails: { // Snapshot of variant details
                material: variantData.material,
                purity: variantData.purity,
                selectedSize: selectedSize || null,
                price: variantData.price
            }
        };

        const token = localStorage.getItem('token');

        if (token) {
            // Authenticated user: Add to server cart
            setCartLoading(true);
            try {
                const response = await axios.post(`${backdendUrl}/api/cart/addToCart`, itemToAdd, getAuthHeaders());

                console.log(response, "response data")
                if (response.data.success) {
                    setCartItems(response.data.cart.items);
                    toast.success('Item added to cart!');
                } else {
                    toast.error(response.data.message || 'Failed to add item to cart.');
                }
            } catch (error) {
                console.error('Error adding to server cart:', error);
                toast.error(error.response?.data?.message || 'Server error adding item to cart.');
            } finally {
                setCartLoading(false);
            }
        } else {
            // Guest user: Add to localStorage cart
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const existingItemIndex = guestCart.findIndex(item =>
                item.productId === itemToAdd.productId && item.variantId === itemToAdd.variantId
            );

            if (existingItemIndex > -1) {
                // Update quantity of existing item
                guestCart[existingItemIndex].quantity += quantity;
            } else {
                // Add new item
                guestCart.push(itemToAdd);
            }

            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            setCartItems(guestCart);
            toast.success('Item added to cart (guest mode)!');
        }
    };

    // --- Remove From Cart ---
    const removeFromCart = async (itemIdToRemove) => {
        const token = localStorage.getItem('token');

        if (token) {
            // Authenticated user: Remove from server cart
            setCartLoading(true);
            try {
                const response = await axios.delete(`${backdendUrl}/api/cart/remove/${itemIdToRemove}`, getAuthHeaders());
                console.log("remove item from cart", response)
                if (response.data.success) {
                    setCartItems(response.data.cart.items);
                    toast.success('Item removed from cart!');
                } else {
                    toast.error(response.data.message || 'Failed to remove item from cart.');
                }
            } catch (error) {
                console.error('Error removing from server cart:', error);
                toast.error(error.response?.data?.message || 'Server error removing item from cart.');
            } finally {
                setCartLoading(false);
            }
        } else {
            // Guest user: Remove from localStorage cart
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            // For guest cart, itemIdToRemove is variantId
            guestCart = guestCart.filter(item => item.variantId !== itemIdToRemove);
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            setCartItems(guestCart);
            toast.success('Item removed from cart!');
        }
    };

    // --- Update Cart Item Quantity ---
    const updateCartItemQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            await removeFromCart(itemId); // Remove if quantity becomes 0
            return;
        }

        const token = localStorage.getItem('token');

        if (token) {
            // Authenticated user: Update server cart
            setCartLoading(true);
            try {
                const response = await axios.put(`${backdendUrl}/api/cart/updateCart/${itemId}`, { quantity: newQuantity }, getAuthHeaders());

                console.log("update cart token response:", response)
                if (response.data.success) {
                    setCartItems(response.data.cart.items);
                    toast.success('Cart updated!');
                } else {
                    toast.error(response.data.message || 'Failed to update cart.');
                }
            } catch (error) {
                console.error('Error updating server cart:', error);
                toast.error(error.response?.data?.message || 'Server error updating cart.');
            } finally {
                setCartLoading(false);
            }
        } else {
            // Guest user: Update localStorage cart
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const itemIndex = guestCart.findIndex(item => item.variantId === itemId); // Find by variantId for guest cart
            if (itemIndex > -1) {
                guestCart[itemIndex].quantity = newQuantity;
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                setCartItems(guestCart);
                toast.success('Cart updated!');
            }
        }
    };

    // --- Clear Cart ---
    const clearCart = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            // TODO: For authenticated users, implement a backend API to clear their cart in DB
            // For now, it will only clear local state for authenticated users.
            // await axios.post(`${backdendUrl}/api/cart/clear`, {}, getAuthHeaders());
            console.log("Clear Cart for authenticated user not yet fully implemented in backend.");
        }
        localStorage.removeItem('guestCart');
        setCartItems([]);
        // toast.info("Cart cleared!");
    };


    // --- Cart Merging Logic (on successful login/register) ---
    // This function should be called right after a user successfully logs in or registers
    const mergeGuestCartWithUserCart = useCallback(async () => {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const token = localStorage.getItem('token'); // Check for token *after* user has logged in/registered

        if (guestCart.length > 0 && token) {
            setCartLoading(true);
            try {
                const response = await axios.post(`${backdendUrl}/api/cart/merge`, { guestCartItems: guestCart }, getAuthHeaders());
                if (response.data.success) {
                    localStorage.removeItem('guestCart'); // Clear guest cart after successful merge
                    setCartItems(response.data.cart.items);
                    toast.success('Your guest cart has been merged!');
                } else {
                    toast.warn(response.data.message || 'Failed to merge guest cart.');
                }
            } catch (error) {
                console.error('Error merging guest cart:', error);
                toast.error(error.response?.data?.message || 'Server error merging guest cart.');
            } finally {
                setCartLoading(false);
            }
        }
    }, [backdendUrl]); // Memoize the callback


    // --- Effects ---
    useEffect(() => {
        fetchUserCart();
        // The merge logic should also be explicitly triggered after login/registration
        // You'll need to call mergeGuestCartWithUserCart from your login/register component
    }, [fetchUserCart]);


    // Context value
    const cartContextValue = {
        cartItems,
        cartLoading,
        cartError,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        clearCart,
        fetchUserCart, // Expose for external re-fetching if needed
        mergeGuestCart: mergeGuestCartWithUserCart, // Expose for login/register flow
        cartTotal: cartItems.reduce((acc, item) => acc + (item.quantity * (item.variantDetails?.price || 0)), 0),
        cartItemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>
    );
};

// src/contexts/CartContext.jsx
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { AuthContext } from './AuthContext'; // ✅ Import AuthContext

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//     // ✅ Get isAuthenticated, token, and loadingAuth from AuthContext
//     const { isAuthenticated, token, loadingAuth } = useContext(AuthContext);

//     const [cartItems, setCartItems] = useState([]);
//     const [cartLoading, setCartLoading] = useState(true); // Initial state set to true as cart loads immediately
//     const [cartError, setCartError] = useState(null);

//     const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

//     // Helper to get auth headers (now depends on context's token)
//     const getAuthHeaders = useCallback(() => {
//         return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
//     }, [token]); // Dependency on the 'token' from AuthContext


//     // --- Core Fetch Cart Function ---
//     const fetchUserCart = useCallback(async () => {
//         // ✅ IMPORTANT: Wait until AuthContext has finished loading the user status
//         if (loadingAuth) {
//             console.log("CartContext: Waiting for AuthContext to load user status...");
//             return;
//         }

//         setCartLoading(true);
//         setCartError(null);

//         if (!isAuthenticated) { // ✅ Use isAuthenticated from AuthContext
//             console.log("CartContext: User is guest or session expired, loading guest cart.");
//             const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//             setCartItems(guestCart);
//             setCartLoading(false);
//             return;
//         }

//         // --- Only attempt to fetch from backend if isAuthenticated is true ---
//         console.log("CartContext: User is authenticated, fetching cart from server.");
//         try {
//             // Your backend route name was /api/cart/getUserCart, changed to /api/cart based on your routes/cartRoutes.js
//             // If your backend route is still /api/cart/getUserCart, please change it back.
//             const response = await axios.get(`${backdendUrl}/api/cart`, getAuthHeaders());
//             if (response.data.success) {
//                 setCartItems(response.data.cart.items || []);
//             } else {
//                 setCartError(response.data.message || 'Failed to fetch cart.');
//                 toast.error(response.data.message || 'Failed to fetch cart.');
//                 setCartItems([]);
//             }
//         } catch (error) {
//             console.error('Error fetching user cart:', error);
//             // ✅ Handle 401 (Unauthorized) specifically: means token was invalid/expired
//             if (error.response?.status === 401) {
//                 // AuthContext should have ideally already cleared the token.
//                 // Here, we ensure the cart reverts to guest mode.
//                 toast.info("Your session expired. Please log in again to access your saved cart. Displaying guest cart.");
//                 setCartItems(JSON.parse(localStorage.getItem('guestCart') || '[]')); // Load guest cart
//                 // AuthContext's loadUserFromStorage should handle clearing local storage
//             } else {
//                 setCartError(error.response?.data?.message || 'Server error fetching cart.');
//                 toast.error(error.response?.data?.message || 'Server error fetching cart.');
//                 setCartItems([]);
//             }
//         } finally {
//             setCartLoading(false);
//         }
//     }, [isAuthenticated, loadingAuth, backdendUrl, getAuthHeaders]); // ✅ Dependencies updated

//     // --- Add to Cart ---
//     const addToCart = useCallback(async (productData, variantData, quantity) => {
//         if (!productData || !variantData || !quantity || quantity < 1) {
//             toast.error("Invalid product or variant data to add to cart.");
//             return;
//         }
//         if (!variantData.stock || variantData.stock < quantity) { // Check stock before even trying to add
//             toast.error(`Only ${variantData.stock} items available in stock.`);
//             return;
//         }


//         const itemToAdd = {
//             productId: productData._id,
//             variantId: variantData._id,
//             quantity: quantity,
//             name: `${productData.title} - ${variantData.material} ${variantData.purity}`,
//             mainImage: productData.mainImage || variantData.images?.[0],
//             variantDetails: {
//                 material: variantData.material,
//                 purity: variantData.purity,
//                 size: variantData.size,
//                 sku: variantData.sku,
//                 price: variantData.price,
//                 stock: variantData.stock, // Include stock in snapshot for guest cart stock check
//             }
//         };

//         if (isAuthenticated) { // ✅ Use isAuthenticated from AuthContext
//             setCartLoading(true);
//             try {
//                 // Ensure your backend endpoint is correct here (e.g., /api/cart/add or /api/cart)
//                 const response = await axios.post(`${backdendUrl}/api/cart/add`, itemToAdd, getAuthHeaders());
//                 if (response.data.success) {
//                     setCartItems(response.data.cart.items);
//                     toast.success('Item added to cart!');
//                 } else {
//                     toast.error(response.data.message || 'Failed to add item to cart.');
//                 }
//             } catch (error) {
//                 console.error('Error adding to server cart:', error);
//                 // ✅ Handle 401 specifically: token expired during add to cart operation
//                 if (error.response?.status === 401) {
//                     toast.info("Your session expired. Item added to guest cart locally.");
//                     // Revert to guest cart logic for this item
//                     let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//                     const existingItemIndex = guestCart.findIndex(item => item.productId === itemToAdd.productId && item.variantId === itemToAdd.variantId);
//                     if (existingItemIndex > -1) { guestCart[existingItemIndex].quantity += quantity; } else { guestCart.push(itemToAdd); }
//                     localStorage.setItem('guestCart', JSON.stringify(guestCart));
//                     setCartItems(guestCart); // Update cartItems state with guest cart
//                 } else {
//                     toast.error(error.response?.data?.message || 'Server error adding item to cart.');
//                 }
//             } finally {
//                 setCartLoading(false);
//             }
//         } else { // Guest user: Add to localStorage cart
//             let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//             const existingItemIndex = guestCart.findIndex(item => item.productId === itemToAdd.productId && item.variantId === itemToAdd.variantId);

//             if (existingItemIndex > -1) {
//                 // Update quantity of existing item, check stock for guest cart
//                 if (guestCart[existingItemIndex].quantity + quantity > itemToAdd.variantDetails.stock) {
//                     toast.error(`Adding ${quantity} exceeds available stock (${itemToAdd.variantDetails.stock}).`);
//                     return;
//                 }
//                 guestCart[existingItemIndex].quantity += quantity;
//             } else {
//                 guestCart.push(itemToAdd);
//             }

//             localStorage.setItem('guestCart', JSON.stringify(guestCart));
//             setCartItems(guestCart);
//             toast.success('Item added to cart (guest mode)!');
//         }
//     }, [isAuthenticated, backdendUrl, getAuthHeaders]); // ✅ Dependencies updated


//     // --- Remove From Cart ---
//     const removeFromCart = useCallback(async (itemIdToRemove) => {
//         if (isAuthenticated) { // ✅ Use isAuthenticated from AuthContext
//             setCartLoading(true);
//             try {
//                 // Backend endpoint is /api/cart/remove/:itemId
//                 const response = await axios.delete(`${backdendUrl}/api/cart/remove/${itemIdToRemove}`, getAuthHeaders());
//                 if (response.data.success) {
//                     setCartItems(response.data.cart.items);
//                     toast.warn("Item removed from cart.");
//                 } else {
//                     toast.error(response.data.message || 'Failed to remove item.');
//                 }
//             } catch (error) {
//                 console.error('Error removing from server cart:', error);
//                 // ✅ Handle 401 specifically
//                 if (error.response?.status === 401) {
//                     toast.info("Your session expired. Item removed from guest cart locally.");
//                     let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//                     // Find by variantId for guest cart removal
//                     guestCart = guestCart.filter(item => item.variantId !== itemIdToRemove);
//                     localStorage.setItem('guestCart', JSON.stringify(guestCart));
//                     setCartItems(guestCart); // Update cartItems state with guest cart
//                 } else {
//                     toast.error(error.response?.data?.message || 'Failed to remove item.');
//                 }
//             } finally {
//                 setCartLoading(false);
//             }
//         } else { // Guest user (not authenticated)
//             let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//             // For guest cart, itemIdToRemove is variantId (since _id is not available)
//             guestCart = guestCart.filter(item => item.variantId !== itemIdToRemove);
//             localStorage.setItem('guestCart', JSON.stringify(guestCart));
//             setCartItems(guestCart);
//             toast.warn("Item removed from guest cart.");
//         }
//     }, [isAuthenticated, backdendUrl, getAuthHeaders]); // ✅ Dependencies updated


//     // --- Update Cart Item Quantity ---
//     const updateCartItemQuantity = useCallback(async (itemId, newQuantity) => {
//         if (newQuantity < 1) { // If quantity drops to 0, remove the item
//             await removeFromCart(itemId);
//             return;
//         }

//         // Get the item's stock for guest cart stock check
//         const currentItemInCart = cartItems.find(item => (isAuthenticated ? item._id === itemId : item.variantId === itemId));
//         if (currentItemInCart && newQuantity > (currentItemInCart.variantDetails?.stock || Infinity)) {
//             toast.error(`Quantity exceeds available stock (${currentItemInCart.variantDetails?.stock}).`);
//             return;
//         }

//         if (isAuthenticated) { // ✅ Use isAuthenticated from AuthContext
//             setCartLoading(true);
//             try {
//                 // Backend endpoint is /api/cart/update/:itemId
//                 const response = await axios.put(`${backdendUrl}/api/cart/update/${itemId}`, { quantity: newQuantity }, getAuthHeaders());
//                 if (response.data.success) {
//                     setCartItems(response.data.cart.items);
//                     toast.success('Cart updated!');
//                 } else {
//                     toast.error(response.data.message || 'Failed to update cart.');
//                 }
//             } catch (error) {
//                 console.error('Error updating server cart:', error);
//                 // ✅ Handle 401 specifically
//                 if (error.response?.status === 401) {
//                     toast.info("Your session expired. Item quantity updated in guest cart locally.");
//                     let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//                     const itemIndex = guestCart.findIndex(item => item.variantId === itemId);
//                     if (itemIndex > -1) {
//                         guestCart[itemIndex].quantity = newQuantity;
//                     }
//                     localStorage.setItem('guestCart', JSON.stringify(guestCart));
//                     setCartItems(guestCart); // Update cartItems state with guest cart
//                 } else {
//                     toast.error(error.response?.data?.message || 'Server error updating cart.');
//                 }
//             } finally {
//                 setCartLoading(false);
//             }
//         } else { // Guest user (not authenticated)
//             let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//             const itemIndex = guestCart.findIndex(item => item.variantId === itemId); // Find by variantId for guest cart
//             if (itemIndex > -1) {
//                 guestCart[itemIndex].quantity = newQuantity;
//                 localStorage.setItem('guestCart', JSON.stringify(guestCart));
//                 setCartItems(guestCart);
//                 toast.success('Cart updated!');
//             }
//         }
//     }, [isAuthenticated, backdendUrl, getAuthHeaders, removeFromCart, cartItems]); // ✅ Dependencies updated


//     // --- Clear Cart ---
//     const clearCart = useCallback(async () => {
//         if (isAuthenticated) { // ✅ Use isAuthenticated from AuthContext
//             setCartLoading(true);
//             try {
//                 // You'll need to create this backend API endpoint to clear the user's cart in DB
//                 const response = await axios.post(`${backdendUrl}/api/cart/clear`, {}, getAuthHeaders());
//                 if (response.data.success) {
//                     localStorage.removeItem('guestCart'); // Clear guest cart too just in case
//                     setCartItems([]);
//                     toast.info("Your cart has been cleared!");
//                 } else {
//                     toast.error(response.data.message || "Failed to clear cart.");
//                 }
//             } catch (error) {
//                 console.error("Error clearing server cart:", error);
//                 if (error.response?.status === 401) {
//                     toast.info("Your session expired. Clearing guest cart locally.");
//                     localStorage.removeItem('guestCart');
//                     setCartItems([]);
//                 } else {
//                     toast.error(error.response?.data?.message || "Server error clearing cart.");
//                 }
//             } finally {
//                 setCartLoading(false);
//             }
//         } else { // Guest user (not authenticated)
//             localStorage.removeItem('guestCart');
//             setCartItems([]);
//             toast.info("Cart cleared!");
//         }
//     }, [isAuthenticated, backdendUrl, getAuthHeaders]); // Dependencies


//     // --- Cart Merging Logic (on successful login/register) ---
//     const mergeGuestCartWithUserCart = useCallback(async () => {
//         const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//         // Only merge if authenticated AND guest cart has items
//         if (isAuthenticated && guestCart.length > 0) {
//             setCartLoading(true);
//             try {
//                 // Backend endpoint is /api/cart/merge
//                 const response = await axios.post(`${backdendUrl}/api/cart/merge`, { guestCartItems: guestCart }, getAuthHeaders());
//                 if (response.data.success) {
//                     localStorage.removeItem('guestCart'); // Clear guest cart after successful merge
//                     setCartItems(response.data.cart.items);
//                     toast.success('Your guest cart has been merged!');
//                 } else {
//                     toast.warn(response.data.message || 'Failed to merge guest cart.');
//                 }
//             } catch (error) {
//                 console.error('Error merging guest cart:', error);
//                 toast.error(error.response?.data?.message || 'Server error merging guest cart.');
//             } finally {
//                 setCartLoading(false);
//             }
//         }
//     }, [isAuthenticated, backdendUrl, getAuthHeaders]);


//     // --- Primary Effect for Cart Loading/Merging ---
//     useEffect(() => {
//         // This effect will run on initial mount and whenever isAuthenticated or loadingAuth changes
//         // It's crucial that we wait for loadingAuth to be false before fetching
//         if (!loadingAuth) { // Only proceed once AuthContext has loaded user status
//             fetchUserCart(); // Loads user cart or guest cart based on isAuthenticated
//             // If user just became authenticated AND auth loading is done, trigger merge
//             if (isAuthenticated) { // mergeGuestCartWithUserCart already checks for guestCart.length > 0
//                 mergeGuestCartWithUserCart();
//             }
//         }
//     }, [isAuthenticated, loadingAuth, fetchUserCart, mergeGuestCartWithUserCart]); // Dependencies

//     // Context value
//     const cartContextValue = {
//         cartItems,
//         cartLoading,
//         cartError,
//         addToCart,
//         removeFromCart,
//         updateCartItemQuantity,
//         clearCart,
//         fetchUserCart,
//         mergeGuestCart: mergeGuestCartWithUserCart,
//         cartTotal: cartItems.reduce((acc, item) => acc + (item.quantity * (item.variantDetails?.price || 0)), 0),
//         cartItemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
//     };

//     return (
//         <CartContext.Provider value={cartContextValue}>
//             {children}
//         </CartContext.Provider>
//     );
// };