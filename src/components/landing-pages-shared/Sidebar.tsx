import { useState } from "react";
import { SectionItem } from "../types";
import { Menu, X } from "lucide-react";

interface SidebarProps {
  sections: SectionItem[];
  selectedSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sections, selectedSection, onSectionChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSectionChange = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-3 rounded-lg shadow-lg border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative md:col-span-4 lg:col-span-3
        top-0 left-0 h-full w-72 md:w-auto
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        z-40 md:z-auto
        col-span-12
      `}>
        <div className="bg-gray-50 rounded-lg h-full md:h-auto overflow-y-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold px-4 sm:px-6 md:px-8 py-4 md:py-6 mt-16 md:mt-0">
            Manage Your Content<br />Effortlessly
          </h2>
          <nav className="pb-4 md:pb-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => handleSectionChange(section.id)}
                  className={`w-full flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 text-base md:text-lg transition-all duration-200 cursor-pointer ${
                    selectedSection === section.id
                      ? "bg-white text-gray-900 font-medium border-l-4 border-blue-500"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <span className="text-sm sm:text-base md:text-lg">{section.label}</span>
                  <Icon className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}; 