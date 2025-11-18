<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Publication</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="publish-container">
        <!-- En-tête -->
        <div class="header-section">
          <ion-icon :icon="shareOutline" class="main-icon" color="primary"></ion-icon>
          <h2>Prêt à publier</h2>
          <p class="subtitle">{{ sessionTitle }}</p>
        </div>

        <!-- Résumé de la session -->
        <ion-card class="summary-card">
          <ion-card-header>
            <ion-card-title>Résumé de la session</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <div class="summary-grid">
              <div class="summary-item">
                <ion-icon :icon="imagesOutline" color="primary"></ion-icon>
                <div>
                  <strong>{{ photos.length }}</strong>
                  <span>Photos</span>
                </div>
              </div>
              <div class="summary-item">
                <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
                <div>
                  <strong>{{ photosWithMetadata }}</strong>
                  <span>Avec métadonnées</span>
                </div>
              </div>
              <div class="summary-item">
                <ion-icon :icon="createOutline" color="warning"></ion-icon>
                <div>
                  <strong>{{ editedPhotos }}</strong>
                  <span>Éditées</span>
                </div>
              </div>
              <div class="summary-item">
                <ion-icon :icon="colorPaletteOutline" color="tertiary"></ion-icon>
                <div>
                  <strong>{{ collectionName }}</strong>
                  <span>Collection</span>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Aperçu des photos -->
        <ion-card>
          <ion-card-header>
            <div class="card-header-with-action">
              <ion-card-title>Aperçu des photos</ion-card-title>
              <ion-button size="small" fill="clear" @click="goToEdit">
                Modifier
              </ion-button>
            </div>
          </ion-card-header>
          <ion-card-content>
            <div class="photos-preview">
              <div
                v-for="photo in photos"
                :key="photo.id"
                class="photo-preview-item"
                @click="viewPhoto(photo)"
              >
                <img :src="photo.base64OrWebPath" :alt="getPhotoTitle(photo.id)" />
                <div class="photo-info">
                  <div class="photo-title">{{ getPhotoTitle(photo.id) || 'Sans titre' }}</div>
                  <div class="photo-badges">
                    <ion-badge v-if="photo.edited" color="warning" size="small">
                      Éditée
                    </ion-badge>
                    <ion-badge v-if="hasCompleteMetadata(photo.id)" color="success" size="small">
                      Complète
                    </ion-badge>
                  </div>
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Sélection des plateformes -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Plateformes de publication</ion-card-title>
            <ion-card-subtitle>Choisissez où publier vos photos</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item
                v-for="platform in platforms"
                :key="platform.id"
                button
                @click="togglePlatform(platform.id)"
              >
                <ion-icon
                  :icon="platform.icon"
                  :color="platform.color"
                  slot="start"
                ></ion-icon>
                <ion-label>
                  <h3>{{ platform.name }}</h3>
                  <p>{{ platform.description }}</p>
                </ion-label>
                <ion-checkbox
                  slot="end"
                  :checked="selectedPlatforms.includes(platform.id)"
                  @ionChange="togglePlatform(platform.id)"
                ></ion-checkbox>
              </ion-item>
            </ion-list>

            <!-- Aperçu des légendes -->
            <div v-if="selectedPlatforms.length > 0" class="captions-preview">
              <h4>Aperçu des légendes</h4>
              <div
                v-for="platformId in selectedPlatforms"
                :key="platformId"
                class="caption-preview"
              >
                <div class="platform-header">
                  <ion-icon :icon="getPlatformIcon(platformId)"></ion-icon>
                  <strong>{{ getPlatformName(platformId) }}</strong>
                </div>
                <div class="caption-text">
                  {{ generateCaption(platformId) }}
                </div>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Options d'export -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Options d'export</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item>
              <ion-toggle v-model="exportOptions.includeMetadata">
                <ion-label>
                  <h3>Inclure les métadonnées EXIF</h3>
                  <p>Ajouter les métadonnées dans les fichiers</p>
                </ion-label>
              </ion-toggle>
            </ion-item>

            <ion-item>
              <ion-toggle v-model="exportOptions.addWatermark">
                <ion-label>
                  <h3>Ajouter un watermark</h3>
                  <p>Protéger vos images avec votre signature</p>
                </ion-label>
              </ion-toggle>
            </ion-item>

            <ion-item>
              <ion-select
                v-model="exportOptions.quality"
                label="Qualité de compression"
                interface="popover"
              >
                <ion-select-option value="high">Haute qualité (100%)</ion-select-option>
                <ion-select-option value="medium">Moyenne (80%)</ion-select-option>
                <ion-select-option value="low">Basse (60%)</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Checklist de vérification -->
        <ion-card class="checklist-card">
          <ion-card-header>
            <ion-card-title>Checklist de publication</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item>
                <ion-icon
                  :icon="photos.length > 0 ? checkmarkCircleOutline : closeCircleOutline"
                  :color="photos.length > 0 ? 'success' : 'danger'"
                  slot="start"
                ></ion-icon>
                <ion-label>
                  Au moins une photo capturée
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon
                  :icon="allPhotosHaveMetadata ? checkmarkCircleOutline : closeCircleOutline"
                  :color="allPhotosHaveMetadata ? 'success' : 'warning'"
                  slot="start"
                ></ion-icon>
                <ion-label>
                  Toutes les photos ont des métadonnées
                </ion-label>
              </ion-item>

              <ion-item>
                <ion-icon
                  :icon="selectedPlatforms.length > 0 ? checkmarkCircleOutline : closeCircleOutline"
                  :color="selectedPlatforms.length > 0 ? 'success' : 'danger'"
                  slot="start"
                ></ion-icon>
                <ion-label>
                  Au moins une plateforme sélectionnée
                </ion-label>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Boutons d'action -->
        <div class="action-buttons">
          <ion-button
            expand="block"
            color="primary"
            size="large"
            @click="publish"
            :disabled="!canPublish"
          >
            <ion-icon slot="start" :icon="shareOutline"></ion-icon>
            Publier maintenant
          </ion-button>

          <ion-button
            expand="block"
            fill="outline"
            @click="exportOnly"
            :disabled="photos.length === 0"
          >
            <ion-icon slot="start" :icon="downloadOutline"></ion-icon>
            Exporter uniquement
          </ion-button>

          <ion-button
            expand="block"
            fill="clear"
            @click="saveAsDraft"
          >
            <ion-icon slot="start" :icon="saveOutline"></ion-icon>
            Enregistrer comme brouillon
          </ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonCheckbox,
  IonToggle,
  IonSelect,
  IonSelectOption,
  IonBadge,
  alertController,
  toastController,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGalleryStore } from '@/stores/galleryStore';
