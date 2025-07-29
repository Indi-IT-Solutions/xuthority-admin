import { SectionItem } from "../types";

interface SidebarProps {
  sections: SectionItem[];
  selectedSection: string;
  onSectionChange: (sectionId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ sections, selectedSection, onSectionChange }) => {
  return (
    <div className="col-span-12 md:col-span-4 lg:col-span-3">
      <div className="bg-gray-50 rounded-lg">
        <h2 className="text-2xl font-bold px-8 py-6">
          Manage Your Content<br />Effortlessly
        </h2>
        <nav className="pb-6">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onSectionChange(section.id)}
                className={`w-full flex items-center justify-between px-8 py-5 text-lg transition-all duration-200 cursor-pointer ${
                  selectedSection === section.id
                    ? "bg-white text-gray-900 font-medium border-l-4 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span>{section.label}</span>
                <Icon className="w-5 h-5 text-gray-400" />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}; 