<template>
  <!--
    Main page container with padding and bottom margin.
    This is the root container for the final review page.
  -->
  <ion-page class="ion-padding ion-margin-bottom">
    <ion-header>
      <!--
        Header section with toolbar for navigation and title.
        Contains back button, page title, and site information.
      -->
      <ion-toolbar>
        <ion-buttons slot="start">
          <!-- Back button with default navigation to inspection conclusions -->
          <ion-back-button default-href="/inspection-conclusions/:id"></ion-back-button>
        </ion-buttons>
        <!-- Page title with dynamic inspection title -->
        <ion-title>Final Review: {{ inspectionTitle }}</ion-title>
        <!-- Site information chip, displays the site name or 'N/A' if not available -->
        <ion-chip slot="end" outline>
          <ion-label>Site: {{ inspectionStore.activeInspection.siteName || 'N/A' }}</ion-label>
        </ion-chip>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding ion-margin-bottom">
      <!-- Loading state: shown while data is being fetched -->
      <ion-item v-if="isLoading">
        <ion-label class="ion-text-center">Loading review data...</ion-label>
      </ion-item>
      <!-- Error state: shown if there is an error loading data -->
      <ion-item v-else-if="errorMessage">
        <ion-label class="ion-text-center">{{ errorMessage }}</ion-label>
      </ion-item>
      <!-- Main content: shown when data is loaded and there are no errors -->
      <template v-else>
        <!-- Section title for the final review and submission -->
        <h1 class="ion-text-xl font-bold mb-4">5. Final Review and Submission</h1>
        <p class="mb-6 text-gray-600">Please review the entire report before proceeding to signature and final submission.</p>

        <!-- Section A: Summary of observations and conclusions for each equipment and subject -->
        <h2 class="ion-text-lg font-bold mt-8 mb-4">A. Summary of Observations & Conclusions</h2>

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
                
                <!-- Subject card content reorganized in 3 main sections: Photos, Observations, Recommendations -->
                <ion-card-content class="space-y-6">
                  
                  <!-- SECTION 1: PHOTOS WITH METADATA - SMALL SIZE -->
                  <!-- Display all photos with metadata boxes above each image -->
                  <div v-if="getSubjectPhotos(subject.id).length > 0" class="photo-section">
                    <p class="section-title">
                      <ion-icon :icon="cameraOutline" class="section-icon"></ion-icon> 
                      Photos ({{ getSubjectPhotos(subject.id).length }})
                    </p>
                    <!-- Grid layout: 3 columns on desktop for smaller photos, 2 on tablet, 1 on mobile -->
                    <div class="photos-grid">
                      <!-- Loop through each photo with metadata space -->
                      <div
                        v-for="(photoRecord, index) in getSubjectPhotos(subject.id)"
                        :key="index"
                        class="photo-item-container"
                      >
                        <!-- Metadata box above photo: displays photo number and date -->
                        <div class="photo-metadata">
                          <p class="photo-number">Photo {{ index + 1 }}</p>
                          <p class="photo-date">{{ new Date().toLocaleDateString() }}</p>
                        </div>
                        <!-- Photo image - VERY SMALL -->
                        <img
                          :src="photoRecord.base64OrWebPath"
                          alt="Subject Photo"
                          class="photo-thumbnail"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- SECTION 2: OBSERVATIONS (NOTES) - VERY LARGE TEXT -->
                  <!-- Display captured notes for this subject -->
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

                  <!-- SECTION 3: RECOMMENDATIONS - VERY LARGE TEXT -->
                  <!-- Display recommendations parsed as bullet points -->
                  <div class="text-section">
                    <p class="section-title recommendations-title">
                      <ion-icon :icon="checkmarkCircleOutline" class="section-icon"></ion-icon> 
                      Recommandations
                    </p>
                    <!-- Green-highlighted box with left border accent -->
                    <div class="content-box recommendations-box">
                      <!-- Parse conclusion text into bullet points for better readability -->
                      <ul class="recommendations-list" v-if="inspectionStore.getSubjectConclusion(subject.id)">
                        <li v-for="(rec, idx) in parseRecommendations(inspectionStore.getSubjectConclusion(subject.id))" :key="idx" class="recommendation-item">
                          {{ rec }}
                        </li>
                      </ul>
                      <p class="large-text placeholder-text" v-else>
                        Aucune recommandation enregistrée.
                      </p>
                    </div>
                  </div>

                  <!-- SECTION 4 (OPTIONAL): AUDIO RECORDINGS -->
                  <!-- Display audio recordings with playback buttons if available -->
                  <div v-if="getSubjectRecordings(subject.id).length > 0" class="text-section">
                    <p class="section-title">
                      <ion-icon :icon="micOutline" class="section-icon"></ion-icon> 
                      Enregistrements Audio ({{ getSubjectRecordings(subject.id).length }})
                    </p>
                    <!-- Full-width buttons for each audio recording -->
                    <div class="audio-buttons">
                      <ion-button
                        v-for="(audio, index) in getSubjectRecordings(subject.id)"
                        :key="index"
                        size="large"
                        fill="outline"
                        color="secondary"
                        @click="playAudio(audio.permanentUri)"
                        expand="block"
                        class="audio-button"
                      >
                        <ion-icon :icon="playCircleOutline" slot="start" class="audio-icon"></ion-icon>
                        Lecture {{ index + 1 }}
                      </ion-button>
                    </div>
                  </div>

                </ion-card-content>
              </ion-card>
            </div>
          </div>
        </div>

        <!-- Section B: General conclusions and recommendations for the entire inspection -->
        <h2 class="ion-text-lg font-bold mt-8 mb-4">B. General Conclusions & Recommendations</h2>
        <div class="content-box general-conclusions-box">
          <!-- Display the final report conclusion or a placeholder if none exists -->
          <p class="large-text whitespace-pre-wrap">{{ inspectionStore.finalReportConclusion || 'No general conclusion recorded.' }}</p>
        </div>

        <!-- Section C: Inspector signature section -->
        <h2 class="ion-text-lg font-bold mt-8 mb-4">C. Inspector Signature</h2>
        <!-- Inspector name input (read-only) -->
        <ion-item fill="outline" class="mb-6">
            <ion-label position="stacked">Inspector Name:</ion-label>
            <ion-input :value="inspectorName" readonly></ion-input>
        </ion-item>
        <!-- Placeholder for the signature component (canvas or image) -->
        <div class="p-4 border-2 border-dashed border-gray-400 rounded-lg h-32 flex items-center justify-center bg-gray-50 mb-8">
            <p class="text-gray-500 italic">Space for Signature Component (Canvas/Image)</p>
        </div>

        <!-- Submit button for the final report -->
        <ion-button
          expand="block"
          color="danger"
          class="ion-margin-top ion-margin-bottom"
          @click="submitFinalReport"
          :disabled="isSubmitting"
        >
          <ion-icon :icon="cloudUploadOutline" slot="start"></ion-icon>
          {{ isSubmitting ? 'Submitting...' : 'Submit Final Report' }}
        </ion-button>

      </template>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
