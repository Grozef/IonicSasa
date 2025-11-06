<template>
  <!--
    Main page container with padding and bottom margin.
    Conclusions and Recommendations page - Step 4 of inspection workflow.
  -->
  <ion-page class="ion-padding ion-margin-bottom">
    <ion-header>
      <!--
        Header section with toolbar for navigation and title.
        Contains back button, page title, and site information.
      -->
      <ion-toolbar>
        <ion-buttons slot="start">
          <!-- Back button with default navigation to inspection subjects -->
          <ion-back-button default-href="/inspection-subjects/:id"></ion-back-button>
        </ion-buttons>
        <!-- Page title with dynamic inspection title -->
        <ion-title>Conclusions: {{ inspectionTitle }}</ion-title>
        <!-- Site information chip, displays the site name or 'N/A' if not available -->
        <ion-chip slot="end" outline>
          <ion-label>Site: {{ inspectionStore.activeInspection.siteName || 'N/A' }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-margin-bottom">
      <!-- Loading state: shown while data is being fetched -->
      <ion-item v-if="isLoading">
        <ion-label class="ion-text-center">Loading inspection data...</ion-label>
      </ion-item>
      <!-- Error state: shown if there is an error loading data -->
      <ion-item v-else-if="errorMessage">
        <ion-label class="ion-text-center">{{ errorMessage }}</ion-label>
      </ion-item>
      <!-- Main content: shown when data is loaded and there are no errors -->
      <template v-else>
        <!-- Section title for conclusions and recommendations -->
        <h1 class="ion-text-xl font-bold mb-4">4. Conclusions & Recommendations</h1>
        <p class="mb-6 text-gray-600">Review all captured data and provide detailed recommendations for each subject before proceeding to final review.</p>

        <!-- Section A: Summary and recommendations for each equipment and subject -->
        <h2 class="ion-text-lg font-bold mt-8 mb-4">A. Subject Recommendations</h2>

        <!-- Loop through each equipment context in the inspection summary -->
        <div v-if="inspectionSummary.length > 0" class="space-y-8">
          <div v-for="equipmentContext in inspectionSummary" :key="equipmentContext.equipment.id" class="p-4 border-2 border-gray-200 rounded-lg bg-white shadow-md">
            <!-- Equipment header with name and ID -->
            <h3 class="ion-text-base font-extrabold text-primary mb-4 border-b pb-2">
              Equipment: {{ equipmentContext.equipment.name }} ({{ equipmentContext.equipment.id }})
            </h3>
            <!-- Loop through each subject for the current equipment -->
            <div v-if="equipmentContext.subjects.length > 0" class="space-y-6">
              <ion-card v-for="subject in equipmentContext.subjects" :key="subject.id" class="shadow-lg border border-gray-100">
                <!-- Subject card header with name and status -->
                <ion-card-header>
                  <ion-card-title>{{ subject.name }}</ion-card-title>
                  <ion-card-subtitle class="flex items-center space-x-2 flex-wrap">
                    <span class="font-medium text-sm">Criticality:</span>
                    <ion-chip
                      :color="subjectStore.getCriticalityColor(subject.criticality)"
                      class="font-semibold text-xs h-6 px-2"
                      style="min-width: 50px;"
                    >
                      Lvl {{ subject.criticality }}
                    </ion-chip>
                    <span class="font-medium text-sm ml-4">Status:</span>
                    <ion-chip :color="subjectStore.getStatusColor(subject.status)" class="font-semibold text-xs h-6 px-2">
                      {{ subject.status }}
                    </ion-chip>
                  </ion-card-subtitle>
                </ion-card-header>
                
                <!-- Subject card content reorganized in sections matching Review page -->
                <ion-card-content class="space-y-6">
                  
                  <!-- SECTION 1: PHOTOS WITH METADATA - MEDIUM SIZE -->
                  <div v-if="getSubjectPhotos(subject.id).length > 0" class="photo-section">
                    <p class="section-title">
                      <ion-icon :icon="cameraOutline" class="section-icon"></ion-icon> 
                      Photos ({{ getSubjectPhotos(subject.id).length }})
                    </p>
                    <!-- Grid layout: 2 columns with smart last-odd-child behavior -->
                    <div class="photos-grid">
                      <div
                        v-for="(photoRecord, index) in getSubjectPhotos(subject.id)"
                        :key="index"
                        class="photo-item-container"
                      >
                        <!-- Metadata box above photo -->
                        <div class="photo-metadata">
                          <p class="photo-number">Photo {{ index + 1 }}</p>
                          <p class="photo-date">{{ new Date().toLocaleDateString() }}</p>
                        </div>
                        <!-- Photo image - MEDIUM SIZE with delete button -->
                        <div class="photo-wrapper">
                          <img
                            :src="photoRecord.base64OrWebPath"
                            alt="Subject Photo"
                            class="photo-thumbnail"
                          />
                          <ion-button 
                            size="small"
                            color="danger"
                            class="delete-overlay-button"
                            @click="deletePhoto(subject.id, photoRecord.base64OrWebPath)"
                          >
                            <ion-icon :icon="trashOutline" size="small"></ion-icon>
                          </ion-button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- SECTION 2: OBSERVATIONS (NOTES) - LARGE TEXT -->
                  <div class="text-section">
                    <p class="section-title">
                      <ion-icon :icon="listCircleOutline" class="section-icon"></ion-icon> 
                      Observations
                    </p>
                    <!-- Blue-highlighted box with left border accent -->
                    <div class="content-box observations-box">
                      <p class="large-text" v-if="getSubjectNotes(subject.id)">{{ getSubjectNotes(subject.id) }}</p>
                      <p class="large-text placeholder-text" v-else>Aucune observation enregistrée.</p>
                    </div>
                  </div>

                  <!-- SECTION 3: AUDIO RECORDINGS -->
                  <div v-if="getSubjectRecordings(subject.id).length > 0" class="text-section">
                    <p class="section-title">
                      <ion-icon :icon="micOutline" class="section-icon"></ion-icon> 
                      Enregistrements Audio ({{ getSubjectRecordings(subject.id).length }})
                    </p>
                    <!-- Full-width buttons for each audio recording with delete option -->
                    <div class="audio-buttons">
                      <div v-for="(audio, index) in getSubjectRecordings(subject.id)" :key="index" class="audio-item">
                        <ion-button
                          size="large"
                          fill="outline"
                          color="secondary"
                          @click="playAudio(audio.permanentUri)"
                          expand="block"
                          class="audio-button"
                        >
                          <ion-icon :icon="playCircleOutline" slot="start" class="audio-icon"></ion-icon>
                          Lecture {{ index + 1 }}
                          <span class="text-xs ml-auto opacity-70">
                            ({{ new Date(audio.timestamp).toLocaleTimeString() }})
                          </span>
                        </ion-button>
                        <ion-button 
                          size="small" 
                          color="danger" 
                          fill="clear"
                          @click="deleteAudio(subject.id, audio.permanentUri)"
                          class="delete-audio-button"
                        >
                          <ion-icon :icon="trashOutline"></ion-icon>
                        </ion-button>
                      </div>
                    </div>
                  </div>

                  <!-- SECTION 4: RECOMMENDATIONS INPUT - EDITABLE AREA -->
                  <div class="text-section">
                    <p class="section-title recommendations-title">
                      <ion-icon :icon="checkmarkCircleOutline" class="section-icon"></ion-icon> 
                      Recommandations
                      <span v-if="isMandatorySubject(subject.id)" class="mandatory-badge">
                        * Obligatoire
                      </span>
                    </p>
                    <!-- Green-highlighted editable textarea -->
                    <div class="content-box recommendations-box">
                      <ion-textarea
                        placeholder="Entrez vos recommandations détaillées ici (minimum 10 caractères)..."
                        :rows="4"
                        :auto-grow="true"
                        fill="solid"
                        class="recommendations-textarea"
                        :value="inspectionStore.getSubjectConclusion(subject.id)"
                        @ionInput="onSubjectConclusionChange(subject.id, ($event.target as HTMLIonTextareaElement).value || '')"
                      ></ion-textarea>
                      
                      <!-- Validation indicator -->
                      <div 
                        v-if="isMandatorySubject(subject.id)" 
                        :class="{'validation-error': !isSubjectConclusionValid(subject.id), 'validation-success': isSubjectConclusionValid(subject.id)}"
                        class="validation-message"
                      >
                        <ion-icon :icon="isSubjectConclusionValid(subject.id) ? checkmarkCircleOutline : closeCircleOutline"></ion-icon>
                        {{ isSubjectConclusionValid(subject.id) ? 'Recommandation complète' : 'Recommandation manquante ou trop courte (min. 10 caractères)' }}
                      </div>
                    </div>
                  </div>

                </ion-card-content>
              </ion-card>
            </div>
            
            <div v-else class="ion-text-center ion-padding">
              <p class="text-md text-gray-400">Aucun sujet défini pour cet équipement.</p>
            </div>
          </div>
        </div>
        <div v-else class="ion-text-center ion-padding">
          <p class="text-lg text-gray-500">Aucun équipement sélectionné pour cette inspection.</p>
        </div>

        <!-- Section B: General conclusions and recommendations -->
        <h2 class="ion-text-lg font-bold mt-8 mb-4">B. Conclusions Générales</h2>
        <div class="content-box general-conclusions-box">
          <ion-textarea
            placeholder="Entrez la conclusion générale et les actions nécessaires (minimum 10 caractères)..."
            :rows="6"
            :auto-grow="true"
            fill="solid"
            class="general-textarea"
            :value="finalConclusion"
            @ionInput="inspectionStore.setFinalReportConclusion(($event.target as HTMLIonTextareaElement).value || '')"
          ></ion-textarea>
          
          <!-- Validation indicator for general conclusion -->
          <div 
            :class="{'validation-error': !isFinalConclusionValid, 'validation-success': isFinalConclusionValid}"
            class="validation-message"
          >
            <ion-icon :icon="isFinalConclusionValid ? checkmarkCircleOutline : closeCircleOutline"></ion-icon>
            {{ isFinalConclusionValid ? 'Conclusion générale complète' : 'Conclusion manquante ou trop courte (min. 10 caractères)' }}
          </div>
        </div>

        <!-- Warning box if validation incomplete -->
        <div v-if="!isReadyForReview" class="warning-box">
          <div class="warning-header">
            <ion-icon :icon="warningOutline" class="warning-icon"></ion-icon>
            <span class="warning-title">Validation requise</span>
          </div>
          <ul class="warning-list">
            <li>Tous les sujets <strong>obligatoires</strong> doivent avoir une recommandation d'au moins <strong>10 caractères</strong>.</li>
            <li>La section <strong>"Conclusions Générales"</strong> doit contenir au moins <strong>10 caractères</strong>.</li>
          </ul>
        </div>

        <!-- Proceed to Review button -->
        <ion-button
          expand="block"
          color="success"
          size="large"
          class="ion-margin-top ion-margin-bottom proceed-button"
          @click="goToReview"
        >
          <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
          Procéder à la Révision Finale
        </ion-button>
      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonChip, IonButtons, IonBackButton, IonLabel, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, IonTextarea, IonItem, alertController, toastController,
} from '@ionic/vue';
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { 
    listCircleOutline, cameraOutline, micOutline, 
    playCircleOutline, trashOutline, checkmarkCircleOutline,
    closeCircleOutline, warningOutline, arrowForwardOutline
} from 'ionicons/icons';

