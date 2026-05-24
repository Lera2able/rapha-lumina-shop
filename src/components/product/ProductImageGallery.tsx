import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  videoUrl?: string | null;
}

// Internal type for any media slide
type MediaItem =
  | { kind: 'image'; src: string }
  | { kind: 'video'; src: string };

export default function ProductImageGallery({
  images,
  productName,
  videoUrl,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Combine images + (optional) video into a single media list
  const media: MediaItem[] = [
    ...images.map((src) => ({ kind: 'image' as const, src })),
    ...(videoUrl ? [{ kind: 'video' as const, src: videoUrl }] : []),
  ];

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  }, [media.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  }, [media.length]);

  // Keyboard nav while lightbox is open
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

  // Lock body scroll while lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = original; };
    }
  }, [lightboxOpen]);

  if (media.length === 0) {
    return (
      <div className="aspect-square overflow-hidden rounded-lg border bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">No image available</p>
      </div>
    );
  }

  const current = media[selectedIndex];
  const thumbCols = Math.min(media.length, 5);

  return (
    <>
      <div className="space-y-4">
        {/* Main media slot — same square aspect as the photo cards */}
        <div className="aspect-square overflow-hidden rounded-lg border relative group bg-muted/40">
          {current.kind === 'image' ? (
            <button
              type="button"
              onClick={() => setLightboxOpen(true)}
              className="w-full h-full block cursor-zoom-in"
              aria-label="Open full-size image"
            >
              <img
                src={current.src}
                alt={`${productName} - Image ${selectedIndex + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ) : (
            // Video plays inline in the same square container.
            // `key` forces React to remount the <video> when switching slides so it resets.
            <video
              key={current.src}
              src={current.src}
              controls
              playsInline
              className="w-full h-full object-contain bg-black"
            >
              Your browser does not support video playback.
            </video>
          )}

          {/* Zoom hint — only on images */}
          {current.kind === 'image' && (
            <div className="absolute top-3 right-3 bg-foreground/70 text-background rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <ZoomIn className="h-4 w-4" />
            </div>
          )}

          {media.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => { e.stopPropagation(); handlePrevious(); }}
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => { e.stopPropagation(); handleNext(); }}
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              {/* Slide indicator dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-none">
                {media.map((_, index) => (
                  <span
                    key={index}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      index === selectedIndex ? 'bg-primary w-6' : 'bg-primary/40 w-2'
                    )}
                    aria-hidden
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Thumbnail strip */}
        {media.length > 1 && (
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${thumbCols}, minmax(0, 1fr))` }}
          >
            {media.map((item, index) => (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  'aspect-square overflow-hidden rounded border-2 transition-all bg-muted/30 relative',
                  index === selectedIndex
                    ? 'border-primary'
                    : 'border-transparent hover:border-border'
                )}
                aria-label={
                  item.kind === 'video'
                    ? 'Play product video'
                    : `View image ${index + 1}`
                }
              >
                {item.kind === 'image' ? (
                  <img
                    src={item.src}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  // Video thumbnail: render the first frame, with a play overlay
                  <>
                    <video
                      src={item.src}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-contain bg-black pointer-events-none"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
                      <div className="bg-white/90 rounded-full p-2">
                        <Play className="h-4 w-4 text-foreground fill-foreground" />
                      </div>
                    </div>
                  </>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox — full-resolution image viewer (images only) */}
      {lightboxOpen && current.kind === 'image' && (
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

          {media.filter((m) => m.kind === 'image').length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // Cycle only through images in the lightbox
                  let i = selectedIndex;
                  do {
                    i = i === 0 ? media.length - 1 : i - 1;
                  } while (media[i].kind !== 'image' && i !== selectedIndex);
                  setSelectedIndex(i);
                }}
                className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-7 w-7" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  let i = selectedIndex;
                  do {
                    i = i === media.length - 1 ? 0 : i + 1;
                  } while (media[i].kind !== 'image' && i !== selectedIndex);
                  setSelectedIndex(i);
                }}
                className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/90 hover:text-white p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                aria-label="Next image"
              >
                <ChevronRight className="h-7 w-7" />
              </button>
            </>
          )}

          <img
            src={current.src}
            alt={`${productName} - Image ${selectedIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
          />
        </div>
      )}
    </>
  );
}
