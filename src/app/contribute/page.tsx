import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "../../lib/auth";
import CreateContribution from "./create.client";

export default async function ContributePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    redirect("/sign-in");
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <h1 className="font-tobias text-2xl lg:text-4xl">Contribute Papers</h1>
        <CreateContribution />
      </div>
    </div>
  );
}
