"use client";

import { useCallback, useState } from "react";
import LocationField, { type LocationSearch } from "./LocationField";
import { createTripStop } from "@/lib/bookings/types";

const modes = ["Suggestions", "Slow response", "No results", "Service unavailable", "Rate limited"] as const;
type Mode = typeof modes[number];

export default function LocationFieldShowcase() {
  const [mode, setMode] = useState<Mode>("Suggestions");
  const [stop, setStop] = useState(() => createTripStop("showcase-location"));
  const search = useCallback<LocationSearch>(async (_text, signal) => {
    await new Promise<void>((resolve, reject) => {
      const abort = () => { clearTimeout(timer); reject(new DOMException("Aborted", "AbortError")); };
      const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, mode === "Slow response" ? 5000 : 300);
      if (signal.aborted) abort();
      else signal.addEventListener("abort", abort, { once: true });
    });
    if (mode === "Service unavailable") throw new Error("Location search is unavailable. Please try again shortly.");
    if (mode === "Rate limited") throw new Error("Too many requests. Wait a minute before trying again.");
    if (mode === "No results") return [];
    return [
      { placeId: "showcase-cebu", locationName: "Cebu City", formattedAddress: "Cebu City, Cebu, Philippines (example)", latitude: 10.3157, longitude: 123.8854 },
      { placeId: "showcase-mactan", locationName: "Lapu-Lapu City", formattedAddress: "Lapu-Lapu City, Cebu, Philippines (example)", latitude: 10.3103, longitude: 123.9494 },
    ];
  }, [mode]);
  return (
    <div className="space-y-5">
      <div>
        <label htmlFor="location-demo-mode" className="text-sm font-semibold">Example state</label>
        <select id="location-demo-mode" value={mode} onChange={(event) => { setMode(event.target.value as Mode); setStop(createTripStop("showcase-location")); }}
          className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm">
          {modes.map((item) => <option key={item}>{item}</option>)}
        </select>
      </div>
      <LocationField key={mode} stop={stop} label="Pickup location" search={search} onChange={setStop} />
      <p className="text-xs text-muted-foreground">These are local example results. No backend requests are sent. Type at least 3 characters, then try the arrow keys, Enter, Escape, and editing a selected address.</p>
    </div>
  );
}
