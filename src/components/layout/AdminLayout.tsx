import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="md:ml-64 transition-all duration-300">
        <AdminHeader />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 