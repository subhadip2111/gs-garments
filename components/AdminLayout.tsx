import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* You can add an AdminNavbar here later if needed */}
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
