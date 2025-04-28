import { Button } from "@/components/ui/button";
import { verifyAuthToken } from "@/services/authService";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onSuccessfulScan: () => void;
}

function QRScanner({ onSuccessfulScan }: QRScannerProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastVerified, setLastVerified] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Check if the user was previously verified
  useEffect(() => {
    const verified = localStorage.getItem("healthFormAuthVerified");
    if (verified) {
      setLastVerified(verified);

      // Check if the verification is still valid (24 hours)
      const verifiedTime = new Date(verified).getTime();
      const currentTime = new Date().getTime();
      const hoursDiff = (currentTime - verifiedTime) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        // Still valid, can skip QR verification
        console.log("Previously verified within 24 hours");
      }
    }
  }, []);

  // Start the camera
  const startCamera = async () => {
    setError(null);
    setCameraActive(true);

    try {
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        startQRScanning();
      }
    } catch (err) {
      console.error("Error starting camera:", err);
      setError(
        "Unable to access the camera. Please check your permissions and try again."
      );
      setCameraActive(false);
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setCameraActive(false);
    setScanning(false);
  };

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start QR code scanning
  const startQRScanning = () => {
    setScanning(true);
    scanQRCode();
  };

  // Process video frames to detect QR codes
  const scanQRCode = async () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      try {
        // In a real implementation, use a QR code scanning library like jsQR
        // For this example, we'll simulate finding a QR code after a delay

        // Simulate QR code processing delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Simulate detecting a QR code with an auth token
        const simulatedToken =
          "AUTH_" + Math.random().toString(36).substring(2, 15);

        // Verify the token
        const isVerified = await verifyAuthToken(simulatedToken);

        if (isVerified) {
          // Store verification time
          const verificationTime = new Date().toISOString();
          localStorage.setItem("healthFormAuthVerified", verificationTime);
          localStorage.setItem("healthFormAuthToken", simulatedToken);

          // Stop camera and scanning
          stopCamera();

          // Proceed to next step
          onSuccessfulScan();
        } else {
          // If not scanning but still want to demo, use this:
          console.log("Invalid QR code, continuing to scan...");

          // Continue scanning
          requestAnimationFrame(scanQRCode);
        }
      } catch (err) {
        console.error("Error processing QR code:", err);
        // Continue scanning despite error
        requestAnimationFrame(scanQRCode);
      }
    } else {
      // Video not ready yet, continue scanning
      requestAnimationFrame(scanQRCode);
    }
  };

  // Use previously verified session
  const useExistingVerification = () => {
    if (lastVerified) {
      const verifiedTime = new Date(lastVerified).getTime();
      const currentTime = new Date().getTime();
      const hoursDiff = (currentTime - verifiedTime) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        // Still valid
        onSuccessfulScan();
        return;
      }
    }

    // Not valid anymore, need to scan again
    setError(
      "Your previous verification has expired. Please scan the QR code again."
    );
  };

  return (
    <div className="w-full">
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Form QR Code Scanner</h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
            {error}
          </div>
        )}

        {lastVerified && (
          <div className="mb-4 p-3 bg-muted rounded-md">
            <p className="text-sm mb-2">
              Previously verified: {new Date(lastVerified).toLocaleString()}
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={useExistingVerification}
              className="w-full"
            >
              Use Existing Verification
            </Button>
          </div>
        )}

        <p className="mb-6 text-muted-foreground">
          Scan the QR code provided by your healthcare provider to begin the
          upload process.
        </p>

        <div className="relative">
          {cameraActive ? (
            <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              ></video>

              {/* QR code targeting overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-primary w-1/2 h-1/2 rounded-lg"></div>
              </div>

              {/* Scanning animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3/4 h-px bg-primary/70 animate-pulse"></div>
              </div>

              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
          ) : (
            <div className="aspect-square bg-muted rounded-lg mb-4 flex flex-col items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-muted-foreground mb-4"
              >
                <rect width="5" height="5" x="3" y="3" rx="1" />
                <rect width="5" height="5" x="16" y="3" rx="1" />
                <rect width="5" height="5" x="3" y="16" rx="1" />
                <rect width="5" height="5" x="16" y="16" rx="1" />
                <path d="M21 8v8" />
                <path d="M8 3v18" />
                <path d="M3 8h18" />
                <path d="M3 16h18" />
              </svg>
              <p className="text-sm text-muted-foreground mb-6">
                Position the QR code in the camera viewfinder
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {cameraActive ? (
              <Button variant="outline" onClick={stopCamera} className="w-full">
                Cancel Scanning
              </Button>
            ) : (
              <Button onClick={startCamera} className="w-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-2"
                >
                  <path d="M15 8v.5a2.5 2.5 0 0 1-5 0V8" />
                  <path d="M4 7v1a7 7 0 0 0 14 0V7" />
                  <line x1="9" x2="9" y1="11" y2="15" />
                  <line x1="15" x2="15" y1="11" y2="15" />
                  <path d="M12 17v4" />
                </svg>
                Start QR Scanning
              </Button>
            )}

            {/* For demo/testing only - would be removed in production */}
            <Button
              variant="outline"
              onClick={onSuccessfulScan}
              className="w-full text-xs text-muted-foreground"
            >
              Demo: Skip Authentication
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRScanner;
