"use client";

import { getBlurDataUrl } from "@/lib/image/getBlurDataUrl";
import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

type SmartImageProps = Omit<ImageProps, "src"> & {
  src?: ImageProps["src"] | null;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK = "/images/image-fallback.svg";

function resolveSource(
  src: SmartImageProps["src"],
  fallbackSrc: string,
): ImageProps["src"] {
  if (typeof src === "string") {
    const trimmed = src.trim();
    return trimmed.length > 0 ? trimmed : fallbackSrc;
  }

  if (src) {
    return src;
  }

  return fallbackSrc;
}

export default function SmartImage({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  placeholder,
  blurDataURL,
  onError,
  ...props
}: SmartImageProps) {
  const safeSrc = resolveSource(src, fallbackSrc);
  const [resolvedSrc, setResolvedSrc] = useState<ImageProps["src"]>(safeSrc);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setResolvedSrc(safeSrc);
    setFailed(false);
  }, [safeSrc]);

  const computedPlaceholder = placeholder ?? "blur";
  const computedBlur = useMemo(
    () => blurDataURL ?? getBlurDataUrl(),
    [blurDataURL],
  );

  return (
    <Image
      {...props}
      src={resolvedSrc}
      placeholder={computedPlaceholder}
      blurDataURL={computedBlur}
      onError={(event) => {
        onError?.(event);
        if (!failed) {
          setResolvedSrc(fallbackSrc);
          setFailed(true);
        }
      }}
    />
  );
}
