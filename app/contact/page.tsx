import type { Metadata } from "next";
import SupportPage from "@/components/support/SupportPage";

export const metadata: Metadata = {
  title: "Contact Us | ROAMIGO",
  description: "Get help with your Cebu trip, booking, or travel plans.",
};

export default function ContactPage() {
  return <SupportPage kind="contact" />;
}