// --- Pinia Stores ---
import { useInspectionStore } from '@/stores/inspectionStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useNotesStore, type AudioRecord } from '@/stores/notesStore';
import { usePhotoStore, type PhotoRecord } from '@/stores/photoStore';

import { Capacitor } from '@capacitor/core';

// Initialize stores and router
const subjectStore = useSubjectStore();
const inspectionStore = useInspectionStore();
const notesStore = useNotesStore();
const photoStore = usePhotoStore();
const router = useRouter();
const route = useRoute();

// Reactive references
const inspectionTitle = ref('Loading...');
const isLoading = ref(false);
const errorMessage = ref('');
const currentInspectionId = ref<number | null>(null);
const audioPlayer = ref<HTMLAudioElement | null>(null);

/**
 * Initializes or returns the existing HTMLAudioElement for playback.
 * Includes error handling for audio playback.
 * @returns The HTMLAudioElement.
 */
const getAudioPlayer = () => {
    if (!audioPlayer.value) {
        audioPlayer.value = document.createElement('audio');
    }
    audioPlayer.value.onerror = (e) => {
        console.error("Audio playback error:", e);
        showErrorToast('Audio playback failed. Invalid URL or missing permission.');
    };
    return audioPlayer.value;
};

// =================================================================
// --- COMPUTED PROPERTIES ---
// =================================================================

