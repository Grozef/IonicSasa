# 💻 Exemples de Code - Art Social Publisher

Ce fichier contient des exemples de code pour vous aider à démarrer rapidement.

---

## 🎨 1. Exemple de Vue Gallery.vue

```vue
<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Ma Galerie</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="createNewSession">
            <ion-icon :icon="addOutline"></ion-icon>
            Nouvelle Session
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- Filtres -->
      <div class="filters">
        <ion-segment v-model="statusFilter">
          <ion-segment-button value="all">
            <ion-label>Toutes</ion-label>
          </ion-segment-button>
          <ion-segment-button value="Draft">
            <ion-label>Brouillons</ion-label>
          </ion-segment-button>
          <ion-segment-button value="Published">
            <ion-label>Publiées</ion-label>
          </ion-segment-button>
        </ion-segment>
      </div>

      <!-- Statistiques rapides -->
      <div class="stats-grid">
        <ion-card>
          <ion-card-content>
            <div class="stat-value">{{ totalSessions }}</div>
            <div class="stat-label">Sessions</div>
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-content>
            <div class="stat-value">{{ totalPhotos }}</div>
            <div class="stat-label">Photos</div>
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Liste des sessions -->
      <div class="sessions-grid">
        <SessionCard
          v-for="session in filteredSessions"
          :key="session.id"
          :session="session"
          @open="openSession"
          @delete="deleteSession"
        />
      </div>

      <!-- Message si vide -->
      <div v-if="filteredSessions.length === 0" class="empty-state">
        <ion-icon :icon="imagesOutline" size="large"></ion-icon>
        <h3>Aucune session</h3>
        <p>Créez votre première session pour commencer</p>
        <ion-button @click="createNewSession">
          Nouvelle Session
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGalleryStore } from '@/stores/galleryStore';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonSegment, IonSegmentButton,
  IonLabel, IonCard, IonCardContent
} from '@ionic/vue';
import { addOutline, imagesOutline } from 'ionicons/icons';
import SessionCard from '@/components/SessionCard.vue';

const router = useRouter();
const galleryStore = useGalleryStore();

const statusFilter = ref('all');

const filteredSessions = computed(() => {
  const sessions = galleryStore.sessions;
  if (statusFilter.value === 'all') {
    return sessions;
  }
  return sessions.filter(s => s.status === statusFilter.value);
});

const totalSessions = computed(() => galleryStore.sessions.length);
const totalPhotos = computed(() => {
  return galleryStore.sessions.reduce((sum, s) => sum + s.photos.length, 0);
});

function createNewSession() {
  galleryStore.initializeNewSession();
  router.push('/new-session');
}

function openSession(sessionId: number) {
  galleryStore.loadSessionProgress(sessionId);
  router.push('/photo-capture');
}

function deleteSession(sessionId: number) {
  // TODO: Confirmation modal
  const index = galleryStore.sessions.findIndex(s => s.id === sessionId);
  if (index !== -1) {
    galleryStore.sessions.splice(index, 1);
  }
}
</script>

<style scoped>
.filters {
  margin-bottom: 1rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin-top: 0.25rem;
}

.sessions-grid {
  display: grid;
  gap: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}
</style>
```

---

## 🃏 2. Exemple de Composant SessionCard.vue

