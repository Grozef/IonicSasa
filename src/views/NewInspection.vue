<template>
  <ion-page>
    <!-- Page header with menu button and title -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <!-- Menu button for side navigation -->
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <!-- Page title -->
        <ion-title>New Inspection Setup</ion-title>
      </ion-toolbar>
    </ion-header>

    <!-- Main content area with padding -->
    <ion-content class="ion-padding">
      <!-- Input field for inspection title -->
      <ion-item>
        <ion-input
          v-model="inspectionTitle"
          label="Inspection Title"
          placeholder="Enter inspection title (Optional)">
        </ion-input>
      </ion-item>

      <!-- Card for site and equipment selection -->
      <ion-card>
        <ion-card-header>
          <ion-card-title>Site & Equipment Selection</ion-card-title>
        </ion-card-header>
        <ion-card-content>
          <!-- Component for selecting site and equipment -->
          <SiteEquipmentSelector v-model="selectedEquipments" />
        </ion-card-content>
      </ion-card>

      <!-- Button to start the inspection and proceed to the next step -->
      <ion-button
        expand="block"
        color="primary"
        class="ion-margin-top"
        @click="goToSubjects"
        :disabled="!isNextButtonEnabled"
      >
        Start Inspection (Next)
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import SiteEquipmentSelector from '@/components/SiteEquipmentSelector.vue';
import { useInspectionStore } from '@/stores/inspectionStore';

// Initialize router for navigation
const router = useRouter();
// Initialize inspection store for state management
const store = useInspectionStore();
// Reactive reference for the inspection title input
const inspectionTitle = ref('');
// Reactive reference for the list of selected equipment (bound to SiteEquipmentSelector via v-model)
const selectedEquipments = ref<any[]>([]);
// Path for the next step in the inspection workflow
const nextReportStepPath = '/inspection-subjects';

// Computed property to determine if the "Next" button should be enabled
const isNextButtonEnabled = computed(() => {
    // Check if a site is selected
    const siteIsSelected = !!store.activeInspection.siteId;
    // Check if there is any equipment linked to the selected site
    const hasEquipment = store.equipmentsForActiveSite.length > 0;

    // The button is enabled if:
    // 1. A site is selected, AND
    // 2. Either there is no equipment linked to the site OR at least one equipment is selected
    return siteIsSelected && (!hasEquipment || selectedEquipments.value.length > 0);
});

/**
 * Handles the transition to the first report step (/inspection-subjects).
 * 1. Finalizes the inspection creation in the store.
 * 2. Navigates to the next page using the inspection's ID.
 */
const goToSubjects = () => {
    // Early return if the button is disabled or no inspection ID is set
    if (!isNextButtonEnabled.value || !store.activeInspection.id) return;

    // 1. Finalize the creation of the new Inspection object and add it to the main list.
    store.finalizeInspectionCreation(inspectionTitle.value, selectedEquipments.value);
    // 2. Set the current step to the next stage (Observations/Subjects)
    store.setCurrentStepByPath(nextReportStepPath);

    // 3. Navigate to the Subjects page using the newly created ID.
    router.push(`${nextReportStepPath}/${store.activeInspection.id}`);
};
</script>

<style scoped>
/* Custom styling for ion-item to add a light gray border */
ion-item {
  --border-color: var(--ion-color-light-gray);
  margin-bottom: 16px;
}
/* Add margin to the card for better spacing */
ion-card {
  margin: 16px 0;
}
/* Make the ion-list background transparent */
ion-list {
  background: transparent;
}
</style>
