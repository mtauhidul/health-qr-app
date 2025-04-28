/**
 * Authentication Service
 *
 * Handles the verification of QR code authentication tokens
 */
import { getEnv } from "../utils/env";

// Valid tokens - in a real application, these would be validated with a backend service
const VALID_TOKENS = [
  // Add your actual valid tokens here
  "AUTH_TEST_TOKEN",
  "AUTH_VALID_USER",
  "AUTH_CLINIC123",
];

/**
 * Verify an authentication token from a QR code
 * @param token The authentication token to verify
 * @returns Promise that resolves to true if token is valid, false otherwise
 */
export async function verifyAuthToken(token: string): Promise<boolean> {
  try {
    // In a real implementation, this would call an API to validate the token
    // For demonstration purposes, we'll just check against a list of valid tokens

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Check if the token is valid
    if (isValidToken(token)) {
      return true;
    }

    // For demo purposes, accept any token that starts with AUTH_
    // Remove this in a real implementation
    if (token.startsWith("AUTH_")) {
      console.log("Demo mode: Accepting any token starting with AUTH_");
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error verifying auth token:", error);
    return false;
  }
}

/**
 * Check if the token is in the list of valid tokens
 * @param token The token to check
 * @returns True if the token is valid
 */
function isValidToken(token: string): boolean {
  const validationKey = getEnv("VALIDATION_KEY", "");

  // If we have a validation key, use it to validate tokens dynamically
  if (validationKey) {
    // In a real app, you might implement a proper token verification algorithm
    // For example, checking if the token is signed with your validation key
    return token.includes(validationKey);
  }

  // Otherwise, check against the hardcoded list
  return VALID_TOKENS.includes(token);
}

/**
 * Check if the user is currently authenticated
 * @returns True if authenticated
 */
export function isAuthenticated(): boolean {
  const verified = localStorage.getItem("healthFormAuthVerified");
  const token = localStorage.getItem("healthFormAuthToken");

  if (!verified || !token) {
    return false;
  }

  // Check if verification is still valid (24 hours)
  const verifiedTime = new Date(verified).getTime();
  const currentTime = new Date().getTime();
  const hoursDiff = (currentTime - verifiedTime) / (1000 * 60 * 60);

  return hoursDiff < 24;
}

/**
 * Log out the current user
 */
export function logout(): void {
  localStorage.removeItem("healthFormAuthVerified");
  localStorage.removeItem("healthFormAuthToken");
}
