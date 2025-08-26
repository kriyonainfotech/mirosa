// import React from 'react'
// import Sidebar from '../adminpanel/AdminSidebar'
// import { Route, Routes } from 'react-router-dom'
// import Admindashboard from '../adminpanel/Admindashboard'
// import ViewCategory from '../adminpanel/ViewCategory'
// import ViewSubcategory from '../adminpanel/ViewSubcategory'
// import ViewProduct from '../adminpanel/ViewProduct'
// import ViewOrders from '../adminpanel/ViewOrders'
// import ViewUsers from '../adminpanel/ViewUsers'
// import AddCategory from '../adminpanel/AddCategory'
// import AddSubCategory from '../adminpanel/AddSubCategory'
// import AddProduct from '../adminpanel/AddProduct'
// import EditCategory from '../adminpanel/EditCategory'
// import EditSubCategory from '../adminpanel/EditSubCategory'
// import EditProduct from '../adminpanel/EditProduct'

// const AdminHome = () => {
//     return (
//         <div>
//             <div className="h-screen flex overflow-hidden bg-gray-200">
//                 <Sidebar />
//                 <div className="flex-1 overflow-auto">
//                     <Routes>
//                         <Route path='/' element={<Admindashboard />} />
//                         <Route path="/categories" element={<ViewCategory />} />
//                         <Route path="/categories/:categoryId" element={<ViewSubcategory />} />
//                         <Route path="/products" element={<ViewProduct />} />
//                         <Route path="/orders" element={<ViewOrders />} />
//                         <Route path="/users" element={<ViewUsers />} />
//                         <Route path="/categories/add" element={<AddCategory />} />
//                         <Route path="/add-subcategory/:categoryId" element={<AddSubCategory />} />
//                         <Route path="/products/add" element={<AddProduct />} />
//                         <Route path="/edit-category/:categoryId" element={<EditCategory />} />
//                         <Route path="/edit-subcategory/:id" element={<EditSubCategory />} />
//                         <Route path="/edit-product/:productId" element={<EditProduct />} />
//                     </Routes>
//                 </div>


//             </div>

//         </div>
//     )
// }

// export default AdminHome

import React from 'react';
import Sidebar from '../adminpanel/AdminSidebar';
import { Outlet } from 'react-router-dom';

const AdminHome = () => {
    return (
        <div className="h-screen flex overflow-hidden bg-gray-200">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminHome;
