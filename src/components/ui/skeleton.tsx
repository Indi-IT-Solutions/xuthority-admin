import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
};

// Table skeleton components
export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="w-full">
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded w-24" />
        <div className="h-9 bg-gray-200 rounded w-32" />
      </div>
    </div>
    
    {/* Search and filters skeleton */}
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="h-10 bg-gray-200 rounded w-full sm:w-80" />
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded w-32" />
        <div className="h-10 bg-gray-200 rounded w-28" />
      </div>
    </div>

    {/* Table skeleton */}
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-4" />
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Pagination skeleton */}
    <div className="flex items-center justify-between mt-6">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="flex gap-1">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

// Card skeleton components
export const CardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-32" />
      <div className="h-4 bg-gray-200 rounded w-16" />
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-3/5" />
    </div>
  </div>
);

// Stats card skeleton
export const StatsCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="h-8 bg-gray-200 rounded w-16" />
      </div>
      <div className="h-12 w-12 bg-gray-200 rounded-lg" />
    </div>
  </div>
);

// Chart skeleton
export const ChartSkeleton = ({ height = 300 }: { height?: number }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="h-6 bg-gray-200 rounded w-32" />
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
    <div 
      className="bg-gray-100 rounded-lg flex items-center justify-center"
      style={{ height: `${height}px` }}
    >
      {/* <div className="text-gray-400 text-sm">Chart loading...</div> */}
    </div>
  </div>
);

// User detail skeleton
export const UserDetailSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start gap-6 mb-6">
      <div className="h-20 w-20 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
        <div className="flex gap-4">
          <div className="text-center">
            <div className="h-5 bg-gray-200 rounded w-12 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          <div className="text-center">
            <div className="h-5 bg-gray-200 rounded w-12 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
          <div className="text-center">
            <div className="h-5 bg-gray-200 rounded w-12 mb-1" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-28" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-36" />
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-24" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Vendor detail skeleton - matches the complex vendor detail page layout
export const VendorDetailSkeleton = () => (
  <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
    {/* Breadcrumb skeleton */}
    <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
      <div className="flex items-center text-xs sm:text-sm text-gray-600">
        <div className="h-4 bg-gray-200 rounded w-16" />
        <div className="h-4 bg-gray-200 rounded w-4 mx-2" />
        <div className="h-4 bg-gray-200 rounded w-48" />
      </div>
      <div className="flex items-center flex-row-reverse gap-2">
        <div className="h-8 bg-gray-200 rounded w-32" />
        <div className="h-8 bg-gray-200 rounded w-28" />
      </div>
    </div>

    {/* Main Content Card skeleton */}
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden p-3 sm:p-4 lg:p-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Left Side - Company Logo & Social skeleton */}
        <div className="flex flex-col gap-4 lg:gap-6">
          {/* Company Logo skeleton */}
          <div className="w-full sm:w-88 h-40 sm:h-48 lg:h-56 bg-gray-200 rounded-xl lg:rounded-2xl" />
          
          {/* Social Accounts skeleton */}
          <div className="w-full sm:w-80">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 lg:mb-6" />
            <div className="flex gap-3 sm:gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
              <div className="w-12 h-12 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>

        {/* Right Side - Company Details skeleton */}
        <div className="flex-1 p-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8">
            {/* Row 1 skeleton */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            ))}
            
            {/* Row 2 skeleton */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index + 5} className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            ))}
            
            {/* Row 3 skeleton */}
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index + 10} className="space-y-1">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            ))}
            
            {/* Company Description skeleton */}
            <div className="sm:col-span-2 lg:col-span-3 xl:col-span-5 space-y-1">
              <div className="h-3 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Review Summary and Badges Section skeleton */}
      <div className="flex flex-col lg:flex-row mt-6 lg:mt-8 gap-6 lg:gap-8">
        {/* Review Summary skeleton */}
        <div className="flex flex-col gap-4 lg:w-[350px] flex-shrink-0">
          <div className="h-7 bg-gray-200 rounded w-32 mb-4 lg:mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-gray-100 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center">
                <div className="mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-gray-200 rounded mx-auto" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-12 mx-auto mb-1 sm:mb-2" />
                <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Badges & Achievements skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-[300px]">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
              <div className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
              <div className="px-4 py-3">
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </div>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="border-b border-gray-200 last:border-b-0 p-3 sm:p-0">
                <div className="sm:grid sm:grid-cols-3">
                  <div className="px-3 sm:px-4 py-4 flex items-center">
                    <div className="w-8 h-8 bg-gray-200 rounded-full" />
                  </div>
                  <div className="px-3 sm:px-4 py-4 flex items-center">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                  </div>
                  <div className="px-3 sm:px-4 py-4 flex items-center">
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products Section skeleton */}
      <div className="mt-6 lg:mt-8">
        <div className="bg-white rounded-lg lg:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8">
          <div className="text-center">
            <div className="h-6 bg-gray-200 rounded w-32 mx-auto mb-4" />
            <div className="h-4 bg-gray-200 rounded w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Badge card skeleton
