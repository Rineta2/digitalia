import { useState, useEffect } from "react";
import Image from "next/image";

export default function ImageWithOriginalSize({ src, alt, quality, loading }) {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight });
    };
  }, [src]);

  return (
    <Image
      src={src}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      quality={quality}
      loading={loading}
    />
  );
}
