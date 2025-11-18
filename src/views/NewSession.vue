<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Nouvelle Session Photo</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="form-container">
        <!-- En-tête avec icône -->
        <div class="header-section">
          <ion-icon :icon="cameraOutline" class="main-icon" color="primary"></ion-icon>
          <h2>Créer une session photo</h2>
          <p class="subtitle">Organisez vos photos d'œuvres par session thématique</p>
        </div>

        <!-- Titre de la session -->
        <ion-card>
          <ion-card-header>
            <ion-card-title>Informations de la session</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            <ion-item lines="none">
              <ion-input
                v-model="sessionTitle"
                label="Titre de la session"
                label-placement="floating"
                placeholder="Ex: Série Abstraite Printemps 2025"
                clear-input
              ></ion-input>
            </ion-item>

            <ion-item lines="none" class="ion-margin-top">
              <ion-icon :icon="calendarOutline" slot="start" color="medium"></ion-icon>
              <ion-label>
                <p>Date</p>
                <h3>{{ formatDate(currentDate) }}</h3>
              </ion-label>
            </ion-item>
          </ion-card-content>
        </ion-card>

        <!-- Sélection de collection -->
        <ion-card>
          <ion-card-header>
            <div class="card-header-with-action">
              <ion-card-title>Collection</ion-card-title>
              <ion-button 
                fill="clear" 
                size="small" 
                @click="openCreateCollectionModal"
              >
                <ion-icon slot="icon-only" :icon="addCircleOutline"></ion-icon>
              </ion-button>
            </div>
            <ion-card-subtitle>Choisissez une collection ou créez-en une nouvelle</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <!-- Liste des collections -->
            <div class="collections-list">
              <ion-chip
                v-for="collection in galleryStore.collections"
                :key="collection.id"
                :outline="selectedCollectionId !== collection.id"
                :color="selectedCollectionId === collection.id ? 'primary' : 'medium'"
                @click="selectCollection(collection.id)"
                class="collection-chip"
              >
                <ion-icon :icon="colorPaletteOutline"></ion-icon>
                <ion-label>{{ collection.name }}</ion-label>
                <ion-icon 
                  v-if="selectedCollectionId === collection.id" 
                  :icon="checkmarkCircleOutline"
                ></ion-icon>
              </ion-chip>
            </div>

            <!-- Message si aucune collection -->
            <div v-if="galleryStore.collections.length === 0" class="empty-state">
              <ion-icon :icon="colorPaletteOutline" size="large" color="medium"></ion-icon>
              <p>Aucune collection</p>
              <ion-button size="small" fill="outline" @click="openCreateCollectionModal">
                Créer une collection
              </ion-button>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Résumé -->
        <ion-card v-if="selectedCollectionId" class="summary-card">
          <ion-card-content>
            <div class="summary-item">
              <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
              <div>
                <strong>Prêt à commencer</strong>
                <p>{{ sessionTitle || 'Session sans titre' }} • {{ getCollectionName() }}</p>
              </div>
            </div>
          </ion-card-content>
        </ion-card>

        <!-- Bouton de démarrage -->
        <ion-button
          expand="block"
          color="primary"
          size="large"
          class="ion-margin-top"
          @click="startSession"
          :disabled="!isStartEnabled"
        >
          <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
          Commencer à photographier
        </ion-button>
      </div>
    </ion-content>

    <!-- Modal de création de collection -->
    <ion-modal :is-open="isCreateCollectionModalOpen" @didDismiss="closeCreateCollectionModal">
      <ion-header>
        <ion-toolbar>
          <ion-title>Nouvelle Collection</ion-title>
          <ion-buttons slot="end">
            <ion-button @click="closeCreateCollectionModal">Fermer</ion-button>
          </ion-buttons>
        </ion-toolbar>
      </ion-header>
      <ion-content class="ion-padding">
        <ion-item>
          <ion-input
            v-model="newCollectionName"
            label="Nom de la collection"
            label-placement="floating"
            placeholder="Ex: Art Abstrait"
            clear-input
          ></ion-input>
        </ion-item>
        <ion-item class="ion-margin-top">
          <ion-textarea
            v-model="newCollectionDescription"
            label="Description (optionnelle)"
            label-placement="floating"
            placeholder="Décrivez votre collection..."
            :rows="3"
          ></ion-textarea>
        </ion-item>
        <ion-button
          expand="block"
          class="ion-margin-top"
          @click="createCollection"
          :disabled="!newCollectionName.trim()"
        >
          <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
          Créer la collection
        </ion-button>
      </ion-content>
    </ion-modal>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonItem,
  IonInput,
  IonTextarea,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonIcon,
  IonLabel,
  IonChip,
  IonModal,
} from '@ionic/vue';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGalleryStore } from '@/stores/galleryStore';
import {
  cameraOutline,
  arrowBackOutline,
  colorPaletteOutline,
  addCircleOutline,
  checkmarkCircleOutline,
  calendarOutline,
} from 'ionicons/icons';

