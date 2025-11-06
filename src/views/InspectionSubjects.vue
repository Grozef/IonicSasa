<template>
  <!-- Main page container with padding and bottom margin -->
  <ion-page class="ion-padding ion-margin-bottom">
    <!-- Page header with title and site information -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <!-- Menu button for side navigation -->
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <!-- Dynamic page title showing the inspection name -->
        <ion-title>Inspection: {{ inspectionTitle }}</ion-title>
        <!-- Chip showing the current site name -->
        <ion-chip slot="end" outline>
          <ion-label>Site: {{ inspectionStore.activeInspection.siteName }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>

    <!-- Main content area with padding and bottom margin -->
    <ion-content class="ion-padding ion-margin-bottom">
      <!-- Equipment selector card (only shown if multiple equipment are selected) -->
      <EquipmentSelectorCard v-if="inspectionStore.selectedEquipmentList.length > 1" />

      <!-- Subject list card (always shown) -->
      <SubjectListCard />

      <!-- Subject navigation and capture cards (only shown if a subject is selected) -->
      <template v-if="subjectStore.selectedSubject">
        <!-- Photo capture card for the selected subject -->
        <PhotoCaptureCard :subject="subjectStore.selectedSubject" />
        <!-- Notes capture card for the selected subject -->
        <NotesCaptureCard />

        <SubjectCriticality :subject="subjectStore.selectedSubject" />

        <!-- Navigation buttons for moving between subjects -->
        <ion-grid class="ion-no-padding ion-margin-top">
          <ion-row class="ion-align-items-center">
            <ion-col size="6">
              <ion-button
                expand="block"
                fill="outline"
                color="medium"
                @click="subjectStore.goToPreviousSubject()"
                :disabled="!subjectStore.hasPreviousSubject"
              >
                Previous Subject
              </ion-button>
            </ion-col>
            <ion-col size="6">
              <ion-button
                expand="block"
                fill="solid"
                color="secondary"
                @click="subjectStore.goToNextSubject()"
                :disabled="!subjectStore.hasNextSubject"
              >
                Next Subject
              </ion-button>
            </ion-col>
          </ion-row>
        </ion-grid>
      </template>

      <!-- Button to advance to the conclusions step -->
      <ion-button
        expand="block"
        color="primary"
        class="ion-margin-top ion-margin-bottom"
        @click="advanceToNextStep"
        :disabled="!isReadyForConclusions"
      >
        Go to Conclusions
      </ion-button>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonChip, IonButtons, IonMenuButton, IonLabel, IonButton,
  IonGrid, IonRow, IonCol
} from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
// --- Pinia Stores ---
import { useInspectionStore } from '@/stores/inspectionStore';
import { useSubjectStore } from '@/stores/subjectStore';
// --- Import Components ---
import EquipmentSelectorCard from '@/components/EquipementSelectorCard.vue';
import SubjectListCard from '@/components/SubjectListCard.vue';
import PhotoCaptureCard from '@/components/PhotoCaptureCard.vue';
import NotesCaptureCard from '@/components/NotesCaptureCard.vue';
import SubjectCriticality from '@/components/SubjectCriticality.vue';

// Initialize stores and router
const subjectStore = useSubjectStore();
const inspectionStore = useInspectionStore();
const router = useRouter();
const route = useRoute();
// Reactive reference for the inspection title
const inspectionTitle = ref('Loading...');
// Path for the next step in the inspection workflow
const nextReportStepPath = '/inspection-conclusion';

/**
 * Computed property to determine if the "Go to Conclusions" button should be enabled.
 * Currently checks if an equipment has been selected.
 * We need to check if all subjects are marked as complete.
 */
const isReadyForConclusions = computed(() => {
    return !!subjectStore.selectedEquipment.id;
});

/**
 * Lifecycle hook to load inspection data and initialize the SubjectStore.
 * Runs when the component is mounted.
 */
onMounted(() => {
    const inspectionIdParam = route.params.id;

    if (inspectionIdParam) {
        const inspectionId = Number(inspectionIdParam);
        // 1. Load inspection progress (sets activeInspection and currentStepId)
        inspectionStore.loadInspectionProgress(inspectionId);
        // 2. Access the list of selected equipment IDs via the inspection object
        const inspection = inspectionStore.inspections.find(i => i.id === inspectionId);

        if (inspection) {
            inspectionTitle.value = inspection.title;
            const selectedEquipmentIds = inspection.equipmentIds;

            if (selectedEquipmentIds.length > 0) {
                // Initialize the subject store with the first selected equipment
                // This loads the necessary subjects into SubjectListCard.
                subjectStore.loadEquipmentById(selectedEquipmentIds[0]);
            }
        }
    }
});

/**
 * Handles the transition from Observations to the Conclusions step.
 * Updates the inspection's saved progress and navigates the router.
 */
const advanceToNextStep = () => {
    const inspectionIdParam = route.params.id;
    const nextStep = inspectionStore.reportSteps.find(s => s.path === nextReportStepPath);
    if (inspectionIdParam && nextStep) {
        const inspectionId = Number(inspectionIdParam);
        // Save the new step ID to the inspection record in the store
        inspectionStore.updateInspectionProgress(inspectionId, nextStep.id);
    }

    // Update the local currentStepId in the store (using the generic action)
    inspectionStore.goToNextStep();

    // Navigate to the next view
    router.push(`${nextReportStepPath}/${inspectionIdParam}`);
};
</script>

<style scoped>
/* Scoped styles for this component */
</style>
