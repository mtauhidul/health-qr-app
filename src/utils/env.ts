/**
 * Utility functions for safely accessing environment variables
 */

/**
 * Safely get an environment variable with a fallback value
 * @param key The environment variable key
 * @param fallback Fallback value if the environment variable is not set
 * @returns The environment variable value or the fallback
 */
export function getEnv(key: string, fallback: string = ""): string {
  // In a browser context with Vite, env vars are exposed via import.meta.env
  // and client-side env vars must be prefixed with VITE_
  const value = import.meta.env[`VITE_${key}`] || fallback;
  return value;
}

/**
 * Get required environment variable - will throw error if not defined
 * @param key The environment variable key
 * @returns The environment variable value
 * @throws Error if the environment variable is not set
 */
export function getRequiredEnv(key: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(`Required environment variable "${key}" is not defined`);
  }
  return value;
}

/**
 * Check if environment variable is defined
 * @param key The environment variable key
 * @returns True if the environment variable is defined
 */
export function hasEnv(key: string): boolean {
  return !!getEnv(key);
}

/**
 * Get the app name from environment variables
 * @returns The app name
 */
export function getAppName(): string {
  return getEnv("APP_NAME", "Health Form Upload");
}

/**
 * Get the API endpoint from environment variables
 * @returns The API endpoint
 */
export function getApiEndpoint(): string {
  return getEnv("API_ENDPOINT", "");
}
