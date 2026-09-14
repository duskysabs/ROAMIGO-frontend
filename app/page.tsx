import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const TRAVEL_OPTIONS = [
  {
  icon: " ",
  title: "Custom Trips",
  description: "Travel point-to-point with a driver and vehicle of your choice. Flexible and personalized itineraries.",
  cta: "Plan a Custom Trip",
  href: "/plan-a-trip",
  },

  {
    icon: "",
    title: "Tour Packages",
    description: "Choose a published fixed Cebu route with allowed customizations",
    cta: "Browse Tour Packages",
    href: "/tour-packages",
  }
]

const AREAS = [
  {
    name: "Cebu City",
     description: "Heritage, culture, and city highlights.",
    href: "/tour-packages?area=cebu-city",
  },
  {
    name: "South Cebu",
    description: "Waterfalls, coastal scenery, and adventure.",
    href: "/tour-packages?area=south-cebu",
  },
  {
    name: "North Cebu",
    description: "Beaches, islands, and scenic escapes.",
    href: "/tour-packages?area=north-cebu",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar activeHref="/" />

      <main className="flex-1">
        <section className="bg-gradient-to-r from-surface-warm to-background px-6 py-24 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
              Your Cebu <span className="text-primary">journey</span> starts
              here
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Driver-included Custom Trips and fixed-route Cebu Tour Packages.
            </p>
            <Link
              href="/plan-a-trip"
              className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Plan a Trip
            </Link>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-10">
          <div className="mx-auto max-w-7xl">
            <h2 className="text-2xl font-bold text-foreground">
              Choose how you want to travel
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              {TRAVEL_OPTIONS.map((option) => (
                <div
                  key={option.title}
                  className="rounded-lg border border-border p-8"
                >
                  <span className="text-2xl text-primary" aria-hidden>
                    {option.icon}
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-foreground">
                    {option.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {option.description}
                  </p>
                  <Link
                    href={option.href}
                    className="mt-4 inline-block text-sm font-semibold text-primary hover:text-primary-hover"
                  >
                    {option.cta} ›
                  </Link>
                </div>
              ))}
            </div>

            <p className="mt-6 rounded-md bg-muted-foreground/20 px-4 py-3 text-center text-sm text-muted-foreground">
              ⓘ All services include a professional driver. Vehicle
              preference, availability, and the final quotation require
              Planet J validation.
            </p>

            <h2 className="mt-16 text-2xl font-bold text-foreground">
              Explore Cebu by area
            </h2>

            <div className="mt-6 grid gap-6 sm:grid-cols-3">
              {AREAS.map((area) => (
                <div
                  key={area.name}
                  className="overflow-hidden rounded-lg border border-border"
                >
                  {/* TODO: replace with real area photography once assets are provided */}
                  <div
                    className="h-40 w-full bg-surface-warm"
                    role="img"
                    aria-label={`Placeholder image for ${area.name}`}
                  />
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-foreground">
                      {area.name}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {area.description}
                    </p>
                    <Link
                      href={area.href}
                      className="mt-3 inline-block text-sm font-semibold text-primary hover:text-primary-hover"
                    >
                      View Tour Packages ›
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
  }