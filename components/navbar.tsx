import { Suspense } from "react";
import PublicHeader from "./layout/PublicHeader";
import AuthPublicHeader from "./layout/AuthPublicHeader";
import { getSessionState } from "@/lib/auth/session";

export default async function Navbar({
  authContext = false,
}: {
  authContext?: boolean;
}) {
  const session = await getSessionState();
  const headerProps = {
    isAuthenticated: session.status === "authenticated",
    customerName:
      session.status === "authenticated"
        ? session.user.displayName ?? undefined
        : undefined,
    customerEmail:
      session.status === "authenticated"
        ? session.user.email ?? undefined
        : undefined,
  };

  if (authContext) {
    return (
      <Suspense fallback={<PublicHeader {...headerProps} />}>
        <AuthPublicHeader {...headerProps} />
      </Suspense>
    );
  }

  return <PublicHeader {...headerProps} />;
}
