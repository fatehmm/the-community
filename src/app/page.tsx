import { auth } from "@/lib/auth";
import { api, HydrateClient } from "@/trpc/server";
import { headers } from "next/headers";
import { connection } from "next/server";
import Hero from "../components/marketing/hero";

export default async function Home() {
  await connection();
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    void api.post.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <Hero />
    </HydrateClient>
  );
}
