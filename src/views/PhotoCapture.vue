<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>{{ sessionTitle || 'Session Photo' }}</ion-title>
        <ion-chip slot="end" outline color="primary">
          <ion-icon :icon="colorPaletteOutline"></ion-icon>
          <ion-label>{{ collectionName }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <!-- En-tête avec instructions -->
      <ion-card class="info-card">
        <ion-card-content>
          <div class="info-content">
            <ion-icon :icon="informationCircleOutline" color="primary" size="large"></ion-icon>
            <div>
              <strong>Photographiez vos œuvres</strong>
              <p>Capturez plusieurs angles de chaque œuvre pour une meilleure présentation</p>
            </div>
          </div>
        </ion-card-content>
      </ion-card>

      <!-- Boutons de capture -->
      <div class="capture-buttons">
        <ion-button expand="block" size="large" color="primary" @click="takePhoto">
          <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
          Prendre une photo
        </ion-button>
        <ion-button expand="block" fill="outline" @click="pickFromGallery">
          <ion-icon slot="start" :icon="imagesOutline"></ion-icon>
          Importer de la galerie
        </ion-button>
      </div>

      <!-- Statistiques -->
      <div class="stats-bar">
        <div class="stat-item">
          <ion-icon :icon="imagesOutline" color="primary"></ion-icon>
          <span>{{ photos.length }} photo{{ photos.length > 1 ? 's' : '' }}</span>
        </div>
        <div class="stat-item" v-if="photos.length > 0">
          <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
          <span>{{ photosWithMetadata }} avec métadonnées</span>
        </div>
      </div>

      <!-- Grille de photos -->
      <div v-if="photos.length > 0" class="photos-section">
        <div class="section-header">
          <h3>Photos capturées</h3>
          <ion-button size="small" fill="clear" @click="selectAllPhotos">
            <ion-icon slot="icon-only" :icon="checkboxOutline"></ion-icon>
          </ion-button>
        </div>

        <div class="photos-grid">
          <div 
            v-for="photo in photos" 
            :key="photo.id"
            class="photo-item"
            :class="{ selected: selectedPhotoIds.includes(photo.id) }"
            @click="togglePhotoSelection(photo.id)"
          >
            <img :src="photo.base64OrWebPath" :alt="`Photo ${photo.id}`" />
            
            <!-- Badge si édité -->
            <ion-badge v-if="photo.edited" color="warning" class="edited-badge">
              <ion-icon :icon="createOutline"></ion-icon>
            </ion-badge>

            <!-- Overlay de sélection -->
            <div class="selection-overlay" v-if="selectedPhotoIds.includes(photo.id)">
              <ion-icon :icon="checkmarkCircleOutline" color="light"></ion-icon>
            </div>

            <!-- Actions rapides -->
            <div class="photo-actions">
              <ion-button size="small" fill="clear" @click.stop="viewPhoto(photo)">
                <ion-icon slot="icon-only" :icon="eyeOutline" color="light"></ion-icon>
              </ion-button>
              <ion-button size="small" fill="clear" @click.stop="editPhoto(photo)">
                <ion-icon slot="icon-only" :icon="createOutline" color="light"></ion-icon>
              </ion-button>
              <ion-button size="small" fill="clear" @click.stop="deletePhoto(photo.id)">
                <ion-icon slot="icon-only" :icon="trashOutline" color="light"></ion-icon>
              </ion-button>
            </div>
          </div>
        </div>

        <!-- Actions groupées -->
        <div v-if="selectedPhotoIds.length > 0" class="bulk-actions">
          <ion-chip color="primary">
            <ion-label>{{ selectedPhotoIds.length }} sélectionnée(s)</ion-label>
          </ion-chip>
          <ion-button size="small" fill="outline" color="danger" @click="deleteSelectedPhotos">
            <ion-icon slot="start" :icon="trashOutline"></ion-icon>
            Supprimer
          </ion-button>
          <ion-button size="small" fill="clear" @click="clearSelection">
            Annuler
          </ion-button>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="empty-state">
        <ion-icon :icon="cameraOutline" size="large" color="medium"></ion-icon>
        <h3>Aucune photo</h3>
        <p>Commencez par prendre une photo de votre œuvre</p>
      </div>

      <!-- Bouton suivant -->
      <ion-button
        expand="block"
        color="primary"
        size="large"
        class="ion-margin-top"
        @click="goToEdit"
        :disabled="photos.length === 0"
      >
        <ion-icon slot="start" :icon="createOutline"></ion-icon>
        Éditer & Métadonnées ({{ photos.length }})
      </ion-button>

      <!-- Bouton terminer plus tard -->
      <ion-button
        expand="block"
        fill="outline"
        @click="saveAndExit"
        v-if="photos.length > 0"
      >
        <ion-icon slot="start" :icon="saveOutline"></ion-icon>
        Enregistrer et terminer plus tard
      </ion-button>
    </ion-content>

    <!-- Modal de visualisation de photo -->
    <PhotoViewerModal
      :is-open="isPhotoViewerOpen"
      :photo-url="selectedPhotoUrl"
      @close="closePhotoViewer"
    />
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
  IonCardContent,
  IonChip,
  IonLabel,
  IonBadge,
  alertController,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useGalleryStore } from '@/stores/galleryStore';
