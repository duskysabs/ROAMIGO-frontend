"use client";

import { useEffect, useState } from "react";
import Alert from "@/components/ui/alert";
import Button from "@/components/ui/button";
import { formatCurrency } from "@/lib/bookings/display";
import type { RoutePreview, TripQuote } from "@/lib/bookings/integration";

export default function TripQuoteSummary({ route, quote, busy, uncertain, onQuote, onSubmit }: {
  route: RoutePreview;
  quote: TripQuote | null;
  busy: boolean;
  uncertain: boolean;
  onQuote: () => void;
  onSubmit: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  const expired = quote ? Date.parse(quote.expiresAt) <= now : false;
  const metrics = quote ?? route;
  return (
    <section className="mt-6 space-y-4 rounded-xl border border-border p-5" aria-label="Route and quotation">
      <h3 className="font-semibold">Route estimate</h3>
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div><dt className="text-muted-foreground">Distance</dt><dd className="mt-1 font-medium">{metrics.totalDistanceKm} km</dd></div>
        <div><dt className="text-muted-foreground">Driving time</dt><dd className="mt-1 font-medium">{metrics.estimatedDurationMinutes} minutes</dd></div>
      </dl>
      <p className="text-xs text-muted-foreground">Driving time excludes planned stops. Your selected departure and return times define your requested schedule.</p>
      {quote && <>
        <div className="border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">Quoted trip price</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(Number(quote.finalQuotedPrice))}</p>
          <p className="mt-2 text-sm text-muted-foreground">Valid until {new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short" }).format(new Date(quote.expiresAt))}</p>
        </div>
        {expired && !uncertain && <Alert variant="warning">This quote has expired. Request a fresh quote before submitting.</Alert>}
      </>}
      {uncertain ? <>
        <Alert variant="warning">We could not confirm the submission result. Retry to recover the same booking, or check My Bookings before starting another request.</Alert>
        <Button type="button" disabled={busy} onClick={onSubmit}>{busy ? "Checking request..." : "Retry submission"}</Button>
        <Button href="/my-bookings" variant="outline" className="ml-0 sm:ml-3">My Bookings</Button>
      </> : !quote || expired ? (
        <Button type="button" disabled={busy} onClick={onQuote}>{busy ? "Preparing quote..." : quote ? "Refresh quote" : "Get quotation"}</Button>
      ) : (
        <Button type="button" disabled={busy} onClick={onSubmit}>{busy ? "Submitting..." : "Submit booking request"}</Button>
      )}
    </section>
  );
}
