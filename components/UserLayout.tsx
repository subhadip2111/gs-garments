import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import QuickViewModal from './QuickViewModal';

const UserLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-28">
                <Outlet />
            </main>
            <Footer />
            <QuickViewModal />
        </div>
    );
};

export default UserLayout;
