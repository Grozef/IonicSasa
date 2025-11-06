/**
 * Service d'export d'images
 * Gère l'export des images avec métadonnées, watermark, compression
 */

import { useMetadataStore } from '@/stores/metadataStore';

export interface ExportOptions {
  quality?: number;           // 0 to 1 (défaut: 0.92)
  format?: 'jpeg' | 'png';    // Format de sortie
  includeMetadata?: boolean;  // Inclure métadonnées EXIF (Note: limité dans le navigateur)
  addWatermark?: boolean;     // Ajouter un watermark
  watermarkText?: string;     // Texte du watermark
  watermarkPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  watermarkOpacity?: number;  // 0 to 1
  maxWidth?: number;          // Largeur maximale (redimensionnement automatique)
  maxHeight?: number;         // Hauteur maximale
}

/**
 * Exporte une image avec les options spécifiées
 */
export async function exportImage(
  imageUrl: string,
  photoId: string,
  options: ExportOptions = {}
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      let canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Redimensionner si nécessaire
      if (options.maxWidth || options.maxHeight) {
        const ratio = width / height;
        
        if (options.maxWidth && width > options.maxWidth) {
          width = options.maxWidth;
          height = width / ratio;
        }
        
        if (options.maxHeight && height > options.maxHeight) {
          height = options.maxHeight;
          width = height * ratio;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Dessiner l'image
      ctx.drawImage(img, 0, 0, width, height);

      // Ajouter le watermark si demandé
      if (options.addWatermark) {
        await addWatermarkToCanvas(
          ctx,
          width,
          height,
          options.watermarkText,
          options.watermarkPosition,
          options.watermarkOpacity
        );
      }

      // Convertir en blob
      const format = options.format || 'jpeg';
      const quality = options.quality !== undefined ? options.quality : 0.92;
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        mimeType,
        quality
      );
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Ajoute un watermark sur un canvas
 */
async function addWatermarkToCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text?: string,
  position: ExportOptions['watermarkPosition'] = 'bottom-right',
  opacity: number = 0.5
): Promise<void> {
  const watermarkText = text || '© Art Social Publisher';
  
  // Configuration du texte
  const fontSize = Math.max(Math.floor(width / 40), 12);
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
  ctx.strokeStyle = `rgba(0, 0, 0, ${opacity * 0.5})`;
  ctx.lineWidth = 2;

  // Mesurer le texte
  const metrics = ctx.measureText(watermarkText);
  const textWidth = metrics.width;
  const textHeight = fontSize;
  const padding = 20;

  // Calculer la position
  let x: number;
  let y: number;

  switch (position) {
    case 'bottom-right':
      x = width - textWidth - padding;
      y = height - padding;
      break;
    case 'bottom-left':
      x = padding;
      y = height - padding;
      break;
    case 'top-right':
      x = width - textWidth - padding;
      y = textHeight + padding;
      break;
    case 'top-left':
      x = padding;
      y = textHeight + padding;
      break;
    case 'center':
      x = (width - textWidth) / 2;
      y = height / 2;
      break;
    default:
      x = width - textWidth - padding;
      y = height - padding;
  }

  // Dessiner le watermark avec contour pour lisibilité
  ctx.strokeText(watermarkText, x, y);
  ctx.fillText(watermarkText, x, y);
}

/**
 * Télécharge une image exportée
 */
export async function downloadImage(
  imageUrl: string,
  photoId: string,
  filename: string,
  options: ExportOptions = {}
): Promise<void> {
  try {
    const blob = await exportImage(imageUrl, photoId, options);
    
    // Créer un lien de téléchargement
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Déclencher le téléchargement
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Nettoyer
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download image:', error);
    throw error;
  }
}

/**
 * Génère un nom de fichier basé sur les métadonnées
 */
export function generateFilename(photoId: string): string {
  const metadataStore = useMetadataStore();
  const metadata = metadataStore.getMetadata(photoId);
  
  // Utiliser le titre ou un nom par défaut
  const baseName = metadata.title
    ? metadata.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    : `artwork-${Date.now()}`;
  
  const timestamp = new Date().toISOString().split('T')[0];
  return `${baseName}-${timestamp}.jpg`;
}

/**
 * Exporte plusieurs images en ZIP (nécessite une bibliothèque comme JSZip)
 * TODO: Implémenter avec JSZip
 */
export async function exportMultipleImages(
  images: Array<{ url: string; photoId: string }>,
  options: ExportOptions = {}
): Promise<void> {
  console.warn('Multiple image export not yet implemented. Download images individually.');
  
  // Pour l'instant, télécharger une par une
  for (const image of images) {
    const filename = generateFilename(image.photoId);
    await downloadImage(image.url, image.photoId, filename, options);
    
    // Petit délai entre chaque téléchargement
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

/**
 * Optimise une image pour une plateforme sociale spécifique
 */
export async function optimizeForPlatform(
  imageUrl: string,
  photoId: string,
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin'
): Promise<Blob> {
  const platformSpecs: Record<string, ExportOptions> = {
    instagram: {
      maxWidth: 1080,
      maxHeight: 1080,
      quality: 0.9,
      format: 'jpeg',
    },
    facebook: {
      maxWidth: 2048,
      maxHeight: 2048,
      quality: 0.9,
      format: 'jpeg',
    },
    twitter: {
      maxWidth: 1200,
      maxHeight: 675,
      quality: 0.85,
      format: 'jpeg',
    },
    linkedin: {
      maxWidth: 1200,
      maxHeight: 627,
      quality: 0.9,
      format: 'jpeg',
    },
  };

  const options = platformSpecs[platform] || platformSpecs.instagram;
  return exportImage(imageUrl, photoId, options);
}

/**
 * Estime la taille du fichier après export
 */
export async function estimateFileSize(
  imageUrl: string,
  photoId: string,
  options: ExportOptions = {}
): Promise<number> {
  try {
    const blob = await exportImage(imageUrl, photoId, options);
    return blob.size;
  } catch (error) {
    console.error('Failed to estimate file size:', error);
    return 0;
  }
}

/**
 * Formate la taille du fichier en une chaîne lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Configuration d'export par défaut pour l'application
 */
export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
  quality: 0.92,
  format: 'jpeg',
  includeMetadata: true,
  addWatermark: false,
  watermarkPosition: 'bottom-right',
  watermarkOpacity: 0.5,
};

/**
 * Prévisualisation de l'image avec watermark (sans télécharger)
 */
export async function previewWithWatermark(
  imageUrl: string,
  watermarkText?: string,
  position?: ExportOptions['watermarkPosition']
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0);
      
      await addWatermarkToCanvas(
        ctx,
        img.width,
        img.height,
        watermarkText,
        position,
        0.7
      );

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = (error) => {
      reject(new Error(`Failed to load image: ${error}`));
    };
    
    img.src = imageUrl;
  });
}
