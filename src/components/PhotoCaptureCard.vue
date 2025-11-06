<template>
  <ion-card v-if="subjectStore.selectedSubject">
    <ion-card-header>
      <ion-card-title>{{ subjectStore.selectedSubject.name }} Photos</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-grid>
        <ion-row>
          <ion-col>
            <ion-button expand="block" @click="takePhoto">
              <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
              Take Photo
            </ion-button>
          </ion-col>
          <ion-col>
            <ion-button expand="block" @click="uploadPhoto">
              <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
              Upload Photo
            </ion-button>
          </ion-col>
        </ion-row>
        
        <ion-row v-if="photos.length > 0" class="ion-align-items-center">
          <ion-col size="12">
            <ion-text color="medium"><h3>Recorded Photos ({{ photos.length }})</h3></ion-text>
          </ion-col>
          
          <ion-col 
              size="4" 
              size-md="3" 
              v-for="(photo, index) in photos" 
              :key="index"
              class="photo-container"
          >
            <div class="thumbnail-wrapper">
                <ion-img 
                    :src="photo.base64OrWebPath" 
                    class="thumbnail-photo"
                    @click="showPhotoFullScreen(photo.base64OrWebPath)"
                ></ion-img>
                
                <ion-button 
                    class="delete-button" 
                    color="danger" 
                    size="small"
                    @click.stop="deletePhoto(photo.base64OrWebPath)"
                >
                    <ion-icon :icon="trashOutline"></ion-icon>
                </ion-button>
            </div>
          </ion-col>
        </ion-row>
        
        <ion-row v-if="photoPreview">
          <ion-col size="12">
            <ion-text><h3>Last Photo Preview</h3></ion-text>
            <ion-img :src="photoPreview"></ion-img>
          </ion-col>
        </ion-row>

      </ion-grid>
    </ion-card-content>
  </ion-card>

  <PhotoViewerModal 
      :is-open="isModalOpen" 
      :photo-url="fullScreenPhotoUrl" 
      @dismiss="isModalOpen = false"
  />
</template>

<script setup lang="ts">
import {
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonButton,
    IonIcon, IonGrid, IonRow, IonCol, IonImg, IonText, alertController
} from '@ionic/vue';
import { ref } from 'vue';
import { storeToRefs } from 'pinia';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
// NEW: Import trashOutline icon for deletion
import { cameraOutline, cloudUploadOutline, trashOutline } from 'ionicons/icons'; 

// --- Modal Host Import ---
import PhotoViewerModal from './PhotoViewerModal.vue'; 

// --- Store Imports ---
import { usePhotoStore } from '@/stores/photoStore';
import { useSubjectStore } from '@/stores/subjectStore'; 
import type { Subject } from '@/stores/subjectStore'; 

// --- Props & Typing ---
const props = defineProps<{
    subject: Subject | null; 
}>();
console.log(props)

// --- State Management (Pinia) ---
const photoStore = usePhotoStore();
const subjectStore = useSubjectStore();
const { photos } = storeToRefs(photoStore); // Reactive photo list for the current subject

// --- Local Component State ---
const photoPreview = ref(''); 
const isModalOpen = ref(false); // Controls the modal visibility
const fullScreenPhotoUrl = ref(''); // URL passed to the modal


// =================================================================
// --- PHOTO FILTER CONSTANTS ---
// =================================================================
const IMAGE_QUALITY = 80; 
const MAX_DIMENSION = 1280; 

// =================================================================
// --- Camera Logic ---
// =================================================================

/**
 * Capture a photo using the device camera via Capacitor, applying size and compression filters.
 */
const takePhoto = async () => {
    if (!subjectStore.selectedSubject) return; 
    try {
        const photo = await Camera.getPhoto({
            quality: IMAGE_QUALITY, 
            width: MAX_DIMENSION, 
            height: MAX_DIMENSION, 
            allowEditing: false, 
            resultType: CameraResultType.Uri, 
            source: CameraSource.Camera 
        });

        if (photo.webPath) {
            photoPreview.value = photo.webPath;
            photoStore.addPhoto(photo.webPath); 
        }

    } catch (e) {
        console.error('Error taking photo:', e);
        const alert = await alertController.create({
            header: 'Camera Error',
            message: 'Could not open camera. Check permissions.',
            buttons: ['OK'],
        });
        await alert.present();
    }
};

/**
 * Select a photo from the device photo library/gallery via Capacitor, applying size and compression filters.
 */
const uploadPhoto = async () => {
    if (!subjectStore.selectedSubject) return;
    try {
        const photo = await Camera.getPhoto({
            quality: IMAGE_QUALITY, 
            width: MAX_DIMENSION, 
            height: MAX_DIMENSION, 
            allowEditing: false, 
            resultType: CameraResultType.Uri, 
            source: CameraSource.Photos 
        });

        if (photo.webPath) {
            photoPreview.value = photo.webPath;
            photoStore.addPhoto(photo.webPath); 
        }

    } catch (e) {
        console.error('Error uploading photo:', e);
        const alert = await alertController.create({
            header: 'Gallery Error',
            message: 'Could not open photo gallery. Check permissions.',
            buttons: ['OK'],
        });
        await alert.present();
    }
};

/**
 * Opens the PhotoViewerModal by setting the URL and opening the state.
 * @param photoPath The webPath or base64 data of the image.
 */
const showPhotoFullScreen = (photoPath: string) => {
    fullScreenPhotoUrl.value = photoPath;
    isModalOpen.value = true;
};

// =================================================================
// --- DELETION LOGIC (NEW) ---
// =================================================================

/**
 * Handles confirmation and calls the Pinia action to delete the photo record.
 * @param photoPath The path (URI) of the photo to delete.
 */
const deletePhoto = async (photoPath: string) => {
    const alert = await alertController.create({
        header: 'Confirm Deletion',
        message: 'Are you sure you want to delete this photo? This will remove the record and attempt to delete the physical file.',
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Delete',
                role: 'destructive',
                handler: () => {
                    // Call the Pinia action to remove the entry and attempt file deletion
                    photoStore.removePhoto(photoPath);
                },
            },
        ],
    });
    await alert.present();
};

</script>

<style scoped>
ion-card {
    margin-bottom: 16px;
}

/* Container for the thumbnail and delete button */
.thumbnail-wrapper {
    position: relative; 
    display: block;
    margin-bottom: 8px; /* Maintain vertical spacing between rows */
}

/* Style for the smaller photo thumbnails */
.thumbnail-photo {
    height: 80px; 
    width: 100%;
    object-fit: cover; 
    border: 1px solid var(--ion-color-medium);
    border-radius: 4px;
    cursor: pointer; 
    display: block;
}

/* NEW: Style for the delete button overlay */
.delete-button {
    position: absolute;
    top: 0px;
    right: 0px;
    /* Minimize button size */
    --padding-start: 6px;
    --padding-end: 6px;
    --padding-top: 4px;
    --padding-bottom: 4px;
    height: 24px;
    z-index: 10;
    --border-radius: 0 4px 0 4px; /* Rounded top-right corner only */
}

ion-img {
    max-height: 200px;
    object-fit: contain;
}
</style>