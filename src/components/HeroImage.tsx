import { cn } from "@/lib/utils";
import { HERO_SIZE, resolveHeroImageUrl } from "@/lib/hero-image";

type HeroImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** e.g. "100vw" or "(max-width: 768px) 100vw, 50vw" */
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  targetWidth?: number;
};

export function HeroImage({
  src,
  alt,
  className,
  sizes = "100vw",
  width,
  height,
  priority = false,
  targetWidth = HERO_SIZE.banner.targetWidth,
}: HeroImageProps) {
  const resolved = resolveHeroImageUrl(src, targetWidth);

  return (
    <img
      src={resolved}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      className={cn(
        "h-full w-full object-cover object-center",
        className,
      )}
    />
  );
}
