import Image from "next/image";
import Button from "@/components/ui/button";
import { formatCurrency } from "@/lib/bookings/display";
import type { TourPackage } from "@/lib/tour-packages/types";

export default function PackageCard({
  tourPackage,
}: {
  tourPackage: TourPackage;
}) {
  const hours = Math.max(1, Math.round(tourPackage.estimatedDurationMinutes / 60));

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
          {tourPackage.name}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">
          {tourPackage.description}
        </p>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            From {formatCurrency(tourPackage.basePrice)}
          </span>
          <span className="text-muted-foreground">About {hours} hours</span>
        </div>
        <Button
          href={`/tour-packages/${tourPackage.id}`}
          variant="outline"
          className="mt-2 self-start"
        >
          View details
        </Button>
      </div>
    </article>
  );
}
