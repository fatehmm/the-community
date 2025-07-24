import { Suspense } from "react";
import { CreatePostForm } from "./_components/create-post-form";
import { PostList } from "./_components/post-list";

export default function ExplorePage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8 pb-24">
      <div className="mb-8">
        <h1 className="font-tobias text-4xl font-light">Explore</h1>
        <p className="mt-2 text-gray-400">Discover posts from the community</p>
      </div>

      <div className="space-y-8">
        <CreatePostForm />

        <Suspense fallback={<PostListSkeleton />}>
          <PostList />
        </Suspense>
      </div>
    </div>
  );
}

function PostListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="animate-pulse rounded-lg bg-white/5 p-6">
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
          </div>
        </div>
      ))}
    </div>
  );
}