import { usePhotoStore } from '@/stores/photoStore';
import { useMetadataStore } from '@/stores/metadataStore';
import {
  arrowBackOutline,
  shareOutline,
  imagesOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  createOutline,
  colorPaletteOutline,
  downloadOutline,
  saveOutline,
  logoInstagram,
  logoFacebook,
  logoTwitter,
  logoLinkedin,
} from 'ionicons/icons';

const router = useRouter();
const route = useRoute();
const galleryStore = useGalleryStore();
const photoStore = usePhotoStore();
const metadataStore = useMetadataStore();

const selectedPlatforms = ref<string[]>([]);
const exportOptions = ref({
  includeMetadata: true,
  addWatermark: false,
  quality: 'high'
});

const platforms = [
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Format carré ou portrait optimisé',
    icon: logoInstagram,
    color: 'danger'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Publication sur votre page artistique',
    icon: logoFacebook,
    color: 'primary'
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    description: 'Tweet avec visuels',
    icon: logoTwitter,
    color: 'dark'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Partage professionnel',
    icon: logoLinkedin,
    color: 'primary'
  },
];

const sessionId = computed(() => Number(route.params.id));
const session = computed(() => galleryStore.sessions.find(s => s.id === sessionId.value));
const sessionTitle = computed(() => session.value?.title || 'Session sans titre');
const collectionName = computed(() => {
  const collection = galleryStore.collections.find(
    c => c.id === session.value?.collectionId
  );
  return collection?.name || 'Sans collection';
});

const photos = computed(() => photoStore.photos);

const photosWithMetadata = computed(() => {
  return photos.value.filter(photo => {
    const meta = metadataStore.getMetadata(photo.id);
    return !!(meta.title && meta.description);
  }).length;
});

const editedPhotos = computed(() => {
  return photos.value.filter(p => p.edited).length;
});

const allPhotosHaveMetadata = computed(() => {
  return photos.value.length > 0 && photosWithMetadata.value === photos.value.length;
});

const canPublish = computed(() => {
  return photos.value.length > 0 && selectedPlatforms.value.length > 0;
});

/**
 * Obtenir le titre d'une photo
 */
function getPhotoTitle(photoId: string): string {
  const meta = metadataStore.getMetadata(photoId);
  return meta.title;
}

/**
 * Vérifier si une photo a des métadonnées complètes
 */
function hasCompleteMetadata(photoId: string): boolean {
  const meta = metadataStore.getMetadata(photoId);
  return !!(meta.title && meta.description && meta.tags.length > 0);
}

