/**
 * Extract dominant color from an image
 * Returns the most prominent color in the image
 */

export interface ColorInfo {
  color: string; // Hex color
  isLight: boolean; // Whether the color is light (needs dark text)
  rgb: { r: number; g: number; b: number };
}

/**
 * Extract dominant color from an image URL
 */
export async function extractDominantColor(imageUrl: string): Promise<ColorInfo> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Try to handle CORS - if it fails, we'll use a fallback
    img.crossOrigin = 'anonymous';
    
    // Set a timeout for image loading
    const timeout = setTimeout(() => {
      reject(new Error('Image loading timeout'));
    }, 10000);
    
    img.onload = () => {
      clearTimeout(timeout);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Set canvas size (resize for performance)
        const maxSize = 200;
        const scale = Math.min(maxSize / img.width, maxSize / img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        // Draw image to canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Sample colors (skip transparent pixels)
        const colorMap = new Map<string, number>();
        const sampleStep = 4; // Sample every 4th pixel for performance

        for (let i = 0; i < data.length; i += sampleStep * 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip transparent or very transparent pixels
          if (a < 128) continue;

          // Quantize colors to reduce noise (group similar colors)
          const quantizedR = Math.round(r / 10) * 10;
          const quantizedG = Math.round(g / 10) * 10;
          const quantizedB = Math.round(b / 10) * 10;
          const key = `${quantizedR},${quantizedG},${quantizedB}`;

          colorMap.set(key, (colorMap.get(key) || 0) + 1);
        }

        // Find most common color
        let maxCount = 0;
        let dominantColor = { r: 0, g: 0, b: 0 };

        colorMap.forEach((count, key) => {
          if (count > maxCount) {
            maxCount = count;
            const [r, g, b] = key.split(',').map(Number);
            dominantColor = { r, g, b };
          }
        });

        // Convert to hex
        const hex = rgbToHex(dominantColor.r, dominantColor.g, dominantColor.b);
        
        // Determine if color is light or dark
        const isLight = isColorLight(dominantColor.r, dominantColor.g, dominantColor.b);

        resolve({
          color: hex,
          isLight,
          rgb: dominantColor,
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (error) => {
      clearTimeout(timeout);
      // If CORS fails, try without crossOrigin
      if (img.crossOrigin) {
        const imgRetry = new Image();
        imgRetry.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              reject(new Error('Could not get canvas context'));
              return;
            }

            const maxSize = 200;
            const scale = Math.min(maxSize / imgRetry.width, maxSize / imgRetry.height);
            canvas.width = imgRetry.width * scale;
            canvas.height = imgRetry.height * scale;

            ctx.drawImage(imgRetry, 0, 0, canvas.width, canvas.height);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const colorMap = new Map<string, number>();
            const sampleStep = 4;

            for (let i = 0; i < data.length; i += sampleStep * 4) {
              const r = data[i];
              const g = data[i + 1];
              const b = data[i + 2];
              const a = data[i + 3];

              if (a < 128) continue;

              const quantizedR = Math.round(r / 10) * 10;
              const quantizedG = Math.round(g / 10) * 10;
              const quantizedB = Math.round(b / 10) * 10;
              const key = `${quantizedR},${quantizedG},${quantizedB}`;

              colorMap.set(key, (colorMap.get(key) || 0) + 1);
            }

            let maxCount = 0;
            let dominantColor = { r: 0, g: 0, b: 0 };

            colorMap.forEach((count, key) => {
              if (count > maxCount) {
                maxCount = count;
                const [r, g, b] = key.split(',').map(Number);
                dominantColor = { r, g, b };
              }
            });

            const hex = rgbToHex(dominantColor.r, dominantColor.g, dominantColor.b);
            const isLight = isColorLight(dominantColor.r, dominantColor.g, dominantColor.b);

            resolve({
              color: hex,
              isLight,
              rgb: dominantColor,
            });
          } catch (err) {
            reject(err);
          }
        };
        imgRetry.onerror = () => reject(new Error('Failed to load image'));
        imgRetry.src = imageUrl;
      } else {
        reject(new Error('Failed to load image'));
      }
    };

    img.src = imageUrl;
  });
}

/**
 * Convert RGB to hex
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Determine if a color is light (needs dark text) or dark (needs light text)
 * Uses relative luminance formula
 */
function isColorLight(r: number, g: number, b: number): boolean {
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // If luminance is greater than 0.5, it's a light color
  return luminance > 0.5;
}

/**
 * Generate gradient colors from a base color
 * Creates a nice gradient for the invoice header
 */
export function generateGradientColors(baseColor: string): {
  from: string;
  via: string;
  to: string;
} {
  // Parse hex color
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Create darker and lighter variations
  const darken = (value: number, factor: number) => Math.max(0, Math.floor(value * factor));
  const lighten = (value: number, factor: number) => Math.min(255, Math.floor(value + (255 - value) * factor));

  // From: darker version (20% darker)
  const fromR = darken(r, 0.8);
  const fromG = darken(g, 0.8);
  const fromB = darken(b, 0.8);

  // Via: base color
  const viaR = r;
  const viaG = g;
  const viaB = b;

  // To: lighter version (30% lighter)
  const toR = lighten(r, 0.3);
  const toG = lighten(g, 0.3);
  const toB = lighten(b, 0.3);

  return {
    from: rgbToHex(fromR, fromG, fromB),
    via: rgbToHex(viaR, viaG, viaB),
    to: rgbToHex(toR, toG, toB),
  };
}

