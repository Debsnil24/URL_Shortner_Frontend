/**
 * Image conversion and manipulation utilities
 */

const IMAGE_LOAD_TIMEOUT = 5000;
const RENDER_DELAY = 300;

/**
 * Convert blob to data URL
 */
export const blobToDataUrl = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

/**
 * Convert canvas image element to data URL
 */
export const canvasImageToDataUrl = (img: HTMLImageElement): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not get canvas context");

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL("image/png");
};

/**
 * Fetch image with credentials and convert to data URL
 */
export const fetchImageAsDataUrl = async (url: string): Promise<string> => {
    const response = await fetch(url, {
        credentials: "include",
        mode: "cors",
        headers: { Accept: "image/png,image/*,*/*" },
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch image: ${response.status} ${response.statusText}`
        );
    }

    const blob = await response.blob();
    return blobToDataUrl(blob);
};

/**
 * Fetch image with authentication token and convert to data URL
 */
export const fetchAuthenticatedImageAsDataUrl = async (
    url: string,
    token?: string
): Promise<string> => {
    const headers: HeadersInit = {
        Accept: "image/png,image/*,*/*",
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
        credentials: "include",
        mode: "cors",
        headers,
    });

    if (!response.ok) {
        throw new Error(
            `Failed to fetch image: ${response.status} ${response.statusText}`
        );
    }

    const blob = await response.blob();
    return blobToDataUrl(blob);
};

/**
 * Wait for all images in a container to load
 */
export const waitForImages = async (
    container: HTMLElement,
    excludeSrc?: string
): Promise<void> => {
    const images = Array.from(container.querySelectorAll("img")).filter(
        (img) => !excludeSrc || !img.src.includes(excludeSrc)
    );

    const imagePromises = images.map((img) => {
        if (img.complete && img.naturalWidth > 0) {
            return Promise.resolve();
        }

        return new Promise<void>((resolve) => {
            img.onload = () => resolve();
            img.onerror = () => resolve();
            setTimeout(() => resolve(), IMAGE_LOAD_TIMEOUT);
        });
    });

    await Promise.all(imagePromises);
    await new Promise((resolve) => setTimeout(resolve, RENDER_DELAY));
};

