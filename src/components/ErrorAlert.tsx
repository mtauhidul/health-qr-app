// Enhanced Error Alert Component
// You can place this as a separate component in src/components/ErrorAlert.tsx
import { AlertCircle, XCircle } from "lucide-react";

interface ErrorAlertProps {
  message: string | null;
  onDismiss?: () => void;
}

function ErrorAlert({ message, onDismiss }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="mb-4 p-4 bg-destructive/10 border border-destructive rounded-md text-sm text-destructive animate-in fade-in duration-300">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="font-medium mb-1">Error</h4>
          <p>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-destructive hover:text-destructive/80"
            aria-label="Dismiss error"
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorAlert;
