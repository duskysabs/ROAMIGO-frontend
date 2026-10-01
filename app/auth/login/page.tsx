import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import { getSessionState } from "@/lib/auth/session";

export default async function LoginPage() {
    const session = await getSessionState();

    if (session.status === "authenticated") {
        redirect("/customer");
    }

    return (
        <section className="bg-gradient-to-r from-surface-warm to-background px-6 py-24 sm:px-10">
            <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2 md:items-center">
                <div>
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                        Welcome back!
                    </h1>
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl">
                        Let&apos;s get you on the road.
                    </h1>
                    <p className="mt-4 max-w-md text-lg text-muted-foreground">
                        Log in to manage booking requests, payments, and trip updates.
                    </p>
                </div>
                
                <div className="rounded-lg border border-border bg-background p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-foreground">
                        Log in to <span className="text-primary">ROAMIGO</span>
                    </h2>

                    <LoginForm />
                </div>
            </div>
        </section>
    );
}
