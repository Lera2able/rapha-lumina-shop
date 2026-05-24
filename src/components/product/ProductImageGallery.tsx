import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation when lightbox is open
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, handleNext, handlePrevious]);

  // Lock body scroll while the lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [lightboxOpen]);

  if (images.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  // For the thumbnail row, cap columns at 5 but flex down for fewer images
  const thumbCols = Math.min(images.length, 5);

  return (
    <>
      <div className="space-y-4">
        {/* Main image — object-contain shows the full image; muted bg fills any letterbox */}
        <div className="aspect-square overflow-hidden rounded-lg border relative group bg-muted/40">
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="w-full h-full block cursor-zoom-in"
            aria-label="Open full-size image"
          >
            <img
              src={images[selectedIndex]}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              className="w-full h-full object-contain"
            />
          </button>

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 bg-foreground/70 text-background rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="h-4 w-4" />
          </div>

          {images.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                aria-label="Previous image"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next image"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
                {images.map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      index === selectedIndex ? "bg-primary w-6" : "bg-primary/40 w-2"
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip — only when there's more than one image */}
        {images.length > 1 && (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${thumbCols}, minmax(0, 1fr))` }}
          >
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "aspect-square overflow-hidden rounded border-2 transition-all bg-muted/30",
                  index === selectedIndex
                    ? "border-primary"
                    : "border-transparent hover:border-border"
                )}
                aria-label={`View image ${index + 1}`}
              >
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — full-resolution viewer */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 md:p-8"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} image viewer`}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightboxOpen(false); }}
            className="absolute top-4 right-4 text-white/90 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <img
            src={images[selectedIndex]}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
          />

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
              {selectedIndex + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