```vue
<template>
  <ion-card button @click="$emit('open', session.id)">
    <div class="card-header">
      <img 
        v-if="session.photos.length > 0" 
        :src="session.photos[0].uri" 
        :alt="session.title"
        class="session-thumbnail"
      />
      <div v-else class="placeholder-thumbnail">
        <ion-icon :icon="imagesOutline"></ion-icon>
      </div>
    </div>
    
    <ion-card-header>
      <div class="header-row">
        <ion-card-title>{{ session.title || 'Sans titre' }}</ion-card-title>
        <ion-badge :color="statusColor">
          {{ session.status }}
        </ion-badge>
      </div>
      <ion-card-subtitle>
        {{ formatDate(session.date) }} • {{ session.photos.length }} photo(s)
      </ion-card-subtitle>
    </ion-card-header>

    <ion-card-content>
      <div class="collection-tag" v-if="collectionName">
        <ion-icon :icon="folderOutline"></ion-icon>
        {{ collectionName }}
      </div>

      <div class="published-platforms" v-if="session.publishedTo.length > 0">
        <ion-chip 
          v-for="platform in session.publishedTo" 
          :key="platform"
          size="small"
        >
          <ion-icon :icon="getPlatformIcon(platform)"></ion-icon>
          <ion-label>{{ platform }}</ion-label>
        </ion-chip>
      </div>
    </ion-card-content>

    <div class="card-actions">
      <ion-button fill="clear" size="small" @click.stop="$emit('open', session.id)">
        Ouvrir
      </ion-button>
      <ion-button 
        fill="clear" 
        size="small" 
        color="danger"
        @click.stop="$emit('delete', session.id)"
      >
        Supprimer
      </ion-button>
    </div>
  </ion-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGalleryStore } from '@/stores/galleryStore';
import type { ArtworkSession } from '@/stores/galleryStore';
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle,
  IonCardContent, IonBadge, IonButton, IonIcon, IonChip, IonLabel
} from '@ionic/vue';
import { 
  imagesOutline, folderOutline, 
  logoInstagram, logoFacebook, logoTwitter 
} from 'ionicons/icons';

interface Props {
  session: ArtworkSession;
}

const props = defineProps<Props>();
const galleryStore = useGalleryStore();

const emit = defineEmits<{
  open: [sessionId: number];
  delete: [sessionId: number];
}>();

const collectionName = computed(() => {
  if (!props.session.collectionId) return null;
  const collection = galleryStore.collections.find(
    c => c.id === props.session.collectionId
  );
  return collection?.name;
});

const statusColor = computed(() => {
  switch (props.session.status) {
    case 'Draft': return 'warning';
    case 'Ready': return 'primary';
    case 'Published': return 'success';
    default: return 'medium';
  }
});

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function getPlatformIcon(platform: string) {
  const icons: Record<string, any> = {
    instagram: logoInstagram,
    facebook: logoFacebook,
    twitter: logoTwitter,
  };
  return icons[platform.toLowerCase()] || imagesOutline;
}
</script>

<style scoped>
.session-thumbnail {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.placeholder-thumbnail {
  width: 100%;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ion-color-light);
  color: var(--ion-color-medium);
}

.placeholder-thumbnail ion-icon {
  font-size: 4rem;
  opacity: 0.3;
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.collection-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: var(--ion-color-light);
  border-radius: 4px;
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  margin-bottom: 0.5rem;
}

.published-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  padding: 0 1rem 1rem;
}
</style>
```

---

## 📸 3. Exemple d'utilisation du PhotoStore

```typescript
// Dans un composant Vue
import { usePhotoStore } from '@/stores/photoStore';
import { useGalleryStore } from '@/stores/galleryStore';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

const photoStore = usePhotoStore();
const galleryStore = useGalleryStore();

// Prendre une photo
async function takePhoto() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    });

    if (image.webPath) {
      photoStore.addPhoto(image.webPath);
    }
  } catch (error) {
    console.error('Error taking photo:', error);
  }
}

// Importer depuis la galerie
async function pickFromGallery() {
  try {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    });

    if (image.webPath) {
      photoStore.addPhoto(image.webPath);
    }
  } catch (error) {
    console.error('Error picking photo:', error);
  }
}

// Sélectionner une photo pour édition
function selectPhotoForEdit(photoId: string) {
  photoStore.selectPhoto(photoId);
  router.push('/photo-edit');
}

// Supprimer une photo
async function deletePhoto(photoId: string) {
  const confirmed = await confirmDialog('Supprimer cette photo ?');
  if (confirmed) {
    await photoStore.removePhoto(photoId);
  }
}
```

---

## 🏷️ 4. Exemple d'utilisation du MetadataStore

```typescript
// Dans un composant Vue
import { useMetadataStore } from '@/stores/metadataStore';
import { usePhotoStore } from '@/stores/photoStore';

const metadataStore = useMetadataStore();
const photoStore = usePhotoStore();

// Mettre à jour le titre
function updateTitle(title: string) {
  metadataStore.updateMetadataField('title', title);
}

// Ajouter un tag
function addTag(tag: string) {
  metadataStore.addTag(tag);
}

// Ajouter un hashtag
function addHashtag(hashtag: string) {
  metadataStore.addHashtag(hashtag);
}

// Générer la légende Instagram
function generateCaption() {
  const caption = metadataStore.generateInstagramCaption();
  console.log(caption);
  // Copier dans le presse-papier ou afficher
}

// Utiliser la reconnaissance vocale pour les notes
async function startVoiceNote() {
  // TODO: Intégrer avec @capacitor-community/speech-recognition
  const text = await recognizeSpeech();
  if (text) {
    metadataStore.appendToNotes(text);
  }
}

// Exemple de formulaire de métadonnées
const metadata = computed(() => metadataStore.currentMetadata);

// Template
/*
<ion-item>
  <ion-label position="floating">Titre de l'œuvre</ion-label>
  <ion-input
    v-model="metadata.title"
    @ionChange="e => updateTitle(e.detail.value)"
  ></ion-input>
</ion-item>

<ion-item>
  <ion-label position="floating">Description</ion-label>
  <ion-textarea
    v-model="metadata.description"
    rows="4"
    @ionChange="e => metadataStore.updateMetadataField('description', e.detail.value)"
  ></ion-textarea>
</ion-item>

<ion-item>
  <ion-label position="floating">Technique</ion-label>
  <ion-select
    v-model="metadata.medium"
    @ionChange="e => metadataStore.updateMetadataField('medium', e.detail.value)"
  >
    <ion-select-option value="huile">Huile</ion-select-option>
    <ion-select-option value="acrylique">Acrylique</ion-select-option>
    <ion-select-option value="aquarelle">Aquarelle</ion-select-option>
    <ion-select-option value="pastel">Pastel</ion-select-option>
    <ion-select-option value="digital">Art numérique</ion-select-option>
  </ion-select>
</ion-item>

<ion-item>
  <ion-label>À vendre</ion-label>
  <ion-toggle
    v-model="metadata.forSale"
    @ionChange="e => metadataStore.updateMetadataField('forSale', e.detail.checked)"
  ></ion-toggle>
</ion-item>

<ion-item v-if="metadata.forSale">
  <ion-label position="floating">Prix (€)</ion-label>
  <ion-input
    type="number"
    v-model="metadata.price"
    @ionChange="e => metadataStore.updateMetadataField('price', parseFloat(e.detail.value))"
  ></ion-input>
</ion-item>
*/
```

