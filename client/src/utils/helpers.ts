export const formatMessage = (message: string): string => {
  return `Formatted: ${message}`;
};

export const capitalize = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};
