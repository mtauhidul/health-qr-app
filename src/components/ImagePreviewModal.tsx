// ImagePreviewModal.tsx
import { useEffect, useState } from "react";

interface ImagePreviewModalProps {
  images: File[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
  fallbackMode?: boolean;
}

function ImagePreviewModal({
  images,
  initialIndex,
  isOpen,
  onClose,
  fallbackMode = false,
}: ImagePreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [loadError, setLoadError] = useState(false);

  // Create image URLs for preview
  useEffect(() => {
    // Skip URL generation in fallback mode
    if (fallbackMode) return;

    const urls: string[] = [];

    try {
      // Create object URLs for each image
      images.forEach((image) => {
        const url = URL.createObjectURL(image);
        urls.push(url);
      });

      setImageUrls(urls);

      // Clean up URLs when component unmounts
      return () => {
        urls.forEach((url) => {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {
            console.warn("Error revoking object URL:", e);
          }
        });
      };
    } catch (error) {
      console.error("Error creating object URLs:", error);
      setLoadError(true);
      return undefined;
    }
  }, [images, fallbackMode]);

  // Reset current index when initialIndex changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "Escape":
          onClose();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Create a more compatible modal overlay
  const modalStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    padding: "1rem",
  } as React.CSSProperties;

  return (
    <div style={modalStyle} className="backdrop-blur-sm">
      <div className="relative w-full max-w-3xl sm:max-w-4xl p-2 sm:p-4">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 z-10 rounded-full bg-background/50 hover:bg-background/80 w-8 h-8 flex items-center justify-center"
          aria-label="Close"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
          <span className="sr-only">Close</span>
        </button>

        {/* Image container */}
        <div
          className="flex items-center justify-center bg-card rounded-lg overflow-hidden"
          style={{
            height: "calc(100vh - 6rem)",
            maxHeight: "80vh",
          }}
        >
          {!fallbackMode && imageUrls[currentIndex] && !loadError ? (
            <img
              src={imageUrls[currentIndex]}
              alt={`Image ${currentIndex + 1}`}
              className="max-h-full max-w-full object-contain"
              onError={() => setLoadError(true)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 w-full p-4 text-center">
              <div className="text-4xl font-bold text-accent-foreground mb-2">
                {currentIndex + 1}
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                {images[currentIndex]?.name || `Image ${currentIndex + 1}`}
              </div>
              <div className="text-xs text-muted-foreground">
                Preview not available on this device
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <button
          type="button"
          onClick={goToPrevious}
          className="absolute inset-y-0 left-4 flex items-center justify-center w-10 h-10 rounded-full bg-background/50 hover:bg-background/80"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute inset-y-0 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-background/50 hover:bg-background/80"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Image info and pagination */}
        <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 text-center">
          <div className="inline-block px-3 py-1 sm:px-4 sm:py-2 bg-background/70 backdrop-blur-sm rounded-full text-xs sm:text-sm">
            <span className="font-medium">
              {currentIndex + 1} / {images.length}
              {images[currentIndex]?.name && (
                <span className="hidden sm:inline">
                  {" "}
                  - {images[currentIndex].name}
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ImagePreviewModal;
