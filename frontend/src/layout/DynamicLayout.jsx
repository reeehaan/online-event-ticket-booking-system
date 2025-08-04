import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import { getCurrentUserType } from '../utils/authUtils';

// Dynamic Layout component that determines user type and renders layout
const DynamicLayout = () => {

    const [userType, setUserType] = useState(() => getCurrentUserType());
       
    useEffect(() => {
        const updateUserType = () => {
                 setUserType(getCurrentUserType());
             };
         
             // Listen for localStorage changes from same tab
             window.addEventListener('localStorageUpdate', updateUserType);
             
             // Listen for localStorage changes from other tabs
             window.addEventListener('storage', updateUserType);
         
             return () => {
                 window.removeEventListener('localStorageUpdate', updateUserType);
                 window.removeEventListener('storage', updateUserType);
             };
}, []);

return (
<div className="flex flex-col min-h-screen">
    <Header userType={userType} />
    
    <main className="flex-1 mt-10">
    <Outlet />
    </main>
    
    <Footer />
</div>
);
};

export default DynamicLayout;