import Footer from "@/components/footer";
import Navbar from "@/components/navbar";

export default function MyBookingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      {children}
      <Footer compact />
    </div>
  );
}
