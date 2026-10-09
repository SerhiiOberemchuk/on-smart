"use client";

import { getBlurDataUrl } from "@/lib/image/getBlurDataUrl";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type SmartImageProps = Omit<ImageProps, "src"> & {
  src?: ImageProps["src"] | null;
  fallbackSrc?: string;
};

const DEFAULT_FALLBACK = "/images/image-fallback.svg";

function resolveSource(src: SmartImageProps["src"], fallbackSrc: string): ImageProps["src"] {
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
  alt,
  ...props
}: SmartImageProps) {
  const safeSrc = resolveSource(src, fallbackSrc);
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  const [previousSource, setPreviousSource] = useState(safeSrc);
  if (previousSource !== safeSrc) {
    setPreviousSource(safeSrc);
    setFailedSource(null);
  }
  const failed = failedSource === safeSrc;
  const resolvedSrc = failed ? fallbackSrc : safeSrc;

  const computedPlaceholder = placeholder ?? "blur";
  const computedBlur = blurDataURL ?? getBlurDataUrl();

  return (
    <Image
      {...props}
      src={resolvedSrc}
      alt={alt}
      placeholder={computedPlaceholder}
      blurDataURL={computedBlur}
      onError={(event) => {
        onError?.(event);
        if (!failed) {
          setFailedSource(safeSrc);
        }
      }}
    />
  );
}
