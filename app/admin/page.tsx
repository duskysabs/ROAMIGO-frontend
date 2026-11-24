import { PageHeading } from "@/components/staff/StaffUI";
import { requireAdmin } from "@/lib/auth/require-admin";
import { adminResources, resourceKeys } from "@/lib/admin/config";
import { Button, Card } from "@/components/ui";
export default async function AdminPage() {
  await requireAdmin();
  return <><PageHeading title="Manage your operations" description="Maintain the people, fleet, packages and pricing used by your booking workflows." />
    <div className="grid gap-4 sm:grid-cols-2">{resourceKeys.map(key => <Card className="admin-card" key={key}><h2 className="text-xl font-bold">{adminResources[key].title}</h2><p className="mb-5 mt-2 text-sm leading-6 text-muted-foreground">{adminResources[key].description}</p><Button className="staff-button" href={"/admin/" + key} variant="outline">Manage {adminResources[key].title.toLowerCase()}</Button></Card>)}</div>
  </>;
}
