"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUploadThing } from "@/lib/uploadthing";
import { api } from "@/trpc/react";
import { Image, X } from "lucide-react";
import Link from "next/link";
import React, { useCallback, useState } from "react";
import { useSession } from "../../../lib/auth-client";

export function CreatePostForm() {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const utils = api.useUtils();
  const createPost = api.post.create.useMutation({
    onSuccess: async () => {
      await utils.post.invalidate();
      await utils.post.getAll.invalidate();
      setContent("");
      setUploadedImages([]);
      setIsSubmitting(false);
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const { startUpload } = useUploadThing("postImageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload completed successfully:", res);
      setIsUploading(false);
      if (res) {
        const newImageUrls = res.map((file) => file.url);
        console.log("New image URLs:", newImageUrls);
        setUploadedImages((prev) => [...prev, ...newImageUrls]);
      }
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      setIsUploading(false);
    },
    onUploadBegin: (fileName) => {
      console.log("Upload beginning for:", fileName);
    },
  });

  // Debug UploadThing configuration
  React.useEffect(() => {
    console.log(
      "UploadThing App ID:",
      process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID,
    );
    console.log("UploadThing hook initialized:", !!startUpload);
  }, [startUpload]);

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      console.log("Files selected:", files);
      if (!files || files.length === 0) return;

      setIsUploading(true);
      try {
        console.log("Starting upload...");
        const result = await startUpload(Array.from(files));
        console.log("Upload result:", result);
      } catch (error) {
        console.error("Error uploading images:", error);
        setIsUploading(false);
      }
    },
    [startUpload],
  );

  const removeImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && uploadedImages.length === 0) || isSubmitting)
      return;

    setIsSubmitting(true);
    createPost.mutate({
      content: content.trim(),
      mediaUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
    });
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

            {/* Image Upload Section */}
            <div className="mt-3 space-y-3">
              {/* Upload Button */}
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading || uploadedImages.length >= 4}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex cursor-pointer items-center space-x-2"
                  disabled={isUploading || uploadedImages.length >= 4}
                  onClick={() => {
                    console.log("Button clicked, triggering file input");
                    document.getElementById("image-upload")?.click();
                  }}
                >
                  <Image className="h-4 w-4" />
                  <span>Add Images</span>
                </Button>
                {isUploading && (
                  <span className="text-sm text-gray-400">Uploading...</span>
                )}
                {uploadedImages.length >= 4 && (
                  <span className="text-sm text-gray-400">Max 4 images</span>
                )}
              </div>

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {uploadedImages.map((imageUrl, index) => (
                    <div key={index} className="group relative">
                      <img
                        src={imageUrl}
                        alt={`Upload ${index + 1}`}
                        className="h-24 w-full rounded-lg object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {content.length}/1000 • {uploadedImages.length}/4 images
              </div>

              <Button
                type="submit"
                disabled={
                  (!content.trim() && uploadedImages.length === 0) ||
                  isSubmitting ||
                  content.length > 1000 ||
                  isUploading
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
