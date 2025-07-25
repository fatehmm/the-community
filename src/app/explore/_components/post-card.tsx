"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "@/lib/auth-client";
import { POLLING_CONFIG } from "@/lib/config";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Heart,
  MessageSquare,
  Repeat2,
  Send,
  Trash2,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface Comment {
  id: number;
  content: string;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    image: string | null;
  };
  userInteractions?: {
    liked: boolean;
    retweeted: boolean;
  };
}

interface PostCardProps {
  post: {
    id: number;
    content: string;
    mediaUrls: string | null;
    likeCount: number | null;
    retweetCount: number | null;
    replyCount: number | null;
    viewCount: number | null;
    createdAt: Date;
    createdBy: {
      id: string;
      name: string;
      image: string | null;
    };
    userInteractions?: {
      liked: boolean;
      retweeted: boolean;
    };
  };
}

function CommentItem({ comment }: { comment: Comment }) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(
    comment.userInteractions?.liked ?? false,
  );
  const [localLikeCount, setLocalLikeCount] = useState(0); // Comments don't have like counts in schema yet
  const [isLoading, setIsLoading] = useState(false);

  const likeMutation = api.post.like.useMutation({
    onSuccess: () => {
      setIsLoading(false);
    },
    onError: (error) => {
      console.error("Error liking comment:", error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLocalLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      setIsLoading(false);
    },
  });

  const handleLike = async () => {
    if (!session?.user || isLoading) return;

    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLocalLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    setIsLoading(true);

    likeMutation.mutate({ postId: comment.id });
  };

  return (
    <div className="flex space-x-3 border-b border-white/10 py-3 last:border-b-0">
      <Avatar className="h-8 w-8 border">
        <AvatarImage src={comment.createdBy.image ?? undefined} />
        <AvatarFallback>
          {comment.createdBy.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center space-x-2">
          <span className="text-foreground text-sm font-medium">
            {comment.createdBy.name}
          </span>
          <span className="text-xs text-gray-400">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-foreground text-sm">{comment.content}</p>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-auto p-1 text-gray-400 hover:text-red-500",
              isLiked && "text-red-500",
            )}
            onClick={handleLike}
            disabled={isLoading}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PostCard({ post }: PostCardProps) {
  const { data: session } = useSession();
  const utils = api.useUtils();

  // Local state for optimistic updates
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount ?? 0);
  const [localRetweetCount, setLocalRetweetCount] = useState(
    post.retweetCount ?? 0,
  );
  const [localReplyCount, setLocalReplyCount] = useState(post.replyCount ?? 0);
  const [isLiked, setIsLiked] = useState(post.userInteractions?.liked ?? false);
  const [isRetweeted, setIsRetweeted] = useState(
    post.userInteractions?.retweeted ?? false,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // tRPC mutations
  const likeMutation = api.post.like.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      // Invalidate and refetch posts to get updated counts
      void utils.post.getAllInfinite?.invalidate();
    },
    onError: (error) => {
      console.error("Error liking post:", error);
      // Revert optimistic update on error
      setIsLiked(!isLiked);
      setLocalLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
      setIsLoading(false);
    },
  });

  const retweetMutation = api.post.retweet.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      void utils.post.getAllInfinite?.invalidate();
    },
    onError: (error) => {
      console.error("Error retweeting post:", error);
      // Revert optimistic update on error
      setIsRetweeted(!isRetweeted);
      setLocalRetweetCount((prev) => (isRetweeted ? prev - 1 : prev + 1));
      setIsLoading(false);
    },
  });

  const createCommentMutation = api.post.create.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      setCommentContent("");
      setShowCommentForm(false);
      // Reload comments if the section is open
      if (showComments) {
        void loadComments();
      }
      // Invalidate posts to update reply count
      void utils.post.getAllInfinite?.invalidate();
    },
    onError: (error) => {
      console.error("Error commenting on post:", error);
      // Revert optimistic update on error
      setLocalReplyCount((prev) => prev - 1);
      setCommentContent("");
      setShowCommentForm(true);
      setComments((prev) => prev.filter((c) => c.id !== Date.now()));
      setIsLoading(false);
    },
  });

  const deleteMutation = api.post.delete.useMutation({
    onSuccess: () => {
      setIsLoading(false);
      window.location.reload();
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      setIsLoading(false);
    },
  });

  // tRPC query for comments
  const commentsQuery = api.post.getComments.useQuery(
    { postId: post.id, limit: 10 },
    { enabled: showComments },
  );

  // Background polling for new comments
  const [lastCommentPoll, setLastCommentPoll] = useState<number>(Date.now());
  const [hasNewComments, setHasNewComments] = useState<boolean>(false);

  useEffect(() => {
    if (!showComments) return;

    const pollForNewComments = async () => {
      try {
        // Check for new comments since last poll
        const newComments = await fetch(
          `/api/trpc/post.getNewComments?batch=1&input=${encodeURIComponent(
            JSON.stringify({
              "0": {
                json: {
                  postId: post.id,
                  since: lastCommentPoll,
                },
              },
            }),
          )}`,
        ).then((res) => res.json());

        if (
          newComments[0]?.result?.data?.items &&
          newComments[0].result.data.items.length > 0
        ) {
          // New comments found, show notification
          setHasNewComments(true);
        }
      } catch (error) {
        console.error("Background comment polling error:", error);
      }
    };

    const interval = setInterval(
      pollForNewComments,
      POLLING_CONFIG.COMMENTS_INTERVAL,
    );

    return () => clearInterval(interval);
  }, [showComments, post.id, lastCommentPoll, commentsQuery]);

  const handleRefreshComments = async () => {
    setHasNewComments(false);
    setLastCommentPoll(Date.now());
    void commentsQuery.refetch();
  };

  const loadComments = async () => {
    if (isLoadingComments) return;
    setIsLoadingComments(true);

    // The query will automatically run when showComments is true
    // We just need to wait for it to complete
    try {
      await commentsQuery.refetch();
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleLike = async () => {
    if (!session?.user || isLoading) return;

    // Optimistic update
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLocalLikeCount((prev) => (newLikedState ? prev + 1 : prev - 1));
    setIsLoading(true);

    likeMutation.mutate({ postId: post.id });
  };

  const handleRetweet = async () => {
    if (!session?.user || isLoading) return;

    // Optimistic update
    const newRetweetedState = !isRetweeted;
    setIsRetweeted(newRetweetedState);
    setLocalRetweetCount((prev) => (newRetweetedState ? prev + 1 : prev - 1));
    setIsLoading(true);

    retweetMutation.mutate({ postId: post.id });
  };

  const handleComment = async () => {
    if (!session?.user || !commentContent.trim() || isLoading) return;

    console.log(
      "Creating comment for post:",
      post.id,
      "Content:",
      commentContent,
    );

    // Optimistic update
    const newReplyCount = localReplyCount + 1;
    setLocalReplyCount(newReplyCount);
    const commentToSubmit = commentContent;
    setCommentContent("");
    setShowCommentForm(false);

    // Add the new comment to the list optimistically
    const newComment: Comment = {
      id: Date.now(), // Temporary ID
      content: commentToSubmit,
      createdAt: new Date(),
      createdBy: {
        id: session.user.id,
        name: session.user.name ?? "You",
        image: session.user.image ?? null,
      },
      userInteractions: { liked: false, retweeted: false },
    };
    setComments((prev) => [newComment, ...prev]);
    setIsLoading(true);

    createCommentMutation.mutate({
      content: commentToSubmit,
      replyToId: post.id,
    });
  };

  const handleDelete = async () => {
    if (!session?.user || isLoading) return;

    setIsLoading(true);
    deleteMutation.mutate({ postId: post.id });
  };

  // Update comments when query data changes
  React.useEffect(() => {
    if (commentsQuery.data?.items) {
      setComments(commentsQuery.data.items);
    }
  }, [commentsQuery.data]);

  return (
    <div className="rounded-lg border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex space-x-3">
        <Avatar className="h-10 w-10 border">
          <AvatarImage src={post.createdBy.image ?? undefined} />
          <AvatarFallback>
            {post.createdBy.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-foreground font-medium">
              {post.createdBy.name}
            </span>
            <span className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          <p className="text-foreground">{post.content}</p>
          {post.mediaUrls && (
            <div className="overflow-hidden rounded-lg">
              {(() => {
                try {
                  const mediaUrls = JSON.parse(post.mediaUrls) as string[];
                  if (mediaUrls.length === 1) {
                    return (
                      <img
                        src={mediaUrls[0]}
                        alt="Post media"
                        className="h-auto max-h-96 w-full object-cover"
                      />
                    );
                  } else if (mediaUrls.length === 2) {
                    return (
                      <div className="grid grid-cols-2 gap-1">
                        {mediaUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Post media ${index + 1}`}
                            className="h-48 w-full object-cover"
                          />
                        ))}
                      </div>
                    );
                  } else if (mediaUrls.length === 3) {
                    return (
                      <div className="grid grid-cols-2 gap-1">
                        <img
                          src={mediaUrls[0]}
                          alt="Post media 1"
                          className="row-span-2 h-48 w-full object-cover"
                        />
                        <img
                          src={mediaUrls[1]}
                          alt="Post media 2"
                          className="h-24 w-full object-cover"
                        />
                        <img
                          src={mediaUrls[2]}
                          alt="Post media 3"
                          className="h-24 w-full object-cover"
                        />
                      </div>
                    );
                  } else if (mediaUrls.length === 4) {
                    return (
                      <div className="grid grid-cols-2 gap-1">
                        {mediaUrls.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Post media ${index + 1}`}
                            className="h-24 w-full object-cover"
                          />
                        ))}
                      </div>
                    );
                  }
                } catch (error) {
                  // Fallback for single image stored as string
                  return (
                    <img
                      src={post.mediaUrls}
                      alt="Post media"
                      className="h-auto max-h-96 w-full object-cover"
                    />
                  );
                }
              })()}
            </div>
          )}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-auto p-2 text-gray-400 hover:text-red-500",
                  isLiked && "text-red-500",
                )}
                onClick={handleLike}
                disabled={isLoading}
              >
                <Heart className="h-5 w-5" />
                <span className="ml-1 text-sm">{localLikeCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-auto p-2 text-gray-400 hover:text-green-500",
                  isRetweeted && "text-green-500",
                )}
                onClick={handleRetweet}
                disabled={isLoading}
              >
                <Repeat2 className="h-5 w-5" />
                <span className="ml-1 text-sm">{localRetweetCount}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-2 text-gray-400 hover:text-blue-500"
                onClick={() => {
                  setShowCommentForm(!showCommentForm);
                  if (!showComments && localReplyCount > 0) {
                    setShowComments(true);
                    void loadComments();
                  }
                }}
                disabled={isLoading}
              >
                <MessageSquare className="h-5 w-5" />
                <span className="ml-1 text-sm">{localReplyCount}</span>
              </Button>
            </div>
            {session?.user.id === post.createdBy.id && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-2 text-gray-400 hover:text-red-500"
                onClick={handleDelete}
                disabled={isLoading}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Comment Form */}
          {showCommentForm && (
            <div className="flex space-x-2 pt-2">
              <Input
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void handleComment();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={handleComment}
                disabled={!commentContent.trim() || isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Comments Section */}
          {localReplyCount > 0 && (
            <div className="pt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-gray-400 hover:text-blue-500"
                onClick={() => {
                  setShowComments(!showComments);
                  if (!showComments) {
                    void loadComments();
                  }
                }}
              >
                {showComments ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                <span className="ml-1 text-sm">
                  Show {localReplyCount} comment
                  {localReplyCount !== 1 ? "s" : ""}
                </span>
              </Button>
            </div>
          )}

          {showComments && (
            <div className="mt-4 space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
              {/* New comments notification */}
              {hasNewComments && (
                <div className="mb-3 rounded-lg border border-green-500/20 bg-green-500/10 p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 animate-pulse rounded-full bg-green-500"></div>
                      <span className="text-sm text-green-400">
                        New comments available
                      </span>
                    </div>
                    <button
                      onClick={handleRefreshComments}
                      className="text-sm font-medium text-green-400 hover:text-green-300"
                    >
                      Refresh
                    </button>
                  </div>
                </div>
              )}

              {commentsQuery.isLoading ? (
                <div className="text-center text-sm text-gray-400">
                  Loading comments...
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} />
                ))
              ) : (
                <div className="text-center text-sm text-gray-400">
                  No comments yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
