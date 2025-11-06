# Services d'édition d'images

Ce dossier contient tous les services pour l'édition, la transformation et l'export d'images.

## 📁 Structure

```
src/services/imageEditor/
├── index.ts        # Point d'entrée principal
├── filters.ts      # Filtres et effets
├── transforms.ts   # Transformations (rotation, recadrage, etc.)
└── export.ts       # Export avec métadonnées et watermark
```

## 🎨 Filtres (filters.ts)

### Utilisation de base

```typescript
import { applyFilters, applyPreset } from '@/services/imageEditor';

// Appliquer des filtres personnalisés
const filteredImage = await applyFilters(imageUrl, {
  brightness: 10,
  contrast: 20,
  saturation: -10
});

// Appliquer un filtre prédéfini
const vintageImage = await applyPreset(imageUrl, 'vintage');
```

### Filtres disponibles

| Option | Type | Valeurs | Description |
|--------|------|---------|-------------|
| `brightness` | number | -100 à 100 | Luminosité |
| `contrast` | number | -100 à 100 | Contraste |
| `saturation` | number | -100 à 100 | Saturation |
| `sepia` | number | 0 à 100 | Effet sépia |
| `grayscale` | boolean | - | Noir et blanc |
| `blur` | number | 0 à 10 | Flou |
| `hueRotate` | number | 0 à 360 | Rotation teinte |
| `invert` | boolean | - | Inverser couleurs |

### Filtres prédéfinis

- `blackAndWhite` - Noir et blanc classique
- `sepia` - Effet sépia vintage
- `vintage` - Look rétro adouci
- `vibrant` - Couleurs éclatantes
- `soft` - Douceur et subtilité
- `dramatic` - Contraste intense
- `cool` - Tons froids
- `warm` - Tons chauds
- `faded` - Effet délavé
- `sharpen` - Netteté renforcée

## ✂️ Transformations (transforms.ts)

### Recadrage

```typescript
import { cropImage, cropWithRatio } from '@/services/imageEditor';

// Recadrage manuel
const cropped = await cropImage(imageUrl, {
  x: 100,
  y: 100,
  width: 500,
  height: 500
});

// Recadrage avec ratio prédéfini
const instagramSquare = await cropWithRatio(imageUrl, 'instagram');
```

### Ratios prédéfinis

- `square` - Carré (1:1)
- `portrait` - Portrait (4:5)
- `landscape` - Paysage (16:9)
- `instagram` - Instagram carré (1080x1080)
- `instagramPortrait` - Instagram portrait (1080x1350)
- `story` - Story (9:16)
- `facebook` - Facebook (1200x630)
- `twitter` - Twitter (1200x675)

### Rotation

```typescript
import { rotateImage, rotate90 } from '@/services/imageEditor';

// Rotation personnalisée
const rotated = await rotateImage(imageUrl, 45);

// Rotation rapide
const rotated90 = await rotate90(imageUrl);
const rotated180 = await rotate180(imageUrl);
const rotated270 = await rotate270(imageUrl);
```

### Flip (Miroir)

```typescript
import { flipHorizontal, flipVertical } from '@/services/imageEditor';

const flippedH = await flipHorizontal(imageUrl);
const flippedV = await flipVertical(imageUrl);
```

### Redimensionnement

```typescript
import { resizeImage } from '@/services/imageEditor';

// Redimensionner avec maintien du ratio
const resized = await resizeImage(imageUrl, {
  width: 1920,
  maintainAspectRatio: true,
  quality: 0.9
});
```

## 📤 Export (export.ts)

### Export simple

```typescript
import { downloadImage, generateFilename } from '@/services/imageEditor';

const filename = generateFilename(photoId);
await downloadImage(imageUrl, photoId, filename, {
  quality: 0.92,
  format: 'jpeg'
});
```

### Export avec watermark

```typescript
import { downloadImage } from '@/services/imageEditor';

await downloadImage(imageUrl, photoId, 'artwork.jpg', {
  addWatermark: true,
  watermarkText: '© Mon Portfolio',
  watermarkPosition: 'bottom-right',
  watermarkOpacity: 0.7
});
```

### Optimisation par plateforme

```typescript
import { optimizeForPlatform } from '@/services/imageEditor';

const blob = await optimizeForPlatform(imageUrl, photoId, 'instagram');
// Dimensions et qualité automatiquement optimisées pour Instagram
```

### Options d'export

