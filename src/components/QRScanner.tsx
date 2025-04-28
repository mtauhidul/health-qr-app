import { Button } from "@/components/ui/button";
import { QrCode, Scan, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QRScannerProps {
  onSuccessfulScan: () => void;
}

function QRScanner({ onSuccessfulScan }: QRScannerProps) {
  const [cameraActive, setCameraActive] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

        // Simulate detecting a QR code
        const simulatedSuccess = Math.random() > 0.7; // 30% chance of success on each frame

        if (simulatedSuccess) {
          // Stop camera and scanning
          stopCamera();

          // Proceed to next step
          onSuccessfulScan();
        } else {
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

  return (
    <div className="w-full">
      <div className="bg-card p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
            {error}
          </div>
        )}

        <p className="mb-6 text-muted-foreground">
          Scan the QR code to begin the upload process.
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
              <QrCode size={64} className="text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-6">
                Position the QR code in the camera viewfinder
              </p>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            {cameraActive ? (
              <Button variant="outline" onClick={stopCamera} className="w-full">
                <X size={18} className="mr-2" />
                Cancel Scanning
              </Button>
            ) : (
              <Button onClick={startCamera} className="w-full">
                <Scan size={18} className="mr-2" />
                Start QR Scanning
              </Button>
            )}

            {/* For demo/testing only */}
            <Button
              variant="outline"
              onClick={onSuccessfulScan}
              className="w-full"
            >
              Skip Scanning
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRScanner;
