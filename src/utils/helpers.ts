/**
 * Format time from ISO string to HH:MM format
 */
export const formatTime = (iso: string): string => {
    return new Date(iso).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
};

/**
 * Get headers for API requests with optional auth token
 */
export const getHeaders = (token?: string): Record<string, string> => {
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};