/**
 * Returns the full inspection summary with all equipment and subjects.
 */
const inspectionSummary = computed(() => {
    return subjectStore.fullInspectionSummary;
});

/**
 * Returns the final conclusion text bound to the textarea.
 */
const finalConclusion = computed({
    get: () => inspectionStore.finalReportConclusion,
    set: (val) => inspectionStore.setFinalReportConclusion(val)
});

/**
 * Validates that the final conclusion is at least 10 characters long.
 */
const isFinalConclusionValid = computed(() => {
    return finalConclusion.value.trim().length >= 10;
});

/**
 * Checks whether all mandatory subjects have valid conclusions (>= 10 chars).
 */
const allMandatorySubjectsValid = computed(() => {
    const allSubjects = subjectStore.allInspectionSubjects;
    for (const equipmentContext of inspectionSummary.value) {
        for (const subject of equipmentContext.subjects) {
            const masterData = allSubjects.find((s: any) => s.id === subject.id);
            if (masterData && masterData.isMandatory) {
                const conclusion = inspectionStore.getSubjectConclusion(subject.id) || '';
                if (conclusion.trim().length < 10) {
                    return false;
                }
            }
        }
    }
    return true;
});

/**
 * Returns true if both the mandatory subjects and final conclusion are valid.
 */
