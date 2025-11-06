/**
 * Service de transformations d'images
 * Gère le recadrage, la rotation, le flip, le redimensionnement
 */

export interface CropOptions {
  x: number;       // Position X du recadrage
  y: number;       // Position Y du recadrage
  width: number;   // Largeur du recadrage
  height: number;  // Hauteur du recadrage
}

export interface ResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  quality?: number; // 0 to 1
}

/**
 * Recadre une image selon les dimensions spécifiées
 */
export async function cropImage(
  imageUrl: string,
  crop: CropOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      // Valider les dimensions
      if (crop.x < 0 || crop.y < 0 || 
          crop.width <= 0 || crop.height <= 0 ||
          crop.x + crop.width > img.width ||
          crop.y + crop.height > img.height) {
        reject(new Error('Invalid crop dimensions'));
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Dessiner la portion recadrée
      ctx.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height,  // Source
        0, 0, crop.width, crop.height             // Destination
      );

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Effectue une rotation de l'image
 */
export async function rotateImage(
  imageUrl: string,
  degrees: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Normaliser l'angle
      const angle = degrees % 360;
      const rad = (angle * Math.PI) / 180;

      // Calculer les nouvelles dimensions après rotation
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      
      canvas.width = img.width * cos + img.height * sin;
      canvas.height = img.width * sin + img.height * cos;

      // Appliquer la rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Rotation rapide de 90 degrés
 */
export async function rotate90(imageUrl: string): Promise<string> {
  return rotateImage(imageUrl, 90);
}

/**
 * Rotation rapide de 180 degrés
 */
export async function rotate180(imageUrl: string): Promise<string> {
  return rotateImage(imageUrl, 180);
}

/**
 * Rotation rapide de 270 degrés (ou -90)
 */
export async function rotate270(imageUrl: string): Promise<string> {
  return rotateImage(imageUrl, 270);
}

/**
 * Flip horizontal (miroir)
 */
export async function flipHorizontal(imageUrl: string): Promise<string> {
  return flipImage(imageUrl, true, false);
}

/**
 * Flip vertical
 */
export async function flipVertical(imageUrl: string): Promise<string> {
  return flipImage(imageUrl, false, true);
}

/**
 * Flip une image horizontalement et/ou verticalement
 */
export async function flipImage(
  imageUrl: string,
  horizontal: boolean = false,
  vertical: boolean = false
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Sauvegarder l'état actuel
      ctx.save();

      // Appliquer les transformations
      if (horizontal && vertical) {
        ctx.translate(canvas.width, canvas.height);
        ctx.scale(-1, -1);
      } else if (horizontal) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      } else if (vertical) {
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
      }

      // Dessiner l'image
      ctx.drawImage(img, 0, 0);

      // Restaurer l'état
      ctx.restore();

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Redimensionne une image
 */
export async function resizeImage(
  imageUrl: string,
  options: ResizeOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      let targetWidth = options.width || img.width;
      let targetHeight = options.height || img.height;

      // Maintenir le ratio si demandé
      if (options.maintainAspectRatio !== false) {
        const ratio = img.width / img.height;
        
        if (options.width && !options.height) {
          targetHeight = options.width / ratio;
        } else if (options.height && !options.width) {
          targetWidth = options.height * ratio;
        } else if (options.width && options.height) {
          // Ajuster pour que l'image rentre dans les dimensions
          const targetRatio = options.width / options.height;
          if (ratio > targetRatio) {
            targetHeight = options.width / ratio;
          } else {
            targetWidth = options.height * ratio;
          }
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Utiliser imageSmoothingQuality pour une meilleure qualité
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const quality = options.quality || 0.92;
      resolve(canvas.toDataURL('image/jpeg', quality));
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Recadrage avec ratios prédéfinis
 */
export const CROP_RATIOS = {
  square: { width: 1, height: 1, label: 'Carré (1:1)' },
  portrait: { width: 4, height: 5, label: 'Portrait (4:5)' },
  landscape: { width: 16, height: 9, label: 'Paysage (16:9)' },
  instagram: { width: 1080, height: 1080, label: 'Instagram carré' },
  instagramPortrait: { width: 1080, height: 1350, label: 'Instagram portrait' },
  story: { width: 9, height: 16, label: 'Story (9:16)' },
  facebook: { width: 1200, height: 630, label: 'Facebook' },
  twitter: { width: 1200, height: 675, label: 'Twitter' },
};

/**
 * Calcule les dimensions de recadrage pour un ratio donné
 */
export function calculateCropDimensions(
  imageWidth: number,
  imageHeight: number,
  ratio: { width: number; height: number }
): CropOptions {
  const imageRatio = imageWidth / imageHeight;
  const targetRatio = ratio.width / ratio.height;

  let cropWidth: number;
  let cropHeight: number;
  let x: number;
  let y: number;

  if (imageRatio > targetRatio) {
    // Image plus large que le ratio cible
    cropHeight = imageHeight;
    cropWidth = imageHeight * targetRatio;
    x = (imageWidth - cropWidth) / 2;
    y = 0;
  } else {
    // Image plus haute que le ratio cible
    cropWidth = imageWidth;
    cropHeight = imageWidth / targetRatio;
    x = 0;
    y = (imageHeight - cropHeight) / 2;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

/**
 * Applique un recadrage avec un ratio prédéfini
 */
export async function cropWithRatio(
  imageUrl: string,
  ratioName: keyof typeof CROP_RATIOS
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      const ratio = CROP_RATIOS[ratioName];
      const cropDimensions = calculateCropDimensions(
        img.width,
        img.height,
        ratio
      );
      
      try {
        const croppedImage = await cropImage(imageUrl, cropDimensions);
        resolve(croppedImage);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Obtenir la liste des ratios disponibles
 */
export function getCropRatioNames(): string[] {
  return Object.keys(CROP_RATIOS);
}

/**
 * Obtenir les informations d'un ratio
 */
export function getCropRatioInfo(ratioName: keyof typeof CROP_RATIOS) {
  return CROP_RATIOS[ratioName];
}
