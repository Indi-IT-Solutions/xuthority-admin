/**
 * Generates initials from a full name
 * @param name - The full name to generate initials from
 * @returns The initials (max 2 characters) in uppercase
 */
export const getInitials = (name: string): string => {
  if (!name || typeof name !== 'string') return 'AU'; // Default to "Admin User"
  
  return name
    .trim()
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}; 