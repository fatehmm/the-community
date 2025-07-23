"use client";

import { useSession } from "../../lib/auth-client";
import UserDropdown from "./user-dropdown";

export default function AuthOverlay() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="fixed top-6 right-4 z-50">
      <UserDropdown user={session.user} />
    </div>
  );
}
