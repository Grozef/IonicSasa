<template>
    <ion-modal 
        :is-open="isOpen" 
        @didDismiss="$emit('dismiss')" 
        :initial-breakpoint="1" 
        :breakpoints="[0, 1]"
        class="photo-viewer-modal"
    >
        <ion-header class="ion-no-border">
            <ion-toolbar>
                <ion-title>Photo View</ion-title>
                <ion-buttons slot="end">
                    <ion-button @click="$emit('dismiss')">Close</ion-button>
                </ion-buttons>
            </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding ion-text-center">
            <img :src="photoUrl" class="full-size-img" alt="Full screen inspection photo" v-if="photoUrl" />
        </ion-content>
    </ion-modal>
</template>
  
<script setup lang="ts">
import {
    IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonContent, IonButton
} from '@ionic/vue';

// --- Props ---
const props = defineProps<{
    /** Controls the visibility of the modal. */
    isOpen: boolean;
    /** The URL (webPath) of the photo to display. */
    photoUrl: string;
}>();

// --- Emits ---
const emit = defineEmits<{
    /** Emitted when the modal is closed (via button or swipe down). */
    (event: 'dismiss'): void;
}>();
</script>

<style scoped>
/* Modal specific styles */
.full-size-img {
    width: 100%;
    max-width: 100%;
    height: auto;
    max-height: 85vh; /* Limit height to leave room for the header */
    object-fit: contain; /* Ensure the full image is visible */
}

/* Optional: To make the modal header transparent/minimal */
.photo-viewer-modal {
    --border-radius: 0;
}
</style>