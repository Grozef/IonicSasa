<template>
  <div class="subject-form">
    <!-- Input for subject name -->
    <ion-item>
      <ion-label position="floating">Subject Name</ion-label>
      <ion-input v-model="subjectName" placeholder="Enter subject name"></ion-input>
    </ion-item>

    <!-- Photo preview card -->
    <ion-card v-if="photo">
      <ion-card-content class="ion-text-center">
        <ion-img :src="photo" class="photo-preview"></ion-img>
      </ion-card-content>
    </ion-card>

    <!-- Buttons for taking/uploading photos -->
    <div class="button-group">
      <ion-button expand="block" fill="outline" color="medium" @click="takePhoto">
        <ion-icon :icon="cameraOutline" slot="start"></ion-icon>
        Take Photo
      </ion-button>
      <ion-button expand="block" fill="outline" color="medium" @click="uploadPhoto">
        <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
        Upload Photo
      </ion-button>
    </div>

    <!-- Button to save subject -->
    <ion-button expand="block" color="success" class="ion-margin-top" @click="saveSubject">
      Save Subject
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { 
  IonItem, 
  IonLabel, 
  IonInput, 
  IonCard, 
  IonCardContent, 
  IonImg, 
  IonButton, 
  IonIcon 
} from '@ionic/vue';
import { cameraOutline, cloudUploadOutline } from 'ionicons/icons';
import { Camera, CameraResultType } from '@capacitor/camera';
import { ref } from 'vue';

// Reactive state for subject name and photo
const subjectName = ref('');
const photo = ref<string | null>(null);

// Take a photo using Capacitor Camera
const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: false,
    resultType: CameraResultType.Uri,
  });
  photo.value = image.webPath || null;
};

// Upload a photo (placeholder)
const uploadPhoto = async () => {
  // Logic to upload a photo from the gallery
};

// Emit event when subject is saved
const saveSubject = () => {
  emit('subjectSaved', { name: subjectName.value, photo: photo.value });
};

// Define emit for parent component
const emit = defineEmits<{
  (e: 'subjectSaved', value: { name: string; photo: string | null }): void;
}>();
</script>

<style scoped>
/* Style the form container */
.subject-form {
  padding: 16px;
}

/* Style input items */
ion-item {
  --border-color: var(--ion-color-light-gray);
  margin-bottom: 16px;
}

/* Style photo preview */
.photo-preview {
  max-height: 200px;
  border-radius: 8px;
}

/* Style button group */
.button-group {
  display: flex;
  gap: 16px;
  margin: 16px 0;
}

/* Style buttons */
ion-button {
  --border-radius: 8px;
}
</style>