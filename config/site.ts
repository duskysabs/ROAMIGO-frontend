export type NavigationItem = {
  label: string;
  href: string;
  requiresAuthentication: boolean;
};

export type ContentCard = {
  title: string;
  description: string;
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
    signup: { label: "Sign up", href: "/auth/signup" },
  },
  home: {
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
        action: { label: "Plan a Custom Trip", href: "/plan-a-trip" },
      },
      {
        title: "Tour Packages",
        description:
          "Browse predefined Cebu itineraries with complete service details.",
        action: { label: "Browse Tour Packages", href: "/tour-packages" },
      },
    ] satisfies ContentCard[],
    validationMessage:
      "ROAMIGO checks your trip details and available vehicle-driver pairs before showing the final price.",
    serviceSummary: {
      title: "Travel your way",
      description:
        "Choose a custom route or a prepared Cebu itinerary. Every service includes a professional driver.",
      items: ["Custom trips", "Cebu tour packages", "Driver included"],
    },
    features: [
      {
        title: "Checked availability",
        description:
          "Trip details and eligible vehicle-driver pairs are checked before payment.",
      },
      {
        title: "Clear final pricing",
        description:
          "Review the validated final price before continuing to payment.",
      },
      {
        title: "Driver included",
        description:
          "A professional driver is included with every confirmed service.",
      },
    ],
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
