
import { Outlet } from 'react-router-dom';
import { ASSETS } from '@/config/constants';

const AuthLayout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-100">
        {/* Geometric Shapes */}
     <img src={ASSETS.SVG.HOME_BG} alt="Xuthority background" className="h-full w-full object-cover" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl p-8 min-h-[50vh] max-h-[50vh] overflow-y-auto">
          {/* Logo */}
            <img src={ASSETS.LOGOS.SMALL} alt="Xuthority Logo" className="h-16 w-16" />

          {/* Page Content */}
          <div className="mt-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 