// URL validation function
export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// URL validation with custom error message
export const urlValidation = (errorMessage: string = "Please enter a valid URL (e.g., https://example.com)") => {
  return (url: string) => {
    if (!url) return true; // Allow empty URLs if not required
    return isValidUrl(url) || errorMessage;
  };
}; 