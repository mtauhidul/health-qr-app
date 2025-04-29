/**
 * File Service - Handles file uploads to Google Drive via backend API
 */
import { getEnv } from "../utils/env";

// Upload files to Google Drive through backend API
export async function uploadToGoogleDrive(
  images: File[],
  audioNotes: File[] // Changed from single audioNote to array of audioNotes
): Promise<{ success: boolean; folderPath: string }> {
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
    if (audioNotes.length > 0) {
      audioNotes.forEach((audio, index) => {
        formData.append(
          "audio",
          audio,
          `voice-memo-${index + 1}${getFileExtension(audio.name)}`
        );
      });
    }

    // Send files to backend API
    const response = await fetch(`${apiEndpoint}/api/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.message ||
          `Upload failed with status: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();

    return {
      success: true,
      folderPath:
        result.folderPath ||
        `/${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}/`,
    };
  } catch (error) {
    console.error("Error uploading to Google Drive:", error);
    throw error;
  }
}

// Helper function to get file extension
function getFileExtension(filename: string): string {
  return filename.substring(filename.lastIndexOf("."));
}
