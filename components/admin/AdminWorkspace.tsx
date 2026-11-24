"use client";
import { PageHeading } from "@/components/staff/StaffUI";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Alert, Button, Card, EmptyState, FormField, Input, Textarea } from "@/components/ui";
import { adminResources, isRecord, recordStatus, recordTitle, stopFields, text, type AdminAction, type AdminField, type AdminResource } from "@/lib/admin/config";

type Row = Record<string, unknown> & { id: string };
type Editor = { action: AdminAction; row?: Row };
type Values = Record<string, string>;
type CatalogType = { id: string; name: string };
const selectClass = "min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground focus:outline-2 focus:outline-primary sm:text-sm";
const blankStop = (): Values => ({ locationName: "", formattedAddress: "", activity: "", latitude: "", longitude: "", defaultStopMinutes: "0" });

function readRows(body: unknown): { rows: Row[]; total: number; pages: number } {
  const rows = Array.isArray(body) ? body : isRecord(body) && Array.isArray(body.data) ? body.data : null;
  if (!rows || !rows.every(row => isRecord(row) && typeof row.id === "string")) throw new Error("The service returned an invalid record list.");
  const meta = isRecord(body) && isRecord(body.meta) ? body.meta : null;
  return { rows: rows as Row[], total: meta && typeof meta.total === "number" ? meta.total : rows.length, pages: meta && typeof meta.totalPages === "number" ? Math.max(1, meta.totalPages) : 1 };
}
function initialValues(editor: Editor): Values {
  const row: Record<string, unknown> = editor.row ?? {};
  const values = isRecord(row.user) ? { ...row, ...row.user } : row;
  return Object.fromEntries(editor.action.fields.map(field => {
    let value = text(values[field.name]);
    if (field.name === "driverId") value = text(row.assignedDriverId);
    if (field.kind === "date") value = value.slice(0, 10);
    if (field.kind === "datetime-local" && value) {
      const date = new Date(value);
      if (Number.isFinite(date.getTime())) value = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
    return [field.name, value];
  }));
}
function Field({ field, value, onChange, id }: { field: AdminField; value: string; onChange: (value: string) => void; id: string }) {
  if (field.kind === "select") return <div><label className="text-sm font-semibold" htmlFor={id}>{field.label}</label><select id={id} name={id} required value={value} onChange={event => onChange(event.target.value)} className={"mt-2 " + selectClass}><option value="">Choose {field.label.toLowerCase()}</option>{field.options?.map(option => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></div>;
  return <FormField htmlFor={id} label={field.label} optional={field.optional} hint={field.hint}>
    {field.kind === "textarea" ? <Textarea name={id} value={value} onChange={event => onChange(event.target.value)} required={!field.optional} maxLength={field.maxLength} rows={3} /> :
      <Input name={id} type={field.kind ?? "text"} {...(field.kind === "date" || field.kind === "datetime-local" ? { defaultValue: value } : { value })} onChange={event => onChange(event.target.value)} required={!field.optional} min={field.min} max={field.max} step={field.step} maxLength={field.maxLength} />}
  </FormField>;
}
function RecordDetails({ resource, row }: { resource: AdminResource; row: Row }) {
  const user = isRecord(row.user) ? row.user : {};
  const type = isRecord(row.vehicleType) ? row.vehicleType : {};
  const entries: Array<[string, string]> = [["Record ID", row.id]];
  if (resource === "staff") entries.push(["Auth user ID", text(row.userId)], ["Phone", text(user.phoneNumber)], ["Account", text(user.accountStatus)], ["Driver ID", isRecord(row.driver) ? text(row.driver.id) : "Not linked"]);
  if (resource === "vehicles") entries.push(["Plate", text(row.plateNumber)], ["Capacity", text(row.passengerCapacity)], ["Vehicle type ID", text(row.vehicleTypeId)], ["Designated Driver ID", text(row.assignedDriverId) || "Not paired"]);
  if (resource === "drivers") entries.push(["Staff ID", text(row.staffId)], ["Licence", text(row.licenseNumber)], ["Licence expiry", text(row.licenseExpiry).slice(0, 10)]);
  if (resource === "packages") entries.push(["Base price (PHP)", text(row.basePrice)], ["Duration (minutes)", text(row.estimatedDurationMinutes)], ["Route stops", Array.isArray(row.stops) ? String(row.stops.length) : "0"]);
  if (resource === "pricing") entries.push(["Vehicle type", text(type.vehicleType)], ["Vehicle type ID", text(row.vehicleTypeId)], ["Base rate (PHP)", text(row.baseRate)], ["Minimum adjustment (%)", text(row.minAdjustmentPct)], ["Maximum adjustment (%)", text(row.maxAdjustmentPct)], ["Effective from", text(row.effectiveFrom)], ["Effective until", text(row.effectiveUntil) || "No end date"]);
  return <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">{entries.map(([label, value]) => <div key={label}><dt className="text-muted-foreground">{label}</dt><dd className="mt-1 break-words [overflow-wrap:anywhere]">{value || "Not provided"}</dd></div>)}</dl>;
}
function AdminEditor({ editor, resource, onClose, onSaved }: { editor: Editor; resource: AdminResource; onClose: () => void; onSaved: () => void }) {
  const [values, setValues] = useState<Values>(() => initialValues(editor));
  const [stops, setStops] = useState<Values[]>(() => Array.isArray(editor.row?.stops) ? editor.row.stops.filter(isRecord).map(stop => Object.fromEntries(stopFields.map(field => [field.name, text(stop[field.name])]))) : [blankStop(), blankStop()]);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); }, []);
  function buildFields(fields: readonly AdminField[], source: Values): Record<string, unknown> {
    return Object.fromEntries(fields.flatMap(field => {
      const raw = (source[field.name] ?? "").trim();
      if (!raw && field.optional) return [];
      const value = field.kind === "number" ? Number(raw) : field.kind === "datetime-local" ? new Date(raw).toISOString() : raw;
      return [[field.name, value]];
    }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || uncertain) return;
    const form = new FormData(event.currentTarget);
    const submittedValues = (fields: readonly AdminField[], prefix: string): Values => Object.fromEntries(fields.map(field => [field.name, String(form.get(prefix + field.name) ?? "")]));
    inFlight.current = true; setBusy(true); setError(null);
    try {
      const submitted = submittedValues(editor.action.fields, "admin-");
      const body = buildFields(editor.action.fields, submitted);
      if (editor.action.id === "pair") body.driverId = submitted.driverId?.trim() || null;
      if (editor.action.stops) body.stops = stops.map((_, index) => ({ ...buildFields(stopFields, submittedValues(stopFields, "stop-" + index + "-")), stopType: index === 0 ? "PICKUP" : index === stops.length - 1 ? "DROPOFF" : "INTERMEDIATE" }));
      const response = await fetch("/api/admin/" + resource, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operation: editor.action.id, id: editor.row?.id, values: body, confirmed }), signal: AbortSignal.timeout(30000) });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        if (response.status >= 500) setUncertain(true);
        throw new Error(isRecord(result) && typeof result.message === "string" ? result.message : "The change could not be saved.");
      }
      if (!isRecord(result)) {
        setUncertain(true);
        throw new Error("The saved result could not be verified. Refresh the records before retrying.");
      }
      onSaved();
    } catch (failure) {
      if (!(failure instanceof Error) || failure.name === "TypeError" || failure.name === "TimeoutError") setUncertain(true);
      setError(failure instanceof Error ? failure.message : "The service could not be reached.");
    } finally { inFlight.current = false; setBusy(false); }
  }
  return <Card className="admin-card"><form onSubmit={submit} className="space-y-5">
    <div><h2 ref={heading} tabIndex={-1} className="text-xl font-bold outline-none">{editor.action.label}</h2>{editor.row && <p className="mt-2 break-all text-sm text-muted-foreground">{recordTitle(resource, editor.row)} · {editor.row.id}</p>}</div>
    <fieldset disabled={busy || uncertain} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">{editor.action.fields.map(field => <Field key={field.name} id={"admin-" + field.name} field={field} value={values[field.name] ?? ""} onChange={value => setValues(current => ({ ...current, [field.name]: value }))} />)}</div>
      {editor.action.stops && <section aria-label="Package route" className="space-y-4"><h3 className="font-bold">Ordered route</h3><p className="text-sm text-muted-foreground">The first stop is pickup and the last is drop-off. Stops between them are intermediate stops.</p>{stops.map((stop, index) => <fieldset key={index} className="rounded-xl border border-border p-4"><legend className="px-2 font-semibold">Stop {index + 1} ({index === 0 ? "Pickup" : index === stops.length - 1 ? "Drop-off" : "Intermediate"})</legend><div className="grid gap-4 sm:grid-cols-2">{stopFields.map(field => <Field key={field.name} id={"stop-" + index + "-" + field.name} field={field} value={stop[field.name] ?? ""} onChange={value => setStops(current => current.map((item, position) => position === index ? { ...item, [field.name]: value } : item))} />)}</div>{stops.length > 2 && <Button className="mt-4" type="button" variant="quiet" onClick={() => setStops(current => current.filter((_, position) => position !== index))}>Remove stop {index + 1}</Button>}</fieldset>)}<Button className="staff-button" type="button" variant="outline" disabled={stops.length >= 30} onClick={() => setStops(current => [...current.slice(0, -1), blankStop(), current[current.length - 1]])}>Add intermediate stop</Button></section>}
      {editor.action.confirmation && <label className="flex items-start gap-3 rounded-xl border border-border bg-surface-warm p-4 text-sm leading-6"><input type="checkbox" required checked={confirmed} onChange={event => setConfirmed(event.target.checked)} className="mt-1 h-5 w-5 accent-primary" /><span>{editor.action.confirmation}</span></label>}
    </fieldset>
    {error && <Alert variant="danger">{error}</Alert>}
    {uncertain && <Alert variant="warning">The result could not be confirmed. Refresh the records and check whether the change was saved before trying again.</Alert>}
    <div className="flex flex-wrap gap-3"><Button className="staff-button" type="submit" disabled={busy || uncertain}>{busy ? "Saving..." : "Save change"}</Button><Button className="staff-button" type="button" variant="outline" disabled={busy} onClick={onClose}>{uncertain ? "Close and refresh records" : "Cancel"}</Button></div>
  </form></Card>;
}
export default function AdminWorkspace({ resource }: { resource: AdminResource }) {
  const definition = adminResources[resource];
  const [rows, setRows] = useState<Row[]>([]);
  const [catalog, setCatalog] = useState<CatalogType[]>([]);
  const [catalogError, setCatalogError] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editor, setEditor] = useState<Editor | null>(null);
  const [search, setSearch] = useState("");
  function reload() { setLoading(true); setRefresh(value => value + 1); }
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/admin/" + resource + "?page=" + page, { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]) });
        const body: unknown = await response.json();
        if (!response.ok) throw new Error(isRecord(body) && typeof body.message === "string" ? body.message : "Unable to load records.");
        const result = readRows(body);
        if (!controller.signal.aborted) { setRows(result.rows); setPages(result.pages); setTotal(result.total); setError(null); }
      } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Unable to load records."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [resource, page, refresh]);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/admin/vehicle-types", { cache: "no-store", signal: controller.signal }).then(async response => {
      const body: unknown = await response.json();
      if (!response.ok || !Array.isArray(body) || !body.every(item => isRecord(item) && typeof item.id === "string" && typeof item.name === "string")) throw new Error("Catalog unavailable");
      if (!controller.signal.aborted) setCatalog(body as CatalogType[]);
    }).catch(() => { if (!controller.signal.aborted) setCatalogError(true); });
    return () => controller.abort();
  }, []);
  const visible = rows.filter(row => (recordTitle(resource, row) + " " + row.id + " " + text(row.plateNumber) + " " + recordStatus(row)).toLowerCase().includes(search.toLowerCase()));
  return <><PageHeading title={definition.title} description={definition.description} action={<Button className="staff-button" disabled={loading || Boolean(editor)} onClick={() => { setNotice(null); setEditor({ action: definition.actions[0] }); }}>{definition.actions[0].label}</Button>} />
    {notice && <Alert variant="success">{notice}</Alert>}
    {editor && <AdminEditor key={editor.action.id + (editor.row?.id ?? "new")} editor={editor} resource={resource} onClose={() => { setEditor(null); reload(); }} onSaved={() => { setEditor(null); setNotice("Change saved. Records are being refreshed."); reload(); }} />}
    {(resource === "vehicles" || resource === "pricing") && <Card className="admin-card" padding="sm"><h2 className="font-semibold">Vehicle type reference</h2>{catalogError ? <p className="mt-2 text-sm text-muted-foreground">The vehicle catalog is unavailable. Refresh this page to retry.</p> : catalog.length ? <dl className="mt-2 space-y-2 text-sm">{catalog.map(type => <div key={type.id} className="flex flex-wrap gap-2"><dt className="font-semibold">{type.name}</dt><dd className="break-all">{type.id}</dd></div>)}</dl> : <p className="mt-2 text-sm text-muted-foreground">No customer-selectable vehicle types were returned. Vehicle types must already exist before creating vehicles or pricing.</p>}</Card>}
    <div className="flex flex-wrap items-end gap-3"><div className="min-w-48 flex-1"><label htmlFor="admin-search" className="text-sm font-semibold">Filter this page</label><Input id="admin-search" className="mt-2" value={search} onChange={event => setSearch(event.target.value)} placeholder="Name, reference or status" /></div><Button className="staff-button" variant="outline" disabled={loading || Boolean(editor)} onClick={reload}>Refresh records</Button></div>
    {loading ? <p role="status">Loading records...</p> : error ? <Alert variant="danger">{error} <Button className="staff-button" variant="quiet" onClick={reload}>Try again</Button></Alert> : !visible.length ? <EmptyState title={search ? "No matching records" : "No records yet"} description={search ? "Change the filter to see more records on this page." : "Create a record to get started."} /> : <div className="space-y-4">{visible.map(row => <Card className="admin-card" key={row.id}><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{recordTitle(resource, row)}</h2><p className="mt-1 text-sm font-semibold text-primary">{recordStatus(row).replaceAll("_", " ")}</p></div><div className="min-w-48"><label htmlFor={"actions-" + row.id} className="sr-only">Actions for {recordTitle(resource, row)}</label><select id={"actions-" + row.id} className={selectClass} disabled={Boolean(editor)} value="" onChange={event => { const action = definition.actions.find(item => item.id === event.target.value); if (action) { setNotice(null); setEditor({ action, row }); } }}><option value="">Choose action</option>{definition.actions.filter(action => action.record).map(action => <option key={action.id} value={action.id}>{action.label}</option>)}</select></div></div><RecordDetails resource={resource} row={row} /></Card>)}</div>}
    {definition.paginated && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Page {page} of {pages} · {total} records</p><div className="flex gap-2"><Button className="staff-button" variant="outline" disabled={loading || Boolean(editor) || page <= 1} onClick={() => { setLoading(true); setPage(value => value - 1); }}>Previous</Button><Button className="staff-button" variant="outline" disabled={loading || Boolean(editor) || page >= pages} onClick={() => { setLoading(true); setPage(value => value + 1); }}>Next</Button></div></div>}
  </>;
}
