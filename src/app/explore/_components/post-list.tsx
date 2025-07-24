"use client";

import { api } from "@/trpc/react";
import { useEffect, useMemo } from "react";
import { useInView } from "react-intersection-observer";
import { PostCard } from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";

const POSTS_PER_PAGE = 20;

export function PostList() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = api.post.getAllInfinite.useInfiniteQuery(
    {
      limit: POSTS_PER_PAGE,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  // Memoize the flattened posts to avoid unnecessary re-renders
  const allPosts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items) ?? [];
  }, [data?.pages]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-lg">Error loading posts</div>
        <p className="text-red-400">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (allPosts.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-lg">No posts yet</div>
        <p>Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allPosts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Infinite scroll trigger */}
      <div ref={ref} className="py-4">
        {isFetchingNextPage && (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <PostCardSkeleton key={`loading-${i}`} />
            ))}
          </div>
        )}
        {!hasNextPage && allPosts.length > 0 && (
          <div className="text-center text-sm text-gray-400">
            You've reached the end of the feed
          </div>
        )}
      </div>
    </div>
  );
}
