"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { Alert, Button, Card, EmptyState, FormField, Input, PageHeader } from "@/components/ui";
import { isRecord } from "@/lib/admin/config";

type Price = { id: string; vehicleTypeId: string; baseRate: string | number; minAdjustmentPct: string | number; maxAdjustmentPct: string | number; effectiveFrom: string; effectiveUntil: string | null; isActive: boolean; vehicleType?: { vehicleType: string } };
type VehicleType = { id: string; name: string };
function CategorySelect({ invalid, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }) {
  return <select {...props} aria-invalid={invalid || undefined} />;
}
function isPrice(value: unknown): value is Price {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.vehicleTypeId !== "string" || typeof value.isActive !== "boolean") return false;
  if (typeof value.effectiveFrom !== "string" || !Number.isFinite(Date.parse(value.effectiveFrom))) return false;
  if (value.effectiveUntil !== null && (typeof value.effectiveUntil !== "string" || !Number.isFinite(Date.parse(value.effectiveUntil)))) return false;
  if (![value.baseRate, value.minAdjustmentPct, value.maxAdjustmentPct].every(number => (typeof number === "number" || (typeof number === "string" && number.trim() !== "")) && Number.isFinite(Number(number)))) return false;
  return value.vehicleType === undefined || (isRecord(value.vehicleType) && typeof value.vehicleType.vehicleType === "string");
}
const money = (value: string | number) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(value));
const date = (value: string) => new Date(value).toLocaleString("en-PH", { dateStyle: "medium", timeStyle: "short" });
const currentPeriod = (row: Price) => new Date(row.effectiveFrom).getTime() <= Date.now() && (!row.effectiveUntil || new Date(row.effectiveUntil).getTime() >= Date.now());
const overlaps = (a: Price, b: Price) => a.vehicleTypeId === b.vehicleTypeId && a.id !== b.id && new Date(a.effectiveFrom).getTime() <= (b.effectiveUntil ? new Date(b.effectiveUntil).getTime() : Infinity) && new Date(b.effectiveFrom).getTime() <= (a.effectiveUntil ? new Date(a.effectiveUntil).getTime() : Infinity);
const localNow = () => { const now = new Date(); return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16); };

async function command(operation: string, values: Record<string, unknown>, id?: string): Promise<Price> {
  const response = await fetch("/api/admin/pricing", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ operation, values, ...(id ? { id } : {}), confirmed: operation === "switch" }), signal: AbortSignal.timeout(30000) });
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(isRecord(body) && typeof body.message === "string" ? body.message : "The change could not be verified. Refresh before retrying.");
  if (!isPrice(body)) throw new Error("The result could not be verified. Refresh before retrying.");
  return body;
}


