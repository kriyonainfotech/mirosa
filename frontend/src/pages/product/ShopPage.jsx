// import React, { useState, useEffect, useRef } from 'react';
// import { FiFilter, FiX, FiHeart, FiStar, FiShoppingBag, FiChevronDown, FiChevronUp } from 'react-icons/fi';
// import { FaGem, FaRing, } from 'react-icons/fa';
// import { TbAngle } from "react-icons/tb";
// import { GiDropEarrings, GiNoseSide } from "react-icons/gi";
// import { useLocation, Link } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import { useCart } from '../../context/CartContext';

// const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

// const ShopPage = () => {
//   const location = useLocation();
//   const { categoryId, subcategoryId } = location.state || {};

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [loadingProductId, setLoadingProductId] = useState(null);

//   const [filters, setFilters] = useState({
//     metals: [],
//     categories: [],
//     priceRange: [0, 20000],
//   });
//   const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // State for filter sidebar toggle
//   const filterRef = useRef();
//   const { addToCart, cartLoading } = useCart();

//   const categoryIcons = {
//     Rings: <FaRing className="text-amber-500" />,
//     Earrings: <GiDropEarrings className="text-amber-500" />,
//     Necklaces: <TbAngle className="text-amber-500" />,
//     Bracelets: <FaGem className="text-amber-500" />,
//     Pendants: <GiNoseSide className="text-amber-500" />,
//     // Add more mappings for your categories
//   };

//   const uniqueCategories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

//   useEffect(() => {
//     const fetchProducts = async () => {
//       setLoading(true);
//       setError(null);
//       let apiUrl = `${backdendUrl}/api/product/get-products-filtered?`;

//       if (categoryId) {
//         apiUrl += `categoryId=${categoryId}`;
//       } else if (subcategoryId) {
//         apiUrl += `subcategoryId=${subcategoryId}`;
//       }

//       try {
//         const response = await axios.get(apiUrl);
//         if (response.data.success) {
//           setProducts(response.data.products);
//         } else {
//           setError(response.data.message || "Failed to fetch products.");
//           toast.error(response.data.message || "Failed to fetch products.");
//         }
//       } catch (err) {
//         console.error("Error fetching products:", err);
//         setError(err.response?.data?.message || "Server error fetching products.");
//         toast.error(err.response?.data?.message || "Server error fetching products.");
//         setProducts([]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProducts();
//   }, [categoryId, subcategoryId]);

//   const handleFilterChange = (filterType, value) => {
//     setFilters(prev => {
//       if (filterType === 'metals' || filterType === 'categories') {
//         const currentValues = prev[filterType];
//         if (currentValues.includes(value)) {
//           return { ...prev, [filterType]: currentValues.filter(item => item !== value) };
//         } else {
//           return { ...prev, [filterType]: [...currentValues, value] };
//         }
//       } else if (filterType === 'priceRange') {
//         return { ...prev, priceRange: value };
//       }
//       return prev;
//     });
//   };

//   const applyFilters = (productsToFilter) => {
//     return productsToFilter.filter(product => {
//       const matchesMetal = filters.metals.length === 0 ||
//         product.variants?.some(v => filters.metals.includes(v.material));

//       const matchesCategory = filters.categories.length === 0 ||
//         filters.categories.includes(product.category?.name);

//       const productPrice = product.variants?.[0]?.price || 0;
//       const matchesPrice = productPrice >= filters.priceRange[0] && productPrice <= filters.priceRange[1];

//       return matchesMetal && matchesCategory && matchesPrice;
//     });
//   };

//   const filteredProducts = applyFilters(products);

//   useEffect(() => {
//     const handleClick = (e) => {
//       if (filterRef.current && filterRef.current.contains(e.target)) {
//         // clicked inside the filter
//         setIsFilterPanelOpen(false); // close anyway
//       } else {
//         // clicked outside the filter
//         setIsFilterPanelOpen(false);
//       }
//     };

//     if (isFilterPanelOpen) {
//       document.addEventListener("mousedown", handleClick);
//     }

