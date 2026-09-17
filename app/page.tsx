import Footer from "@/components/footer";
import FeatureHighlights from "@/components/home/FeatureHighlights";
import HeroSection from "@/components/home/HeroSection";
import TravelOptionsSection from "@/components/home/TravelOptionsSection";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <TravelOptionsSection />
        <FeatureHighlights />
      </main>

      <Footer />
    </div>
  );
}