export const BadgeCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 bg-gray-200 rounded-lg" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-48 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
        </div>
      </div>
      <div className="h-8 bg-gray-200 rounded w-20" />
    </div>
  </div>
);

// Review card skeleton
export const ReviewCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start gap-4 mb-4">
      <div className="h-12 w-12 bg-gray-200 rounded-full" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-32 mb-1" />
        <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
        <div className="flex items-center gap-2 mb-3">
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded" />
            ))}
          </div>
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
    
    <div className="space-y-2 mb-4">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-3/5" />
    </div>
    
    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
      <div className="h-4 bg-gray-200 rounded w-24" />
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

// Resource card skeleton
export const ResourceCardSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-start gap-4">
      <div className="h-16 w-16 bg-gray-200 rounded-lg" />
      <div className="flex-1">
        <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
        <div className="h-4 bg-gray-200 rounded w-32 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-4/5" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
  </div>
);

// Page skeleton
export const PageSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex items-center justify-between">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded w-24" />
        <div className="h-9 bg-gray-200 rounded w-32" />
      </div>
    </div>
    
    {/* Content skeleton */}
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="space-y-4">
        <div className="h-6 bg-gray-200 rounded w-64" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-4/5" />
        <div className="h-4 bg-gray-200 rounded w-3/5" />
      </div>
    </div>
  </div>
);

// Meta tag skeleton
export const MetaTagSkeleton = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-6">
    <div className="flex items-center justify-between mb-4">
      <div className="h-5 bg-gray-200 rounded w-32" />
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded w-20" />
        <div className="h-8 bg-gray-200 rounded w-20" />
      </div>
    </div>
    <div className="space-y-3">
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-4/5" />
      <div className="h-4 bg-gray-200 rounded w-3/5" />
    </div>
  </div>
);