const isReadyForReview = computed(() => {
    return allMandatorySubjectsValid.value && isFinalConclusionValid.value;
});

// =================================================================
// --- HELPER METHODS ---
// =================================================================

/**
 * Checks if a subject is marked as mandatory based on the allInspectionSubjects.
 * @param subjectId - The ID of the subject to check.
 * @returns True if the subject is mandatory, false otherwise.
 */
const isMandatorySubject = (subjectId: number): boolean => {
    const master = subjectStore.allInspectionSubjects.find((s: any) => s.id === subjectId);
    return master?.isMandatory ?? false;
};

/**
 * Validates if a subject conclusion meets the minimum character requirement (10 characters).
 * @param subjectId - The ID of the subject to validate.
 * @returns True if the conclusion is valid, false otherwise.
 */
const isSubjectConclusionValid = (subjectId: number): boolean => {
    const conclusion = inspectionStore.getSubjectConclusion(subjectId) || '';
    return conclusion.trim().length >= 10;
};

/**
 * Handles the input event from the subject conclusion textarea.
 * @param subjectId - The ID of the subject being edited.
 * @param value - The new value from the textarea.
 */
const onSubjectConclusionChange = (subjectId: number, value: string) => {
    inspectionStore.setSubjectConclusion(subjectId, value);
};

/**
 * Retrieves the text notes for a given subject.
 * @param subjectId - The ID of the subject.
 * @returns The note text or an empty string if no notes exist.
 */
const getSubjectNotes = (subjectId: number): string => {
    return notesStore.getNotes(subjectId);
};

/**
 * Retrieves all photos for a given subject.
 * @param subjectId - The ID of the subject.
 * @returns An array of PhotoRecord objects.
 */
const getSubjectPhotos = (subjectId: number): PhotoRecord[] => {
    return photoStore.getPhotos(subjectId);
};

/**
 * Retrieves all audio recordings for a given subject.
 * @param subjectId - The ID of the subject.
 * @returns An array of AudioRecord objects.
 */
const getSubjectRecordings = (subjectId: number): AudioRecord[] => {
    return notesStore.getRecordings(subjectId);
};

/**
 * Shows an error toast message.
 * @param message - The error message to display.
 */
const showErrorToast = async (message: string) => {
    const toast = await toastController.create({
        message,
        duration: 3000,
        position: 'bottom',
        color: 'danger',
    });
    await toast.present();
};

/**
 * Plays the audio recording from its permanent URI.
 * Uses Capacitor's secure file path conversion for native platforms.
 * @param uri - The permanent URI of the audio file (e.g., capacitor://... or a web path)
 */
const playAudio = (uri: string) => {
    let secureUrl = uri;
    if (Capacitor.isNativePlatform()) {
        secureUrl = Capacitor.convertFileSrc(uri);
    }

    const player = getAudioPlayer();
    player.src = secureUrl;

    player.play()
        .then(() => {
            console.log(`Audio playback started: ${uri}`);
        })
        .catch(error => {
            console.error("Audio playback failed:", error);
            showErrorToast("Audio playback failed. Format or access issue.");
        });
};

// =================================================================
// --- DELETION METHODS ---
// =================================================================

/**
 * Handles confirmation and calls the Pinia action to delete a permanent audio recording.
 * @param subjectId - The ID of the subject.
 * @param uri - The permanent URI of the audio file to delete.
 */
