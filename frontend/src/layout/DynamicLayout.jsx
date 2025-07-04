import PropTypes from 'prop-types';
import { Outlet } from 'react-router-dom';
import Header from "../Components/Header/Header";
import Footer from "../Components/Footer/Footer";
import { getCurrentUserType } from '../utils/authUtils';

// Dynamic Layout component that determines user type and renders layout
const DynamicLayout = () => {
const userType = getCurrentUserType();

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