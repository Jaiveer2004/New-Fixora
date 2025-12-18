import Skeleton from "react-loading-skeleton";

export function ServiceDetailSkeleton() {
  return (
    <main className="container mx-auto py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Skeleton width={100} height={16} className="mb-2" />
          <Skeleton height={40} width="80%" className="mb-4" />
          <Skeleton count={3} height={20} className="mb-2" />
        </div>
        <div>
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <Skeleton height={24} width={120} className="mb-4" />
            <Skeleton height={20} width="70%" className="mb-2" />
            <Skeleton height={16} width="90%" className="mb-4" />
            <hr className="my-4" />
            <Skeleton height={36} width={80} className="mx-auto mb-4" />
            <Skeleton height={40} width="100%" className="rounded" />
          </div>
        </div>
      </div>
    </main>
  );
}