/**
 * Basculer une plateforme
 */
function togglePlatform(platformId: string) {
  const index = selectedPlatforms.value.indexOf(platformId);
  if (index > -1) {
    selectedPlatforms.value.splice(index, 1);
  } else {
    selectedPlatforms.value.push(platformId);
  }
}

/**
 * Obtenir l'icône d'une plateforme
 */
function getPlatformIcon(platformId: string) {
  const platform = platforms.find(p => p.id === platformId);
  return platform?.icon || shareOutline;
}

/**
 * Obtenir le nom d'une plateforme
 */
function getPlatformName(platformId: string): string {
  const platform = platforms.find(p => p.id === platformId);
  return platform?.name || '';
}

/**
 * Générer une légende pour une plateforme
 */
function generateCaption(platformId: string): string {
  // Utiliser les métadonnées de la première photo comme exemple
  if (photos.value.length === 0) return '';
  
  const firstPhotoMeta = metadataStore.getMetadata(photos.value[0].id);
  
  let caption = '';
  if (firstPhotoMeta.title) {
    caption += `${firstPhotoMeta.title}\n\n`;
  }
  if (firstPhotoMeta.description) {
    caption += `${firstPhotoMeta.description}\n\n`;
  }
  if (firstPhotoMeta.hashtags.length > 0) {
    caption += firstPhotoMeta.hashtags.slice(0, 5).join(' ');
  }
  
  return caption || 'Nouvelle œuvre à découvrir ! 🎨';
}

/**
 * Visualiser une photo
 */
function viewPhoto(photo: any) {
  // TODO: Ouvrir modal de visualisation
  console.log('View photo:', photo);
}

/**
 * Aller à l'édition
 */
function goToEdit() {
  router.push('/photo-edit');
}

/**
 * Publier
 */
async function publish() {
  const alert = await alertController.create({
    header: 'Publier maintenant ?',
    message: `Publier ${photos.value.length} photo(s) sur ${selectedPlatforms.value.length} plateforme(s)`,
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Publier',
        handler: async () => {
          await performPublish();
        }
      }
    ]
  });

  await alert.present();
}

/**
 * Effectuer la publication
 */
async function performPublish() {
  // TODO: Implémenter la logique de publication
  galleryStore.publishSession(selectedPlatforms.value);
  
  const toast = await toastController.create({
    message: '✅ Publication réussie !',
    duration: 3000,
    color: 'success',
    position: 'top'
  });
  await toast.present();
  
  router.push('/dashboard');
}

/**
 * Exporter uniquement
 */
async function exportOnly() {
  // TODO: Implémenter l'export des photos
  const toast = await toastController.create({
    message: '📦 Export en cours...',
    duration: 2000,
    position: 'top'
  });
  await toast.present();
}

/**
 * Enregistrer comme brouillon
 */
async function saveAsDraft() {
  const toast = await toastController.create({
    message: '💾 Session enregistrée',
    duration: 2000,
    color: 'success',
    position: 'top'
  });
  await toast.present();
  
  router.push('/dashboard');
}

/**
 * Retour
 */
function goBack() {
  router.back();
}
</script>

<style scoped>
.publish-container {
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 2rem;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.main-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.header-section h2 {
  margin: 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  color: var(--ion-color-medium);
  margin: 0;
}

.summary-card {
  margin-bottom: 1.5rem;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.summary-item ion-icon {
  font-size: 2rem;
}

.summary-item strong {
  display: block;
  font-size: 1.25rem;
  color: var(--ion-color-dark);
}

.summary-item span {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}

.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.photos-preview {
  display: grid;
  gap: 1rem;
}

.photo-preview-item {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--ion-color-light);
  border-radius: 8px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.photo-preview-item:active {
  transform: scale(0.98);
}

.photo-preview-item img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
}

.photo-info {
  flex: 1;
}

.photo-title {
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: var(--ion-color-dark);
}

.photo-badges {
  display: flex;
  gap: 0.5rem;
}

.captions-preview {
  margin-top: 1.5rem;
}

.captions-preview h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--ion-color-dark);
}

.caption-preview {
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
  border-left: 3px solid var(--ion-color-primary);
}

.platform-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--ion-color-dark);
}

.caption-text {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
  white-space: pre-wrap;
}

.checklist-card {
  background: linear-gradient(135deg, var(--ion-color-success-tint) 0%, var(--ion-color-light) 100%);
}

.action-buttons {
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;
}

ion-card {
  margin-bottom: 1rem;
}

ion-item {
  --padding-start: 0;
}
</style>