// Meta tag edit form skeleton
export const MetaTagEditSkeleton = () => (
  <div className="space-y-6">
    {/* Header skeleton */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-4" />
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
      <div className="h-9 bg-gray-200 rounded w-24" />
    </div>

    {/* Form skeleton */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="space-y-6">
        {/* Page Name field skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-200 rounded w-full" />
        </div>

        {/* Meta Title field skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-10 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>

        {/* Meta Description field skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-24 bg-gray-200 rounded w-full" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      </div>
    </div>
  </div>
);

// Collection table skeleton
export const CollectionTableSkeleton = () => (
  <div className="w-full">
    {/* Header skeleton */}
    <div className="flex items-center justify-between mb-4">
      <div className="h-8 bg-gray-200 rounded w-48" />
      <div className="flex gap-2">
        <div className="h-9 bg-gray-200 rounded w-24" />
        <div className="h-9 bg-gray-200 rounded w-32" />
      </div>
    </div>
    
    {/* Search and filters skeleton */}
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="h-10 bg-gray-200 rounded w-full sm:w-80" />
      <div className="flex gap-2">
        <div className="h-10 bg-gray-200 rounded w-32" />
        <div className="h-10 bg-gray-200 rounded w-28" />
      </div>
    </div>

    {/* Table skeleton */}
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Table header */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="h-4 bg-gray-200 rounded w-4" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
      
      {/* Table rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="h-4 bg-gray-200 rounded w-4" />
              <div className="flex items-center gap-3 flex-1">
                <div className="h-8 w-8 bg-gray-200 rounded-full" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-28" />
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Pagination skeleton */}
    <div className="flex items-center justify-between mt-6">
      <div className="h-4 bg-gray-200 rounded w-32" />
      <div className="flex gap-1">
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
        <div className="h-8 w-8 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

// Resource edit form skeleton
export const ResourceEditSkeleton = () => (
  <div className="min-h-screen bg-gray-50">
    {/* Header skeleton */}
    <div className="">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-4 animate-pulse" />
          <div className="h-4 bg-gray-300 rounded w-40 animate-pulse font-semibold" />
        </div>
        <div className="h-10 bg-blue-200 rounded-full w-24 animate-pulse" />
      </div>
    </div>

    {/* Main Content skeleton */}
    <div className="my-4">
      <div className="bg-white rounded-2xl border border-gray-200 p-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-8 animate-pulse" />
        
        {/* Banner Upload skeleton */}
        <div className="mb-8 min-w-full">
          <div className="h-5 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
          <div className="border-2 border-dashed border-gray-300 rounded-2xl h-48 sm:h-[500px] bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 animate-pulse">
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center animate-pulse">
                  <div className="h-8 w-8 bg-blue-200 rounded" />
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-48 mx-auto mb-1 animate-pulse" />
                  <div className="h-2 bg-gray-200 rounded w-64 mx-auto animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          {/* Thumbnail Upload skeleton */}
          <div className="lg:mb-8">
            <div className="h-5 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
            <div className="border-2 border-dashed border-gray-300 rounded-2xl min-w-full max-w-[400px] md:w-[400px] h-[234px] bg-gray-50 animate-pulse">
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center animate-pulse">
                    <div className="h-8 w-8 bg-blue-200 rounded" />
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mx-auto mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-40 mx-auto mb-1 animate-pulse" />
                    <div className="h-2 bg-gray-200 rounded w-48 mx-auto animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields skeleton */}
          <div className="grid grid-cols-4 gap-6 lg:mb-8 py-10 w-full">
            {/* Title field */}
            <div className="col-span-4">
              <div className="h-4 bg-gray-200 rounded w-16 mb-3 animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-full w-full animate-pulse" />
            </div>

            {/* Resource Type field */}
            <div className="col-span-4 lg:col-span-2">
              <div className="h-4 bg-gray-200 rounded w-28 mb-3 animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-full w-full animate-pulse" />
            </div>

            {/* Content Type field */}
            <div className="col-span-4 lg:col-span-2">
              <div className="h-4 bg-gray-200 rounded w-28 mb-3 animate-pulse" />
              <div className="h-14 bg-gray-200 rounded-full w-full animate-pulse" />
            </div>
          </div>
        </div>

        {/* Description field */}
        <div className="mb-8">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3 animate-pulse" />
          <div className="h-[200px] bg-gray-200 rounded-lg w-full animate-pulse" />
        </div>

        {/* Video Link field */}
        <div>
          <div className="h-4 bg-gray-200 rounded w-32 mb-3 animate-pulse" />
          <div className="h-14 bg-gray-200 rounded-full w-full animate-pulse" />
        </div>
      </div>
    </div>
  </div>
);

// Profile settings skeleton
export const ProfileSettingsSkeleton = () => (
  <div className="max-w-screen mx-auto">
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="h-10 bg-gray-200 rounded w-44" />
      </div>

      {/* Profile Form skeleton */}
      <div className="bg-white shadow-md p-6 rounded-lg border-0">
        {/* Card Header skeleton */}
        <div className="px-0 pb-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        </div>

        {/* Profile Picture skeleton */}
        <div className="mb-8">
          <div className="flex items-center mb-4 sm:mb-6">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full" />
              <div className="absolute -bottom-1 -right-1">
                <div className="w-6 h-6 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* First Name field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>

          {/* Last Name field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>

          {/* Role field */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-12" />
            <div className="h-12 bg-gray-200 rounded w-full" />
          </div>
        </div>

        {/* Additional sections skeleton */}
        <div className="space-y-6">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-full" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Dashboard stats skeleton
export const DashboardStatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
    {Array.from({ length: 3 }).map((_, index) => (
      <StatsCardSkeleton key={index} />
    ))}
  </div>
);

// Dashboard content skeleton
export const DashboardContentSkeleton = () => (
  <div className="space-y-6">
    <DashboardStatsSkeleton />
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
    
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 bg-gray-200 rounded w-32" />
        <div className="h-8 bg-gray-200 rounded w-24" />
      </div>
      <TableSkeleton rows={5} />
    </div>
  </div>
);

export { Skeleton }; 