---

## 🎨 5. Exemple de service d'édition d'images

```typescript
// src/services/imageEditor/filters.ts

export interface FilterOptions {
  brightness?: number; // -100 to 100
  contrast?: number;   // -100 to 100
  saturation?: number; // -100 to 100
  sepia?: number;      // 0 to 100
  grayscale?: boolean;
}

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

      // Dessiner l'image
      ctx.drawImage(img, 0, 0);

      // Appliquer les filtres CSS
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

      // Appliquer les filtres
      if (filters.length > 0) {
        ctx.filter = filters.join(' ');
        ctx.drawImage(img, 0, 0);
      }

      // Retourner l'URL de l'image filtrée
      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}

// Filtres prédéfinis
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
  },
  vibrant: {
    saturation: 30,
    contrast: 10,
  },
  soft: {
    brightness: 10,
    contrast: -10,
    saturation: -10,
  },
};

export async function applyPreset(
  imageUrl: string,
  presetName: keyof typeof PRESET_FILTERS
): Promise<string> {
  return applyFilters(imageUrl, PRESET_FILTERS[presetName]);
}
```

```typescript
// src/services/imageEditor/transforms.ts

export interface CropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function cropImage(
  imageUrl: string,
  crop: CropOptions
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(
        img,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
      );

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}

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

      // Calculer les nouvelles dimensions après rotation
      const rad = (degrees * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      
      canvas.width = img.width * cos + img.height * sin;
      canvas.height = img.width * sin + img.height * cos;

      // Appliquer la rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}

export async function flipImage(
  imageUrl: string,
  horizontal: boolean = true
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

      ctx.translate(
        horizontal ? canvas.width : 0,
        horizontal ? 0 : canvas.height
      );
      ctx.scale(
        horizontal ? -1 : 1,
        horizontal ? 1 : -1
      );
      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    img.onerror = reject;
    img.src = imageUrl;
  });
}
```

---

## 🚀 6. Exemple de Router complet

```typescript
// src/router/index.ts

import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useGalleryStore } from '@/stores/galleryStore';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/gallery'
  },
  {
    path: '/gallery',
    name: 'Gallery',
    component: () => import('@/views/Gallery.vue')
  },
  {
    path: '/new-session',
    name: 'NewSession',
    component: () => import('@/views/NewSession.vue'),
    meta: { requiresActiveSession: false }
  },
  {
    path: '/photo-capture',
    name: 'PhotoCapture',
    component: () => import('@/views/PhotoCapture.vue'),
    meta: { requiresActiveSession: true }
  },
  {
    path: '/photo-edit',
    name: 'PhotoEdit',
    component: () => import('@/views/PhotoEdit.vue'),
    meta: { requiresActiveSession: true }
  },
  {
    path: '/publish',
    name: 'Publish',
    component: () => import('@/views/Publish.vue'),
    meta: { requiresActiveSession: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue')
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const galleryStore = useGalleryStore();
  
  if (to.meta.requiresActiveSession) {
    if (galleryStore.activeSession.id === null) {
      // Rediriger vers la galerie si pas de session active
      next('/gallery');
      return;
    }
  }
  
  // Mettre à jour le step actuel
  if (to.path) {
    galleryStore.setCurrentStepByPath(to.path);
  }
  
  next();
});

export default router;
```

---

## 🎯 7. Configuration main.ts

```typescript
// src/main.ts

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import App from './App.vue';
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components */
import '@ionic/vue/css/core.css';
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/* Theme */
import './theme/variables.css';
import './theme/custom.css'; // Votre thème personnalisé

const app = createApp(App);

// Configuration Pinia avec persistance
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(IonicVue);
app.use(router);
app.use(pinia);

router.isReady().then(() => {
  app.mount('#app');
});
```

---

Ces exemples devraient vous donner une bonne base pour démarrer le développement. N'hésitez pas à les adapter selon vos besoins spécifiques !
