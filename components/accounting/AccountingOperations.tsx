"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Alert from "@/components/ui/alert";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import EmptyState from "@/components/ui/empty-state";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import PageHeader from "@/components/ui/page-header";
import Textarea from "@/components/ui/textarea";
import { assignmentMessage, isRecord, parseQueue, paymentMethods, type AccountingCommand, type PendingPayment, type QueuePage, type QueueResource } from "@/lib/accounting/live";

type Action = { operation: AccountingCommand["operation"]; id: string };
const empty: QueuePage = { payments: [], assignments: [], nextCursor: null };
const money = (amount: string) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(Number(amount));
const date = (value: string) => new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
const label = (value: string) => value.replaceAll("_", " ").toLowerCase();

export default function AccountingOperations({ resource }: { resource: QueueResource }) {
  const [page, setPage] = useState<QueuePage>(empty);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [busy, setBusy] = useState(false);
  const [uncertain, setUncertain] = useState<AccountingCommand | null>(null);
  const [saveError, setSaveError] = useState("");
  const [notice, setNotice] = useState("");
  const [revision, setRevision] = useState(0);
  const lock = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const refresh = useCallback(() => { setCursor(null); setRevision(value => value + 1); }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setLoadError("");
      try {
        const response = await fetch("/api/accounting/" + resource + (cursor ? "?cursor=" + cursor : ""), { cache: "no-store", signal: controller.signal });
        const data: unknown = await response.json();
        if (!response.ok) throw new Error(isRecord(data) && typeof data.message === "string" ? data.message : "The queue could not be loaded.");
        const result = parseQueue(resource, data);
        if (!controller.signal.aborted) setPage(result);
      } catch (error) {
        if (!controller.signal.aborted) setLoadError(error instanceof Error ? error.message : "The queue could not be loaded.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [resource, cursor, revision]);

  useEffect(() => { if (action) heading.current?.focus(); }, [action]);

  function open(next: Action) {
    setAction(next);
    setSaveError("");
    setNotice("");
  }
  async function send(command: AccountingCommand) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    setSaveError("");
    try {
      const response = await fetch("/api/accounting/" + resource, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(command), signal: AbortSignal.timeout(30_000),
      });
      let data: unknown;
      try { data = await response.json(); } catch { throw new Error("The response was interrupted. Retry the same action to recover its result."); }
      if (!response.ok) {
        const message = isRecord(data) && typeof data.message === "string" ? data.message : "The change could not be saved.";
        if (response.status >= 500) throw new Error(message);
        // A failed recovery does not prove that an earlier request was rolled back.
        setSaveError(message);
        return;
      }
      if (!isRecord(data) || (command.operation === "record" && typeof data.paymentStatus !== "string") ||
          ((command.operation === "approve" || command.operation === "reject") && !isRecord(data.payment)) ||
          (command.operation === "retry" && typeof data.status !== "string")) throw new Error("The saved result could not be read. Retry the same action to recover it.");
      setUncertain(null);
      setAction(null);
      setNotice(command.operation === "record" ? "Receipt recovered or recorded. Payment status: " + label(String(data.paymentStatus)) + ". Receipt entry alone does not verify funds." :
        command.operation === "reject" ? "Receipt rejected. This does not record a refund." :
        command.operation === "approve" ? "Full payment verified. " + assignmentMessage(data.assignment) : assignmentMessage(data));
      refresh();
    } catch (error) {
      setUncertain(command);
      setSaveError(error instanceof Error ? error.message : "The result is uncertain. Retry the same action to recover it.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!action || busy || uncertain) return;
    const data = new FormData(event.currentTarget);
    const values: Record<string, string> = {};
    if (action.operation === "record") {
      for (const key of ["method", "reference", "amount", "reason"]) values[key] = String(data.get(key) ?? "").trim();
    } else if (action.operation !== "retry") values.reason = String(data.get("reason") ?? "").trim();
    void send({ operation: action.operation, id: action.operation === "record" ? String(data.get("bookingId") ?? "").trim() : action.id, values, confirmed: true });
  }
  const disabled = busy || uncertain !== null;
  const selected = page.payments.find(row => row.id === action?.id);
  return <div className="space-y-6">
    <PageHeader eyebrow="Accounting" title={resource === "payments" ? "Payment review" : "Assignment queue"}
      description={resource === "payments" ? "Record full PHP receipts and verify received funds against your payment channel records." : "Review paid bookings awaiting allocation and retry after resolving resource readiness."}
      actions={<Button variant="outline" onClick={refresh} disabled={loading || busy}>Refresh queue</Button>} />
    <Alert>These queues use live backend data. Other Accounting sections still contain preview data.</Alert>
    {notice && <Alert variant="success">{notice}</Alert>}
    {resource === "payments" && !action && <Button onClick={() => open({ operation: "record", id: "" })}>Record manual receipt</Button>}
    {action && <Card>
      <h2 ref={heading} tabIndex={-1} className="text-xl font-bold">{action.operation === "record" ? "Record manual receipt" : action.operation === "retry" ? "Retry assignment" : action.operation === "approve" ? "Approve full payment" : "Reject receipt"}</h2>
      <p className="mt-2 break-all text-sm text-muted-foreground">{selected ? "Booking: " + selected.bookingId + " | " + money(selected.amount) + " | Reference: " + selected.providerReference : action.id ? "Booking: " + action.id : "Use the booking UUID and exact full quoted amount from the booking details."}</p>
      {saveError && <div className="mt-4"><Alert variant={uncertain ? "warning" : "danger"}>{saveError}</Alert></div>}
      {uncertain && <div className="mt-4 space-y-3">
        <p className="text-sm">The server may have saved this change. Its original values are locked. Retry sends the same receipt or decision and uses the backend&apos;s duplicate protection.</p>
        <Button onClick={() => void send(uncertain)} disabled={busy}>{busy ? "Recovering result..." : "Retry same action"}</Button>
      </div>}
      <form className="mt-5 space-y-4" onSubmit={submit}>
        <fieldset disabled={disabled} className="space-y-4">
          {action.operation === "record" && <>
            <FormField htmlFor="receipt-booking" label="Booking UUID"><Input name="bookingId" required pattern="[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}" /></FormField>
            <div><label htmlFor="receipt-method" className="text-sm font-semibold">Payment method</label><select id="receipt-method" name="method" required className="mt-2 min-h-11 w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus-visible:outline-primary">{paymentMethods.map(method => <option key={method} value={method}>{label(method)}</option>)}</select></div>
            <FormField htmlFor="receipt-reference" label="Receipt reference" hint="3 to 100 letters, digits, periods, underscores, colons, slashes or hyphens. Cash requires a receipt number."><Input name="reference" required minLength={3} maxLength={100} /></FormField>
            <FormField htmlFor="receipt-amount" label="Full amount (PHP)" hint="Enter the exact full quote with two decimal places, for example 1200.00."><Input name="amount" inputMode="decimal" required pattern="(?:0|[1-9][0-9]{0,9})[.][0-9]{2}" /></FormField>
          </>}
          {action.operation !== "retry" && <FormField htmlFor="receipt-reason" label={action.operation === "record" ? "Receipt evidence note" : "Decision reason"}><Textarea name="reason" required minLength={3} maxLength={500} rows={3} /></FormField>}
          <label className="flex items-start gap-3 text-sm"><input type="checkbox" required className="mt-1 size-4 accent-primary" /><span>{action.operation === "approve" ? "I verified that the exact full PHP amount was received using external payment records. Approval can dispatch a driver and vehicle." : action.operation === "reject" ? "I confirm this evidence should be rejected. This action does not refund funds." : action.operation === "retry" ? "I reviewed this booking and resource readiness. Retrying can dispatch a driver and vehicle." : "I checked the booking, amount and receipt reference. This records evidence pending verification."}</span></label>
          <div className="flex flex-wrap gap-3"><Button type="submit">{busy ? "Saving..." : "Confirm and submit"}</Button><Button type="button" variant="quiet" onClick={() => { setAction(null); setSaveError(""); }}>Cancel</Button></div>
        </fieldset>
      </form>
    </Card>}
    {loading ? <p role="status">Loading {resource === "payments" ? "pending receipts" : "assignment requests"}...</p> :
      loadError ? <Alert variant="danger">{loadError} <Button variant="quiet" onClick={refresh}>Try again</Button></Alert> :
      <section aria-label={resource === "payments" ? "Pending receipts" : "Pending assignments"} className="space-y-4">
        {resource === "payments" ? page.payments.length ? page.payments.map(row => <PaymentRow key={row.id} row={row} disabled={action !== null} open={open} />) :
          <EmptyState title="No pending receipts" description="Recorded receipts awaiting verification will appear here. This is not a history of all payments." /> :
          page.assignments.length ? page.assignments.map(row => <Card key={row.bookingId}>
            <h2 className="break-all text-base font-semibold">Booking {row.bookingId}</h2>
            <p className="mt-2 text-sm">{date(row.booking.startDatetime)} to {date(row.booking.endDatetime)}</p>
            <p className="mt-2 text-sm capitalize">{label(row.booking.bookingStatus)} | {row.attempts} allocation attempts{row.isRecovery ? " | Recovery request" : ""}</p>
            <p className="my-3 text-sm text-muted-foreground">{assignmentMessage({ status: "PENDING", reason: row.lastFailure })}</p>
            <Button variant="outline" disabled={action !== null} onClick={() => open({ operation: "retry", id: row.bookingId })}>Review retry</Button>
          </Card>) : <EmptyState title="No pending assignment requests" description="Paid bookings needing allocation or recovery will appear here. This queue does not list all dispatched bookings." />}
        {page.nextCursor && <div className="flex flex-wrap gap-3"><Button variant="outline" disabled={action !== null} onClick={() => setCursor(page.nextCursor)}>Next page</Button>{cursor && <Button variant="quiet" disabled={action !== null} onClick={refresh}>Back to first page</Button>}</div>}
        {!page.nextCursor && cursor && <Button variant="quiet" disabled={action !== null} onClick={refresh}>Back to first page</Button>}
      </section>}
  </div>;
}
function PaymentRow({ row, disabled, open }: { row: PendingPayment; disabled: boolean; open: (action: Action) => void }) {
  return <Card>
    <h2 className="break-all text-base font-semibold">Booking {row.bookingId}</h2>
    <p className="mt-2 text-lg font-bold">{money(row.amount)} <span className="text-sm font-normal capitalize">{label(row.paymentMethod)}</span></p>
    <p className="mt-2 break-all text-sm">Receipt: {row.providerReference}</p>
    <p className="mt-1 break-all text-sm text-muted-foreground">Payment: {row.id} | Recorded {date(row.createdAt)}</p>
    {row.audits.map((audit, index) => <p key={index} className="mt-2 whitespace-pre-wrap break-words text-sm">{label(audit.action)}: {audit.reason}</p>)}
    <div className="mt-4 flex flex-wrap gap-3"><Button disabled={disabled} onClick={() => open({ operation: "approve", id: row.id })}>Review approval</Button><Button variant="outline" disabled={disabled} onClick={() => open({ operation: "reject", id: row.id })}>Review rejection</Button></div>
  </Card>;
}
