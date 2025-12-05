// // src/contexts/CartContext.jsx
// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';

// const CartContext = createContext();

// export const useCart = () => useContext(CartContext);

// export const CartProvider = ({ children }) => {
//     const [cartItems, setCartItems] = useState([]);
//     const [cartLoading, setCartLoading] = useState(false);
//     const [cartError, setCartError] = useState(null);
//     const [shippingAddress, setShippingAddress] = useState(null);

//     const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

//     // Helper to get auth token
//     const getAuthHeaders = () => {
//         const token = localStorage.getItem('token');
//         return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
//     };

//     // --- Core Fetch Cart Function ---
//     const fetchUserCart = useCallback(async () => {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             // If no token, load guest cart from localStorage
//             const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//             setCartItems(guestCart);
//             return;
//         }

//         setCartLoading(true);
//         setCartError(null);
//         try {
//             const response = await axios.get(`${backdendUrl}/api/cart/getUserCart`, getAuthHeaders());
//             if (response.data.success) {
//                 setCartItems(response.data.cart.items || []);
//             } else {
//                 setCartError(response.data.message || 'Failed to fetch cart.');
//                 toast.error(response.data.message || 'Failed to fetch cart.');
//                 setCartItems([]); // Clear cart on error
//             }
//         } catch (error) {
//             console.error('Error fetching user cart:', error);
//             setCartError(error.response?.data?.message || 'Server error fetching cart.');
//             toast.error(error.response?.data?.message || 'Server error fetching cart.');
//             setCartItems([]); // Clear cart on error
//         } finally {
//             setCartLoading(false);
//         }
//     }, [backdendUrl]); // Memoize fetchUserCart

//     // --- Add to Cart ---
//     const addToCart = async (productData, variantData, quantity, selectedSize) => {
//         if (!productData || !variantData || !quantity || quantity < 1) {
//             toast.error("Invalid product or variant data to add to cart.");
//             return;
//         }

//         const itemToAdd = {
//             productId: productData._id,
//             variantId: variantData._id,
//             quantity: quantity,
//             name: `${productData.title}`, // Example name
//             mainImage: productData.mainImage || variantData.images?.[0], // Image URL
//             variantDetails: { // Snapshot of variant details
//                 material: variantData.material,
//                 purity: variantData.purity,
//                 selectedSize: selectedSize || null,
//                 price: variantData.price
//             }
//         };

//         const token = localStorage.getItem('token');

//         if (token) {
//             // Authenticated user: Add to server cart
//             setCartLoading(true);
//             try {
//                 const response = await axios.post(`${backdendUrl}/api/cart/addToCart`, itemToAdd, getAuthHeaders());

//                 console.log(response, "response data")
//                 if (response.data.success) {
//                     setCartItems(response.data.cart.items);
//                     toast.success('Item added to cart!');
//                 } else {
//                     toast.error(response.data.message || 'Failed to add item to cart.');
//                 }
//             } catch (error) {
//                 console.error('Error adding to server cart:', error);
//                 toast.error(error.response?.data?.message || 'Server error adding item to cart.');
//             } finally {
//                 setCartLoading(false);
//             }
//         } else {
//             // Guest user: Add to localStorage cart
//             let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//             const existingItemIndex = guestCart.findIndex(item =>
//                 item.productId === itemToAdd.productId && item.variantId === itemToAdd.variantId
//             );

//             if (existingItemIndex > -1) {
//                 // Update quantity of existing item
//                 guestCart[existingItemIndex].quantity += quantity;
//             } else {
//                 // Add new item
//                 guestCart.push(itemToAdd);
//             }

//             localStorage.setItem('guestCart', JSON.stringify(guestCart));
//             setCartItems(guestCart);
//             toast.success('Item added to cart (guest mode)!');
//         }
//     };

//     // --- Remove From Cart ---
//     const removeFromCart = async (itemIdToRemove) => {
//         const token = localStorage.getItem('token');

//         if (token) {
//             // Authenticated user: Remove from server cart
//             setCartLoading(true);
//             try {
//                 const response = await axios.delete(`${backdendUrl}/api/cart/remove/${itemIdToRemove}`, getAuthHeaders());
//                 console.log("remove item from cart", response)
//                 if (response.data.success) {
//                     setCartItems(response.data.cart.items);
//                     toast.success('Item removed from cart!');
//                 } else {
//                     toast.error(response.data.message || 'Failed to remove item from cart.');
//                 }
//             } catch (error) {
//                 console.error('Error removing from server cart:', error);
//                 toast.error(error.response?.data?.message || 'Server error removing item from cart.');
//             } finally {
//                 setCartLoading(false);
//             }
//         } else {
//             // Guest user: Remove from localStorage cart
//             let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//             // For guest cart, itemIdToRemove is variantId
//             guestCart = guestCart.filter(item => item.variantId !== itemIdToRemove);
//             localStorage.setItem('guestCart', JSON.stringify(guestCart));
//             setCartItems(guestCart);
//             toast.success('Item removed from cart!');
//         }
//     };

