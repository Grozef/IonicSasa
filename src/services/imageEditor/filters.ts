/**
 * Service de filtres d'images
 * Applique différents filtres et effets aux images
 */

export interface FilterOptions {
  brightness?: number;   // -100 to 100
  contrast?: number;     // -100 to 100
  saturation?: number;   // -100 to 100
  sepia?: number;        // 0 to 100
  grayscale?: boolean;
  blur?: number;         // 0 to 10
  hueRotate?: number;    // 0 to 360 (degrees)
  invert?: boolean;
}

/**
 * Applique des filtres CSS à une image
 */
export async function applyFilters(
  imageUrl: string,
  options: FilterOptions
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

      // Construire la chaîne de filtres CSS
      const filters: string[] = [];
      
      if (options.brightness !== undefined) {
        const value = 100 + options.brightness;
        filters.push(`brightness(${value}%)`);
      }
      
      if (options.contrast !== undefined) {
        const value = 100 + options.contrast;
        filters.push(`contrast(${value}%)`);
      }
      
      if (options.saturation !== undefined) {
        const value = 100 + options.saturation;
        filters.push(`saturate(${value}%)`);
      }
      
      if (options.sepia !== undefined) {
        filters.push(`sepia(${options.sepia}%)`);
      }
      
      if (options.grayscale) {
        filters.push('grayscale(100%)');
      }

      if (options.blur !== undefined && options.blur > 0) {
        filters.push(`blur(${options.blur}px)`);
      }

      if (options.hueRotate !== undefined) {
        filters.push(`hue-rotate(${options.hueRotate}deg)`);
      }

      if (options.invert) {
        filters.push('invert(100%)');
      }

      // Appliquer les filtres
      if (filters.length > 0) {
        ctx.filter = filters.join(' ');
      }

      // Dessiner l'image avec les filtres appliqués
      ctx.drawImage(img, 0, 0);

      // Retourner l'URL de l'image filtrée
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Filtres prédéfinis pour application rapide
 */
export const PRESET_FILTERS = {
  blackAndWhite: {
    grayscale: true,
    contrast: 10,
  },
  sepia: {
    sepia: 100,
    brightness: 10,
  },
  vintage: {
    sepia: 30,
    contrast: -10,
    saturation: -20,
    brightness: 5,
  },
  vibrant: {
    saturation: 30,
    contrast: 10,
    brightness: 5,
  },
  soft: {
    brightness: 10,
    contrast: -10,
    saturation: -10,
  },
  dramatic: {
    contrast: 30,
    saturation: 20,
    brightness: -5,
  },
  cool: {
    hueRotate: 200,
    saturation: 10,
  },
  warm: {
    hueRotate: 30,
    saturation: 15,
  },
  faded: {
    contrast: -20,
    brightness: 15,
    saturation: -15,
  },
  sharpen: {
    contrast: 20,
    saturation: 10,
  },
};

/**
 * Applique un filtre prédéfini
 */
export async function applyPreset(
  imageUrl: string,
  presetName: keyof typeof PRESET_FILTERS
): Promise<string> {
  return applyFilters(imageUrl, PRESET_FILTERS[presetName]);
}

/**
 * Applique un filtre noir et blanc
 */
export async function applyBlackAndWhite(imageUrl: string): Promise<string> {
  return applyPreset(imageUrl, 'blackAndWhite');
}

/**
 * Applique un filtre sépia
 */
export async function applySepia(imageUrl: string): Promise<string> {
  return applyPreset(imageUrl, 'sepia');
}

/**
 * Applique un filtre vintage
 */
export async function applyVintage(imageUrl: string): Promise<string> {
  return applyPreset(imageUrl, 'vintage');
}

/**
 * Ajuste uniquement la luminosité
 */
export async function adjustBrightness(
  imageUrl: string,
  value: number
): Promise<string> {
  return applyFilters(imageUrl, { brightness: value });
}

/**
 * Ajuste uniquement le contraste
 */
export async function adjustContrast(
  imageUrl: string,
  value: number
): Promise<string> {
  return applyFilters(imageUrl, { contrast: value });
}

/**
 * Ajuste uniquement la saturation
 */
export async function adjustSaturation(
  imageUrl: string,
  value: number
): Promise<string> {
  return applyFilters(imageUrl, { saturation: value });
}

/**
 * Obtenir un aperçu de tous les filtres prédéfinis
 * Utile pour afficher une grille de prévisualisations
 */
export function getPresetNames(): string[] {
  return Object.keys(PRESET_FILTERS);
}

/**
 * Obtenir la description d'un filtre prédéfini
 */
export function getPresetDescription(presetName: keyof typeof PRESET_FILTERS): string {
  const descriptions: Record<string, string> = {
    blackAndWhite: 'Noir et blanc classique',
    sepia: 'Effet sépia vintage',
    vintage: 'Look rétro adouci',
    vibrant: 'Couleurs éclatantes',
    soft: 'Douceur et subtilité',
    dramatic: 'Contraste intense',
    cool: 'Tons froids',
    warm: 'Tons chauds',
    faded: 'Effet délavé',
    sharpen: 'Netteté renforcée',
  };
  return descriptions[presetName] || presetName;
}
