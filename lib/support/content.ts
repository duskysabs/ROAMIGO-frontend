export const supportPages = {
  feedback: {
    eyebrow: "Your experience matters",
    title: "How was your journey?",
    description: "Tell us what went well and what we can do better. Your perspective helps shape a better ROAMIGO experience.",
    formTitle: "Share your feedback",
    formDescription: "A few details can make a difference to your next trip.",
    topics: ["Trip experience", "Driver service", "Vehicle comfort", "Booking experience", "Other"],
  },
  contact: {
    eyebrow: "Here to help",
    title: "Let’s talk about your trip.",
    description: "Have a question about a booking or planning your Cebu itinerary? Start your message here.",
    formTitle: "Get in touch",
    formDescription: "Tell us what you need help with and include your booking reference if you have one.",
    topics: ["Booking question", "Trip planning", "Payments", "Changes or cancellation", "Other"],
  },
};
export type SupportPageKind = keyof typeof supportPages;
export const ratings = ["Poor", "Fair", "Good", "Very good", "Excellent"];
export const supportQuestions = [
  { question: "Where can I check my booking?", answer: "Sign in and open My Bookings to review your trip details and booking status." },
  { question: "Can I plan my own itinerary?", answer: "Choose Plan a Trip to enter your destinations, schedule, stops, and group size." },
  { question: "What should I include in my message?", answer: "Include your booking reference, travel date, and a short description of your question. Never include passwords or payment card details." },
];
