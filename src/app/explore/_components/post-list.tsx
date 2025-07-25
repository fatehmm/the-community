"use client";

import { CACHE_CONFIG, POLLING_CONFIG } from "@/lib/config";
import { api } from "@/trpc/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { PostCard } from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";

const POSTS_PER_PAGE = 20;

export function PostList() {
  const { ref, inView } = useInView({
    threshold: 0.1,
    rootMargin: "100px",
  });

  const lastPollTime = useRef<number>(Date.now());
  const isPolling = useRef<boolean>(false);
  const [hasNewPosts, setHasNewPosts] = useState<boolean>(false);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = api.post.getAllInfinite.useInfiniteQuery(
    {
      limit: POSTS_PER_PAGE,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: CACHE_CONFIG.STALE_TIME,
      gcTime: CACHE_CONFIG.GC_TIME,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  );

  // Background polling for new posts
  const getNewPostsQuery = api.post.getNewPosts.useQuery(
    { since: lastPollTime.current },
    {
      enabled: false, // Don't run automatically
      staleTime: 0, // Always consider stale
    },
  );

  useEffect(() => {
    const pollForNewPosts = async () => {
      if (isPolling.current) return;

      isPolling.current = true;
      try {
        // Check for new posts since last poll
        const result = await getNewPostsQuery.refetch();

        if (result.data?.items && result.data.items.length > 0) {
          // New posts found, show notification
          setHasNewPosts(true);
        }
      } catch (error) {
        console.error("Background polling error:", error);
      } finally {
        isPolling.current = false;
      }
    };

    const interval = setInterval(() => {
      void pollForNewPosts();
    }, POLLING_CONFIG.POSTS_INTERVAL);

    // Also poll when user becomes active (tab focus, visibility change)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        void pollForNewPosts();
      }
    };

    const handleFocus = () => {
      void pollForNewPosts();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [refetch, getNewPostsQuery]);

  const handleRefresh = async () => {
    setHasNewPosts(false);
    lastPollTime.current = Date.now();
    await refetch();
  };

  // Memoize the flattened posts to avoid unnecessary re-renders
  const allPosts = useMemo(() => {
    return data?.pages.flatMap((page) => page.items ?? []) ?? [];
  }, [data?.pages]);

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
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
      {/* New posts notification */}
      {hasNewPosts && (
        <div className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500"></div>
              <span className="text-sm text-blue-400">New posts available</span>
            </div>
            <button
              onClick={handleRefresh}
              className="text-sm font-medium text-blue-400 hover:text-blue-300"
            >
              Refresh
            </button>
          </div>
        </div>
      )}

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
            You&apos;ve reached the end of the feed
          </div>
        )}
      </div>
    </div>
  );
}
