export type NavigationItem = {
  label: string;
  href: string;
  requiresAuthentication: boolean;
};

export type ContentCard = {
  title: string;
  description: string;
  imagePath: string;
  photoAlt: string;
  action: {
    label: string;
    href: string;
  };
};

export const siteConfig = {
  brand: {
    companyName: "Planet J Rent a Car",
    systemName: "ROAMIGO",
    logoPath: "/images/planet-j-logo.png",
  },
  navigation: [
    { label: "Home", href: "/", requiresAuthentication: false },
    {
      label: "Plan a Trip",
      href: "/plan-a-trip",
      requiresAuthentication: false,
    },
    {
      label: "Tour Packages",
      href: "/tour-packages",
      requiresAuthentication: false,
    },
    {
      label: "My Bookings",
      href: "/my-bookings",
      requiresAuthentication: true,
    },
    {
      label: "Feedback",
      href: "/feedback",
      requiresAuthentication: false,
    },
    {
      label: "Contact Us",
      href: "/contact",
      requiresAuthentication: false,
    },
  ] satisfies NavigationItem[],
  authentication: {
    login: { label: "Log in", href: "/auth/login" },
  },
  home: {
    eyebrow: "Driver-included Cebu travel",
    heading: {
      textBeforeHighlight: "Your Cebu",
      highlightedText: "journey",
      textAfterHighlight: "starts here.",
    },
    description:
      "Plan custom trips or explore Cebu tour packages, with a professional driver included.",
    actions: [
      { label: "Plan a Custom Trip", href: "/plan-a-trip" },
      { label: "Browse Tour Packages", href: "/tour-packages" },
    ],
    travelOptions: [
      {
        title: "Custom Trips",
        description:
          "Build a trip around your destinations, stops, schedule, and group size.",
        imagePath: "/images/home/custom-trip-mountain-view-enhanced.png",
        photoAlt: "Mountain landscape viewed from a Cebu countryside stop",
        action: { label: "Plan a Custom Trip", href: "/plan-a-trip" },
      },
      {
        title: "Tour Packages",
        description:
          "Browse predefined Cebu itineraries with complete service details.",
        imagePath: "/images/home/tour-package-cebu-coast-enhanced.png",
        photoAlt: "Clear coastal water and an outrigger boat in Cebu",
        action: { label: "Browse Tour Packages", href: "/tour-packages" },
      },
    ] satisfies ContentCard[],
    fleet: {
      eyebrow: "Planet J fleet",
      title: "Group travel, handled professionally",
      description:
        "Vehicle-driver availability is checked against your trip details before you continue to payment.",
      imagePath: "/images/home/hero-planet-j-yard-v4.png",
      alt: "Planet J fleet of buses and vans parked in its Cebu vehicle yard",
    },
    checkoutValidation: {
      eyebrow: "Confirmed before payment",
      items: ["Trip details", "Availability", "Final price"],
    },
  },
  footer: {
    description:
      "Driver-included vehicle rental services for custom trips and Cebu tours.",
    location: "Lapu-Lapu City, Cebu, Philippines",
    contactPage: "/contact",
    businessHours: [
      { days: "Sunday to Friday", hours: "Open 24 hours" },
      { days: "Saturday", hours: "Closed" },
    ],
  },
} as const;
