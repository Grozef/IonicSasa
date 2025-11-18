<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-button @click="goBack">
            <ion-icon slot="icon-only" :icon="arrowBackOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
        <ion-title>Éditer & Métadonnées</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="saveAndContinue" :disabled="!selectedPhoto">
            <ion-icon slot="icon-only" :icon="checkmarkOutline"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Sélecteur de photos (miniatures en haut) -->
      <div class="photo-selector" v-if="photos.length > 0">
        <div class="thumbnails-container">
          <div
            v-for="photo in photos"
            :key="photo.id"
            class="thumbnail"
            :class="{ active: selectedPhoto?.id === photo.id }"
            @click="selectPhoto(photo.id)"
          >
            <img :src="photo.base64OrWebPath" :alt="`Photo ${photo.id}`" />
            <ion-badge v-if="photo.edited" color="warning" class="edited-badge">
              <ion-icon :icon="createOutline"></ion-icon>
            </ion-badge>
            <ion-badge v-if="hasMetadata(photo.id)" color="success" class="metadata-badge">
              <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
            </ion-badge>
          </div>
        </div>
      </div>

      <div class="content-container" v-if="selectedPhoto">
        <!-- Tabs : Édition / Métadonnées -->
        <ion-segment v-model="activeTab" @ionChange="handleTabChange">
          <ion-segment-button value="edit">
            <ion-icon :icon="createOutline"></ion-icon>
            <ion-label>Édition</ion-label>
          </ion-segment-button>
          <ion-segment-button value="metadata">
            <ion-icon :icon="documentTextOutline"></ion-icon>
            <ion-label>Métadonnées</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Tab Édition -->
        <div v-show="activeTab === 'edit'" class="tab-content">
          <!-- Photo principale -->
          <div class="main-photo">
            <img :src="selectedPhoto.base64OrWebPath" :alt="'Photo principale'" />
          </div>

          <!-- Outils d'édition (à implémenter) -->
          <ion-card>
            <ion-card-header>
              <ion-card-title>Outils d'édition</ion-card-title>
              <ion-card-subtitle>Améliorez votre photo</ion-card-subtitle>
            </ion-card-header>
            <ion-card-content>
              <div class="tools-grid">
                <ion-button fill="outline" size="small" disabled>
                  <ion-icon slot="start" :icon="contrastOutline"></ion-icon>
                  Filtres
                </ion-button>
                <ion-button fill="outline" size="small" disabled>
                  <ion-icon slot="start" :icon="cropOutline"></ion-icon>
                  Recadrer
                </ion-button>
                <ion-button fill="outline" size="small" disabled>
                  <ion-icon slot="start" :icon="colorFillOutline"></ion-icon>
                  Ajuster
                </ion-button>
                <ion-button fill="outline" size="small" disabled>
                  <ion-icon slot="start" :icon="ellipseOutline"></ion-icon>
                  Rotation
                </ion-button>
              </div>
              <p class="coming-soon">🎨 Fonctionnalités d'édition à venir</p>
              
              <ion-button
                v-if="selectedPhoto.edited"
                expand="block"
                fill="outline"
                color="warning"
                @click="restoreOriginal"
                class="ion-margin-top"
              >
                <ion-icon slot="start" :icon="refreshOutline"></ion-icon>
                Restaurer l'original
              </ion-button>
            </ion-card-content>
          </ion-card>
        </div>

        <!-- Tab Métadonnées -->
        <div v-show="activeTab === 'metadata'" class="tab-content">
          <div class="metadata-form">
            <!-- Informations de base -->
            <ion-card>
              <ion-card-header>
                <ion-card-title>Informations de l'œuvre</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-item>
                  <ion-input
                    v-model="metadata.title"
                    label="Titre de l'œuvre"
                    label-placement="floating"
                    placeholder="Ex: Abstraction en bleu"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-textarea
                    v-model="metadata.description"
                    label="Description"
                    label-placement="floating"
                    placeholder="Décrivez votre œuvre..."
                    :rows="4"
                    auto-grow
                  ></ion-textarea>
                </ion-item>

                <ion-item>
                  <ion-select
                    v-model="metadata.medium"
                    label="Technique"
                    label-placement="floating"
                    placeholder="Choisir"
                  >
                    <ion-select-option value="huile">Huile sur toile</ion-select-option>
                    <ion-select-option value="acrylique">Acrylique</ion-select-option>
                    <ion-select-option value="aquarelle">Aquarelle</ion-select-option>
                    <ion-select-option value="pastel">Pastel</ion-select-option>
                    <ion-select-option value="fusain">Fusain</ion-select-option>
                    <ion-select-option value="mixte">Technique mixte</ion-select-option>
                    <ion-select-option value="digital">Art numérique</ion-select-option>
                    <ion-select-option value="sculpture">Sculpture</ion-select-option>
                    <ion-select-option value="autre">Autre</ion-select-option>
                  </ion-select>
                </ion-item>

                <ion-item>
                  <ion-input
                    v-model="metadata.dimensions"
                    label="Dimensions"
                    label-placement="floating"
                    placeholder="Ex: 50x70 cm"
                  ></ion-input>
                </ion-item>

                <ion-item>
                  <ion-input
                    v-model="metadata.year"
                    label="Année"
                    label-placement="floating"
                    placeholder="Ex: 2025"
                    type="number"
                  ></ion-input>
                </ion-item>
              </ion-card-content>
            </ion-card>

            <!-- Vente -->
            <ion-card>
              <ion-card-header>
                <ion-card-title>Informations de vente</ion-card-title>
              </ion-card-header>
              <ion-card-content>
                <ion-item>
                  <ion-toggle v-model="metadata.forSale">
                    <ion-label>
                      <h3>À vendre</h3>
                      <p>Cette œuvre est disponible à la vente</p>
                    </ion-label>
                  </ion-toggle>
                </ion-item>

                <ion-item v-if="metadata.forSale">
                  <ion-input
                    v-model.number="metadata.price"
                    label="Prix (€)"
                    label-placement="floating"
                    placeholder="Ex: 500"
                    type="number"
                  ></ion-input>
                </ion-item>
              </ion-card-content>
            </ion-card>

            <!-- Tags -->
            <ion-card>
              <ion-card-header>
                <ion-card-title>Tags</ion-card-title>
                <ion-card-subtitle>Mots-clés pour organiser vos œuvres</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="tags-container">
                  <ion-chip
                    v-for="tag in metadata.tags"
                    :key="tag"
                    @click="removeTag(tag)"
                  >
                    <ion-label>{{ tag }}</ion-label>
                    <ion-icon :icon="closeCircleOutline"></ion-icon>
                  </ion-chip>
                </div>
                <ion-item>
                  <ion-input
                    v-model="newTag"
                    placeholder="Ajouter un tag"
                    @keyup.enter="addTag"
                  >
                    <ion-button slot="end" @click="addTag" fill="clear">
                      <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
                    </ion-button>
                  </ion-input>
                </ion-item>
              </ion-card-content>
            </ion-card>

            <!-- Hashtags -->
            <ion-card>
              <ion-card-header>
                <ion-card-title>Hashtags</ion-card-title>
                <ion-card-subtitle>Pour les réseaux sociaux</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <div class="tags-container">
                  <ion-chip
                    v-for="hashtag in metadata.hashtags"
                    :key="hashtag"
                    color="primary"
                    @click="removeHashtag(hashtag)"
                  >
                    <ion-label>{{ hashtag }}</ion-label>
                    <ion-icon :icon="closeCircleOutline"></ion-icon>
                  </ion-chip>
                </div>
                <ion-item>
                  <ion-input
                    v-model="newHashtag"
                    placeholder="Ajouter un hashtag (#art)"
                    @keyup.enter="addHashtag"
                  >
                    <ion-button slot="end" @click="addHashtag" fill="clear">
                      <ion-icon slot="icon-only" :icon="addOutline"></ion-icon>
                    </ion-button>
                  </ion-input>
                </ion-item>
              </ion-card-content>
            </ion-card>

            <!-- Notes vocales -->
            <ion-card>
              <ion-card-header>
                <ion-card-title>Notes</ion-card-title>
                <ion-card-subtitle>Utilisez la reconnaissance vocale</ion-card-subtitle>
              </ion-card-header>
              <ion-card-content>
                <NotesCaptureCard />
              </ion-card-content>
            </ion-card>
          </div>
        </div>
      </div>

      <!-- État vide -->
      <div v-else class="empty-state">
        <ion-icon :icon="imagesOutline" size="large" color="medium"></ion-icon>
        <h3>Aucune photo sélectionnée</h3>
        <p>Capturez d'abord des photos de vos œuvres</p>
        <ion-button @click="goToCapture">
          <ion-icon slot="start" :icon="cameraOutline"></ion-icon>
          Capturer des photos
        </ion-button>
      </div>

      <!-- Bouton de navigation -->
      <div class="bottom-actions" v-if="selectedPhoto">
        <ion-button
          expand="block"
          color="primary"
          size="large"
          @click="goToPublish"
        >
          <ion-icon slot="start" :icon="arrowForwardOutline"></ion-icon>
          Préparer la publication
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonItem,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonChip,
  IonBadge,
} from '@ionic/vue';
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePhotoStore } from '@/stores/photoStore';
import { useMetadataStore } from '@/stores/metadataStore';
import NotesCaptureCard from '@/components/NotesCaptureCard.vue';
import {
  arrowBackOutline,
  checkmarkOutline,
  createOutline,
  documentTextOutline,
  contrastOutline,
  cropOutline,
  colorFillOutline,
  ellipseOutline,
  refreshOutline,
  addOutline,
  closeCircleOutline,
  checkmarkCircleOutline,
  imagesOutline,
  cameraOutline,
  arrowForwardOutline,
} from 'ionicons/icons';

