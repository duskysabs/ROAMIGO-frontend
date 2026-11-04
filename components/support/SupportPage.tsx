import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import Card from "@/components/ui/card";
import PageHeader from "@/components/ui/page-header";
import Button from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { supportPages, supportQuestions, type SupportPageKind } from "@/lib/support/content";
import SupportForm from "./SupportForm";

export default function SupportPage({ kind }: { kind: SupportPageKind }) {
  const content = supportPages[kind];
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main id="main-content" className="flex-1 bg-linear-to-b from-surface-warm/80 via-background to-background px-4 py-8 sm:px-10 sm:py-12">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="rounded hover:text-primary focus-visible:outline-2 focus-visible:outline-primary">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-foreground">{kind === "feedback" ? "Feedback" : "Contact us"}</span>
          </nav>
          <div className="border-b border-primary/10 pb-8">
            <PageHeader {...content} />

          </div>
          <div className="mt-9 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-8">
            <Card padding="lg" className="min-w-0 p-5 shadow-sm sm:p-8">
              <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"><span className="h-px w-8 bg-primary" aria-hidden="true" />{kind === "feedback" ? "Made better by you" : "Start a conversation"}</div>
              <h2 className="text-2xl font-bold tracking-tight">{content.formTitle}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{content.formDescription}</p>
              <SupportForm kind={kind} />
            </Card>
            <aside className="min-w-0 space-y-5">
              <div className="relative isolate overflow-hidden rounded-2xl bg-primary">
                <Image src={siteConfig.home.travelOptions[1].imagePath} alt="Cebu coastline with clear water and an outrigger boat" width={720} height={440} sizes="(max-width: 1024px) 100vw, 400px" className="aspect-[16/9] w-full object-cover" />
                <div className="bg-primary px-6 py-5 text-primary-foreground">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em]">Every journey, a connection</p>
                  <p className="mt-2 text-lg font-semibold leading-7">{kind === "feedback" ? "Good trips start with listening." : "Your Cebu journey starts here."}</p>
                </div>
              </div>
              <Card padding="lg" className="border-primary/15 bg-surface-warm/60 p-5 sm:p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">Planet J Rent a Car</p>
                <h2 className="mt-3 text-xl font-bold">Local roots. Personal service.</h2>
                <dl className="mt-6 space-y-5 text-sm">
                  <div><dt className="font-semibold">Find us in Cebu</dt><dd className="mt-1 leading-6 text-muted-foreground">{siteConfig.footer.location}</dd></div>
                  <div><dt className="font-semibold">Business hours</dt><dd className="mt-2 space-y-2">{siteConfig.footer.businessHours.map(item => <div key={item.days} className="flex flex-wrap justify-between gap-2"><span className="text-muted-foreground">{item.days}</span><span>{item.hours}</span></div>)}</dd></div>
                </dl>
              </Card>
              <Card>
                <h2 className="text-lg font-bold">{kind === "feedback" ? "Need help with a booking?" : "Already have a booking?"}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{kind === "feedback" ? "Use Contact Us for booking questions or help planning your trip." : "Your trip details and status are available in My Bookings."}</p>
                <Button href={kind === "feedback" ? "/contact" : "/my-bookings"} variant="outline" className="mt-5 w-full">{kind === "feedback" ? "Contact us" : "View my bookings"}</Button>
              </Card>
            </aside>
          </div>
          <section className="mt-12 grid gap-6 border-t border-border pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12" aria-labelledby="support-questions">
            <div><p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-primary">Before you ask</p><h2 id="support-questions" className="text-2xl font-bold tracking-tight">A few helpful answers</h2><p className="mt-3 text-sm leading-7 text-muted-foreground">Find your way to booking details, trip planning, and the information you need.</p></div><div>
            <div className="divide-y divide-border rounded-2xl border border-border bg-background px-5 sm:px-6">
              {supportQuestions.map(item => <details key={item.question} className="group py-1"><summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-4 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">{item.question}<span aria-hidden="true" className="text-xl font-normal text-primary transition-transform group-open:rotate-45">+</span></summary><p className="pb-5 text-sm leading-7 text-muted-foreground">{item.answer}</p></details>)}
            </div>
            <Link href={kind === "feedback" ? "/contact" : "/feedback"} className="mt-6 inline-flex min-h-11 items-center rounded-lg font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-primary">{kind === "feedback" ? "Have another question? Contact us →" : "Want to share your experience? Leave feedback →"}</Link>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