const deleteAudio = async (subjectId: number, uri: string) => {
    const alert = await alertController.create({
        header: 'Confirm Deletion',
        message: 'Are you sure you want to delete this audio recording? This action is irreversible.',
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Delete',
                role: 'destructive',
                handler: () => {
                    // Pass the subjectId to removePermanentRecording
                    notesStore.removePermanentRecording(uri, subjectId);
                    console.log(`Audio deleted from Subject ${subjectId}: ${uri}`);
                },
            },
        ],
    });
    await alert.present();
};

/**
 * Handles confirmation and calls the Pinia action to delete a photo record.
 * @param subjectId - The ID of the subject.
 * @param uri - The webPath or Base64 of the photo to delete.
 */
const deletePhoto = async (subjectId: number, uri: string) => {
    const alert = await alertController.create({
        header: 'Confirm Deletion',
        message: 'Are you sure you want to delete this photo? This will remove the photo record and attempt to delete the physical file.',
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Delete',
                role: 'destructive',
                handler: () => {
                    // Pass the subjectId to removePhoto
                    photoStore.removePhoto(uri, subjectId);
                    console.log(`Photo deletion initiated for Subject ${subjectId}: ${uri}`);
                },
            },
        ],
    });
    await alert.present();
};

/**
 * Navigates to the review and submission page, saving all data beforehand.
 */
const goToReview = () => {
    const inspectionIdFromStore = inspectionStore.activeInspection.id;
    const nextReportStepPath = '/inspection-review';

    const nextStep = inspectionStore.reportSteps.find(s => s.path === nextReportStepPath);
    if (inspectionIdFromStore !== null && nextStep) {

        // 1. Save all current conclusions and final report text
        inspectionStore.saveAllConclusions();

        // 2. Update inspection progress to the next step
        inspectionStore.updateInspectionProgress(inspectionIdFromStore, nextStep.id);

        // 3. Update the local step tracking
        inspectionStore.setCurrentStepByPath(nextReportStepPath);

        // 4. Navigate
        router.push(`${nextReportStepPath}/${inspectionIdFromStore}`);

    } else {
        showErrorToast('Cannot advance to review: Invalid inspection or step (missing ID)');
    }
};

// --- Lifecycle Hooks ---
onMounted(() => {
    const inspectionIdParam = route.params.id;
    if (!inspectionIdParam) return;
    const inspectionId = Number(inspectionIdParam);

    if (inspectionId && !isNaN(inspectionId)) {
        currentInspectionId.value = inspectionId;
        
        // Load active inspection data
        inspectionStore.loadInspectionProgress(inspectionId);
        
        const inspection = inspectionStore.inspections.find(i => i.id === inspectionId);
        
        if (inspection) {
            inspectionTitle.value = inspection.title;
            // Load subjects for ALL selected equipment
            inspection.equipmentIds.forEach(eqId => {
                subjectStore.loadEquipmentById(eqId); 
            });
        }
        // Set the current step to this page
        inspectionStore.setCurrentStepByPath('/inspection-conclusion');
    }
});
</script>

<style scoped>
/* ===== PHOTOS SECTION - MEDIUM SIZE WITH SMART LAYOUT ===== */
.photo-section {
    margin-bottom: 2rem;
}

.photos-grid {
    display: grid;
    gap: 0.75rem;
    grid-template-columns: repeat(2, 1fr); /* Default: 2 columns */
}

/* When there's an odd number of photos, the last one spans full width */
.photos-grid .photo-item-container:nth-child(odd):last-child {
    grid-column: 1 / -1; /* Last odd photo takes full width */
}

.photo-item-container {
    display: flex;
    flex-direction: column;
}

.photo-metadata {
    background-color: #f9fafb;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-bottom: none;
    border-radius: 0.375rem 0.375rem 0 0;
    min-height: 50px;
}

.photo-number {
    font-size: 0.875rem; /* 14px */
    font-weight: 700;
    color: #374151;
    margin: 0;
}

.photo-date {
    font-size: 0.75rem; /* 12px */
    color: #6b7280;
    margin: 0;
}

.photo-wrapper {
    position: relative;
}

