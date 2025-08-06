interface UserLike {
  firstName?: string;
  lastName?: string;
  companyName?: string;
  email?: string;
}

/**
 * Get display name for a user object
 * Priority: firstName + lastName > companyName > email > 'Unknown'
 */
export const getUserDisplayName = (user: UserLike | null | undefined): string => {
  if (!user) return 'Unknown';
  
  // Try firstName + lastName combination
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  
  // Fall back to individual names
  if (user.firstName) return user.firstName;
  if (user.lastName) return user.lastName;
  
  // Try company name
  if (user.companyName) return user.companyName;
  
  // Try email as last resort
  if (user.email) return user.email;
  
  return 'Unknown';
};

/**
 * Get initials for a user object
 * Priority: firstName + lastName > companyName > email > 'U'
 */
export const getUserInitials = (user: UserLike | null | undefined): string => {
  if (!user) return 'U';
  
  // Try firstName + lastName initials
  if (user.firstName && user.lastName) {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
  
  // Try single name initial
  if (user.firstName) return user.firstName.charAt(0).toUpperCase();
  if (user.lastName) return user.lastName.charAt(0).toUpperCase();
  
  // Try company name initials (first two words)
  if (user.companyName) {
    const words = user.companyName.split(' ').filter(word => word.length > 0);
    if (words.length >= 2) {
      return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    }
    return user.companyName.charAt(0).toUpperCase();
  }
  
  // Try email initial
  if (user.email) return user.email.charAt(0).toUpperCase();
  
  return 'U';
};

/**
 * Get truncated display name for UI display
 * @param user - User object
 * @param maxLength - Maximum length before truncation
 * @returns Truncated display name with ellipsis if needed
 */
export const getTruncatedDisplayName = (user: any | null, maxLength: number = 15): string => {
  const displayName = getUserDisplayName(user);
  if (displayName.length > maxLength) {
    return `${displayName.substring(0, maxLength)}...`;
  }
  return displayName;
}; 

export const getFirstName = (user: any | null): string => {
  const displayName = getUserDisplayName(user);
  return displayName.split(' ')[0];
}; 