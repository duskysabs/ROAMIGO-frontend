import type { Metadata } from "next";
import type { ReactNode } from "react";
import LocationFieldShowcase from "@/components/bookings/LocationFieldShowcase";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  FormField,
  Input,
  PageHeader,
  Textarea,
} from "@/components/ui";

export const metadata: Metadata = {
  title: "Component Showcase | ROAMIGO",
  description: "Shared ROAMIGO frontend components and states.",
};

function ShowcaseSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function ComponentShowcasePage() {
  return (
    <main className="bg-gradient-to-br from-surface-warm via-background to-background px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-6xl space-y-12">
        <PageHeader
          eyebrow="Frontend foundations"
          title="Component showcase"
          description="The approved shared components, variants, and states for ROAMIGO customer pages. Reuse these before adding screen-specific styling."
          actions={
            <Button href="/" variant="outline">
              Return home
            </Button>
          }
        />

        <ShowcaseSection
          title="Buttons"
          description="Use one clear primary action per section. Outline and quiet buttons support secondary actions."
        >
          <Card className="flex flex-wrap items-center gap-3">
            <Button>Primary action</Button>
            <Button variant="outline">Secondary action</Button>
            <Button variant="quiet">Quiet action</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
          </Card>
        </ShowcaseSection>

        <ShowcaseSection
          title="Form controls"
          description="Labels, help text, error text, focus treatment, and disabled states remain consistent across forms."
        >
          <Card className="grid gap-6 md:grid-cols-2">
            <FormField
              htmlFor="showcase-name"
              label="Full name"
              hint="Use the name shown on the customer account."
            >
              <Input id="showcase-name" placeholder="Juan Dela Cruz" />
            </FormField>
            <FormField
              htmlFor="showcase-email"
              label="Email address"
              error="Enter a valid email address."
            >
              <Input
                id="showcase-email"
                type="email"
                defaultValue="invalid-email"
                invalid
              />
            </FormField>
            <FormField
              htmlFor="showcase-notes"
              label="Trip notes"
              optional
            >
              <Textarea
                id="showcase-notes"
                rows={4}
                placeholder="Add accessibility needs or pickup instructions"
              />
            </FormField>
            <FormField htmlFor="showcase-disabled" label="Unavailable field">
              <Input
                id="showcase-disabled"
                value="This field is currently unavailable"
                disabled
                readOnly
              />
            </FormField>
          </Card>
        </ShowcaseSection>

        <ShowcaseSection title="Booking location search" description="The shared booking field supports selection, keyboard navigation, loading, empty results, and recoverable errors.">
          <Card className="max-w-xl"><LocationFieldShowcase /></Card>
        </ShowcaseSection>

        <ShowcaseSection
          title="Feedback"
          description="Use semantic feedback colors only for their named purpose."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Alert title="Information">
              Vehicle and driver availability is confirmed before payment.
            </Alert>
            <Alert variant="success" title="Booking submitted">
              Your request was sent successfully.
            </Alert>
            <Alert variant="warning" title="Action needed">
              Review the pickup time before continuing.
            </Alert>
            <Alert variant="danger" title="Unable to continue">
              Check the highlighted fields and try again.
            </Alert>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="Cards and empty states"
          description="Cards group related information. Empty states explain what happened and provide one useful next action."
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Card padding="lg">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
                Upcoming trip
              </p>
              <h3 className="mt-2 text-xl font-bold">Cebu City day tour</h3>
              <p className="mt-2 leading-7 text-muted-foreground">
                A standard content card for grouped customer information.
              </p>
            </Card>
            <EmptyState
              icon={<span aria-hidden="true">✓</span>}
              title="No bookings yet"
              description="Plan a custom trip or select a tour package to create your first booking."
              action={<Button href="/plan-a-trip">Plan a trip</Button>}
            />
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
