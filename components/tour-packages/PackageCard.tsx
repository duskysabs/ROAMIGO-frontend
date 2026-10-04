import Image from "next/image";
import Button from "@/components/ui/button";
import { formatCurrency } from "@/lib/bookings/display";
import type { TourPackage } from "@/lib/tour-packages/types";

export default function PackageCard({
  tourPackage,
}: {
  tourPackage: TourPackage;
}) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-background transition-[border-color,transform] hover:-translate-y-1 hover:border-primary/30">
      <div className="relative aspect-[16/9] overflow-hidden bg-surface-warm">
        <Image
          src={tourPackage.heroImage.path}
          alt={tourPackage.heroImage.alt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
        />
      </div>
      <div className="flex flex-col gap-3 p-6">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          {tourPackage.title}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          {tourPackage.shortDescription}
        </p>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            {formatCurrency(tourPackage.pricePerPerson)} / person
          </span>
          <span className="text-muted-foreground">{tourPackage.duration}</span>
        </div>
        <Button
          href={`/tour-packages/${tourPackage.slug}`}
          variant="outline"
          className="mt-2 self-start"
        >
          View details
        </Button>
      </div>
    </article>
  );
}