```typescript
interface ExportOptions {
  quality?: number;           // 0 à 1 (défaut: 0.92)
  format?: 'jpeg' | 'png';
  includeMetadata?: boolean;
  addWatermark?: boolean;
  watermarkText?: string;
  watermarkPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  watermarkOpacity?: number;  // 0 à 1
  maxWidth?: number;
  maxHeight?: number;
}
```

## 🎯 Exemples d'utilisation

### Exemple 1 : Appliquer un filtre et télécharger

```typescript
import { applyPreset, downloadImage, generateFilename } from '@/services/imageEditor';

async function applyFilterAndDownload(imageUrl: string, photoId: string) {
  // Appliquer un filtre vintage
  const filtered = await applyPreset(imageUrl, 'vintage');
  
  // Générer nom de fichier
  const filename = generateFilename(photoId);
  
  // Télécharger
  await downloadImage(filtered, photoId, filename, {
    quality: 0.9,
    addWatermark: true
  });
}
```

### Exemple 2 : Recadrer pour Instagram et exporter

```typescript
import { cropWithRatio, optimizeForPlatform } from '@/services/imageEditor';

async function prepareForInstagram(imageUrl: string, photoId: string) {
  // Recadrer au format Instagram
  const cropped = await cropWithRatio(imageUrl, 'instagram');
  
  // Optimiser pour la plateforme
  const blob = await optimizeForPlatform(cropped, photoId, 'instagram');
  
  return blob;
}
```

### Exemple 3 : Pipeline complet d'édition

```typescript
import { 
  applyFilters, 
  rotate90, 
  cropImage, 
  downloadImage 
} from '@/services/imageEditor';

async function editPipeline(imageUrl: string, photoId: string) {
  // 1. Rotation
  let edited = await rotate90(imageUrl);
  
  // 2. Recadrage
  edited = await cropImage(edited, {
    x: 50,
    y: 50,
    width: 800,
    height: 600
  });
  
  // 3. Filtres
  edited = await applyFilters(edited, {
    brightness: 10,
    contrast: 15,
    saturation: 5
  });
  
  // 4. Export
  await downloadImage(edited, photoId, 'edited-artwork.jpg', {
    quality: 0.95,
    addWatermark: true
  });
}
```

## 🔧 Intégration dans les composants Vue

### Dans PhotoEdit.vue

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { usePhotoStore } from '@/stores/photoStore';
import { applyPreset, rotate90, cropWithRatio } from '@/services/imageEditor';

const photoStore = usePhotoStore();
const selectedPhoto = computed(() => photoStore.selectedPhoto);
const editedImageUrl = ref<string>('');

async function applyFilter(filterName: string) {
  if (!selectedPhoto.value) return;
  
  editedImageUrl.value = await applyPreset(
    selectedPhoto.value.base64OrWebPath,
    filterName
  );
  
  // Sauvegarder dans le store
  photoStore.updatePhoto(selectedPhoto.value.id, editedImageUrl.value);
}

async function rotatePhoto() {
  if (!selectedPhoto.value) return;
  
  editedImageUrl.value = await rotate90(
    selectedPhoto.value.base64OrWebPath
  );
  
  photoStore.updatePhoto(selectedPhoto.value.id, editedImageUrl.value);
}
</script>

<template>
  <div>
    <img :src="editedImageUrl || selectedPhoto?.base64OrWebPath" />
    
    <ion-button @click="applyFilter('vintage')">
      Filtre Vintage
    </ion-button>
    
    <ion-button @click="rotatePhoto">
      Rotation 90°
    </ion-button>
  </div>
</template>
```

## 📝 Notes importantes

### Performance

- Toutes les opérations sont asynchrones
- Les images sont traitées dans le navigateur (pas de serveur)
- Pour les grandes images, prévoir un indicateur de chargement

### Limitations

- Les métadonnées EXIF ne sont pas pleinement supportées dans le navigateur
- Le watermark est ajouté au canvas (pas de métadonnées EXIF)
- L'export multiple en ZIP nécessite une bibliothèque additionnelle (JSZip)

### Qualité

- Qualité par défaut : 0.92 (92%)
- Format recommandé : JPEG pour photos, PNG pour graphiques
- Utiliser `imageSmoothingQuality = 'high'` pour meilleur rendu

## 🚀 Améliorations futures

- [ ] Support des métadonnées EXIF complètes (avec bibliothèque exif-js)
- [ ] Export multiple en ZIP (avec JSZip)
- [ ] Plus de filtres (vignette, grain, etc.)
- [ ] Historique d'édition avec undo/redo
- [ ] Présets de filtres personnalisables
- [ ] Optimisation avec Web Workers pour grandes images
- [ ] Support des formats WebP et AVIF
