import Skeleton from "react-loading-skeleton";

export function PartnerServiceCardSkeleton() {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <Skeleton 
        height={20} 
        width="80%" 
        className="mb-2" 
        baseColor="#374151" 
        highlightColor="#4B5563" 
      />
      <Skeleton 
        height={16} 
        width="60%" 
        className="mb-2" 
        baseColor="#374151" 
        highlightColor="#4B5563" 
      />
      <Skeleton 
        height={24} 
        width={80} 
        className="mt-2" 
        baseColor="#374151" 
        highlightColor="#4B5563" 
      />
    </div>
  );
}