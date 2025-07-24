import React, { useState, useEffect } from "react";
import { CalendarDays, ChevronDown, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface ReviewFilterProps {
  onFilterChange: (filters: ReviewFilters) => void;
  currentFilters: ReviewFilters;
}

export interface ReviewFilters {
  dateFilter: 'weekly' | 'monthly' | 'yearly' | 'custom' | null;
  dateFrom?: string;
  dateTo?: string;
  rating?: number | null;
  appliedAt?: number; // Timestamp to force refresh even when same filter is applied
}

const ReviewFilter: React.FC<ReviewFilterProps> = ({
  onFilterChange,
  currentFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ReviewFilters>(currentFilters);

  // Sync localFilters with currentFilters when popover opens
  useEffect(() => {
    if (isOpen) {
      console.log('Popover opened, syncing filters:', currentFilters);
      setLocalFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  const handleDateFilterChange = (filterType: 'weekly' | 'monthly' | 'yearly' | 'custom') => {
    console.log('Date filter changed to:', filterType);
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

  const handleRatingFilterChange = (rating: number | null) => {
    console.log('Rating filter changed to:', rating);
    setLocalFilters(prev => ({
      ...prev,
      rating: rating
    }));
  };

  const handleApplyFilter = () => {
    const filtersWithTimestamp = {
      ...localFilters,
      appliedAt: Date.now() // Add timestamp to force refresh
    };
    console.log('Applying filters:', filtersWithTimestamp);
    onFilterChange(filtersWithTimestamp);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    const clearedFilters: ReviewFilters = {
      dateFilter: null,
      dateFrom: undefined,
      dateTo: undefined,
      rating: null,
      appliedAt: Date.now()
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
          className="h-12 px-3 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 flex items-center gap-2"
        >
          <ListFilter className="w-4 h-4"/>
          Filters
          <ChevronDown className="w-4 h-4"/>
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
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
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
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
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
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
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
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
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

          {/* By Rating Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">By Rating</h3>
            
            <div className="space-y-3">
              {/* All Ratings */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="ratingFilter"
                  value="all"
                  checked={localFilters.rating === null}
                  onChange={() => handleRatingFilterChange(null)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
                />
                <span className="ml-3 text-gray-700 font-medium">All Ratings</span>
              </label>

              {/* 5 Stars */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="ratingFilter"
                  value="5"
                  checked={localFilters.rating === 5}
                  onChange={() => handleRatingFilterChange(5)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
                />
                <span className="ml-3 text-gray-700 font-medium">5 Stars</span>
              </label>

              {/* 4 Stars */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="ratingFilter"
                  value="4"
                  checked={localFilters.rating === 4}
                  onChange={() => handleRatingFilterChange(4)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
                />
                <span className="ml-3 text-gray-700 font-medium">4 Stars</span>
              </label>

              {/* 3 Stars */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="ratingFilter"
                  value="3"
                  checked={localFilters.rating === 3}
                  onChange={() => handleRatingFilterChange(3)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
                />
                <span className="ml-3 text-gray-700 font-medium">3 Stars</span>
              </label>

              {/* 2 Stars */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="ratingFilter"
                  value="2"
                  checked={localFilters.rating === 2}
                  onChange={() => handleRatingFilterChange(2)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
                />
                <span className="ml-3 text-gray-700 font-medium">2 Stars</span>
              </label>

              {/* 1 Star */}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="ratingFilter"
                  value="1"
                  checked={localFilters.rating === 1}
                  onChange={() => handleRatingFilterChange(1)}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300"
                />
                <span className="ml-3 text-gray-700 font-medium">1 Star</span>
              </label>
            </div>
          </div>

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

export default ReviewFilter; 