//     return () => {
//       document.removeEventListener("mousedown", handleClick);
//     };
//   }, [isFilterPanelOpen]);

//   // ✅ New: handleAddToCart function for product cards
//   const handleAddToCartFromCard = async (product) => {
//     // For a listing page, we typically add the first variant (or default)
//     const variantToAdd = product.variants?.[0];
//     if (!variantToAdd) return toast.error("No variant found");
//     if (variantToAdd.stock < 1) return toast.error("Out of stock");

//     setLoadingProductId(product._id); // 🌀 Start local loading

//     try {
//       await addToCart(product, variantToAdd, 1);
//       toast.success("Added to cart");
//     } catch (err) {
//       toast.error("Failed to add to cart");
//     } finally {
//       setLoadingProductId(null); // 🛑 End local loading
//     }
//   };

//   // if()

//   return (
//     <>
//       <div className='relative'>
//         {/* Top Bar for Filter Toggle (now visible on all screen sizes) */}
//         {/* Top Filter Bar (normal flow, not fixed) */}
//         <div className="sticky top-[108px] z-40 bg-white shadow-sm px-4 py-3">
//           <div className="max-w-7xl flex items-center justify-between">
//             <div className=''>
//               <button onClick={() => setIsFilterPanelOpen(true)} className='flex items-center space-x-3 border border-gray-400 px-3 py-1 cursor-pointer'>
//                 <FiFilter className="text-xl text-gray-700" />
//                 <h1 className="text-xl font-bold text-gray-800">Filter</h1>
//               </button>

//             </div>
//             <div >
//               <Link className='bg-maroon text-white px-3 py-2' to={'/'}>
//                 Back To Home
//               </Link>
//             </div>
//           </div>

//         </div>
//       </div >
//       <div className="flex flex-col lg:flex-row max-w-7xl mx-auto pt-5"> {/* Removed lg:pt-0, adjust padding */}
//         <aside
//           ref={filterRef}
//           className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 transform
//                         ${isFilterPanelOpen ? 'translate-x-0' : '-translate-x-full'}
//                         transition-transform duration-300 ease-in-out p-6 overflow-y-auto border-r`} // Removed lg:static, lg:translate-x-0, lg:border-r-0
//         >
//           <div className="flex justify-between items-center mb-6"> {/* Removed lg:hidden */}
//             <h2 className="text-xl font-bold">Filters</h2>
//             <button onClick={() => setIsFilterPanelOpen(false)} className="text-gray-700 cursor-pointer">
//               <FiX className="text-2xl" />
//             </button>
//           </div>

//           {/* Filter Section: Metals */}
//           <div className="mb-8">
//             <h3 className="font-semibold text-gray-800 mb-3 text-lg">Metal Type</h3>
//             {['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold'].map(metal => (
//               <label key={metal} className="flex items-center mb-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={filters.metals.includes(metal)}
//                   onChange={() => handleFilterChange('metals', metal)}
//                   className="form-checkbox h-4 w-4 text-violet-600 rounded"
//                 />
//                 <span className="ml-2 text-gray-700">{metal}</span>
//               </label>
//             ))}
//           </div>

//           {/* Filter Section: Categories */}
//           <div className="mb-8">
//             <h3 className="font-semibold text-gray-800 mb-3 text-lg">Categories</h3>
//             {uniqueCategories.map(cat => (
//               <label key={cat} className="flex items-center mb-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={filters.categories.includes(cat)}
//                   onChange={() => handleFilterChange('categories', cat)}
//                   className="form-checkbox h-4 w-4 text-violet-600 rounded"
//                 />
//                 <span className="ml-2 text-gray-700">{cat}</span>
//               </label>
//             ))}
//           </div>

