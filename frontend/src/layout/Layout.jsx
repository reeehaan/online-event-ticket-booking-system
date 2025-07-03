import React from 'react';
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import { Outlet } from 'react-router-dom';

const Layout = ({allowedUserType}) => {

return (
<div className="flex flex-col min-h-screen">
    <Header  userType={allowedUserType}/>
    
    <main className="flex-1 mt-10">
        <Outlet />
    </main>
    
    <Footer />
</div>
);
};
export default Layout