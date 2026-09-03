import Image from "next/image";
import { Parallax } from "@/components/ui/Parallax";

/**
 * The hero's approved 3D visual: an original illustrative graphic showing
 * a generic, unbranded power station connected to a refrigerator, laptop,
 * lamp and RV — representing the kinds of devices a station can power, not
 * a specific product in the PowerMatchLab catalog and not a claim about any
 * real device's wattage. The image itself is never stretched or cropped
 * into a different shape (object-contain) — only layered glow/parallax
 * effects move around it.
 */
export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-2xl">
      {/* Animated glow layers behind the image — independent, subtle motion. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[6%] rounded-full bg-radial-glow-cyan opacity-70 animate-pulse-soft"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[18%] rounded-full bg-radial-glow-brand opacity-50 animate-pulse-soft"
        style={{ animationDelay: "-1.5s" }}
      />

      <Parallax range={12} className="relative animate-float">
        <Image
          src="/marketing/hero-power-station.png"
          alt="Illustrative 3D graphic of a generic portable power station connected by glowing lines to a refrigerator, laptop, lamp and RV — representing typical devices it can power. Not a photograph of a specific PowerMatchLab catalog product."
          width={1672}
          height={941}
          priority
          sizes="(min-width: 1024px) 640px, 90vw"
          className="h-auto w-full object-contain drop-shadow-[0_30px_60px_rgba(6,182,212,0.25)]"
        />
      </Parallax>
    </div>
  );
}
