<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Inspection Notes</ion-card-title>
      <ion-card-subtitle v-if="subjectStore.selectedSubject">
        Notes for: {{ subjectStore.selectedSubject.name }}
      </ion-card-subtitle>
    </ion-card-header>
    <ion-card-content>
      <ion-textarea v-model="notes" label="Notes" label-placement="stacked"
        placeholder="Add notes here manually, or use the microphone for speech-to-text." auto-grow
        :rows="4"></ion-textarea>

      <ion-item lines="none" v-if="detectedText">
        <ion-label color="secondary" class="ion-text-wrap">
          Last recognition: <strong>{{ detectedText }}</strong>
        </ion-label>
      </ion-item>

      <ion-grid class="ion-padding-top ion-no-padding-bottom">
        <ion-row>
          <ion-col size="6">
            <ion-button expand="block" :color="isListening ? 'danger' : 'primary'" :disabled="isRecording"
              @click="isListening ? stopSpeechToText() : startSpeechToText(true)" class="action-button">
              <ion-icon :icon="micOutline" slot="start"></ion-icon>
              {{ isListening ? 'Stop Speech To Text' : 'Start Speech To Text' }}
            </ion-button>
          </ion-col>

          <ion-col size="6">
            <ion-button expand="block" :color="isRecording ? 'danger' : 'secondary'" :disabled="isListening"
              @click="isRecording ? stopRecord() : startRecord()" class="action-button">
              <ion-icon :icon="micOutline" slot="start"></ion-icon>
              {{ isRecording ? 'Stop Recording Audio' : 'Start Audio Recording' }}
            </ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>

      <ion-grid>
        <ion-row class="ion-padding-top">
          <ion-col size="12" class="ion-align-items-center ion-justify-content-between">
            <ion-text color="medium" style="display: inline-block;">
              <h3>Recordings ({{ currentRecordings.length }})</h3>
            </ion-text>
            <ion-button size="small" fill="outline" color="medium" @click="forceRefreshList()" style="float: right;">
              Refresh List
            </ion-button>
          </ion-col>

          <ion-col size="12" :key="recordingsKey" v-if="currentRecordings.length > 0">
            <ion-item lines="full" v-for="(record, index) in currentRecordings" :key="record.permanentUri">
              <ion-label class="ion-text-wrap">
                <p>Recorded at: {{ new Date(record.timestamp).toLocaleTimeString() }}</p>
                <strong>{{ record.permanentUri.split('/').pop() }}</strong>
              </ion-label>

              <ion-button slot="end" size="small" fill="outline" :disabled="isListening || isRecording"
                @click="playAudio(record.permanentUri)">
                Play
              </ion-button>

              <ion-button slot="end" size="small" color="danger" fill="clear" :disabled="isListening || isRecording"
                @click="deleteRecording(record.permanentUri)">
                <ion-icon :icon="trashOutline" slot="icon-only"></ion-icon>
              </ion-button>

            </ion-item>
          </ion-col>

          <ion-col size="12" v-if="currentRecordings.length === 0">
            <ion-text color="medium">
              <p>No audio recordings found for this subject.</p>
            </ion-text>
          </ion-col>
        </ion-row>
      </ion-grid>

    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonTextarea,
  IonItem, IonLabel, IonButton, IonIcon, alertController, IonGrid, IonRow, IonCol,
  toastController, IonText, 
} from '@ionic/vue';
import { ref, nextTick, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { micOutline, trashOutline } from 'ionicons/icons';
// Capacitor Plugins
import { SpeechRecognition } from '@capacitor-community/speech-recognition';
import { VoiceRecorder } from 'capacitor-voice-recorder';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences'; // <-- ADDED: For language setting

// Stores 
import { useNotesStore } from '@/stores/notesStore';
import { useSubjectStore } from '@/stores/subjectStore';
// this is a static list of technical terms
import { TECHNICAL_TERMS } from '@/utils/technicalVocabulary'; 

// --- Constants ---
const LANGUAGE_PREF_KEY = 'speech_recognition_language';

// --- State Management (Pinia) ---
const notesStore = useNotesStore();
const subjectStore = useSubjectStore();
const {
  currentNotes: notes,
  detectedText,
  currentRecordings
} = storeToRefs(notesStore);

// --- Local UI State ---
const isListening = ref(false);
const isRecording = ref(false);
const audioPlayer = ref<HTMLAudioElement | null>(null);
const recordingsKey = ref(0); // Key for forced list refresh
const preferredLanguage = ref('fr-FR'); // Will be loaded from preferences

// Function to force the list refresh
const forceRefreshList = async () => {
  recordingsKey.value++; // Increment the key to force Vue to re-create the list
  const toast = await toastController.create({
    message: 'Recording list refreshed.',
    duration: 1500,
    color: 'medium'
  });
  toast.present();
};

/**
 * Loads the user's preferred language from the Preferences store.
 * Uses 'fr-FR' as a fallback if no setting is found.
 */
const loadPreferredLanguage = async () => {
  try {
    const result = await Preferences.get({ key: LANGUAGE_PREF_KEY });
    if (result.value) {
      preferredLanguage.value = result.value;
      console.log(`STT language set to: ${preferredLanguage.value}`);
    }
  } catch (e) {
    console.error('Error loading language preference:', e);
  }
};


// --- Capacitor Permissions Reference ---
// Note: Direct access to plugins via (Capacitor as any).Plugins is the legacy way.
// It's cleaner to import and use the dedicated Permissions plugin package.
const PermissionsPlugin = (Capacitor as any).isPluginAvailable('Permissions')
  ? (Capacitor as any).Plugins.Permissions
  : null;

// =========================================================================
// PERMISSION & STT FUNCTIONS
// =========================================================================

/**
 * Checks and requests microphone permission (required for both STT and Voice Recorder).
 */
const checkMicrophonePermission = async (): Promise<boolean> => {
  if (!PermissionsPlugin) return true; // Allows web/unsupported environments

  try {
    const permissionName = 'microphone' as any;
    let { state } = await PermissionsPlugin.query({ name: permissionName });

    if (state !== 'granted') {
      const result = await PermissionsPlugin.request({ name: permissionName });
      state = result.state;

      if (state !== 'granted') {
        const alert = await alertController.create({
          header: 'Permission Required',
          message: 'You must grant microphone access for voice functions.',
          buttons: ['OK'],
        });
        await alert.present();
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error requesting permission:', error);
    return false;
  }
};

/**
 * Stops the speech-to-text recognition process manually.
 */
const stopSpeechToText = async () => {
  if (isListening.value) {
    try {
      await SpeechRecognition.stop();
      isListening.value = false;
      notesStore.setDetectedText('Recognition cancelled.');
    } catch (error) {
      console.error('Error stopping recognition:', error);
      isListening.value = false;
    }
  }
};

/**
 * Starts speech-to-text recognition.
 */
const startSpeechToText = async (showValidationAlert: boolean) => {
  notesStore.setDetectedText('');

  if (isRecording.value) {
    console.warn('Cannot start STT while audio recording is active.');
    return;
  }

  try {
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) return;

    const { available } = await SpeechRecognition.available();
    if (!available) {
      const alert = await alertController.create({
        header: 'Recognition Unavailable',
        message: 'Speech recognition is not available on this device.',
        buttons: ['OK'],
      });
      await alert.present();
      return;
    }

    isListening.value = true;

    // Use the loaded language preference
    const options = {
      language: preferredLanguage.value, // <-- CORRECTION: Using loaded preference
      maxResults: 1,
      prompt: 'Speak now...',
      contextualStrings: TECHNICAL_TERMS,
    };

    const { matches } = await SpeechRecognition.start(options as any);
    isListening.value = false;

    if (matches && matches.length > 0) {
      let recognizedText = matches[0];

      // --- POST-PROCESSING (Filtering filler words) ---
      const termsToFilter = /(\s*(et alors|du coup|en fait|quoi|ben|bah|euh|euuuh|hum|hummm)[\s,.?!]*)/gi;
      recognizedText = recognizedText.replace(termsToFilter, '').trim().replace(/\s\s+/g, ' ');

      if (recognizedText.length === 0) {
        notesStore.setDetectedText('No meaningful speech recognized.');
        return;
      }

      // Basic capitalization and punctuation for notes
      recognizedText = recognizedText.charAt(0).toUpperCase() + recognizedText.slice(1);
      if (!/[.?!]$/.test(recognizedText)) {
        recognizedText += '.';
      }
      // --- END POST-PROCESSING ---

      notesStore.setDetectedText(recognizedText);

      if (showValidationAlert) {
        const alert = await alertController.create({
          header: 'Text Recognized',
          inputs: [
            { name: 'validatedText', type: 'textarea', value: recognizedText, placeholder: 'Enter validated text here...' },
          ],
          buttons: [
            { text: 'Cancel', role: 'cancel' },
            {
              text: 'Add to Notes', handler: async (data) => {
                if (data.validatedText) {
                  notesStore.appendNote(data.validatedText);
                  await nextTick();
                }
              },
            },
          ],
        });
        await alert.present();
      }

    } else {
      notesStore.setDetectedText('No speech recognized.');
    }

  } catch (error) {
    console.error('Speech recognition error:', error);
    notesStore.setDetectedText('Error during recognition.');
  } finally {
    isListening.value = false;
  }
};

// =========================================================================
// AUDIO RECORDING & PERSISTENCE FUNCTIONS
// =========================================================================

/**
 * Moves the temporary recording data (Base64) to a permanent location.
 * Uses a new file name and saves it into Directory.Data.
 */
const saveRecordingPermanently = async (base64Data: string, subjectId: number): Promise<string> => {
  try {
    const newFileName = `audio_${subjectId}_${Date.now()}.wav`;

    await Filesystem.writeFile({
      path: newFileName,
      data: base64Data, // Uses Base64 data
      directory: Directory.Data,
      recursive: true,
    });

    // We store the full URI path in the Pinia store
    const uriResult = await Filesystem.getUri({
      directory: Directory.Data,
      path: newFileName,
    });

    return uriResult.uri;

  } catch (e) {
    console.error('Error saving permanent audio file:', e);
    throw new Error('Could not save permanent audio file.');
  }
};

/**
 * Starts the simple audio recording.
 */
const startRecord = async () => {
  if (isListening.value) return;

  try {
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) return;

    await VoiceRecorder.startRecording();

    isRecording.value = true;
    notesStore.setDetectedText('Recording audio...');

  } catch (error) {
    console.error('Error starting audio recording:', error);
    isRecording.value = false;
    const alert = await alertController.create({
      header: 'Recording Error',
      message: 'Could not start audio recording.',
      buttons: ['OK'],
    });
    await alert.present();
  }
};

/**
 * Stops the audio recording, saves it permanently, and updates the store.
 */
const stopRecord = async () => {
  if (!isRecording.value || !subjectStore.selectedSubject) return;

  try {
    const result = await VoiceRecorder.stopRecording();
    isRecording.value = false;

    if (result.value && result.value.recordDataBase64) {
      const base64Audio = result.value.recordDataBase64;

      // STEP 1: Save the Base64 data permanently
      const permanentUri = await saveRecordingPermanently(
        base64Audio,
        subjectStore.selectedSubject.id
      );

      // STEP 2: Add the permanent URI to the Pinia store list
      notesStore.addPermanentRecording(permanentUri);

      // Force UI update
      await nextTick(() => {
        recordingsKey.value++;
      });

      const toast = await toastController.create({
        message: `Recording saved: ${permanentUri.split('/').pop()}`,
        duration: 2000,
        color: 'success'
      });
      toast.present();

      notesStore.setDetectedText('Audio recording finished and saved.');

    } else {
      console.warn('Recording stopped, but no Base64 data received.');
      notesStore.setDetectedText('Recording failed: No audio data received.');
    }

  } catch (error) {
    console.error('Error stopping audio recording:', error);
    isRecording.value = false;
  }
};

// =========================================================================
// AUDIO PLAYBACK
// =========================================================================

/**
 * Initializes or reuses the HTML Audio element for playback.
 */
const getAudioPlayer = () => {
  if (!audioPlayer.value) {
    audioPlayer.value = document.createElement('audio');
    // Optional: Add event listener to reset UI state after playback
    audioPlayer.value.onended = () => {
      notesStore.setDetectedText('Audio playback finished.');
    };
  }
  return audioPlayer.value;
};

/**
 * Plays a permanent audio file.
 * Requires converting the Filesystem URI to a secure URL for the WebView.
 */
const playAudio = (uri: string) => {
  let secureUrl = uri;
  if (Capacitor.isNativePlatform()) {
    // Convert the file URI to a secure path the webview can access
    secureUrl = Capacitor.convertFileSrc(uri);
  }

  const player = getAudioPlayer();
  player.src = secureUrl;

  player.play()
    .then(() => {
      notesStore.setDetectedText(`Playing audio file: ${uri.split('/').pop()}`);
    })
    .catch(e => {
      console.error("Audio playback error with secure URL:", e);
      notesStore.setDetectedText(`ERROR: Could not play audio. Check permissions/URL.`);
    });
};

// =========================================================================
// DELETION FUNCTION (CRITICAL FIX)
// =========================================================================

/**
 * Deletes an audio recording from the list AND the filesystem.
 * @param uri Permanent URI of the file to delete.
 */
const deleteRecording = async (uri: string) => {
  const alert = await alertController.create({
    header: 'Confirm Deletion',
    message: `Are you sure you want to permanently delete the recording: ${uri.split('/').pop()}? This action is irreversible.`,
    buttons: [
      { text: 'Cancel', role: 'cancel' },
      {
        text: 'Delete',
        role: 'destructive',
        handler: async () => {
          // 1. Determine the file name (relative path for Filesystem.deleteFile)
          const pathSegments = uri.split('/');
          const fileName = pathSegments.pop(); // e.g., audio_1_1678888.wav

          if (!fileName) {
            console.error("Invalid URI path for deletion.");
            return;
          }

          try {
            // 2. Physical File Deletion (CRITICAL FIX)
            // We use the known file name and the Directory.Data where it was saved.
            await Filesystem.deleteFile({
              path: fileName,
              directory: Directory.Data,
            });

            // 3. Remove from Pinia store list
            notesStore.removePermanentRecording(uri);

            // 4. Update UI
            const toast = await toastController.create({
              message: `Recording successfully deleted.`,
              duration: 2000,
              color: 'danger'
            });
            toast.present();

            await nextTick(() => recordingsKey.value++);

          } catch (e) {
            console.error('Error deleting recording file:', e);
            const alert = await alertController.create({
              header: 'Deletion Error',
              message: `Could not delete the file (${fileName}) on the device. Data removed from list only.`,
              buttons: ['OK'],
            });
            await alert.present();
          }
        },
      },
    ],
  });
  await alert.present();
};

// =========================================================================
// LIFECYCLE
// =========================================================================

onMounted(() => {
  // Load the user's preferred STT language when the component mounts
  loadPreferredLanguage();
});
</script>

<style scoped>
/*
 * Your original styles are clean and functional, no changes needed here.
 */
ion-card {
  margin-bottom: 16px;
}

ion-grid {
  margin-top: 1rem;
}

ion-col {
  padding: 4px;
}

.action-button {
  width: 100%;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
  --min-height: 48px;
}

.ion-align-items-center {
  display: flex;
  align-items: center;
}

.ion-justify-content-between {
  justify-content: space-between;
}
</style>