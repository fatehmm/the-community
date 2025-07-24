import { Button } from "@/components/ui/button";
import { MessageSquare, Users } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pb-24">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl space-y-8 text-center">
          {/* App branding */}
          <div className="space-y-2">
            <h1 className="font-tobias text-4xl font-light tracking-tight text-slate-900 md:text-6xl">
              The Community
            </h1>
          </div>

          {/* Description */}
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Connect with others, share your thoughts, and discover what&apos;s
            happening in your community.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="w-full px-8 py-3 text-white sm:w-auto"
            >
              <Link href="/explore">
                <MessageSquare className="mr-2 h-5 w-5" />
                Explore Posts
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full bg-transparent px-8 py-3 sm:w-auto"
            >
              <Link href="/profile">
                <Users className="mr-2 h-5 w-5" />
                View Profile
              </Link>
            </Button>
          </div>

          {/* Quick stats or info */}
          <div className="pt-8 text-sm text-slate-500">
            <p>Connect and share with your community</p>
            <p>
              Completely free.{" "}
              <Button
                asChild
                className="p-0 text-slate-500 underline"
                variant={"link"}
              >
                <a href="https://github.com/fatehmm/social-media">
                  Proudly open source.
                </a>
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
