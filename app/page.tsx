import Footer from "@/components/footer";
import HeroSection from "@/components/home/HeroSection";
import TravelOptionsSection from "@/components/home/TravelOptionsSection";
import Navbar from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="bg-linear-to-b from-surface-warm/80 via-background to-background">
          <HeroSection />
          <TravelOptionsSection />
        </div>
      </main>

      <Footer />
    </div>
  );
}