const router = useRouter();
const photoStore = usePhotoStore();
const metadataStore = useMetadataStore();

const activeTab = ref('metadata');
const newTag = ref('');
const newHashtag = ref('');

const selectedPhoto = computed(() => photoStore.selectedPhoto);
const photos = computed(() => photoStore.photos);
const metadata = computed(() => metadataStore.currentMetadata);

/**
 * Sélectionner une photo
 */
function selectPhoto(photoId: string) {
  photoStore.selectPhoto(photoId);
}

/**
 * Vérifier si une photo a des métadonnées
 */
function hasMetadata(photoId: string): boolean {
  const meta = metadataStore.getMetadata(photoId);
  return !!(meta.title || meta.description || meta.tags.length > 0);
}

/**
 * Ajouter un tag
 */
function addTag() {
  if (newTag.value.trim()) {
    metadataStore.addTag(newTag.value.trim());
    newTag.value = '';
  }
}

/**
 * Supprimer un tag
 */
function removeTag(tag: string) {
  metadataStore.removeTag(tag);
}

/**
 * Ajouter un hashtag
 */
function addHashtag() {
  if (newHashtag.value.trim()) {
    let hashtag = newHashtag.value.trim();
    if (!hashtag.startsWith('#')) {
      hashtag = '#' + hashtag;
    }
    metadataStore.addHashtag(hashtag);
    newHashtag.value = '';
  }
}

