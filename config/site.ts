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
      "Book driver-included vehicle rental services for custom trips or approved Cebu tour packages.",
    actions: [
      { label: "Plan a Custom Trip", href: "/plan-a-trip" },
      { label: "Browse Tour Packages", href: "/tour-packages" },
    ],
    travelOptions: [
      {
        title: "Custom Trips",
        description:
          "Enter your route, schedule, passengers, and preferred vehicle category.",
        action: { label: "Plan a Custom Trip", href: "/plan-a-trip" },
      },
      {
        title: "Tour Packages",
        description:
          "Choose from active packages with approved routes, stops, and service information.",
        action: { label: "Browse Tour Packages", href: "/tour-packages" },
      },
    ] satisfies ContentCard[],
    validationMessage:
      "ROAMIGO validates the route, schedule, passenger capacity, and availability before presenting the final customer-facing price.",
    features: [
      {
        title: "Automated validation",
        description:
          "Route, schedule, capacity, availability, and readiness are checked before payment.",
      },
      {
        title: "Final price",
        description:
          "The customer sees the validated final price before continuing to payment.",
      },
      {
        title: "Driver included",
        description:
          "An eligible designated vehicle-driver pair is assigned after confirmation.",
      },
    ],
  },
  footer: {
    location: "Lapu-Lapu City, Cebu, Philippines",
    contactPage: "/contact",
    businessHours: [
      { days: "Sunday to Friday", hours: "Open 24 hours" },
      { days: "Saturday", hours: "Closed" },
    ],
  },
} as const;
