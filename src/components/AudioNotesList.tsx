import { Button } from "@/components/ui/button";
import { Mic, X } from "lucide-react";

interface AudioNotesListProps {
  audioNotes: File[];
  onRemove: (index: number) => void;
}

function AudioNotesList({ audioNotes, onRemove }: AudioNotesListProps) {
  if (audioNotes.length === 0) return null;

  // Format file size to human readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium mb-2">
        Uploaded Voice Memos ({audioNotes.length})
      </div>

      {audioNotes.map((audioNote, index) => (
        <div
          key={index}
          className="py-3 px-4 flex items-center justify-between bg-muted/30 rounded-md"
        >
          <div className="flex items-center">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent rounded-md flex items-center justify-center text-accent-foreground mr-2 sm:mr-3">
              <Mic size={18} />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-medium">
                {audioNote.name.length > 20
                  ? audioNote.name.substring(0, 20) + "..."
                  : audioNote.name}
              </div>
              <div className="text-[10px] sm:text-xs text-muted-foreground">
                {formatFileSize(audioNote.size)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-xs h-8 w-8 p-0 rounded-full"
            aria-label="Remove audio note"
          >
            <X size={16} />
          </Button>
        </div>
      ))}
    </div>
  );
}

export default AudioNotesList;