//           {/* Filter Section: Price Range */}
//           <div className="mb-8">
//             <h3 className="font-semibold text-gray-800 mb-3 text-lg">Price Range</h3>
//             <div className="flex items-center space-x-2">
//               <input
//                 type="number"
//                 value={filters.priceRange[0]}
//                 onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
//                 className="w-1/2 p-2 border text-sm"
//                 placeholder="Min"
//               />
//               <span>-</span>
//               <input
//                 type="number"
//                 value={filters.priceRange[1]}
//                 onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
//                 className="w-1/2 p-2 border text-sm"
//                 placeholder="Max"
//               />
//             </div>
//           </div>

//           {/* Reset Filters Button */}
//           <button
//             onClick={() => setFilters({ metals: [], categories: [], priceRange: [0, 20000] })}
//             className="bg-maroon text-white px-6 py-2 w-full"
//           >
//             Reset Filters
//           </button>
//         </aside>

//         {/* Product Listing Area */}
//         <main className="flex-1 p-6"> {/* Removed lg:ml-64 */}

//           {loading ? (
//             <div className="text-center py-10 text-gray-600">Loading products...</div>
//           ) : error ? (
//             <div className="text-center py-10 text-red-600">Error: {error}</div>
//           ) : filteredProducts.length === 0 ? (
//             <div className="text-center py-10">
//               <p className="text-2xl font-semibold text-gray-700 mb-4">No products found.</p>
//               <p className="text-gray-600 mb-6">Try adjusting your filters to find what you're looking for</p>
//               <button
//                 onClick={() => setFilters({ metals: [], categories: [], priceRange: [0, 20000] })}
//                 className="bg-maroon text-white px-6 py-2 rounded-lg me-3 cursor-pointer"
//               >
//                 Reset Filters
//               </button>
//               <Link
//                 to={'/'}
//                 className="text-maroon border border-rose-900 px-6 py-2 rounded-lg cursor-pointer"
//               >
//                 Back to Home
//               </Link>
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
//                 {filteredProducts.map(product => (
//                   <div
//                     key={product._id}
//                     className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
//                   >
//                     <Link to={`/products/${product.slug}`} state={{ productId: product._id }} className="block">
//                       <img
//                         src={product.mainImage || 'https://placehold.co/400x300/E0E0E0/6C6C6C?text=No+Image'}
//                         alt={product.title}
//                         className="w-full h-84 object-cover"
//                       />
//                     </Link>
//                     <div className="p-4">
//                       <Link to={`/products/${product.slug}`} className="block">
//                         <h3 className="text-lg font-semibold text-gray-800 truncate nunito ">
//                           {product.title}
//                         </h3>
//                       </Link>
//                       {/* <p className="text-sm text-gray-500 mt-1">{product.category?.name} {product.subcategory?.name ? `/ ${product.subcategory.name}` : ''}</p> */}
//                       {product.variants && product.variants.length > 0 && (
//                         <p className="text-xl font-bold text-gray-900 mt-0 nunito">
//                           ${product.variants[0].price}
//                         </p>
//                       )}
//                       {/* <div className="flex items-center mt-3 text-sm text-gray-600">
//                         <FiStar className="text-amber-400 mr-1" />
//                         <span>{product.rating || 'N/A'}</span>
//                         <span className="ml-auto text-maroon font-medium">
//                           {product.isNew ? 'New Arrival' : ''}
//                         </span>
//                       </div> */}
//                       <button
//                         onClick={() => handleAddToCartFromCard(product)}
//                         disabled={loadingProductId === product._id || !product.variants?.length || product.variants[0].stock < 1}
//                         className="mt-4 w-full bg-maroon cursor-pointer text-white py-2 hover:bg-violet-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                       >
//                         {loadingProductId === product._id ? (
//                           <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                           </svg>
//                         ) : (
//                           <>
//                             <FiShoppingBag />
//                             <span>Add to Bag</span>
//                           </>
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </main>
//       </div>

//       {isFilterPanelOpen && (
//         <div
//           className="fixed top-0 bottom-0 letf-0 h-full bg-opacity-50 z-40" // Removed lg:hidden
//           onClick={() => setIsFilterPanelOpen(false)}
//         ></div>
//       )}
//     </>
//   );
// };

// export default ShopPage;