/**
 * Supprimer un hashtag
 */
function removeHashtag(hashtag: string) {
  metadataStore.removeHashtag(hashtag);
}

/**
 * Restaurer l'original
 */
function restoreOriginal() {
  if (selectedPhoto.value) {
    photoStore.restoreOriginal(selectedPhoto.value.id);
  }
}

/**
 * Changer de tab
 */
function handleTabChange() {
  // Logique additionnelle si nécessaire
}

/**
 * Sauvegarder et continuer
 */
function saveAndContinue() {
  // La sauvegarde est automatique via les stores réactifs
  // Passer à la photo suivante si disponible
  const currentIndex = photos.value.findIndex(p => p.id === selectedPhoto.value?.id);
  if (currentIndex < photos.value.length - 1) {
    selectPhoto(photos.value[currentIndex + 1].id);
  }
}

/**
 * Aller à la capture
 */
function goToCapture() {
  router.push('/inspection-subjects');
}

/**
 * Aller à la publication
 */
function goToPublish() {
  router.push('/inspection-review');
}

/**
 * Retour
 */
function goBack() {
  router.back();
}

// Auto-sélectionner la première photo si aucune n'est sélectionnée
watch(() => photos.value.length, (newLength) => {
  if (newLength > 0 && !selectedPhoto.value) {
    selectPhoto(photos.value[0].id);
  }
}, { immediate: true });
</script>

<style scoped>
.photo-selector {
  background: var(--ion-color-light);
  padding: 1rem;
  border-bottom: 1px solid var(--ion-border-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.thumbnails-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.thumbnail {
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.thumbnail.active {
  border-color: var(--ion-color-primary);
  transform: scale(1.05);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edited-badge,
.metadata-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  padding: 0.125rem 0.25rem;
  font-size: 0.75rem;
}

.content-container {
  padding: 1rem;
}

ion-segment {
  margin-bottom: 1.5rem;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.main-photo {
  width: 100%;
  aspect-ratio: 4/3;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: var(--ion-color-light);
}

.main-photo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.coming-soon {
  text-align: center;
  color: var(--ion-color-medium);
  font-size: 0.875rem;
  margin: 1rem 0 0;
}

.metadata-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  min-height: 2rem;
}

ion-chip {
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--ion-color-medium);
}

.empty-state ion-icon {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin: 0.5rem 0;
}

.empty-state p {
  margin: 0 0 1.5rem;
}

.bottom-actions {
  padding: 1rem;
  background: var(--ion-background-color);
  border-top: 1px solid var(--ion-border-color);
  position: sticky;
  bottom: 0;
}

ion-item {
  --padding-start: 0;
  margin-bottom: 0.5rem;
}
</style>
