/**
 * File Service - Handles file uploads to Google Drive via backend API
 */
import { getEnv } from "../utils/env";

// Upload files to Google Drive through backend API
export async function uploadToGoogleDrive(
  images: File[],
  audioNotes: File[] // Array of audio files
): Promise<{ success: boolean; folderPath: string; message?: string }> {
  try {
    // Get API endpoint from environment variable
    const apiEndpoint = getEnv("API_ENDPOINT");
    if (!apiEndpoint) {
      throw new Error(
        "API endpoint is not configured. Please add VITE_API_ENDPOINT to your .env file."
      );
    }

    // Create FormData to send files
    const formData = new FormData();

    // Add all images to FormData
    images.forEach((image, index) => {
      formData.append(
        "images",
        image,
        `image${index + 1}${getFileExtension(image.name)}`
      );
    });

    // Add all audio notes if provided
    audioNotes.forEach((audioNote, index) => {
      formData.append(
        "audio",
        audioNote,
        `voice-memo-${index + 1}${getFileExtension(audioNote.name)}`
      );
    });

    // Send files to backend API
    const response = await fetch(`${apiEndpoint}/api/upload`, {
      method: "POST",
      body: formData,
    });

    // Try to parse response as JSON
    let result;
    try {
      result = await response.json();
    } catch (jsonError) {
      console.error("Error parsing response:", jsonError);
      throw new Error(
        `Upload failed with status: ${response.status} ${response.statusText}`
      );
    }

    // Check if response has success status
    if (!response.ok || (result && result.success === false)) {
      const errorMessage =
        result?.message ||
        `Upload failed with status: ${response.status} ${response.statusText}`;
      console.error("Upload error:", errorMessage);
      throw new Error(errorMessage);
    }

    return {
      success: true,
      message: result?.message || "Upload successful",
      folderPath:
        result?.folderPath ||
        `/${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}/`,
    };
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw error; // Re-throw to let the caller handle the error
  }
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf("."));
}