//     // --- Update Cart Item Quantity ---
//     const updateCartItemQuantity = async (itemId, newQuantity) => {
//         if (newQuantity < 1) {
//             await removeFromCart(itemId); // Remove if quantity becomes 0
//             return;
//         }

//         const token = localStorage.getItem('token');

//         if (token) {
//             // Authenticated user: Update server cart
//             setCartLoading(true);
//             try {
//                 const response = await axios.put(`${backdendUrl}/api/cart/updateCart/${itemId}`, { quantity: newQuantity }, getAuthHeaders());

//                 console.log("update cart token response:", response)
//                 if (response.data.success) {
//                     setCartItems(response.data.cart.items);
//                     toast.success('Cart updated!');
//                 } else {
//                     toast.error(response.data.message || 'Failed to update cart.');
//                 }
//             } catch (error) {
//                 console.error('Error updating server cart:', error);
//                 toast.error(error.response?.data?.message || 'Server error updating cart.');
//             } finally {
//                 setCartLoading(false);
//             }
//         } else {
//             // Guest user: Update localStorage cart
//             let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//             const itemIndex = guestCart.findIndex(item => item.variantId === itemId); // Find by variantId for guest cart
//             if (itemIndex > -1) {
//                 guestCart[itemIndex].quantity = newQuantity;
//                 localStorage.setItem('guestCart', JSON.stringify(guestCart));
//                 setCartItems(guestCart);
//                 toast.success('Cart updated!');
//             }
//         }
//     };

//     // --- Clear Cart ---
//     const clearCart = async () => {
//         const token = localStorage.getItem('token');
//         if (token) {
//             // TODO: For authenticated users, implement a backend API to clear their cart in DB
//             // For now, it will only clear local state for authenticated users.
//             // await axios.post(`${backdendUrl}/api/cart/clear`, {}, getAuthHeaders());
//             console.log("Clear Cart for authenticated user not yet fully implemented in backend.");
//         }
//         localStorage.removeItem('guestCart');
//         setCartItems([]);
//         // toast.info("Cart cleared!");
//     };


//     // --- Cart Merging Logic (on successful login/register) ---
//     // This function should be called right after a user successfully logs in or registers
//     const mergeGuestCartWithUserCart = useCallback(async () => {
//         const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
//         const token = localStorage.getItem('token'); // Check for token *after* user has logged in/registered

//         if (guestCart.length > 0 && token) {
//             setCartLoading(true);
//             try {
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
//     }, [backdendUrl]); // Memoize the callback


//     // --- Effects ---
//     useEffect(() => {
//         fetchUserCart();
//         // The merge logic should also be explicitly triggered after login/registration
//         // You'll need to call mergeGuestCartWithUserCart from your login/register component
//     }, [fetchUserCart]);


//     // Context value
//     const cartContextValue = {
//         cartItems,
//         cartLoading,
//         cartError,
//         addToCart,
//         removeFromCart,
//         updateCartItemQuantity,
//         shippingAddress,
//         setShippingAddress,
//         clearCart,
//         fetchUserCart, // Expose for external re-fetching if needed
//         mergeGuestCart: mergeGuestCartWithUserCart, // Expose for login/register flow
//         cartTotal: cartItems.reduce((acc, item) => acc + (item.quantity * (item.variantDetails?.price || 0)), 0),
//         cartItemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
//     };

//     return (
//         <CartContext.Provider value={cartContextValue}>
//             {children}
//         </CartContext.Provider>
//     );
// };

