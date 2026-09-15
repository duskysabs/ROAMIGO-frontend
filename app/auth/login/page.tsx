import Link from "next/link";

export default function LoginPage(){
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

                    <form className="mt-6 space-y-4">
                        <div>
                            <label htmlFor="identifier" className="text-sm font-semibold text-foreground">
                                Mobile number or email
                            </label>
                            <input
                                id="identifier"
                                type="text"
                                placeholder="customer@example.com"
                                className="mt-2 w-full rounded-md border border-border bg-background px-4 py-2 text-sm"
                                />
                        </div>

                        <div>
                            <label htmlFor="password" className="text-sm font-semibold text-foreground">
                                Password
                            </label>
                            <input 
                                id="password"
                                type="password"
                                className="mt-2 w-full rounded-md border border-border bg-background px-4 py-2 text-sm"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-muted-foreground">
                                <input type="checkbox" />
                                Remember me
                            </label>
                            <Link href="/auth/forgot-password" className="text-primary hover:text-primary-hover">
                                Forgot your password?
                            </Link>
                        </div>

                        <button 
                            type="submit"
                            className="w-full rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-hover">
                                Log in
                            </button>
                    </form>

                    <div className="mt-6 space-y-3 border-t border-border pt-4 text-center text-sm">
                        <p className="text-muted-foreground">
                            Need help? {" "}
                            <Link href="/contact" className="font-semibold text-primary hover:text-primary-hover">
                                Contact Planet J
                            </Link>
                        </p>

                        <p className="text-muted-foreground">
                            Don&apos;t have an account? {" "}
                            <Link href="/auth/signup" className="font-semibold text-primary hover:text-primary-hover">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}