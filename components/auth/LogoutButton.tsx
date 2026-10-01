"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type LogoutButtonProps = {
  className?: string;
  onLoggedOut?: () => void;
};

export default function LogoutButton({
  className = "",
  onLoggedOut,
}: LogoutButtonProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    setIsSubmitting(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      onLoggedOut?.();
      router.replace("/auth/login");
      router.refresh();
      setIsSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isSubmitting}
      className={className}
    >
      {isSubmitting ? "Logging out..." : "Log out"}
    </button>
  );
}