function PricingModal({ title, children, onClose, busy }: { title: string; children: ReactNode; onClose: () => void; busy: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    element?.showModal();
    closeButton.current?.focus();
    document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  return <dialog ref={dialog} aria-labelledby="pricing-confirmation-title" aria-busy={busy} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border border-border bg-background p-5 text-foreground shadow-xl backdrop:bg-black/40 sm:p-6"><header className="mb-5 flex items-start justify-between gap-4"><h2 id="pricing-confirmation-title" className="text-xl font-bold">{title}</h2><button ref={closeButton} type="button" disabled={busy} aria-label="Close pricing confirmation" onClick={onClose} className="min-h-10 min-w-10 rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50">×</button></header>{children}</dialog>;
}

export default function PricingWorkspace() {
  const [rows, setRows] = useState<Price[]>([]);
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [editor, setEditor] = useState<{ previous?: Price } | null>(null);
  const [pending, setPending] = useState<Price | null>(null);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [search, setSearch] = useState("");
  const inFlight = useRef(false);
  const formHeading = useRef<HTMLHeadingElement>(null);
  const createButton = useRef<HTMLDivElement>(null);
  const wasConfirming = useRef(false);
  const refresh = () => { setLoading(true); setPending(null); setEditor(null); setUncertain(false); setRevision(value => value + 1); };
  useEffect(() => { if (editor) formHeading.current?.focus(); }, [editor]);
  useEffect(() => {
    if (wasConfirming.current && !pending) createButton.current?.focus();
    wasConfirming.current = Boolean(pending);
  }, [pending]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const responses = await Promise.all([fetch("/api/admin/pricing", { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]) }), fetch("/api/admin/vehicle-types", { cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]) })]);
        if (responses.some(response => !response.ok)) throw new Error("Pricing could not be loaded. Refresh to try again.");
        const [prices, catalog]: unknown[] = await Promise.all(responses.map(response => response.json()));
        if (!Array.isArray(prices) || !prices.every(isPrice)) throw new Error("The pricing list could not be verified.");
        if (!Array.isArray(catalog) || !catalog.every(row => isRecord(row) && typeof row.id === "string" && typeof row.name === "string")) throw new Error("The vehicle categories could not be verified.");
        if (!controller.signal.aborted) { setRows(prices as Price[]); setTypes(catalog as VehicleType[]); setError(null); }
      } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : "Unable to load pricing."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [revision]);
  const category = (row: Price) => row.vehicleType?.vehicleType ?? types.find(type => type.id === row.vehicleTypeId)?.name ?? "Unavailable category";
  const replacements = pending ? rows.filter(row => row.isActive && overlaps(row, pending)) : [];
  const visible = rows.filter(row => `${category(row)} ${row.baseRate}`.toLowerCase().includes(search.toLowerCase()));
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || uncertain) return;
    const values = new FormData(event.currentTarget);
    const from = new Date(String(values.get("effectiveFrom")));
    const until = values.get("effectiveUntil") ? new Date(String(values.get("effectiveUntil"))) : null;
    const minimum = Number(values.get("minAdjustmentPct"));
    const maximum = Number(values.get("maxAdjustmentPct"));
    if ((until && until <= from) || minimum > maximum) { setError("Check the effective dates and adjustment range before saving."); return; }
    inFlight.current = true; setBusy(true); setError(null); setNotice(null);
    try {
      const row = await command("create", { vehicleTypeId: values.get("vehicleTypeId"), baseRate: Number(values.get("baseRate")), minAdjustmentPct: minimum, maxAdjustmentPct: maximum, effectiveFrom: from.toISOString(), ...(until ? { effectiveUntil: until.toISOString() } : {}) });
      setRows(current => [row, ...current]); setEditor(null);
      if (currentPeriod(row)) setPending(row);
      else setNotice("Configuration saved as inactive. You can activate it when its effective period starts.");
    } catch (failure) { setUncertain(true); setError(failure instanceof Error ? failure.message : "The change could not be verified."); }
    finally { inFlight.current = false; setBusy(false); }
  }
  async function switchPrice() {
    if (!pending || inFlight.current || uncertain) return;
    inFlight.current = true; setBusy(true); setError(null);
    try {
      await command("switch", { expectedActiveIds: replacements.map(row => row.id) }, pending.id);
      setNotice("Pricing switched. Previous configurations are retained in history."); refresh(); createButton.current?.focus();
    } catch (failure) { setUncertain(true); setError(failure instanceof Error ? failure.message : "The switch could not be verified."); }
    finally { inFlight.current = false; setBusy(false); }
  }
  function table(title: string, description: string, active: boolean) {
    const items = visible.filter(row => row.isActive === active);
    return <Card padding="sm"><div className="mb-4"><h2 className="text-lg font-bold">{title} <span className="text-sm font-normal text-muted-foreground">({items.length})</span></h2><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{!items.length ? <EmptyState title={search ? "No matching configurations" : active ? "No active configurations" : "No configuration history"} description={active ? "Save a configuration and confirm activation to start using it." : "Saved and replaced configurations appear here."} /> : <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><caption className="sr-only">{title}</caption><thead className="border-b border-border text-muted-foreground"><tr>{["Vehicle category", "Base rate", "Adjustment", "Effective period", "Status", "Action"].map(label => <th key={label} scope="col" className="px-3 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{items.map(row => <tr key={row.id} className="border-b border-border last:border-0"><th scope="row" className="px-3 py-4 font-semibold">{category(row)}</th><td className="whitespace-nowrap px-3 py-4 font-semibold">{money(row.baseRate)}</td><td className="px-3 py-4">{row.minAdjustmentPct}% to {row.maxAdjustmentPct}%</td><td className="px-3 py-4"><span className="block">{date(row.effectiveFrom)}</span><span className="mt-1 block text-xs text-muted-foreground">{row.effectiveUntil ? `Until ${date(row.effectiveUntil)}` : "No end date"}</span></td><td className="px-3 py-4">{active ? currentPeriod(row) ? "Active" : new Date(row.effectiveFrom).getTime() > Date.now() ? "Scheduled" : "Expired" : "Inactive"}</td><td className="px-3 py-4"><Button size="sm" variant="outline" disabled={busy || Boolean(editor) || (!active && !currentPeriod(row))} onClick={() => { setError(null); setNotice(null); if (active) setEditor({ previous: row }); else setPending(row); }}>{active ? "Create replacement" : "Activate"}</Button>{!active && !currentPeriod(row) && <p className="mt-2 max-w-40 text-xs text-muted-foreground">Activation is available during its effective period.</p>}</td></tr>)}</tbody></table></div>}</Card>;
  }
  return <><div ref={createButton} tabIndex={-1} className="outline-none"><PageHeader eyebrow="Administration" title="Pricing" description="Review active rates, prepare replacements and keep previous configurations for reference." actions={<Button disabled={loading || busy || Boolean(editor) || Boolean(error)} onClick={() => { setEditor({}); setNotice(null); }}>New configuration</Button>} /></div>
    {notice && <div role="status"><Alert variant="success">{notice}</Alert></div>}
    {error && !pending && <Alert variant="danger">{error} <Button variant="quiet" disabled={busy} onClick={refresh}>Refresh configurations</Button></Alert>}
    {editor && <Card><form onSubmit={save} className="space-y-5"><div><h2 ref={formHeading} tabIndex={-1} className="text-xl font-bold outline-none">{editor.previous ? `Replace ${category(editor.previous)} pricing` : "New pricing configuration"}</h2><p className="mt-2 text-sm text-muted-foreground">Save the configuration first, then review the activation confirmation. Existing bookings keep their quoted prices.</p></div><fieldset disabled={busy || uncertain} className="grid gap-5 sm:grid-cols-2"><FormField htmlFor="pricing-category" label="Vehicle category"><CategorySelect required id="pricing-category" name="vehicleTypeId" defaultValue={editor.previous?.vehicleTypeId ?? ""} className="min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 focus:outline-primary"><option value="">Choose a category</option>{types.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</CategorySelect></FormField><FormField htmlFor="pricing-rate" label="Base rate (PHP)"><Input id="pricing-rate" name="baseRate" type="number" min="0" step="0.01" required defaultValue={editor.previous?.baseRate} /></FormField>{["min", "max"].map(kind => <FormField key={kind} htmlFor={`pricing-${kind}`} label={`${kind === "min" ? "Minimum" : "Maximum"} adjustment (%)`}><Input id={`pricing-${kind}`} name={`${kind}AdjustmentPct`} type="number" min="0" step="0.01" required defaultValue={kind === "min" ? editor.previous?.minAdjustmentPct ?? 0 : editor.previous?.maxAdjustmentPct ?? 0} /></FormField>)}<FormField htmlFor="pricing-from" label="Effective from"><Input id="pricing-from" name="effectiveFrom" type="datetime-local" required defaultValue={localNow()} /></FormField><FormField htmlFor="pricing-until" label="Effective until" optional hint="Leave blank for no end date."><Input id="pricing-until" name="effectiveUntil" type="datetime-local" /></FormField></fieldset>{uncertain && <Alert variant="warning">Refresh and check configuration history before retrying. The save may have completed.</Alert>}<div className="flex flex-wrap gap-3"><Button type="submit" disabled={busy || uncertain}>{busy ? "Saving..." : "Save and review activation"}</Button><Button type="button" variant="outline" disabled={busy} onClick={() => { refresh(); createButton.current?.focus(); }}>Cancel</Button></div></form></Card>}
    <div className="flex flex-wrap items-end gap-3"><div className="min-w-48 flex-1"><label htmlFor="pricing-search" className="text-sm font-semibold">Find a configuration</label><Input id="pricing-search" className="mt-2" placeholder="Vehicle category or base rate" value={search} onChange={event => setSearch(event.target.value)} /></div><Button variant="outline" disabled={busy || loading} onClick={refresh}>Refresh</Button></div>
    {loading ? <p role="status">Loading pricing configurations...</p> : !error && <>{table("Active configurations", "Enabled pricing, including any scheduled effective periods.", true)}{table("Configuration history", "Inactive configurations, including saved drafts and previously used rates.", false)}</>}
    {pending && <PricingModal busy={busy} title="Activate this pricing configuration?" onClose={() => { if (!busy) { setPending(null); setError(null); if (uncertain) refresh(); createButton.current?.focus(); } }}><div className="space-y-5 p-1"><div className="rounded-xl border border-border bg-surface-warm p-4"><p className="font-semibold">{category(pending)}</p><p className="mt-1 text-2xl font-bold">{money(pending.baseRate)}</p><p className="mt-2 text-sm">Adjustment: {pending.minAdjustmentPct}% to {pending.maxAdjustmentPct}%</p><p className="mt-1 text-sm">{date(pending.effectiveFrom)} to {pending.effectiveUntil ? date(pending.effectiveUntil) : "no end date"}</p></div><p className="text-sm">{replacements.length ? "The following overlapping configurations will be deactivated automatically:" : "There are no overlapping active configurations to replace."}</p>{replacements.length > 0 && <ul className="list-disc space-y-2 pl-5 text-sm">{replacements.map(row => <li key={row.id}>{category(row)}: {money(row.baseRate)}, from {date(row.effectiveFrom)}{row.effectiveUntil ? ` until ${date(row.effectiveUntil)}` : ", no end date"}</li>)}</ul>}<p className="text-sm text-muted-foreground">New quotes will use the selected configuration for eligible trips. Existing bookings and saved quotes retain their prices. Replaced configurations stay in history and do not resume automatically.</p>{error && <Alert variant="danger">{error}</Alert>}{uncertain && <Alert variant="warning">Refresh and review the active configurations before retrying.</Alert>}<div className="flex flex-wrap gap-3"><Button disabled={busy || uncertain || !currentPeriod(pending)} onClick={switchPrice}>{busy ? "Switching pricing..." : "Confirm and switch pricing"}</Button><Button variant="outline" disabled={busy} onClick={() => { setPending(null); setError(null); if (uncertain) refresh(); createButton.current?.focus(); }}>{uncertain ? "Close and refresh" : "Keep inactive"}</Button></div></div></PricingModal>}
  </>;
}