// src/contexts/CartContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartError, setCartError] = useState(null);

    // ✅ 1. Initialize shippingAddress state from sessionStorage
    // This loads the saved address when the context first loads.
    const [shippingAddress, setShippingAddress] = useState(() => {
        try {
            const savedAddress = sessionStorage.getItem('shippingAddress');
            return savedAddress ? JSON.parse(savedAddress) : null;
        } catch (error) {
            console.error("Failed to parse shipping address from sessionStorage", error);
            return null;
        }
    });

    const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

    // ✅ 2. Add a useEffect to save shippingAddress to sessionStorage
    // This automatically saves the address whenever it's updated.
    useEffect(() => {
        if (shippingAddress) {
            sessionStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
        } else {
            // If the address is null, remove it from storage
            sessionStorage.removeItem('shippingAddress');
        }
    }, [shippingAddress]);


    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    };

    const fetchUserCart = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
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
                setCartItems([]);
            }
        } catch (error) {
            console.error('Error fetching user cart:', error);
            setCartError(error.response?.data?.message || 'Server error fetching cart.');
            toast.error(error.response?.data?.message || 'Server error fetching cart.');
            setCartItems([]);
        } finally {
            setCartLoading(false);
        }
    }, [backdendUrl]);

    const addToCart = async (productData, variantData, quantity, selectedSize) => {
        if (!productData || !variantData || !quantity || quantity < 1) {
            toast.error("Invalid product or variant data to add to cart.");
            return;
        }

        const itemToAdd = {
            productId: productData._id,
            variantId: variantData._id,
            quantity: quantity,
            name: `${productData.title}`,
            mainImage: productData.mainImage || variantData.images?.[0],
            variantDetails: {
                material: variantData.material,
                purity: variantData.purity,
                selectedSize: selectedSize || null,
                price: variantData.price,
                weight: variantData.weight,
                weightUnit: variantData.weightUnit || 'G',
                hsCode: variantData.hsCode,
                countryOfOrigin: variantData.countryOfOrigin || 'IN'
            }
        };

        const token = localStorage.getItem('token');

        if (token) {
            setCartLoading(true);
            try {
                const response = await axios.post(`${backdendUrl}/api/cart/addToCart`, itemToAdd, getAuthHeaders());

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
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const existingItemIndex = guestCart.findIndex(item =>
                item.productId === itemToAdd.productId && item.variantId === itemToAdd.variantId
            );

            if (existingItemIndex > -1) {
                guestCart[existingItemIndex].quantity += quantity;
            } else {
                guestCart.push(itemToAdd);
            }

            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            setCartItems(guestCart);
            toast.success('Item added to cart (guest mode)!');
        }
    };

    const removeFromCart = async (itemIdToRemove) => {
        const token = localStorage.getItem('token');

        if (token) {
            setCartLoading(true);
            try {
                const response = await axios.delete(`${backdendUrl}/api/cart/remove/${itemIdToRemove}`, getAuthHeaders());
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
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            guestCart = guestCart.filter(item => item.variantId !== itemIdToRemove);
            localStorage.setItem('guestCart', JSON.stringify(guestCart));
            setCartItems(guestCart);
            toast.success('Item removed from cart!');
        }
    };

    const updateCartItemQuantity = async (itemId, newQuantity) => {
        if (newQuantity < 1) {
            await removeFromCart(itemId);
            return;
        }

        const token = localStorage.getItem('token');

        if (token) {
            setCartLoading(true);
            try {
                const response = await axios.put(`${backdendUrl}/api/cart/updateCart/${itemId}`, { quantity: newQuantity }, getAuthHeaders());
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
            let guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
            const itemIndex = guestCart.findIndex(item => item.variantId === itemId);
            if (itemIndex > -1) {
                guestCart[itemIndex].quantity = newQuantity;
                localStorage.setItem('guestCart', JSON.stringify(guestCart));
                setCartItems(guestCart);
                toast.success('Cart updated!');
            }
        }
    };

    const clearCart = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Call backend to clear cart
                await axios.post(`${backdendUrl}/api/cart/clear`, {}, getAuthHeaders());
                console.log("Cart cleared on backend.");
            } catch (error) {
                console.error("Failed to clear backend cart:", error);
                // toast.error("Failed to sync cart clear with server.");
            }
        }
        localStorage.removeItem('guestCart');
        setCartItems([]);

        // ✅ 3. Reset the shippingAddress state when the cart is cleared.
        // The useEffect will handle removing it from sessionStorage.
        setShippingAddress(null);
    };

    const mergeGuestCartWithUserCart = useCallback(async () => {
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
        const token = localStorage.getItem('token');

        if (guestCart.length > 0 && token) {
            setCartLoading(true);
            try {
                const response = await axios.post(`${backdendUrl}/api/cart/merge`, { guestCartItems: guestCart }, getAuthHeaders());
                if (response.data.success) {
                    localStorage.removeItem('guestCart');
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
    }, [backdendUrl]);

    useEffect(() => {
        fetchUserCart();
    }, [fetchUserCart]);

    const cartContextValue = {
        cartItems,
        cartLoading,
        cartError,
        addToCart,
        removeFromCart,
        updateCartItemQuantity,
        shippingAddress,
        setShippingAddress,
        clearCart,
        fetchUserCart,
        mergeGuestCart: mergeGuestCartWithUserCart,
        cartTotal: cartItems.reduce((acc, item) => acc + (item.quantity * (item.variantDetails?.price || 0)), 0),
        cartItemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
    };

    return (
        <CartContext.Provider value={cartContextValue}>
            {children}
        </CartContext.Provider>
    );
};