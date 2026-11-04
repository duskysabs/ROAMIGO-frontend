"use client";

import { useEffect, useRef, useState } from "react";
import type { TripLocation, TripStopDraft } from "@/lib/bookings/types";
import { parseLocation, tripRequest } from "@/lib/bookings/integration";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import TripField from "./TripField";

export type LocationSearch = (text: string, signal: AbortSignal) => Promise<TripLocation[]>;

async function searchLocations(text: string, signal: AbortSignal): Promise<TripLocation[]> {
  const body = await tripRequest(`/api/locations/autocomplete?${new URLSearchParams({ text })}`, { signal });
  if (!Array.isArray(body)) throw new Error("Location search returned an invalid response. Please try again.");
  const locations = body.map(parseLocation);
  if (locations.some((location) => !location)) throw new Error("Location search returned an invalid response. Please try again.");
  return locations as TripLocation[];
}

export default function LocationField({ stop, label, placeholder = "Search for a place", error, onChange, search = searchLocations }: {
  stop: TripStopDraft;
  label: string;
  placeholder?: string;
  error?: string;
  onChange: (stop: TripStopDraft) => void;
  search?: LocationSearch;
}) {
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(-1);
  const [retry, setRetry] = useState(0);
  const [result, setResult] = useState<{ query: string; options: TripLocation[]; error?: string } | null>(null);
  const request = useRef<AbortController | null>(null);
  const query = stop.searchText.trim();
  const canSearch = focused && !stop.location && query.length >= 3 && query.length <= 200;
  const current = result?.query === query ? result : null;
  const options = canSearch ? current?.options ?? [] : [];
  const expanded = options.length > 0;
  const listId = `${stop.id}-suggestions`;

  useEffect(() => {
    if (expanded && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [expanded, active, listId]);

  useEffect(() => {
    if (!canSearch) return;
    const controller = new AbortController();
    request.current = controller;
    const timer = setTimeout(async () => {
      try {
        const options = await search(query, controller.signal);
        if (!controller.signal.aborted) setResult({ query, options });
      } catch (error) {
        if (!controller.signal.aborted) setResult({ query, options: [], error: error instanceof Error ? error.message : "Location search is unavailable." });
      }
    }, 450);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [canSearch, query, stop.searchText, retry, search]);

  function select(location: TripLocation) {
    request.current?.abort();
    setFocused(false);
    setActive(-1);
    onChange({ ...stop, searchText: location.formattedAddress, location });
  }

  const hint = stop.location ? "Location selected."
    : query.length > 200 ? "Use 200 characters or fewer to search."
    : !canSearch ? "Type at least 3 characters, then choose a suggestion."
    : !current ? "Searching locations..."
    : current.error ?? (options.length ? `${options.length} suggestions available. Use the arrow keys to choose.` : "No locations found. Try a more specific address.");

  return (
    <TripField id={stop.id} label={label} error={error}>
      <div className="relative mt-2" onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) { setFocused(false); request.current?.abort(); }
      }}>
        <Input id={stop.id} role="combobox" type="text" required autoComplete="off" maxLength={255}
          value={stop.searchText} placeholder={placeholder} invalid={Boolean(error)}
          aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listId : undefined}
          aria-activedescendant={expanded && active >= 0 && active < options.length ? `${listId}-${active}` : undefined}
          aria-describedby={[`${stop.id}-hint`, error ? `${stop.id}-error` : ""].filter(Boolean).join(" ")}
          onFocus={() => setFocused(true)}
          onChange={(event) => {
            request.current?.abort();
            setResult(null); setActive(-1); setFocused(true);
            onChange({ ...stop, searchText: event.target.value, location: null });
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") { event.preventDefault(); setFocused(false); request.current?.abort(); }
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault(); setFocused(true);
              if (options.length) setActive((index) => event.key === "ArrowDown" ? (index + 1) % options.length : (index <= 0 ? options.length - 1 : index - 1));
            }
            if (event.key === "Enter" && expanded) {
              event.preventDefault();
              if (active >= 0 && options[active]) select(options[active]);
            }
          }} />
        {expanded && (
          <ul id={listId} role="listbox" aria-label={`${label} suggestions`} className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-border bg-background shadow-lg">
            {options.map((location, index) => (
              <li key={location.placeId} id={`${listId}-${index}`} role="option" aria-selected={active === index}
                onMouseDown={(event) => event.preventDefault()} onClick={() => select(location)}
                onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); select(location); } }}
                tabIndex={-1}
                className={`cursor-pointer px-4 py-3 text-sm hover:bg-surface-warm ${active === index ? "bg-surface-warm text-primary" : "text-foreground"}`}>
                {location.formattedAddress}
              </li>
            ))}
          </ul>
        )}
        <p id={`${stop.id}-hint`} role="status" className="mt-2 text-xs text-muted-foreground">{hint}</p>
        {canSearch && current?.error && <Button type="button" variant="quiet" size="sm" onClick={() => { setResult(null); setRetry((value) => value + 1); }}>Retry search</Button>}
      </div>
    </TripField>
  );
}
