/**
 * File download utilities
 */

/**
 * Trigger a file download from a data URL
 */
export const downloadFile = (dataUrl: string, filename: string): void => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