// Import Ionic Vue components for UI
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonChip, IonButtons, IonLabel, IonCard,
  IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonButton, IonIcon, IonItem, IonBackButton, IonInput,
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toastController } from '@ionic/vue';
// Import Ionic icons for UI elements
import {
    listCircleOutline, cameraOutline, micOutline,
    playCircleOutline, checkmarkCircleOutline, cloudUploadOutline
} from 'ionicons/icons';
import { Capacitor } from '@capacitor/core';

// --- Pinia Stores ---
// Import custom Pinia stores for state management
import { useInspectionStore } from '@/stores/inspectionStore';
import { useSubjectStore } from '@/stores/subjectStore';
import { useNotesStore, type AudioRecord } from '@/stores/notesStore';
import { usePhotoStore, type PhotoRecord } from '@/stores/photoStore';

// Initialize stores and router
const subjectStore = useSubjectStore();
const inspectionStore = useInspectionStore();
const notesStore = useNotesStore();
const photoStore = usePhotoStore();
const router = useRouter();
const route = useRoute();

// --- Reactive References ---
// Page title, loading state, error message, submission state, and inspector name
const inspectionTitle = ref('Review');
const isLoading = ref(false);
const errorMessage = ref('');
const isSubmitting = ref(false);
const inspectorName = ref('John Doe (Inspector)'); // Replace with actual user data

// --- Computed Properties ---
// Get the full inspection summary from the subject store
const inspectionSummary = subjectStore.fullInspectionSummary;

// --- Audio Playback Logic ---
// Reference to the HTML audio element for playing recordings
const audioPlayer = ref<HTMLAudioElement | null>(null);

// Function to get or create the audio player element
const getAudioPlayer = () => {
    if (!audioPlayer.value) {
      audioPlayer.value = document.createElement('audio');
    }
    // Set up error handling for audio playback
    audioPlayer.value.onerror = (e) => {
        console.error("Audio playback error:", e);
        showErrorToast('Audio playback failed.');
    };
    return audioPlayer.value;
};

// Function to play an audio recording by URI
const playAudio = (uri: string) => {
    let secureUrl = uri;
    // Convert file URI for native platforms
    if (Capacitor.isNativePlatform()) {
        secureUrl = Capacitor.convertFileSrc(uri);
    }
    const player = getAudioPlayer();
    player.src = secureUrl;

    // Attempt to play the audio and handle success/failure
    player.play()
        .then(() => {
            console.log(`Audio playback started: ${uri}`);
        })
        .catch(error => {
            console.error("Audio playback failed:", error);
            showErrorToast("Audio playback failed. File format or access issue.");
        });
};

