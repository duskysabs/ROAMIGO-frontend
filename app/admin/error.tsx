"use client";
import { Alert, Button } from "@/components/ui";
export default function AdminError({ reset }: { reset: () => void }) {
  return <div className="space-y-4"><Alert variant="danger">Administration is temporarily unavailable. Please try again.</Alert><Button onClick={reset}>Try again</Button></div>;
}
