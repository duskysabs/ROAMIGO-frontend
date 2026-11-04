"use client";

import { useRef, useState, type FormEvent } from "react";
import Alert from "@/components/ui/alert";
import Button from "@/components/ui/button";
import FormField from "@/components/ui/form-field";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { ratings, supportPages, type SupportPageKind } from "@/lib/support/content";

export default function SupportForm({ kind }: { kind: SupportPageKind }) {
  const [rating, setRating] = useState("");
  const [message, setMessage] = useState("");
  const [review, setReview] = useState<Record<string, string> | null>(null);
  const [error, setError] = useState("");
  const reviewHeading = useRef<HTMLHeadingElement>(null);
  const nameInput = useRef<HTMLInputElement>(null);
  const content = supportPages[kind];

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const name = String(fields.get("name") ?? "").trim();
    if (!name || !message.trim()) {
      setError("Please enter your name and a message containing more than spaces.");
      return;
    }
    setError("");
    setReview({
      Name: name,
      Email: String(fields.get("email") ?? "").trim(),
      Topic: String(fields.get("topic") ?? ""),
      "Booking reference": String(fields.get("booking") ?? "").trim() || "Not provided",
      ...(kind === "feedback" ? { Rating: `${rating} / 5 — ${ratings[Number(rating) - 1]}` } : {}),
      Message: message.trim(),
    });
    requestAnimationFrame(() => reviewHeading.current?.focus());
  }

  return (
    <div className="mt-7">
      <ol aria-label="Message progress" className="mb-7 flex items-center gap-3 border-y border-border py-4 text-sm">
        <li aria-current={!review ? "step" : undefined} className={`flex items-center gap-2 ${!review ? "font-semibold text-primary" : "text-muted-foreground"}`}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-warm text-xs font-bold">1</span>Your details</li>
        <li aria-hidden="true" className="h-px flex-1 bg-border" />
        <li aria-current={review ? "step" : undefined} className={`flex items-center gap-2 ${review ? "font-semibold text-primary" : "text-muted-foreground"}`}><span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-warm text-xs font-bold">2</span>Review</li>
      </ol>
      <form onSubmit={handleReview} hidden={review !== null} className="space-y-6">
        {kind === "feedback" && (
          <fieldset className="rounded-2xl border border-primary/10 bg-surface-warm/40 p-4 sm:p-5">
            <legend className="px-1 text-sm font-semibold">How would you rate your experience?</legend>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {ratings.map((label, index) => {
                const value = String(index + 1);
                return <label key={label} className="relative cursor-pointer">
                  <input type="radio" name="rating" value={value} checked={rating === value} onChange={event => setRating(event.target.value)} required className="peer sr-only" />
                  <span className="flex min-h-20 flex-col items-center justify-center rounded-xl border border-border bg-background px-1 py-2 text-muted-foreground transition hover:border-primary/40 hover:bg-surface-warm peer-checked:border-primary peer-checked:bg-surface-warm peer-checked:text-primary peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary">
                    <span aria-hidden="true" className="text-2xl">{Number(rating) >= index + 1 ? "★" : "☆"}</span>
                    <span className="text-xs font-semibold">{index + 1}<span className="sr-only"> of 5: {label}</span></span><span aria-hidden="true" className="mt-1 hidden text-[10px] sm:block">{label}</span>
                  </span>
                </label>;
              })}
            </div>
            <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">{rating ? ratings[Number(rating) - 1] : "1 = Poor · 5 = Excellent"}</p>
          </fieldset>
        )}
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField htmlFor={`${kind}-name`} label="Full name">
            <Input ref={nameInput} name="name" autoComplete="name" required maxLength={150} placeholder="Your full name" />
          </FormField>
          <FormField htmlFor={`${kind}-email`} label="Email address">
            <Input name="email" type="email" autoComplete="email" required maxLength={254} placeholder="you@example.com" />
          </FormField>
        </div>
        <div>
          <label htmlFor={`${kind}-topic`} className="text-sm font-semibold">{kind === "feedback" ? "What is your feedback about?" : "How can we help?"}</label>
          <select id={`${kind}-topic`} name="topic" required defaultValue="" className="mt-2 min-h-12 w-full rounded-xl border border-border bg-background px-4 py-3 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20">
            <option value="" disabled>Select a topic</option>
            {content.topics.map(topic => <option key={topic}>{topic}</option>)}
          </select>
        </div>
        <FormField htmlFor={`${kind}-booking`} label="Booking reference" optional hint="You can find this in My Bookings.">
          <Input name="booking" maxLength={100} placeholder="Enter your booking reference" />
        </FormField>
        <FormField htmlFor={`${kind}-message`} label={kind === "feedback" ? "Tell us about your experience" : "Your message"} hint="Please leave out passwords and payment card details.">
          <Textarea name="message" rows={5} required maxLength={2000} value={message} onChange={event => setMessage(event.target.value)} placeholder={kind === "feedback" ? "What stood out? What could we improve?" : "Share a few details so we can understand your question."} />
        </FormField>
        <p className="-mt-4 text-right text-xs tabular-nums text-muted-foreground">{message.length.toLocaleString()} / 2,000</p>
        {error && <Alert variant="danger">{error}</Alert>}
        <div className="border-t border-border pt-5">
          <Button type="submit" size="lg" className="w-full sm:w-auto">Review {kind === "feedback" ? "feedback" : "message"} <span className="ml-3" aria-hidden="true">→</span></Button>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">You can review your message here. Online delivery is not available yet; nothing is sent or saved when you leave this page.</p>
        </div>
      </form>
      {review && <section aria-labelledby={`${kind}-review-title`}>
        <h3 id={`${kind}-review-title`} ref={reviewHeading} tabIndex={-1} className="rounded-lg text-xl font-bold focus-visible:outline-2 focus-visible:outline-primary">Review your {kind === "feedback" ? "feedback" : "message"}</h3>
        <Alert className="mt-4">This message has not been sent. Online delivery is not available yet.</Alert>
        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-5 rounded-2xl border border-border bg-surface-warm/30 p-5 sm:grid-cols-2">{Object.entries(review).map(([label, value]) => <div key={label} className={label === "Message" ? "border-t border-border pt-5 sm:col-span-2" : "min-w-0"}><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</dt><dd className="mt-1 whitespace-pre-wrap wrap-anywhere text-sm leading-6">{value}</dd></div>)}</dl>
        <Button type="button" variant="outline" className="mt-6 w-full sm:w-auto" onClick={() => { setReview(null); requestAnimationFrame(() => nameInput.current?.focus()); }}>Edit {kind === "feedback" ? "feedback" : "message"}</Button>
      </section>}
    </div>
  );
}
