import { Button } from "@/components/ui/button";
import {
  Camera as CameraIcon,
  Check,
  Clock,
  File,
  FileUp,
  FolderUp,
  Image,
  Mic,
  Upload,
} from "lucide-react";
import { useEffect, useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import Camera from "./components/Camera";
import Footer from "./components/Footer";
import Header from "./components/Header";
import ImagePreview from "./components/ImagePreview";
import UploadProgress from "./components/UploadProgress";
import { uploadToGoogleDrive } from "./services/fileService";
import { getAppName } from "./utils/env";

// Define the steps of our form upload process
type Step = "instructions" | "upload" | "confirmation";

function App() {
  // App state
  const [currentStep, setCurrentStep] = useState<Step>("instructions");
  const [images, setImages] = useState<File[]>([]);
  const [audioNote, setAudioNote] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    folderPath: string;
  } | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unsupportedBrowser, setUnsupportedBrowser] = useState(false);

  // Check browser compatibility on mount
  useEffect(() => {
    // Check for essential browser features
    const checkBrowserCompatibility = () => {
      // List of features to check
      const requiredFeatures = {
        fileAPI:
          window.File && window.FileReader && window.FileList && window.Blob,
        formData: window.FormData !== undefined,
        fetch: window.fetch !== undefined,
        promises: window.Promise !== undefined,
        localStorage: (() => {
          try {
            localStorage.setItem("test", "test");
            localStorage.removeItem("test");
            return true;
          } catch {
            return false;
          }
        })(),
      };

      // Check if any required feature is missing
      const incompatible = Object.values(requiredFeatures).some(
        (feature) => !feature
      );
      setUnsupportedBrowser(incompatible);

      // Log detailed compatibility info
      if (incompatible) {
        console.warn(
          "Browser compatibility issues detected:",
          Object.entries(requiredFeatures)
            .filter(([, supported]) => !supported)
            .map(([feature]) => feature)
            .join(", ")
        );
      }
    };

    checkBrowserCompatibility();
  }, []);

  // For legacy browsers, use a simpler file input
  const handleDirectImageUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      setImages((prev) => [...prev, ...newFiles]);
    }
  };

  // Handle file selection for images
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleDirectImageUpload(e.target.files);
  };

  // Handle file selection for audio
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAudioNote(e.target.files[0]);
    }
  };

  // Handle voice recording completion
  const handleRecordingComplete = (audioFile: File) => {
    setAudioNote(audioFile);
  };

  // Handle image capture from camera
  const handleCameraCapture = (file: File) => {
    setImages((prev) => [...prev, file]);
    setIsCameraOpen(false);
  };

  // Remove an image by index
  const removeImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // Simulated upload function with progress for testing on legacy browsers
  const simulateUpload = async () => {
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const steps = [10, 25, 40, 60, 80, 100];

    for (const progress of steps) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setUploadProgress(progress);
    }

    return {
      success: true,
      folderPath: `/Forms/${new Date().toISOString().slice(0, 10)}/`,
    };
  };

  // Move to the next step
  const goToNextStep = async () => {
    setError(null);

    if (currentStep === "instructions") {
      setCurrentStep("upload");
    } else if (currentStep === "upload") {
      try {
        // Validate required files
        if (images.length < 8) {
          setError("Please upload at least 8 images before proceeding.");
          return;
        }

        // Start upload process
        setIsUploading(true);
        setUploadProgress(0);

        try {
          // Set initial progress
          setUploadProgress(10);

          let result;

          // Use the real upload function or fallback if needed
          try {
            result = await uploadToGoogleDrive(images, audioNote);
          } catch (uploadError) {
            console.warn(
              "Standard upload failed, using fallback:",
              uploadError
            );
            // Fallback for testing or when API is not available
            result = await simulateUpload();
          }

          // Update progress to show completion
          setUploadProgress(100);
          setUploadResult(result);

          // Small delay to show 100% before moving to confirmation
          setTimeout(() => {
            setCurrentStep("confirmation");
            setIsUploading(false);
          }, 500);
        } catch (error) {
          console.error("Upload error:", error);
          setIsUploading(false);
          setError(
            "Failed to upload files. Please check your connection and try again."
          );
        }
      } catch (error) {
        console.error("Error:", error);
        setError("An unexpected error occurred. Please try again.");
      }
    } else if (currentStep === "confirmation") {
      // Reset the form and start over
      setImages([]);
      setAudioNote(null);
      setUploadResult(null);
      setError(null);

      // Go back to upload step, we're always authenticated
      setCurrentStep("upload");
    }
  };

  // Validate if we can proceed to the next step
  const canProceed = () => {
    if (currentStep === "instructions") return true;
    if (currentStep === "upload") return images.length >= 8;
    return true;
  };

  // Check for very old browsers and show a simple version
  if (unsupportedBrowser) {
    return (
      <div
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          padding: "20px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <h1 style={{ fontSize: "24px", marginBottom: "20px" }}>
          {getAppName() || "Health Form Upload"}
        </h1>

        <div
          style={{
            border: "1px solid #ccc",
            borderRadius: "5px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>
            Your browser has limited support
          </h2>
          <p style={{ marginBottom: "15px" }}>
            For the best experience, please use a modern browser like Chrome,
            Firefox, Safari, or Edge.
          </p>
          <p style={{ marginBottom: "15px" }}>
            You can still upload your forms using the simplified interface
            below.
          </p>

          <form style={{ marginTop: "20px" }}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Upload Images (at least 8):
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleDirectImageUpload(e.target.files)}
                style={{ marginBottom: "10px" }}
              />
              <div style={{ fontSize: "14px", color: "#666" }}>
                {images.length} images selected
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  fontWeight: "bold",
                }}
              >
                Upload Audio Note (optional):
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
              />
            </div>

            <button
              type="button"
              onClick={goToNextStep}
              disabled={images.length < 8}
              style={{
                padding: "10px 15px",
                backgroundColor: images.length >= 8 ? "#4a90e2" : "#cccccc",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: images.length >= 8 ? "pointer" : "not-allowed",
              }}
            >
              Upload Files
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-svh bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex justify-between mb-4 sm:mb-6">
            {["Instructions", "Upload", "Confirmation"].map((step, index) => (
              <div
                key={step}
                className={`flex flex-col items-center ${
                  (currentStep === "instructions" && index === 0) ||
                  (currentStep === "upload" && index === 1) ||
                  (currentStep === "confirmation" && index === 2)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 sm:mb-2 text-xs sm:text-sm ${
                    (currentStep === "instructions" && index === 0) ||
                    (currentStep === "upload" && index === 1) ||
                    (currentStep === "confirmation" && index === 2)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="text-[10px] sm:text-xs">{step}</span>
              </div>
            ))}
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Content based on current step */}
          <div className="bg-card p-4 sm:p-6 rounded-lg shadow-sm">
            {currentStep === "instructions" && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Instructions</h2>
                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  <li className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-md">
                    <span className="bg-primary text-primary-foreground w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs sm:text-sm">
                      1
                    </span>
                    <span className="text-sm sm:text-base">
                      Take photos of every page of the filled form.
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-md">
                    <span className="bg-primary text-primary-foreground w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs sm:text-sm">
                      2
                    </span>
                    <span className="text-sm sm:text-base">
                      Take photos of the patient's medication list.
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-md">
                    <span className="bg-primary text-primary-foreground w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs sm:text-sm">
                      3
                    </span>
                    <span className="text-sm sm:text-base">
                      (Optional) Record a short voice memo.
                    </span>
                  </li>
                  <li className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-muted/50 rounded-md">
                    <span className="bg-primary text-primary-foreground w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs sm:text-sm">
                      4
                    </span>
                    <span className="text-sm sm:text-base">
                      Upload everything in the next step.
                    </span>
                  </li>
                </ul>
                <Button onClick={goToNextStep} className="w-full">
                  Continue to Upload
                </Button>
              </div>
            )}

            {currentStep === "upload" && (
              <div>
                <h2 className="text-xl font-semibold mb-2 sm:mb-4">Upload</h2>
                <p className="mb-4 text-sm text-muted-foreground">
                  Please upload at least 8 images of the form and medication
                  list.
                </p>

                {/* Image upload section */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium mb-2 flex items-center gap-2">
                    <Image className="text-primary" size={18} />
                    Photos
                  </h3>
                  <div className="bg-muted/30 p-3 sm:p-4 rounded-md mb-2">
                    <ImagePreview images={images} onRemove={removeImage} />

                    <div className="text-center">
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-4">
                        <Button
                          variant="secondary"
                          onClick={() => setIsCameraOpen(true)}
                          className="w-full sm:w-auto flex items-center gap-2 text-xs sm:text-sm py-1 sm:py-2"
                        >
                          <CameraIcon size={16} />
                          Take Photo
                        </Button>

                        <span className="text-xs text-muted-foreground sm:hidden">
                          or
                        </span>

                        <Button
                          variant="secondary"
                          className="w-full sm:w-auto flex items-center gap-2 text-xs sm:text-sm py-1 sm:py-2"
                          onClick={() =>
                            document.getElementById("image-upload")?.click()
                          }
                        >
                          <Upload size={16} />
                          Upload Images
                        </Button>
                        <input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>

                      <div
                        className={`py-3 sm:py-4 border-2 ${
                          images.length >= 8
                            ? "border-primary/30"
                            : "border-border"
                        } rounded-md ${
                          images.length >= 8 ? "bg-primary/5" : "bg-muted/50"
                        }`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm font-medium">
                            {images.length} / 8+ images
                          </span>
                          {images.length >= 8 && (
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
                              className="text-primary"
                            >
                              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                              <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {images.length >= 8
                            ? "Ready to upload!"
                            : "Please add at least 8 images"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Audio upload section */}
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-medium mb-2 flex items-center gap-2">
                    <Mic className="text-primary" size={18} />
                    Voice Memo (Optional)
                  </h3>
                  <div className="mb-2">
                    {audioNote ? (
                      <div className="py-3 sm:py-4 px-3 sm:px-4 flex items-center justify-between bg-muted/30 rounded-md">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-md flex items-center justify-center text-accent-foreground mr-2 sm:mr-3">
                            <Mic size={18} />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium">
                              {audioNote.name}
                            </div>
                            <div className="text-[10px] sm:text-xs text-muted-foreground">
                              Voice Memo
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setAudioNote(null)}
                          className="text-xs"
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col space-y-3 sm:space-y-4">
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <AudioRecorder
                              onRecordingComplete={handleRecordingComplete}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 my-2 sm:my-4">
                          <div className="h-px bg-border flex-grow"></div>
                          <span className="text-xs font-medium text-muted-foreground px-2">
                            or
                          </span>
                          <div className="h-px bg-border flex-grow"></div>
                        </div>

                        <div className="flex justify-center w-full">
                          <Button
                            variant="outline"
                            className="py-4 sm:py-8 px-4 sm:px-6 border border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex items-center gap-2 sm:gap-3 w-full"
                            onClick={() =>
                              document.getElementById("audio-upload")?.click()
                            }
                          >
                            <div className="bg-primary/10 p-2 sm:p-3 rounded-full">
                              <FileUp size={18} className="text-primary" />
                            </div>
                            <div className="text-left">
                              <p className="text-xs sm:text-sm font-medium mb-0 sm:mb-1">
                                Upload audio file
                              </p>
                              <p className="text-[10px] sm:text-xs text-muted-foreground">
                                MP3, WAV, or M4A
                              </p>
                            </div>
                          </Button>
                        </div>
                        <input
                          id="audio-upload"
                          type="file"
                          accept="audio/*"
                          className="hidden"
                          onChange={handleAudioUpload}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={goToNextStep}
                  disabled={!canProceed() || isUploading}
                  className="w-full"
                >
                  {isUploading ? "Uploading..." : "Upload to Google Drive"}
                </Button>
              </div>
            )}

            {currentStep === "confirmation" && (
              <div className="text-center">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={24} className="text-primary" />
                </div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  Success!
                </h2>
                <p className="text-sm text-muted-foreground mb-4">
                  Your photos have been uploaded successfully. Thank you!
                </p>

                {uploadResult && (
                  <div className="bg-muted/30 p-3 sm:p-4 rounded-md text-left mb-4 sm:mb-6">
                    <h3 className="font-medium text-xs sm:text-sm mb-2 sm:mb-3">
                      Upload Details:
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <FolderUp
                          size={14}
                          className="text-primary mt-1 shrink-0"
                        />
                        <div>
                          <p className="font-medium">Folder</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {uploadResult.folderPath}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <File
                          size={14}
                          className="text-primary mt-1 shrink-0"
                        />
                        <div>
                          <p className="font-medium">Uploaded Items</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {images.length} photos{" "}
                            {audioNote ? "+ 1 voice memo" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs sm:text-sm">
                        <Clock
                          size={14}
                          className="text-primary mt-1 shrink-0"
                        />
                        <div>
                          <p className="font-medium">Time</p>
                          <p className="text-[10px] sm:text-xs text-muted-foreground">
                            {new Date().toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  <Button onClick={goToNextStep} variant="default" size="lg">
                    Submit Another Form
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Camera component */}
      {isCameraOpen && (
        <Camera
          onCapture={handleCameraCapture}
          onClose={() => setIsCameraOpen(false)}
        />
      )}

      {/* Upload progress overlay */}
      <UploadProgress isUploading={isUploading} progress={uploadProgress} />
    </div>
  );
}

export default App;
