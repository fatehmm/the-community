import { Suspense } from "react";
import { CreatePostForm } from "./_components/create-post-form";
import { PostCardSkeleton } from "./_components/post-card-skeleton";
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
      {Array.from({ length: 5 }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}
