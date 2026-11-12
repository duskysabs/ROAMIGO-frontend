"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { isStaffWorkspacePath } from "@/lib/auth/roles";
import PublicHeader, { type PublicHeaderProps } from "./PublicHeader";

type AuthPublicHeaderProps = Omit<
  PublicHeaderProps,
  "staffLoginContext"
>;

export default function AuthPublicHeader(props: AuthPublicHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const staffLoginContext =
    pathname === "/auth/login" &&
    isStaffWorkspacePath(searchParams.get("next") ?? undefined);

  return (
    <PublicHeader {...props} staffLoginContext={staffLoginContext} />
  );
}
