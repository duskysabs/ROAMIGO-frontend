import type { TourPackage } from "./types";

export const tourPackages: TourPackage[] = [
  {
    slug: "south-cebu-waterfalls-canyoneering",
    title: "South Cebu Waterfalls & Canyoneering",
    shortDescription:
      "Chase turquoise waterfalls and canyoneer through Kawasan's famous cliffs and cascades.",
    description:
      "Head south to Badian for a full day among Cebu's most photographed waterfalls. A certified canyoneering guide leads you through a series of cliff jumps, rope slides, and swims down Kawasan's turquoise river, ending at the three-tier main falls.",
    heroImage: {
      path: "/images/home/custom-trip-mantayupan-falls.jpg",
      alt: "Turquoise waterfall in Cebu's southern mountains",
    },
    itinerary: [
      "5:00 AM — Pickup from your accommodation",
      "8:00 AM — Arrive in Badian, safety briefing and gear fitting",
      "9:00 AM to 1:00 PM — Kawasan Falls canyoneering trek",
      "1:30 PM — Lunch by the falls",
      "3:00 PM — Return drive with a stop at a local viewpoint",
      "6:00 PM — Drop-off",
    ],
    inclusions: [
      "Professional driver and air-conditioned vehicle",
      "Certified canyoneering guide and safety gear",
      "Lunch",
      "Entrance and environmental fees",
    ],
    duration: "Full day, about 13 hours",
    pricePerPerson: 2800,
    maxPassengers: 12,
  },
  {
    slug: "cebu-coastal-island-hopping",
    title: "Cebu Coastal & Island Hopping",
    shortDescription:
      "Island-hop across Cebu's clearest coastal waters with stops for snorkeling and lunch on the sand.",
    description:
      "Board a traditional outrigger boat and hop between sandbars and reef stops off Cebu's coast. Expect calm, clear water, a floating lunch setup, and time to snorkel over coral gardens before heading back to shore.",
    heroImage: {
      path: "/images/home/tour-package-cebu-coast-enhanced.png",
      alt: "Clear coastal water and an outrigger boat in Cebu",
    },
    itinerary: [
      "7:00 AM — Pickup from your accommodation",
      "9:00 AM — Depart by boat from the pier",
      "9:30 AM to 12:00 PM — Island and sandbar hopping with snorkeling stops",
      "12:30 PM — Floating lunch",
      "2:00 PM to 4:00 PM — Final reef stop and free time",
      "5:30 PM — Drop-off",
    ],
    inclusions: [
      "Professional driver and air-conditioned vehicle",
      "Boat, boatman, and life vests",
      "Snorkeling gear",
      "Lunch",
      "Island entrance fees",
    ],
    duration: "Full day, about 10 hours",
    pricePerPerson: 2200,
    maxPassengers: 15,
  },
  {
    slug: "moalboal-seaside-sardine-run",
    title: "Moalboal Seaside & Sardine Run",
    shortDescription:
      "Snorkel alongside Moalboal's legendary sardine run and unwind at a seaside resort pool.",
    description:
      "Drive to Moalboal on Cebu's southwest coast to swim just meters from shore into one of the world's few year-round sardine runs. The afternoon winds down at a seaside resort pool with ocean views before the drive back.",
    heroImage: {
      path: "/images/home/tour-package-seaside-pool.jpg",
      alt: "Seaside pool overlooking the ocean in Moalboal, Cebu",
    },
    itinerary: [
      "6:00 AM — Pickup from your accommodation",
      "9:00 AM — Arrive in Moalboal, gear fitting",
      "9:30 AM to 11:30 AM — Guided sardine run snorkel",
      "12:00 PM — Lunch at a seaside resort",
      "1:00 PM to 4:00 PM — Free time at the resort pool and beach",
      "7:00 PM — Drop-off",
    ],
    inclusions: [
      "Professional driver and air-conditioned vehicle",
      "Snorkeling guide and gear",
      "Lunch",
      "Resort day-use pass",
    ],
    duration: "Full day, about 13 hours",
    pricePerPerson: 2500,
    maxPassengers: 12,
  },
];

export function getTourPackage(slug: string): TourPackage | undefined {
  return tourPackages.find((tourPackage) => tourPackage.slug === slug);
}
