export function ServiceCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 shadow-lg overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="h-48 w-full bg-gray-700"></div>
      
      {/* Content skeleton */}
      <div className="p-6">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-700 rounded mb-3"></div>
        
        {/* Rating skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-16 bg-gray-700 rounded"></div>
          <div className="h-4 w-20 bg-gray-700 rounded"></div>
        </div>
        
        {/* Duration skeleton */}
        <div className="h-4 w-24 bg-gray-700 rounded mb-4"></div>
        
        {/* Price and button skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 w-16 bg-gray-700 rounded mb-1"></div>
            <div className="h-3 w-20 bg-gray-700 rounded"></div>
          </div>
          <div className="h-10 w-28 bg-gray-700 rounded"></div>
        </div>
      </div>
    </div>
  );
}