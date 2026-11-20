import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isAdminResource } from "@/lib/admin/config";
import AdminWorkspace from "@/components/admin/AdminWorkspace";
export default async function AdminResourcePage({ params }: { params: Promise<{ resource: string }> }) {
  await requireAdmin();
  const { resource } = await params;
  if (!isAdminResource(resource)) notFound();
  return <AdminWorkspace key={resource} resource={resource} />;
}
