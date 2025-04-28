interface UploadProgressProps {
  isUploading: boolean;
  progress?: number; // 0-100
}

function UploadProgress({ isUploading, progress = 0 }: UploadProgressProps) {
  if (!isUploading) return null;

  // Messages based on progress
  let statusMessage = "Preparing files...";
  if (progress > 25) statusMessage = "Uploading to server...";
  if (progress > 75) statusMessage = "Saving to Google Drive...";
  if (progress >= 100) statusMessage = "Upload complete!";

  // Animation style for older browsers (removed unused spinAnimation)

  // Add fallback styles for browsers that might not support all CSS features
  const progressBarStyle = {
    width: `${progress}%`,
    transition: "width 0.3s ease",
    WebkitTransition: "width 0.3s ease",
    MozTransition: "width 0.3s ease",
  };

  // Create a more reliable overlay for maximum compatibility
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-sm w-[90%] sm:w-full p-4 sm:p-6 m-4">
        <div className="text-center mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-primary ${
                progress < 100 ? "animate-pulse" : ""
              }`}
              style={progress < 100 ? { opacity: 0.8 } : { opacity: 1 }}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2">
            Uploading...
          </h2>
          <p className="text-sm text-muted-foreground mb-3 sm:mb-4">
            {statusMessage}
          </p>
        </div>

        {/* Standard progress bar with fallbacks */}
        <div className="w-full bg-muted rounded-full h-2 sm:h-2.5 mb-2">
          <div
            className="bg-primary h-2 sm:h-2.5 rounded-full"
            style={progressBarStyle}
          ></div>
        </div>

        {/* Fallback progress display for older browsers */}
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Upload progress</span>
          <span>{progress}%</span>
        </div>

        {/* For extremely old browsers, add a text-based progress indicator */}
        <noscript>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            Uploading... Please do not close this window.
          </div>
        </noscript>
      </div>
    </div>
  );
}

export default UploadProgress;