import { usePhotoStore } from '@/stores/photoStore';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import PhotoViewerModal from '@/components/PhotoViewerModal.vue';
import {
  cameraOutline,
  imagesOutline,
  arrowBackOutline,
  colorPaletteOutline,
  informationCircleOutline,
  checkmarkCircleOutline,
  createOutline,
  eyeOutline,
  trashOutline,
  checkboxOutline,
  saveOutline,
} from 'ionicons/icons';

const router = useRouter();
const route = useRoute();
const galleryStore = useGalleryStore();
const photoStore = usePhotoStore();

const selectedPhotoIds = ref<string[]>([]);
const isPhotoViewerOpen = ref(false);
const selectedPhotoUrl = ref('');

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
  // TODO: Compter les photos avec métadonnées complètes
  return 0;
});

/**
 * Prendre une photo avec la caméra
 */
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
    console.error('Erreur lors de la prise de photo:', error);
  }
}

/**
 * Importer depuis la galerie
 */
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
    console.error('Erreur lors de l\'import:', error);
  }
}

/**
 * Sélectionner/désélectionner une photo
 */
function togglePhotoSelection(photoId: string) {
  const index = selectedPhotoIds.value.indexOf(photoId);
  if (index > -1) {
    selectedPhotoIds.value.splice(index, 1);
  } else {
    selectedPhotoIds.value.push(photoId);
  }
}

/**
 * Sélectionner toutes les photos
 */
function selectAllPhotos() {
  if (selectedPhotoIds.value.length === photos.value.length) {
    selectedPhotoIds.value = [];
  } else {
    selectedPhotoIds.value = photos.value.map(p => p.id);
  }
}

/**
 * Annuler la sélection
 */
function clearSelection() {
  selectedPhotoIds.value = [];
}

/**
 * Visualiser une photo
 */
function viewPhoto(photo: any) {
  selectedPhotoUrl.value = photo.base64OrWebPath;
  isPhotoViewerOpen.value = true;
}

/**
 * Fermer le viewer
 */
function closePhotoViewer() {
  isPhotoViewerOpen.value = false;
  selectedPhotoUrl.value = '';
}

/**
 * Éditer une photo
 */
function editPhoto(photo: any) {
  photoStore.selectPhoto(photo.id);
  router.push('/photo-edit');
}

/**
 * Supprimer une photo
 */
async function deletePhoto(photoId: string) {
  const alert = await alertController.create({
    header: 'Supprimer cette photo ?',
    message: 'Cette action est irréversible.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: () => {
          photoStore.removePhoto(photoId);
        }
      }
    ]
  });

  await alert.present();
}

/**
 * Supprimer les photos sélectionnées
 */
async function deleteSelectedPhotos() {
  const alert = await alertController.create({
    header: `Supprimer ${selectedPhotoIds.value.length} photo(s) ?`,
    message: 'Cette action est irréversible.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: () => {
          selectedPhotoIds.value.forEach(id => {
            photoStore.removePhoto(id);
          });
          clearSelection();
        }
      }
    ]
  });

  await alert.present();
}

/**
 * Aller à l'édition
 */
function goToEdit() {
  if (photos.value.length > 0) {
    // Sélectionner automatiquement la première photo
    photoStore.selectPhoto(photos.value[0].id);
    router.push('/photo-edit');
  }
}

/**
 * Enregistrer et quitter
 */
async function saveAndExit() {
  const alert = await alertController.create({
    header: 'Enregistrer et quitter ?',
    message: 'Vous pourrez reprendre cette session plus tard.',
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Enregistrer',
        handler: () => {
          router.push('/dashboard');
        }
      }
    ]
  });

  await alert.present();
}

/**
 * Retour
 */
function goBack() {
  router.push('/dashboard');
}
</script>

<style scoped>
.info-card {
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--ion-color-primary-tint) 0%, var(--ion-color-light) 100%);
}

.info-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.info-content ion-icon {
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.info-content strong {
  display: block;
  margin-bottom: 0.25rem;
  color: var(--ion-color-dark);
}

.info-content p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.875rem;
}

.capture-buttons {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.stats-bar {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--ion-color-light);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.photos-section {
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.section-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.photo-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
}

.photo-item.selected {
  border-color: var(--ion-color-primary);
  transform: scale(0.95);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edited-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  z-index: 2;
}

.selection-overlay {
  position: absolute;
  inset: 0;
  background: rgba(var(--ion-color-primary-rgb), 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.selection-overlay ion-icon {
  font-size: 3rem;
}

.photo-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
  padding: 0.5rem;
  display: flex;
  gap: 0.25rem;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.photo-item:hover .photo-actions {
  opacity: 1;
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--ion-color-light);
  border-radius: 8px;
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

.empty-state h3 {
  margin: 0.5rem 0;
}

.empty-state p {
  margin: 0;
}
</style>
