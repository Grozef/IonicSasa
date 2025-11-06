<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Settings</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <h2>Voice Input Settings</h2>
      
      <ion-list lines="full">
        <ion-item>
          <ion-label position="stacked">Preferred Voice Recognition Language</ion-label>
          <ion-select :interface-options="{ header: 'Select Language' }" v-model="selectedLanguage" placeholder="Select Language">
            <ion-select-option 
              v-for="lang in supportedLanguages" 
              :key="lang.code" 
              :value="lang.code"
            >
              {{ lang.name }} ({{ lang.code }})
            </ion-select-option>
          </ion-select>
        </ion-item>
      </ion-list>
      
      <ion-button expand="block" @click="saveLanguage" class="ion-margin-top">
        Save Language
      </ion-button>
      
      <p class="ion-text-center ion-margin-top">
        <small>This preference sets the language used when the app calls the device's speech-to-text function (via Capacitor).</small>
      </p>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  IonPage, IonContent, IonHeader, IonToolbar, IonTitle, 
  IonButtons, IonMenuButton, IonItem, IonLabel, 
  IonList, IonSelect, IonSelectOption, IonButton, 
  alertController 
} from '@ionic/vue';
import { Preferences } from '@capacitor/preferences';
import { SpeechRecognition } from '@capacitor-community/speech-recognition';

// Define the component name (optional for <script setup>, useful for devtools/debugging)
// Note: This requires Vue 3.3+ or a plugin like 'unplugin-vue-define-options'.
// If you are on an older version of Vue, you might need a separate <script> block.
/*
if (typeof defineOptions === 'function') {
  defineOptions({
    name: 'SettingsPage',
  });
}
*/

// --- CONFIGURATION ---
// Define the languages to be offered in the settings (BCP-47 codes)
const supportedLanguages = [
  { code: 'fr-FR', name: 'French' },
  { code: 'en-US', name: 'English (US)' },
  { code: 'de-DE', name: 'German' },
];

// Key used to store and retrieve the language preference
const LANGUAGE_PREF_KEY = 'speech_recognition_language';
// --- /CONFIGURAION ---


// Reactive variable to hold the currently selected language
const selectedLanguage = ref<string>('fr-FR'); // Default to French


/**
 * Loads the saved language preference from Capacitor Preferences.
 */
const loadPreferredLanguage = async () => {
  try {
    const result = await Preferences.get({ key: LANGUAGE_PREF_KEY });
    if (result.value) {
      selectedLanguage.value = result.value;
      console.log(`Loaded preferred language: ${result.value}`);
    }
  } catch (e) {
    console.error('Error loading language preference:', e);
  }
};

/**
 * Saves the selected language preference to Capacitor Preferences.
 * Displays an alert upon successful save.
 */
const saveLanguage = async () => {
  try {
    await Preferences.set({
      key: LANGUAGE_PREF_KEY,
      value: selectedLanguage.value,
    });
    
    // Display a confirmation alert
    const alert = await alertController.create({
      header: 'Success',
      message: `Voice input language saved: ${selectedLanguage.value}`,
      buttons: ['OK'],
    });
    await alert.present();
    console.log(`Language saved: ${selectedLanguage.value}`);

  } catch (e) {
    console.error('Error saving language preference:', e);
    const alert = await alertController.create({
      header: 'Error',
      message: 'Failed to save language preference.',
      buttons: ['OK'],
    });
    await alert.present();
  }
};

/**
 * Checks if the Speech Recognition feature is available and requests permissions.
 * This is crucial for the plugin to work.
 */
const checkAndRequestPermissions = async () => {
  try {
    const available = await SpeechRecognition.available();
    if (!available.available) {
      console.warn("Speech Recognition is not available on this device.");
      return;
    }
    
    // Check current permissions status
    let permissionStatus = await SpeechRecognition.checkPermissions();
    console.log('Current speech recognition permission status:', permissionStatus.speechRecognition);

    // If permission is not granted, request it
    if (permissionStatus.speechRecognition !== 'granted') {
      permissionStatus = await SpeechRecognition.requestPermissions();
      if (permissionStatus.speechRecognition === 'granted') {
        console.log("Speech recognition permission granted.");
      } else {
        console.error("Speech recognition permission denied by user.");
      }
    }
  } catch (e) {
    console.error("Error checking or requesting permissions:", e);
  }
};

// Lifecycle hook: runs when the component is mounted
onMounted(() => {
  loadPreferredLanguage();
  checkAndRequestPermissions();
});
</script>

<style scoped>
h2 {
  font-size: 1.5rem;
  margin-bottom: 16px;
}
</style>