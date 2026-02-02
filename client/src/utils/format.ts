/**
 * Formats seconds into MM:SS or HH:MM:SS
 */
export const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Truncates text with ellipsis
 */
export const truncateText = (text: string, length: number): string => {
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
};
