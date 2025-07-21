interface TimeFilterProps {
  activeFilter: 'Weekly' | 'Monthly' | 'Yearly';
  onFilterChange: (filter: 'Weekly' | 'Monthly' | 'Yearly') => void;
}

const TimeFilter = ({ activeFilter, onFilterChange }: TimeFilterProps) => {
  const filters: ('Weekly' | 'Monthly' | 'Yearly')[] = ['Weekly', 'Monthly', 'Yearly'];

  return (
    <div className="flex items-center bg-blue-50 rounded-full p-2">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-3 py-2 md:px-6 md:py-2 text-xs md:text-sm font-medium rounded-full transition-all duration-200 cursor-pointer ${
            activeFilter === filter
              ? 'bg-white text-blue-500 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {filter}
        </button>
      ))}
    </div>
  );
};

export default TimeFilter; 