// --- Helper Methods ---
// Function to retrieve notes for a subject by ID
const getSubjectNotes = (subjectId: number): string => {
    return notesStore.getNotes(subjectId);
};

// Function to retrieve photos for a subject by ID
const getSubjectPhotos = (subjectId: number): PhotoRecord[] => {
    return photoStore.getPhotos(subjectId);
};

// Function to retrieve audio recordings for a subject by ID
const getSubjectRecordings = (subjectId: number): AudioRecord[] => {
    return notesStore.getRecordings(subjectId);
};

// Function to parse recommendations text into bullet points
// Splits text by periods, semicolons, or line breaks for better presentation
const parseRecommendations = (text: string | undefined): string[] => {
    if (!text) return [];
    // Split by periods, semicolons, or line breaks and filter empty strings
    return text
        .split(/[.;]\s+|\n/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
};

// Function to display an error message as a toast
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
 * Simulates the final submission of the report (uploading data and files).
 * This function handles the submission process, error handling, and success feedback.
 */
const submitFinalReport = async () => {
    isSubmitting.value = true;
    const inspectionId = Number(route.params.id);

    // Validate inspection ID
    if (!inspectionId || isNaN(inspectionId)) {
        showErrorToast('Error: Missing inspection ID.');
        isSubmitting.value = false;
        return;
    }

    try {
        // 1. Mark the inspection as complete in the store (commented out for now)
      //   inspectionStore.finalizeInspection(inspectionId);

        // 2. Simulate API call for upload with a delay
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 3. Display success message to the user
        const successToast = await toastController.create({
            message: 'Report submitted successfully!',
            duration: 5000,
            position: 'top',
            color: 'success',
        });
        await successToast.present();

        // 4. Redirect to the home page after successful submission
        router.replace('/home');

    } catch (error) {
        // Log and display any errors that occur during submission
        console.error('Error submitting report:', error);
        showErrorToast('Failed to submit report. Please try again.');
    } finally {
        // Reset submission state
        isSubmitting.value = false;
    }
};

// --- Lifecycle Hooks ---
// Load inspection data when the component is mounted
onMounted(() => {
    const inspectionIdParam = route.params.id;
    // Validate inspection ID from route params
    if (!inspectionIdParam) {
        errorMessage.value = 'Error: Missing inspection ID in URL.';
        return;
    }
    const inspectionId = Number(inspectionIdParam);

    // Load inspection progress and details
    inspectionStore.loadInspectionProgress(inspectionId);
    const inspection = inspectionStore.inspections.find(i => i.id === inspectionId);

    if (inspection) {
        inspectionTitle.value = inspection.title;
        // Load equipment data if available
        if (inspection.equipmentIds.length > 0) {
             subjectStore.loadEquipmentById(inspection.equipmentIds[0]);
        }
    } else {
        errorMessage.value = 'Inspection not found.';
    }

    // Set the current step in the inspection store
    inspectionStore.setCurrentStepByPath('/inspection-review');
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

.photo-thumbnail {
    width: 100%;
    height: 140px; /* MEDIUM SIZE - 140px */
    object-fit: contain; /* Show full image within frame instead of cropping */
    background-color: #f3f4f6; /* Light gray background for letterboxing */
    border: 1px solid #e5e7eb;
    border-radius: 0 0 0.375rem 0.375rem;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
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
}

.general-conclusions-box {
    background-color: rgba(239, 246, 255, 0.5);
    border-left-color: #3b82f6;
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

.recommendations-list {
    list-style-type: disc;
    list-style-position: inside;
    margin: 0;
    padding: 0;
}

.recommendation-item {
    font-size: 1.25rem; /* 20px - Medium-large */
    line-height: 1.6;
    font-weight: 500;
    margin-bottom: 0.75rem;
}

/* ===== AUDIO SECTION ===== */
.audio-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.audio-button {
    font-size: 1.125rem; /* 18px */
    font-weight: 600;
    --padding-top: 16px;
    --padding-bottom: 16px;
}

.audio-icon {
    font-size: 1.5rem; /* 24px */
}

/* ===== RESPONSIVE DESIGN ===== */
@media (max-width: 768px) {
    .section-title {
        font-size: 1.25rem; /* 20px */
    }
    
    .section-icon {
        font-size: 1.5rem; /* 24px */
    }
    
    .large-text,
    .recommendation-item {
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
    
    .large-text,
    .recommendation-item {
        font-size: 1rem; /* 16px */
    }
}

/* Customize back button icon size */
ion-back-button {
    --icon-font-size: 24px;
}
</style>