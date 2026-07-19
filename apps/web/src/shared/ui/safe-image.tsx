'use client';

import Image, { type ImageProps } from 'next/image';
import { useState } from 'react';

/** Reliable fallback when a remote image 404s or fails to load. */
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80';

type SafeImageProps = Omit<ImageProps, 'src' | 'onError'> & {
  src: string | null | undefined;
};

function SafeImageInner({
  src,
  alt,
  ...rest
}: Omit<ImageProps, 'src' | 'onError'> & { src: string }) {
  const [current, setCurrent] = useState(src);

  return (
    <Image
      {...rest}
      src={current}
      alt={alt}
      unoptimized
      onError={() => {
        if (current !== FALLBACK_IMAGE) {
          setCurrent(FALLBACK_IMAGE);
        }
      }}
    />
  );
}

export function SafeImage({ src, alt, ...rest }: SafeImageProps) {
  const resolved = src && src.trim() ? src : FALLBACK_IMAGE;
  return <SafeImageInner key={resolved} src={resolved} alt={alt} {...rest} />;
}
