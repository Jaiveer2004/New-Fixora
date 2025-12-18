export function BookingPageSkeleton() {
  return (
    <main className="container mx-auto py-8 pt-24 px-4">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 animate-pulse">
          <div className="w-12 h-4 bg-gray-700 rounded"></div>
          <span>/</span>
          <div className="w-20 h-4 bg-gray-700 rounded"></div>
          <span>/</span>
          <div className="w-24 h-4 bg-gray-700 rounded"></div>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Service Details Skeleton */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 mb-6 animate-pulse">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="h-10 bg-gray-700 rounded-lg mb-2 w-3/4"></div>
                  <div className="flex items-center gap-4">
                    <div className="h-6 bg-blue-600/20 rounded-full w-20"></div>
                    <div className="h-4 bg-gray-700 rounded w-16"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-8 bg-gray-700 rounded-lg w-24 mb-1"></div>
                  <div className="h-4 bg-gray-700 rounded w-16"></div>
                </div>
              </div>

              <div className="mb-6">
                <div className="h-6 bg-gray-700 rounded-lg mb-3 w-48"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>

              {/* Provider Selection Skeleton */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-6 bg-gray-700 rounded-lg w-64"></div>
                  <div className="h-5 bg-gray-700 rounded w-32"></div>
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-600 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-gray-700 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-48"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form Skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden animate-pulse">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
                <div className="h-6 bg-blue-500 rounded mb-2 w-40"></div>
                <div className="h-4 bg-blue-400 rounded w-56"></div>
              </div>

              {/* Form Content */}
              <div className="p-6 space-y-6">
                {/* Service Summary */}
                <div className="bg-gray-700/50 rounded-xl p-4 border border-gray-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-5 bg-gray-700 rounded w-32"></div>
                    <div className="h-6 bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-5 bg-gray-700 rounded w-16"></div>
                    <div className="h-4 bg-gray-700 rounded w-12"></div>
                  </div>
                </div>

                {/* Form Fields */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i}>
                    <div className="h-4 bg-gray-700 rounded w-24 mb-2"></div>
                    <div className="h-12 bg-gray-700 rounded-xl w-full"></div>
                  </div>
                ))}

                {/* Submit Button */}
                <div className="h-12 bg-blue-600 rounded-xl w-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}