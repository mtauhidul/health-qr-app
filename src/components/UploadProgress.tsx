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

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-sm w-full">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`text-primary ${
                progress < 100 ? "animate-pulse" : ""
              }`}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" x2="12" y1="3" y2="15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Uploading...</h2>
          <p className="text-muted-foreground mb-4">{statusMessage}</p>
        </div>

        <div className="w-full bg-muted rounded-full h-2.5 mb-2">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Upload progress</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}

export default UploadProgress;
