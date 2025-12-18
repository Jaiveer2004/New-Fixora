import Skeleton from "react-loading-skeleton";

export function BookingCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-gray-700 p-4 bg-gray-800 shadow-lg">
      <div className="flex-grow">
        <Skeleton 
          height={20} 
          width={200} 
          className="mb-2" 
          baseColor="#374151" 
          highlightColor="#4B5563" 
        />
        <Skeleton 
          height={16} 
          width={150} 
          className="mb-2" 
          baseColor="#374151" 
          highlightColor="#4B5563" 
        />
        <Skeleton 
          height={24} 
          width={80} 
          className="rounded-full" 
          baseColor="#374151" 
          highlightColor="#4B5563" 
        />
      </div>
      <div className="ml-4">
        <Skeleton 
          height={36} 
          width={120} 
          className="rounded" 
          baseColor="#374151" 
          highlightColor="#4B5563" 
        />
      </div>
    </div>
  );
}