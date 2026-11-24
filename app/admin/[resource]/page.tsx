import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isAdminResource } from "@/lib/admin/config";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
import PricingWorkspace from "@/components/admin/PricingWorkspace";
export default async function AdminResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  await requireAdmin();
  const { resource } = await params;
  if (!isAdminResource(resource)) notFound();
  return resource === "pricing" ? <PricingWorkspace /> : <AdminWorkspace key={resource} resource={resource} />;
}
