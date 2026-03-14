/**
 * Crop an image using a canvas and return a Blob.
 * @param {string} imageSrc - The source URL / data-URL of the image.
 * @param {{ x: number, y: number, width: number, height: number }} pixelCrop - Crop area in pixels.
 * @returns {Promise<Blob>}
 */
export default async function getCroppedImg(imageSrc, pixelCrop) {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height,
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas toBlob failed'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.92);
    });
}

function createImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = (err) => reject(err);
        img.src = url;
    });
}
