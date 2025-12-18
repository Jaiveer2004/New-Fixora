import Skeleton from "react-loading-skeleton";

export function PartnerStatusToggleSkeleton() {
  return (
    <div className="flex items-center space-x-3 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-lg">
      <Skeleton 
        width={44} 
        height={24} 
        className="rounded-full" 
        baseColor="#374151" 
        highlightColor="#4B5563" 
      />
      <Skeleton 
        width={200} 
        height={20} 
        baseColor="#374151" 
        highlightColor="#4B5563" 
      />
    </div>
  );
}