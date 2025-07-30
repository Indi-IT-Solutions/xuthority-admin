import { PageType } from "../types";

interface TabNavigationProps {
  activeTab: PageType;
  onTabChange: (tab: PageType) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: "user" as PageType, label: "User Page" },
    { key: "vendor" as PageType, label: "Vendor Page" },
    { key: "about" as PageType, label: "About Page" },
  ];

  return (
    <div className="flex items-center bg-gray-100 rounded-full p-1 max-w-fit mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-6 py-2 text-sm font-medium rounded-full capitalize transition-all duration-200 cursor-pointer ${
            activeTab === tab.key
              ? "bg-blue-500 text-white shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}; 