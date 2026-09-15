import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}