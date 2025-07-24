"use client";

import { api } from "@/trpc/react";
import { PostCard } from "./post-card";

export function PostList() {
  const {
    data: posts,
    isLoading,
    error,
  } = api.post.getAll.useQuery({ limit: 20 });

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-lg">Loading posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-lg">Error loading posts</div>
        <p className="text-red-400">{error.message}</p>
      </div>
    );
  }

  if (!posts || posts.items.length === 0) {
    return (
      <div className="py-12 text-center">
        <div className="mb-2 text-lg">No posts yet</div>
        <p>Be the first to share something!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.items.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
