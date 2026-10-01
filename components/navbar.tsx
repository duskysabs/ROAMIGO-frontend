import PublicHeader from "./layout/PublicHeader";
import { getSessionState } from "@/lib/auth/session";

export default async function Navbar() {
  const session = await getSessionState();

  return (
    <PublicHeader
      isAuthenticated={session.status === "authenticated"}
      customerName={
        session.status === "authenticated"
          ? session.user.displayName ?? undefined
          : undefined
      }
    />
  );
}
