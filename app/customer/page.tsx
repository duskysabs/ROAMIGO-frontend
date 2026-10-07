import { redirect } from "next/navigation";

export default async function CustomerPage() {
  redirect("/my-bookings");
}
