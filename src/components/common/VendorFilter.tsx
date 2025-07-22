import React, { useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface VendorFilterProps {
  onFilterChange: (filters: VendorFilters) => void;
  currentFilters: VendorFilters;
}

export interface VendorFilters {
  dateFilter: 'weekly' | 'monthly' | 'yearly' | 'custom' | null;
  dateFrom?: string;
  dateTo?: string;
}

const VendorFilter: React.FC<VendorFilterProps> = ({
  onFilterChange,
  currentFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<VendorFilters>(currentFilters);

  const handleDateFilterChange = (filterType: 'weekly' | 'monthly' | 'yearly' | 'custom') => {
    setLocalFilters(prev => ({
      ...prev,
      dateFilter: filterType,
      dateFrom: filterType === 'custom' ? prev.dateFrom : undefined,
      dateTo: filterType === 'custom' ? prev.dateTo : undefined
    }));
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    setLocalFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplyFilter = () => {
    onFilterChange(localFilters);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    const clearedFilters: VendorFilters = {
      dateFilter: null,
      dateFrom: undefined,
      dateTo: undefined
    };
    setLocalFilters(clearedFilters);
    onFilterChange(clearedFilters);
    setIsOpen(false);
  };



  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46 22,3" />
          </svg>
          Filters
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 bg-white rounded-xl shadow-lg border border-gray-200" 
        align="end"
      >
        <div className="p-6">
          {/* By Date Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">By Date</h3>
            
            <div className="space-y-3">
              {/* Weekly */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value="weekly"
                  checked={localFilters.dateFilter === 'weekly'}
                  onChange={() => handleDateFilterChange('weekly')}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-gray-700 font-medium">Weekly</span>
              </label>

              {/* Monthly */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value="monthly"
                  checked={localFilters.dateFilter === 'monthly'}
                  onChange={() => handleDateFilterChange('monthly')}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-gray-700 font-medium">Monthly</span>
              </label>

              {/* Yearly */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value="yearly"
                  checked={localFilters.dateFilter === 'yearly'}
                  onChange={() => handleDateFilterChange('yearly')}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-gray-700 font-medium">Yearly</span>
              </label>

              {/* Custom */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="dateFilter"
                  value="custom"
                  checked={localFilters.dateFilter === 'custom'}
                  onChange={() => handleDateFilterChange('custom')}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-3 text-gray-700 font-medium">Custom</span>
              </label>
            </div>
          </div>

          {/* Custom Date Range Picker */}
          {localFilters.dateFilter === 'custom' && (
            <div className="mb-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">From Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="date"
                    value={localFilters.dateFrom || ''}
                    onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                    className="pl-10 h-10 bg-gray-50 border border-gray-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">To Date</label>
                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="date"
                    value={localFilters.dateTo || ''}
                    onChange={(e) => handleDateChange('dateTo', e.target.value)}
                    className="pl-10 h-10 bg-gray-50 border border-gray-200"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClearAll}
              className="flex-1 h-12 border-2 border-red-200 text-red-600 hover:bg-red-50 font-medium rounded-full"
            >
              Clear All
            </Button>
            <Button
              type="button"
              onClick={handleApplyFilter}
              className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full"
            >
              Apply Filter
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VendorFilter; 