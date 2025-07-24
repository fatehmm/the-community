"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "../../../lib/auth-client";

export function CreatePostForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const utils = api.useUtils();
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      await utils.post.getAll.invalidate();
      setContent("");
      setIsSubmitting(false);
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    createPost.mutate({ content: content.trim() });
  };

  if (!session?.user) {
    return (
      <div className="rounded-lg bg-white/5 p-6 text-center">
        <p className="pb-4 text-gray-400">Please sign in to create posts</p>
        <Button variant="outline" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white/5 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10 border">
            <AvatarImage
              src={session.user.image ?? undefined}
              alt={session.user.name ?? "User"}
            />
            <AvatarFallback>
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <Textarea
              placeholder="What's happening?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px] resize-none border border-white/20 bg-white/10"
              maxLength={1000}
            />

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">{content.length}/1000</div>

              <Button
                type="submit"
                disabled={
                  !content.trim() || isSubmitting || content.length > 1000
                }
                className="bg-primary hover:bg-primary/90 px-6 text-white"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