.photo-thumbnail {
    width: 100%;
    height: 140px; /* MEDIUM SIZE - 140px */
    object-fit: contain; /* Show full image within frame instead of cropping */
    background-color: #f3f4f6; /* Light gray background for letterboxing */
    border: 1px solid #e5e7eb;
    border-radius: 0 0 0.375rem 0.375rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.delete-overlay-button {
    position: absolute;
    top: 4px; 
    right: 4px; 
    height: 28px; 
    width: 28px; 
    margin: 0;
    --padding-start: 0;
    --padding-end: 0;
    z-index: 10;
}

/* ===== TEXT SECTIONS - MEDIUM-LARGE ===== */
.text-section {
    margin-top: 2rem;
}

.section-title {
    font-size: 1.5rem; /* 24px - Medium-large */
    font-weight: 700;
    color: #1f2937;
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.75rem;
    border-bottom: 2px solid #e5e7eb;
}

.section-title.recommendations-title {
    color: #16a34a;
}

.mandatory-badge {
    font-size: 0.875rem;
    font-weight: 600;
    color: #dc2626;
    margin-left: auto;
    padding: 0.25rem 0.75rem;
    background-color: #fee2e2;
    border-radius: 0.375rem;
}

.section-icon {
    font-size: 1.875rem; /* 30px - Medium-large icon */
    margin-right: 0.75rem;
}

.content-box {
    padding: 1.25rem;
    border-radius: 0.5rem;
    border-left: 4px solid;
}

.observations-box {
    background-color: rgba(239, 246, 255, 0.5);
    border-left-color: #3b82f6;
}

.recommendations-box {
    background-color: rgba(240, 253, 244, 0.5);
    border-left-color: #16a34a;
    padding: 0.5rem;
}

.general-conclusions-box {
    background-color: rgba(239, 246, 255, 0.5);
    border-left-color: #3b82f6;
    padding: 0.5rem;
}

.large-text {
    font-size: 1.25rem; /* 20px - Medium-large */
    line-height: 1.6;
    font-weight: 500;
    margin: 0;
}

.placeholder-text {
    font-style: italic;
    color: #9ca3af;
}

/* ===== TEXTAREAS ===== */
.recommendations-textarea,
.general-textarea {
    --background: white;
    --border-radius: 0.375rem;
    --padding-start: 1rem;
    --padding-end: 1rem;
    --padding-top: 0.75rem;
    --padding-bottom: 0.75rem;
    font-size: 1.125rem;
    font-weight: 500;
}

/* ===== VALIDATION MESSAGES ===== */
.validation-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 600;
}

.validation-success {
    background-color: #d1fae5;
    color: #065f46;
}

.validation-error {
    background-color: #fee2e2;
    color: #991b1b;
}

.validation-message ion-icon {
    font-size: 1.25rem;
}

/* ===== WARNING BOX ===== */
.warning-box {
    margin-top: 2rem;
    padding: 1rem;
    background-color: #fef3c7;
    border-left: 4px solid #f59e0b;
    border-radius: 0.5rem;
}

.warning-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
}

.warning-icon {
    font-size: 1.5rem;
    color: #d97706;
}

.warning-title {
    font-size: 1rem;
    font-weight: 700;
    color: #92400e;
}

.warning-list {
    list-style-type: disc;
    list-style-position: inside;
    margin: 0;
    padding-left: 1rem;
    color: #92400e;
    font-size: 0.875rem;
}

.warning-list li {
    margin-bottom: 0.5rem;
}

/* ===== AUDIO SECTION ===== */
.audio-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.audio-item {
    display: flex;
    gap: 0.5rem;
    align-items: center;
}

.audio-button {
    font-size: 1.125rem; /* 18px */
    font-weight: 600;
    --padding-top: 16px;
    --padding-bottom: 16px;
    flex: 1;
}

.delete-audio-button {
    --padding-start: 8px;
    --padding-end: 8px;
}

.audio-icon {
    font-size: 1.5rem; /* 24px */
}

/* ===== PROCEED BUTTON ===== */
.proceed-button {
    font-size: 1.125rem;
    font-weight: 700;
    --padding-top: 18px;
    --padding-bottom: 18px;
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
    .section-title {
        font-size: 1.25rem; /* 20px */
    }
    
    .section-icon {
        font-size: 1.5rem; /* 24px */
    }
    
    .large-text {
        font-size: 1.125rem; /* 18px */
    }
    
    .photo-thumbnail {
        height: 120px; /* Slightly smaller on tablets */
    }
}

@media (max-width: 480px) {
    /* Keep 2-column grid with last odd photo full-width on mobile */
    .photos-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .photos-grid .photo-item-container:nth-child(odd):last-child {
        grid-column: 1 / -1;
    }
    
    .photo-thumbnail {
        height: 100px; /* Smaller on mobile */
    }
    
    .section-title {
        font-size: 1.125rem; /* 18px */
    }
    
    .large-text {
        font-size: 1rem; /* 16px */
    }
}

/* Customize back button icon size */
ion-back-button {
    --icon-font-size: 24px;
}
</style>