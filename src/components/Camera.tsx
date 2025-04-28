import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface CameraProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

function Camera({ onCapture, onClose }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );
  const [isLegacyBrowser, setIsLegacyBrowser] = useState(false);

  // Check for legacy browser on mount
  useEffect(() => {
    // Detect if running in a browser with limited capabilities
    const checkLegacyBrowser = () => {
      // Check if MediaDevices API is fully supported
      const hasModernMediaAPI = !!(
        navigator.mediaDevices && navigator.mediaDevices.getUserMedia
      );

      // Check for older browsers that might have prefixed APIs
      const hasLegacyMediaAPI = !!(
        (
          navigator as Navigator & {
            getUserMedia?: () => void;
            webkitGetUserMedia?: () => void;
            mozGetUserMedia?: () => void;
            msGetUserMedia?: () => void;
          }
        ).getUserMedia ||
        (
          navigator as Navigator & {
            getUserMedia?: () => void;
            webkitGetUserMedia?: () => void;
            mozGetUserMedia?: () => void;
            msGetUserMedia?: () => void;
          }
        ).webkitGetUserMedia ||
        (
          navigator as Navigator & {
            getUserMedia?: () => void;
            webkitGetUserMedia?: () => void;
            mozGetUserMedia?: () => void;
            msGetUserMedia?: () => void;
          }
        ).mozGetUserMedia ||
        (
          navigator as Navigator & {
            getUserMedia?: () => void;
            webkitGetUserMedia?: () => void;
            mozGetUserMedia?: () => void;
            msGetUserMedia?: () => void;
          }
        ).msGetUserMedia
      );

      // If we only have legacy support or no support at all
      setIsLegacyBrowser(
        !hasModernMediaAPI || (hasLegacyMediaAPI && !hasModernMediaAPI)
      );
    };

    checkLegacyBrowser();
  }, []);

  const startCamera = async () => {
    try {
      // Stop previous stream if it exists
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      let mediaStream: MediaStream;

      try {
        // First try the standard approach
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            // Lower resolution for better compatibility with older devices
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch (initialError) {
        console.warn(
          "Initial camera access failed, trying fallback:",
          initialError
        );

        // Fallback to basic video without constraints for older browsers
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      setStream(mediaStream);

      if (videoRef.current) {
        // Use srcObject if supported, otherwise fallback to src + createObjectURL
        try {
          videoRef.current.srcObject = mediaStream;
        } catch {
          // For older browsers that don't support srcObject
          try {
            // TypeScript doesn't know about createObjectURL on URL object
            throw new Error(
              "Your browser doesn't support srcObject for MediaStream."
            );
          } catch (urlError) {
            console.error(
              "Both modern and legacy video methods failed:",
              urlError
            );
            throw new Error("Your browser doesn't support camera features");
          }
        }

        // Setup video loaded event handling with error handling
        const handleVideoReady = () => setCameraReady(true);

        videoRef.current.onloadedmetadata = handleVideoReady;

        // Fallback if onloadedmetadata doesn't fire (happens in some browsers)
        setTimeout(() => {
          if (
            !isCameraReady &&
            videoRef.current &&
            videoRef.current.readyState >= 2
          ) {
            setCameraReady(true);
          }
        }, 1000);

        // Start playback immediately
        try {
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch((playError) => {
              console.error("Error playing video:", playError);
              // Some browsers require user interaction before playing
              setCameraReady(true); // Still mark as ready so user can interact
            });
          }
        } catch (playError) {
          console.warn("Play method not supported:", playError);
          setCameraReady(true); // Consider camera ready anyway
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(
        "Camera access denied or not available. Please check your permissions."
      );
    }
  };

  // Initialize the camera when component mounts
  useEffect(() => {
    startCamera();

    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Switch between front and back camera
  const switchCamera = () => {
    setCameraReady(false);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const capturePhoto = () => {
    if (!canvasRef.current || !videoRef.current || !isCameraReady) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    try {
      // Get video dimensions
      let videoWidth = video.videoWidth;
      let videoHeight = video.videoHeight;

      // Fallback dimensions if videoWidth/videoHeight are not available
      if (!videoWidth || !videoHeight) {
        videoWidth = video.offsetWidth || 640;
        videoHeight = video.offsetHeight || 480;
      }

      // Set canvas dimensions to match the video
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      // Draw the current video frame on the canvas
      const context = canvas.getContext("2d");
      if (context) {
        // Try-catch here because drawImage can fail in some browsers
        try {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
        } catch (drawError) {
          console.error("Error drawing to canvas:", drawError);
          setError("Unable to capture image from camera.");
          return;
        }

        // Convert canvas to blob and create a File
        // Use toBlob if available, otherwise fallback to toDataURL
        if (canvas.toBlob) {
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const file = new File([blob], `photo_${Date.now()}.jpg`, {
                  type: "image/jpeg",
                });
                onCapture(file);
              }
            },
            "image/jpeg",
            0.9
          );
        } else {
          // Fallback for browsers that don't support toBlob
          try {
            const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
            const binStr = atob(dataUrl.split(",")[1]);
            const arr = new Uint8Array(binStr.length);

            for (let i = 0; i < binStr.length; i++) {
              arr[i] = binStr.charCodeAt(i);
            }

            const blob = new Blob([arr], { type: "image/jpeg" });
            const file = new File([blob], `photo_${Date.now()}.jpg`, {
              type: "image/jpeg",
            });

            onCapture(file);
          } catch (dataUrlError) {
            console.error("Error with canvas data URL:", dataUrlError);
            setError("Your browser doesn't support image capture.");
          }
        }
      }
    } catch (error) {
      console.error("Error in capture process:", error);
      setError("Failed to capture photo. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header - fixed height */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold">Take a Photo</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
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
        </Button>
      </div>

      {/* Main content - Scrollable with limited height so footer is visible */}
      <div
        className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto overflow-x-hidden"
        style={{ maxHeight: "calc(100vh - 132px)" }}
      >
        {error ? (
          <div className="text-center p-4">
            <div className="text-destructive mb-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto mb-2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" x2="12" y1="8" y2="12" />
                <line x1="12" x2="12.01" y1="16" y2="16" />
              </svg>
            </div>
            <p className="text-destructive">{error}</p>
            <Button className="mt-4" onClick={onClose}>
              Go Back
            </Button>
          </div>
        ) : (
          <>
            {isLegacyBrowser && (
              <div className="w-full bg-amber-50 text-amber-800 p-2 mb-4 text-xs rounded border border-amber-200">
                Limited functionality detected. Some features may not work
                optimally in your browser.
              </div>
            )}

            {/* Camera preview with responsive sizing */}
            <div
              className="w-full max-w-md overflow-hidden rounded-lg relative bg-muted"
              style={{ aspectRatio: "4/3", maxHeight: "60vh" }}
            >
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
                    style={{ animation: "spin 1s linear infinite" }}
                  ></div>
                </div>
              )}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  isCameraReady ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Camera switch button */}
              {isCameraReady && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={switchCamera}
                  className="absolute top-2 right-2 bg-background/50 hover:bg-background/80 rounded-full"
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
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                </Button>
              )}
            </div>

            {/* Capture guidelines - condensed for small screens */}
            {isCameraReady && (
              <div className="mt-4 bg-muted p-3 rounded-md text-sm text-muted-foreground">
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
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
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Ensure good lighting for clarity
                  </li>
                  <li className="flex items-center gap-2">
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
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Position the form within the frame
                  </li>
                  <li className="flex items-center gap-2">
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
                      <polyline points="9 11 12 14 22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    Hold steady when capturing
                  </li>
                </ul>
              </div>
            )}

            {/* Hidden canvas for capturing frames */}
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}
      </div>

      {/* Footer with capture button - Fixed at bottom with definite height */}
      {isCameraReady && !error && (
        <div
          className="p-4 flex justify-center items-center border-t border-border bg-background"
          style={{ minHeight: "84px" }}
        >
          <div className="w-16 h-16 rounded-full border-4 border-primary flex items-center justify-center">
            <button
              onClick={capturePhoto}
              className="w-12 h-12 bg-primary rounded-full focus:outline-none"
              aria-label="Take photo"
            ></button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Camera;
