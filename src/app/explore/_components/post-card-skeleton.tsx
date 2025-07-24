export function PostCardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg bg-white/5 p-6">
      <div className="mb-4 flex items-center space-x-3">
        <div className="h-10 w-10 rounded-full bg-white/10"></div>
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-white/10"></div>
          <div className="h-3 w-24 rounded bg-white/10"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-white/10"></div>
        <div className="h-4 w-3/4 rounded bg-white/10"></div>
        <div className="h-4 w-1/2 rounded bg-white/10"></div>
      </div>
      <div className="mt-4 flex items-center space-x-6">
        <div className="h-4 w-16 rounded bg-white/10"></div>
        <div className="h-4 w-16 rounded bg-white/10"></div>
        <div className="h-4 w-16 rounded bg-white/10"></div>
      </div>
    </div>
  );
}
