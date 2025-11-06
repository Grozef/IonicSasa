<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>Ma Galerie</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="startNewSession">
            <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Ma Galerie</ion-title>
        </ion-toolbar>
      </ion-header>

      <div class="container">
        
        <!-- Statistiques rapides -->
        <div class="stats-grid">
          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon">
                <ion-icon :icon="imagesOutline" color="primary"></ion-icon>
              </div>
              <div class="stat-value">{{ totalPhotos }}</div>
              <div class="stat-label">Photos</div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon">
                <ion-icon :icon="folderOpenOutline" color="secondary"></ion-icon>
              </div>
              <div class="stat-value">{{ totalSessions }}</div>
              <div class="stat-label">Sessions</div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon">
                <ion-icon :icon="colorPaletteOutline" color="tertiary"></ion-icon>
              </div>
              <div class="stat-value">{{ store.collections.length }}</div>
              <div class="stat-label">Collections</div>
            </ion-card-content>
          </ion-card>

          <ion-card class="stat-card">
            <ion-card-content>
              <div class="stat-icon">
                <ion-icon :icon="checkmarkCircleOutline" color="success"></ion-icon>
              </div>
              <div class="stat-value">{{ publishedSessions }}</div>
              <div class="stat-label">Publiées</div>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Filtres -->
        <div class="filters">
          <ion-segment v-model="statusFilter" @ionChange="handleFilterChange">
            <ion-segment-button value="all">
              <ion-label>Toutes</ion-label>
            </ion-segment-button>
            <ion-segment-button value="Draft">
              <ion-label>Brouillons</ion-label>
            </ion-segment-button>
            <ion-segment-button value="Ready">
              <ion-label>Prêtes</ion-label>
            </ion-segment-button>
            <ion-segment-button value="Published">
              <ion-label>Publiées</ion-label>
            </ion-segment-button>
          </ion-segment>
        </div>

        <!-- Section principale -->
        <div class="cards-container">
          
          <!-- Continuer une session brouillon -->
          <ion-card class="custom-card primary-card" v-if="draftSessions.length > 0">
            <ion-card-header>
              <div class="card-header-content">
                <ion-icon :icon="timeOutline" class="header-icon"></ion-icon>
                <div>
                  <ion-card-title>Reprendre une session</ion-card-title>
                  <ion-card-subtitle>Continuez où vous vous êtes arrêté</ion-card-subtitle>
                </div>
              </div>
            </ion-card-header>
            
            <ion-list lines="none" class="ion-padding-horizontal">
              <ion-item>
                <ion-label position="floating">Sélectionner une session</ion-label>
                <ion-select
                  v-model="selectedDraftId" 
                  interface="popover"
                  placeholder="Choisir une session brouillon..."
                  :disabled="draftSessions.length === 0"
                >
                  <ion-select-option 
                    v-for="draft in draftSessions" 
                    :key="draft.id" 
                    :value="draft.id"
                  >
                    {{ draft.title || 'Sans titre' }} ({{ formatDate(draft.date) }})
                  </ion-select-option>
                </ion-select>
              </ion-item>
            </ion-list>
            
            <ion-button 
              expand="block" 
              fill="solid" 
              color="tertiary" 
              :disabled="selectedDraftId === undefined" 
              @click="continueSelectedDraft()"
              class="card-button"
            >
              <ion-icon slot="start" :icon="arrowForwardOutline"></ion-icon>
              Continuer cette session
            </ion-button>
          </ion-card>
          
          <!-- Nouvelle session -->
          <ion-card class="custom-card highlight-card" @click="startNewSession()">
            <ion-card-header>
              <div class="card-header-content">
                <ion-icon :icon="cameraOutline" class="header-icon large"></ion-icon>
                <div>
                  <ion-card-title>Nouvelle session photo</ion-card-title>
                  <ion-card-subtitle>Photographiez vos nouvelles œuvres</ion-card-subtitle>
                </div>
              </div>
            </ion-card-header>
            <ion-button 
              expand="block" 
              fill="solid" 
              color="primary"
              @click.stop="startNewSession()"
              class="card-button"
            >
              <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
              Créer une nouvelle session
            </ion-button>
          </ion-card>

          <!-- Collections -->
          <ion-card class="custom-card" @click="openCollections()">
            <ion-card-header>
              <div class="card-header-content">
                <ion-icon :icon="colorPaletteOutline" class="header-icon"></ion-icon>
                <div>
                  <ion-card-title>Collections</ion-card-title>
                  <ion-card-subtitle>Organisez vos œuvres par thème</ion-card-subtitle>
                </div>
              </div>
            </ion-card-header>
            <div class="collections-preview">
              <ion-chip v-for="collection in store.collections.slice(0, 3)" :key="collection.id">
                <ion-label>{{ collection.name }}</ion-label>
              </ion-chip>
              <ion-chip v-if="store.collections.length > 3">
                <ion-label>+{{ store.collections.length - 3 }}</ion-label>
              </ion-chip>
            </div>
            <ion-button 
              expand="block" 
              fill="outline" 
              color="primary"
              class="card-button"
            >
              <ion-icon slot="start" :icon="folderOpenOutline"></ion-icon>
              Gérer les collections
            </ion-button>
          </ion-card>

          <!-- Historique -->
          <ion-card class="custom-card" @click="$router.push('/past-inspections')">
            <ion-card-header>
              <div class="card-header-content">
                <ion-icon :icon="timeOutline" class="header-icon"></ion-icon>
                <div>
                  <ion-card-title>Historique</ion-card-title>
                  <ion-card-subtitle>Consultez vos sessions passées</ion-card-subtitle>
                </div>
              </div>
            </ion-card-header>
            <ion-button 
              expand="block" 
              fill="outline" 
              color="primary"
              class="card-button"
            >
              <ion-icon slot="start" :icon="listOutline"></ion-icon>
              Voir l'historique
            </ion-button>
          </ion-card>
          
        </div>
      </div>
      
      <!-- Modal de sélection de collection -->
      <ion-modal 
        :is-open="isCollectionSelectorOpen" 
        @didDismiss="isCollectionSelectorOpen = false"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>Choisir une collection</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="isCollectionSelectorOpen = false">Fermer</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content class="ion-padding">
          <h2>Sélectionnez une collection :</h2>
          <ion-list>
            <ion-item 
              v-for="collection in store.availableCollections" 
              :key="collection.id" 
              button 
              @click="selectCollectionAndNavigate(collection.id)"
            >
              <ion-icon :icon="colorPaletteOutline" slot="start" color="primary"></ion-icon>
              <ion-label>
                <h3>{{ collection.name }}</h3>
                <p v-if="collection.description">{{ collection.description }}</p>
              </ion-label>
            </ion-item>
          </ion-list>
          
          <ion-button 
            expand="block" 
            fill="outline" 
            @click="createNewCollection"
            class="ion-margin-top"
          >
            <ion-icon slot="start" :icon="addCircleOutline"></ion-icon>
            Créer une nouvelle collection
          </ion-button>
        </ion-content>
      </ion-modal>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonButton,
  IonModal,
  IonList,
  IonItem,
  IonLabel,
  IonSelect, 
  IonSelectOption,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonChip,
} from '@ionic/vue';
import { 
  addOutline, 
  addCircleOutline,
  cameraOutline,
  imagesOutline,
  colorPaletteOutline,
  folderOpenOutline,
  timeOutline,
  listOutline,
  checkmarkCircleOutline,
  arrowForwardOutline,
} from 'ionicons/icons';
import { useRouter } from 'vue-router';
import { useGalleryStore, type ArtworkSession } from '@/stores/galleryStore';
import { computed, ref } from 'vue';

