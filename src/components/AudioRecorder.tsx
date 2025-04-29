import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: File) => void;
}

function AudioRecorder({ onRecordingComplete }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingLabel, setRecordingLabel] = useState(""); // Track the name/label for this recording

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Clean up audio URL when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    audioChunksRef.current = [];
    setIsRecording(true);
    setRecordingTime(0);
    setAudioUrl(null);
    setError(null);

    // Set a default label for this recording using timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .substring(0, 19);
    setRecordingLabel(`Voice Memo ${timestamp}`);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      // Set up data handler
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Create a File object from the Blob with the custom label
        const file = new File([audioBlob], `${recordingLabel}.webm`, {
          type: "audio/webm",
          lastModified: Date.now(),
        });

        onRecordingComplete(file);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      // Start recording
      mediaRecorder.start();

      // Set up timer
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check your permissions.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Clear timer
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }
  };

  // Format seconds into MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Handle label change
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecordingLabel(e.target.value);
  };

  // Start a new recording (reset state)
  const resetRecording = () => {
    setAudioUrl(null);

    // Generate a new default label
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .substring(0, 19);
    setRecordingLabel(`Voice Memo ${timestamp}`);
  };

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 border border-destructive p-4 text-center">
        <p className="text-sm text-destructive mb-2">{error}</p>
        <Button variant="outline" size="sm" onClick={() => setError(null)}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-6">
      {isRecording ? (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mb-3 animate-pulse">
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
              className="text-destructive"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <div className="font-mono font-medium text-xl mb-4">
            {formatTime(recordingTime)}
          </div>
          <Button variant="destructive" onClick={stopRecording}>
            Stop Recording
          </Button>
        </div>
      ) : audioUrl ? (
        <div className="flex flex-col items-center">
          {/* Show audio player and label input */}
          <div className="w-full flex flex-col gap-2 items-center justify-center mb-4">
            <div className="bg-muted/50 rounded-md p-3 w-full">
              <audio
                ref={audioRef}
                src={audioUrl}
                controls
                className="w-full max-w-xs"
              />
            </div>

            {/* Recording label input */}
            <div className="w-full">
              <label
                htmlFor="recording-name"
                className="text-xs text-muted-foreground block mb-1"
              >
                Recording Name:
              </label>
              <input
                id="recording-name"
                type="text"
                value={recordingLabel}
                onChange={handleLabelChange}
                className="w-full p-2 text-sm rounded-md border border-border bg-background"
                placeholder="Enter recording name"
              />
            </div>
          </div>

          {/* Buttons to save or reset */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={resetRecording}
            >
              Record New Memo
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mb-3">
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
              className="text-accent-foreground"
            >
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="22" />
            </svg>
          </div>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Record a voice memo to provide additional context
          </p>
          <Button
            variant="secondary"
            onClick={startRecording}
            className="flex gap-2 items-center"
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
              <circle cx="12" cy="12" r="10" fill="currentColor" />
            </svg>
            Start Recording
          </Button>
        </div>
      )}
    </div>
  );
}

export default AudioRecorder;