import React, { useState, useEffect, useRef } from 'react';
import { FiFilter, FiX, FiHeart, FiStar, FiShoppingBag, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { FaGem, FaRing, } from 'react-icons/fa';
import { TbAngle } from "react-icons/tb";
import { GiDropEarrings, GiNoseSide } from "react-icons/gi";
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext'; // Import the wishlist context
import ProductCard from '../cart/ProductCard';

const backdendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:9000";

const ShopPage = () => {
  const location = useLocation();
  const { categoryId, subcategoryId } = location.state || {};

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProductId, setLoadingProductId] = useState(null);

  const [filters, setFilters] = useState({
    metals: [],
    categories: [],
    priceRange: [0, 20000],
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterRef = useRef();
  const { addToCart, cartLoading } = useCart();
  const { addToWishlist, removeFromWishlist, isProductInWishlist } = useWishlist(); // Use wishlist functions

  const categoryIcons = {
    Rings: <FaRing className="text-amber-500" />,
    Earrings: <GiDropEarrings className="text-amber-500" />,
    Necklaces: <TbAngle className="text-amber-500" />,
    Bracelets: <FaGem className="text-amber-500" />,
    Pendants: <GiNoseSide className="text-amber-500" />,
  };

  const uniqueCategories = [...new Set(products.map(p => p.category?.name).filter(Boolean))];

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      let apiUrl = `${backdendUrl}/api/product/get-products-filtered?`;

      if (categoryId) {
        apiUrl += `categoryId=${categoryId}`;
      } else if (subcategoryId) {
        apiUrl += `subcategoryId=${subcategoryId}`;
      }

      try {
        const response = await axios.get(apiUrl);
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError(response.data.message || "Failed to fetch products.");
          toast.error(response.data.message || "Failed to fetch products.");
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.response?.data?.message || "Server error fetching products.");
        toast.error(err.response?.data?.message || "Server error fetching products.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryId, subcategoryId]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      if (filterType === 'metals' || filterType === 'categories') {
        const currentValues = prev[filterType];
        if (currentValues.includes(value)) {
          return { ...prev, [filterType]: currentValues.filter(item => item !== value) };
        } else {
          return { ...prev, [filterType]: [...currentValues, value] };
        }
      } else if (filterType === 'priceRange') {
        return { ...prev, priceRange: value };
      }
      return prev;
    });
  };

  const applyFilters = (productsToFilter) => {
    return productsToFilter.filter(product => {
      const matchesMetal = filters.metals.length === 0 ||
        product.variants?.some(v => filters.metals.includes(v.material));

      const matchesCategory = filters.categories.length === 0 ||
        filters.categories.includes(product.category?.name);

      const productPrice = product.variants?.[0]?.price || 0;
      const matchesPrice = productPrice >= filters.priceRange[0] && productPrice <= filters.priceRange[1];

      return matchesMetal && matchesCategory && matchesPrice;
    });
  };

  const filteredProducts = applyFilters(products);

  useEffect(() => {
    const handleClick = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        // clicked OUTSIDE the filter → close
        setIsFilterPanelOpen(false);
      }
    };

    if (isFilterPanelOpen) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [isFilterPanelOpen]);


  const handleAddToCartFromCard = async (product, variantToAdd, selectedSize) => {
    if (!variantToAdd) return toast.error("Variant not available.");
    if (variantToAdd.stock < 1) return toast.error("Out of stock.");

    setLoadingProductId(product._id);
    try {
      // Pass the specific variant and selected size to the cart context
      await addToCart(product, variantToAdd, 1, selectedSize);
      // toast.success("Added to cart");
    } catch (err) {
      toast.error("Failed to add to cart");
    } finally {
      setLoadingProductId(null);
    }
  };

  const handleWishlistToggle = (productId) => {
    const product = filteredProducts.find(p => p._id === productId);
    if (!product) return toast.error("Product not found in list.");

    if (isProductInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(product); // Send full object now
    }
  };

  return (
    <>
      <div className='relative mt-40 md:mt-32'>
        <div className="sticky top-[108px] z-40 px-4 md:px-4 md:py-3 md:mx-12">
          <div className="max-w-full flex items-center justify-between">
            <div className=''>
              <button onClick={() => setIsFilterPanelOpen(true)} className='flex items-center space-x-3 border border-gray-400 rounded-full px-3 py-2 md:px-6 md:py-3 cursor-pointer'>
                <FiFilter className="text-lg text-gray-700" />
                <h1 className="text-sm md:text-lg font-serif text-gray-800">Filter</h1>
              </button>
            </div>
            <div>
              <Link className='text-sm md:text-lg font-serif rounded-full border border-gray-400 text-gray-800 px-3 py-2 md:px-6 md:py-3' to={'/'}>
                Back To Home
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row max-w-full lg:mx-12 lg:pt-5">
        <aside
          ref={filterRef}
          className={`fixed top-0 left-0 h-full w-84 bg-gray-100 shadow-lg z-50 transform
                      ${isFilterPanelOpen ? 'translate-x-0' : '-translate-x-full'}
                      transition-transform duration-300 ease-in-out p-6 overflow-y-auto border-r`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button onClick={() => setIsFilterPanelOpen(false)} className="text-gray-700 cursor-pointer">
              <FiX className="text-2xl" />
            </button>
          </div>

          {/* Filter Section: Metals */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Metal Type</h3>
            {['Yellow Gold', 'Silver', 'Rose Gold', 'White Gold'].map(metal => (
              <label key={metal} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.metals.includes(metal)}
                  onChange={() => handleFilterChange('metals', metal)}
                  className="form-checkbox h-4 w-4 text-violet-600 rounded"
                />
                <span className="ml-2 text-gray-700">{metal}</span>
              </label>
            ))}
          </div>

          {/* Filter Section: Categories */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Categories</h3>
            {uniqueCategories.map(cat => (
              <label key={cat} className="flex items-center mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories.includes(cat)}
                  onChange={() => handleFilterChange('categories', cat)}
                  className="form-checkbox h-4 w-4 text-violet-600 rounded"
                />
                <span className="ml-2 text-gray-700">{cat}</span>
              </label>
            ))}
          </div>

          {/* Filter Section: Price Range */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-3 text-lg">Price Range</h3>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={filters.priceRange[0]}
                onChange={(e) => handleFilterChange('priceRange', [Number(e.target.value), filters.priceRange[1]])}
                className="w-1/2 p-2 border text-sm"
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                value={filters.priceRange[1]}
                onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], Number(e.target.value)])}
                className="w-1/2 p-2 border text-sm"
                placeholder="Max"
              />
            </div>
          </div>

          <button
            onClick={() => setFilters({ metals: [], categories: [], priceRange: [0, 20000] })}
            className="bg-maroon rounded-full nunito text-white px-6 py-2 w-full"
          >
            Reset Filters
          </button>
        </aside>

        <main className="flex-1 p-3 sm:p-6">
          {loading ? (
            <div className="text-center py-10 text-gray-600">Loading products...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-600">Error: {error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-10 h-96">
              <p className="text-2xl font-semibold text-gray-700 mb-4">No products found.</p>
              <p className="text-gray-600 mb-6">Try adjusting your filters to find what you're looking for</p>
              <button
                onClick={() => setFilters({ metals: [], categories: [], priceRange: [0, 20000] })}
                className="inline-flex items-center px-6 py-2 md:px-8 md:py-3 border border-gray-400 cursor-pointer text-gray-800 font-serif text-lg font-medium rounded-full  transition-all duration-300 group"
              >
                Reset Filters
              </button>

            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredProducts.map(product => (
                <ProductCard
                  key={product._id}
                  product={product}
                  onAddToCart={handleAddToCartFromCard}
                  onToggleWishlist={handleWishlistToggle}
                  isWishlisted={isProductInWishlist(product._id)}
                  isLoading={loadingProductId === product._id}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {isFilterPanelOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsFilterPanelOpen(false)}
        ></div>
      )}
    </>
  );
};

export default ShopPage;