const router = useRouter();
const galleryStore = useGalleryStore();

const sessionTitle = ref('');
const selectedCollectionId = ref<string | null>(galleryStore.activeSession.collectionId);
const currentDate = new Date().toISOString().split('T')[0];

// Modal de création de collection
const isCreateCollectionModalOpen = ref(false);
const newCollectionName = ref('');
const newCollectionDescription = ref('');

const nextStepPath = '/inspection-subjects'; // Sera la page de capture de photos

/**
 * Vérifier si on peut démarrer la session
 */
const isStartEnabled = computed(() => {
  return !!selectedCollectionId.value;
});

/**
 * Sélectionner une collection
 */
function selectCollection(collectionId: string) {
  selectedCollectionId.value = collectionId;
  galleryStore.setActiveCollection(collectionId);
}

/**
 * Obtenir le nom de la collection sélectionnée
 */
function getCollectionName(): string {
  const collection = galleryStore.collections.find(c => c.id === selectedCollectionId.value);
  return collection?.name || '';
}

/**
 * Ouvrir le modal de création de collection
 */
function openCreateCollectionModal() {
  isCreateCollectionModalOpen.value = true;
}

/**
 * Fermer le modal de création de collection
 */
function closeCreateCollectionModal() {
  isCreateCollectionModalOpen.value = false;
  newCollectionName.value = '';
  newCollectionDescription.value = '';
}

/**
 * Créer une nouvelle collection
 */
function createCollection() {
  if (!newCollectionName.value.trim()) return;

  const newCollectionId = galleryStore.addCollection(
    newCollectionName.value.trim(),
    newCollectionDescription.value.trim() || undefined
  );

  // Sélectionner automatiquement la nouvelle collection
  selectCollection(newCollectionId);
  closeCreateCollectionModal();
}

/**
 * Démarrer la session
 */
function startSession() {
  if (!selectedCollectionId.value) return;

  // Finaliser la création de la session dans le store
  galleryStore.finalizeSessionCreation(sessionTitle.value.trim());

  // Mettre à jour le step et naviguer
  galleryStore.goToNextStep();
  
  if (galleryStore.activeSession.id) {
    router.push(`${nextStepPath}/${galleryStore.activeSession.id}`);
  }
}

/**
 * Retour à la galerie
 */
function goBack() {
  router.push('/dashboard');
}

/**
 * Formater une date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}
</script>

<style scoped>
.form-container {
  max-width: 600px;
  margin: 0 auto;
}

.header-section {
  text-align: center;
  margin-bottom: 2rem;
  padding-top: 1rem;
}

.main-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.header-section h2 {
  margin: 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.subtitle {
  color: var(--ion-color-medium);
  margin: 0;
  font-size: 0.9rem;
}

.card-header-with-action {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.collections-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.collection-chip {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.collection-chip:active {
  transform: scale(0.95);
}

.empty-state {
  text-align: center;
  padding: 2rem 1rem;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state p {
  margin-bottom: 1rem;
}

.summary-card {
  background: linear-gradient(135deg, var(--ion-color-success-tint) 0%, var(--ion-color-light) 100%);
  border: 2px solid var(--ion-color-success);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-item ion-icon {
  font-size: 2rem;
}

.summary-item strong {
  display: block;
  margin-bottom: 0.25rem;
}

.summary-item p {
  margin: 0;
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}

ion-card {
  margin-bottom: 1rem;
}

ion-item {
  --padding-start: 0;
}
</style>
