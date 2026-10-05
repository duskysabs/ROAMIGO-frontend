const packageImages = [
  {
    path: "/images/home/custom-trip-mantayupan-falls.jpg",
    alt: "Waterfall scenery in Cebu",
  },
  {
    path: "/images/home/tour-package-cebu-coast-enhanced.png",
    alt: "Coastal scenery in Cebu",
  },
  {
    path: "/images/home/tour-package-seaside-pool.jpg",
    alt: "Seaside scenery in Cebu",
  },
  {
    path: "/images/home/hero-planet-j-vans-enhanced.png",
    alt: "Planet J vehicles in Cebu",
  },
] as const;

export function getPackageImages(index: number) {
  return packageImages.map(
    (_, offset) => packageImages[(index + offset) % packageImages.length],
  );
}
