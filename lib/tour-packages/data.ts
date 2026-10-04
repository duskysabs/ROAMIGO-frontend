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
    gallery: [
      {
        path: "/images/home/custom-trip-mantayupan-falls.jpg",
        alt: "Turquoise waterfall in Cebu's southern mountains",
      },
      {
        path: "/images/home/custom-trip-mountain-view-enhanced.png",
        alt: "Mountain landscape viewed from a Cebu countryside stop",
      },
      {
        path: "/images/home/hero-planet-j-vans-enhanced.png",
        alt: "Planet J van included with your professional driver",
      },
      {
        path: "/images/home/planet-j-fleet-enhanced.png",
        alt: "Planet J fleet of vehicles in its Cebu yard",
      },
    ],
    routeStops: [
      "Cebu City pickup point",
      "Badian welcome center and gear fitting",
      "Kawasan Falls canyoneering trailhead",
      "Kawasan main falls lunch stop",
      "Return drop-off",
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
    gallery: [
      {
        path: "/images/home/tour-package-cebu-coast-enhanced.png",
        alt: "Clear coastal water and an outrigger boat in Cebu",
      },
      {
        path: "/images/home/tour-package-cebu-coast.jpg",
        alt: "Coastal sandbar off Cebu with clear turquoise water",
      },
      {
        path: "/images/home/hero-cebu-driver-v2.png",
        alt: "Your professional Planet J driver in Cebu",
      },
      {
        path: "/images/home/hero-driver-guests.jpg",
        alt: "Driver assisting guests at the start of a Cebu trip",
      },
    ],
    routeStops: [
      "Cebu City pickup point",
      "Mactan pier boat departure",
      "Sandbar and snorkeling stop",
      "Reef stop and floating lunch",
      "Return drop-off",
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
    gallery: [
      {
        path: "/images/home/tour-package-seaside-pool.jpg",
        alt: "Seaside pool overlooking the ocean in Moalboal, Cebu",
      },
      {
        path: "/images/home/tour-package-cebu-coast.jpg",
        alt: "Clear ocean water off Cebu's southwest coast",
      },
      {
        path: "/images/home/hero-planet-j-vans.jpg",
        alt: "Planet J van included with your professional driver",
      },
      {
        path: "/images/home/planet-j-fleet.jpg",
        alt: "Planet J fleet of vehicles in its Cebu yard",
      },
    ],
    routeStops: [
      "Cebu City pickup point",
      "Moalboal gear fitting",
      "Sardine run snorkel site",
      "Seaside resort lunch and pool time",
      "Return drop-off",
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
