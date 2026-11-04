import type { Metadata } from "next";
import SupportPage from "@/components/support/SupportPage";

export const metadata: Metadata = {
  title: "Feedback | ROAMIGO",
  description: "Share your experience with Planet J and ROAMIGO.",
};

export default function FeedbackPage() {
  return <SupportPage kind="feedback" />;
}
