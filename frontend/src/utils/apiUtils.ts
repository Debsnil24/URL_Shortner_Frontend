/**
 * Utility functions for API error handling and message mapping
 */

export const mapApiErrorMessage = (message: string, code?: string): string => {
  if (!code) return message;
  
  switch (code) {
    case "AUTH_401":
      return "Authentication required. Please sign in again.";
    case "HTTP_403":
      return message || "You do not have permission to perform this action.";
    case "HTTP_404":
      return message || "Short link not found.";
    case "HTTP_410":
      return message || "This short link has expired.";
    case "HTTP_422":
      return message || "Validation error. Please check your input.";
    case "NETWORK_ERROR":
      return message || "Network error. Please try again.";
    default:
      return message;
  }
};

