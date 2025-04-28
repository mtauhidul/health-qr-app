import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import ImagePreviewModal from "./ImagePreviewModal";

interface ImagePreviewProps {
  images: File[];
  onRemove: (index: number) => void;
}

function ImagePreview({ images, onRemove }: ImagePreviewProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Create preview URLs for the images
  useEffect(() => {
    // Clean up previous URLs
    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    // Create new URLs
    const urls = images.map((image) => URL.createObjectURL(image));
    setPreviewUrls(urls);

    // Clean up URLs when component unmounts
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setModalOpen(true);
  };

  const closeImageModal = () => {
    setModalOpen(false);
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div
              className="w-full aspect-square rounded-md flex flex-col items-center justify-center overflow-hidden border border-border cursor-pointer"
              onClick={() => openImageModal(index)}
            >
              {previewUrls[index] ? (
                <img
                  src={previewUrls[index]}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="text-xs text-center text-muted-foreground px-1">
                    {image.name.length > 15
                      ? image.name.substring(0, 15) + "..."
                      : image.name}
                  </div>
                  <div className="text-3xl font-bold text-accent-foreground">
                    {index + 1}
                  </div>
                </div>
              )}

              {/* Overlay with image number */}
              <div className="absolute top-1 left-1 bg-background/70 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
                {index + 1}
              </div>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
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
            </Button>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        images={images}
        initialIndex={selectedImageIndex}
        isOpen={modalOpen}
        onClose={closeImageModal}
      />
    </>
  );
}

export default ImagePreview;
