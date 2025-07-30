import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const Breadcrumb: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <button 
        onClick={() => navigate('/pages')}
        className="hover:text-blue-600 transition-colors"
      >
        Pages
      </button>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900 font-medium">Landing Page</span>
    </div>
  );
}; 