const router = useRouter();
const store = useGalleryStore();

// Reactive state
const isCollectionSelectorOpen = ref(false);
const selectedDraftId = ref<number | undefined>(undefined); 
const statusFilter = ref('all');

const newSessionPath = '/new-inspection';
const editSessionBasePath = '/inspection-subjects';

/**
 * Sessions brouillons triées par date
 */
const draftSessions = computed<ArtworkSession[]>(() => {
  const drafts = store.sessions.filter(s => s.status === 'Draft');
  drafts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return drafts;
});

/**
 * Sessions filtrées selon le filtre actif
 */
const filteredSessions = computed<ArtworkSession[]>(() => {
  if (statusFilter.value === 'all') {
    return store.sessions;
  }
  return store.sessions.filter(s => s.status === statusFilter.value);
});

/**
 * Statistiques
 */
const totalSessions = computed(() => store.sessions.length);

const totalPhotos = computed(() => {
  return store.sessions.reduce((sum, s) => sum + s.photos.length, 0);
});

const publishedSessions = computed(() => {
  return store.sessions.filter(s => s.status === 'Published').length;
});

/**
 * Démarrer une nouvelle session
 */
function startNewSession() {
  store.initializeNewSession();
  selectedDraftId.value = undefined;
  isCollectionSelectorOpen.value = true;
}

/**
 * Sélectionner une collection et naviguer
 */
function selectCollectionAndNavigate(collectionId: string) {
  isCollectionSelectorOpen.value = false;
  store.setActiveCollection(collectionId);
  router.push(newSessionPath);
}

/**
 * Continuer une session brouillon
 */
function continueSelectedDraft() {
  const sessionIdToContinue = selectedDraftId.value;
  
  if (sessionIdToContinue !== undefined) {
    store.loadSessionProgress(sessionIdToContinue);
    router.push(`${editSessionBasePath}/${sessionIdToContinue}`);
  }
}

/**
 * Ouvrir la gestion des collections
 */
function openCollections() {
  // TODO: Créer une page dédiée aux collections
  isCollectionSelectorOpen.value = true;
}

/**
 * Créer une nouvelle collection
 */
function createNewCollection() {
  // TODO: Ouvrir un modal ou une page pour créer une collection
  console.log('Créer nouvelle collection');
}

/**
 * Gérer le changement de filtre
 */
function handleFilterChange() {
  // Le computed filteredSessions se mettra à jour automatiquement
}

/**
 * Formater une date
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}
</script>

<style scoped>
/* Container principal */
.container {
  padding: 16px;
  padding-bottom: 80px; /* Espace pour la bottom bar */
}

/* Grille de statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.stat-card {
  margin: 0;
  text-align: center;
}

.stat-card ion-card-content {
  padding: 16px 8px;
}

.stat-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: bold;
  color: var(--ion-color-dark);
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--ion-color-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Filtres */
.filters {
  margin-bottom: 20px;
}

/* Container des cartes */
.cards-container {
  display: flex;
  flex-direction: column; 
  gap: 16px;
}

/* Cartes personnalisées */
.custom-card {
  margin: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.custom-card:active {
  transform: scale(0.98);
}

.card-header-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.header-icon {
  font-size: 2rem;
  color: var(--ion-color-primary);
  margin-top: 4px;
}

.header-icon.large {
  font-size: 2.5rem;
}

/* Carte mise en avant */
.primary-card {
  border: 2px solid var(--ion-color-tertiary);
  background: linear-gradient(135deg, var(--ion-color-tertiary-tint) 0%, var(--ion-color-light) 100%);
}

.highlight-card {
  border: 2px solid var(--ion-color-primary);
  background: linear-gradient(135deg, var(--ion-color-primary-tint) 0%, var(--ion-color-light) 100%);
}

/* Boutons dans les cartes */
.card-button {
  margin: 12px 16px 16px;
}

/* Aperçu des collections */
.collections-preview {
  padding: 0 16px 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Liste dans les cartes */
.custom-card ion-list {
  background: transparent;
  padding: 0;
}

.custom-card ion-item {
  --background: transparent;
}

/* Modal */
ion-modal h2 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--ion-color-dark);
}

ion-modal ion-item {
  --padding-start: 16px;
  margin-bottom: 8px;
}

ion-modal ion-item h3 {
  font-weight: 600;
  margin-bottom: 4px;
}

ion-modal ion-item p {
  font-size: 0.875rem;
  color: var(--ion-color-medium);
}
</style>
