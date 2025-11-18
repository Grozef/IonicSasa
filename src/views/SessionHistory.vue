<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Historique des Sessions</ion-title>
      </ion-toolbar>
      
      <!-- Barre de recherche et filtres -->
      <ion-toolbar>
        <ion-searchbar
          v-model="searchQuery"
          placeholder="Rechercher une session..."
          :debounce="300"
        ></ion-searchbar>
      </ion-toolbar>
      
      <ion-toolbar>
        <ion-segment v-model="statusFilter" @ion-change="filterChanged">
          <ion-segment-button value="all">
            <ion-label>Toutes</ion-label>
          </ion-segment-button>
          <ion-segment-button value="Draft">
            <ion-label>Brouillon</ion-label>
          </ion-segment-button>
          <ion-segment-button value="Ready">
            <ion-label>Prêtes</ion-label>
          </ion-segment-button>
          <ion-segment-button value="Published">
            <ion-label>Publiées</ion-label>
          </ion-segment-button>
        </ion-segment>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Statistiques rapides -->
      <ion-card class="stats-card">
        <ion-card-content>
          <ion-grid>
            <ion-row>
              <ion-col size="4">
                <div class="stat-item">
                  <div class="stat-value">{{ totalSessions }}</div>
                  <div class="stat-label">Sessions</div>
                </div>
              </ion-col>
              <ion-col size="4">
                <div class="stat-item">
                  <div class="stat-value">{{ totalPhotos }}</div>
                  <div class="stat-label">Photos</div>
                </div>
              </ion-col>
              <ion-col size="4">
                <div class="stat-item">
                  <div class="stat-value">{{ publishedCount }}</div>
                  <div class="stat-label">Publiées</div>
                </div>
              </ion-col>
            </ion-row>
          </ion-grid>
        </ion-card-content>
      </ion-card>

      <!-- Liste des sessions -->
      <ion-list v-if="filteredSessions.length > 0">
        <ion-item-sliding 
          v-for="session in filteredSessions" 
          :key="session.id"
        >
          <ion-item 
            button 
            @click="viewSession(session)"
            lines="full"
          >
            <ion-label>
              <h2>{{ session.title }}</h2>
              <p>
                <ion-text color="medium">
                  {{ formatDate(session.date) }}
                </ion-text>
                <span v-if="session.collectionId"> · {{ getCollectionName(session.collectionId) }}</span>
              </p>
              <p>
                <ion-text color="medium">
                  {{ session.photos.length }} photo{{ session.photos.length > 1 ? 's' : '' }}
                </ion-text>
                <span v-if="session.publishedTo.length > 0">
                  · Publié sur {{ session.publishedTo.join(', ') }}
                </span>
              </p>
            </ion-label>
            
            <div slot="end" class="session-badges">
              <ion-badge :color="getStatusColor(session.status)">
                {{ getStatusLabel(session.status) }}
              </ion-badge>
            </div>
          </ion-item>

          <!-- Actions de glissement -->
          <ion-item-options side="end">
            <ion-item-option color="primary" @click="continueSession(session)">
              <ion-icon slot="icon-only" :icon="playOutline"></ion-icon>
            </ion-item-option>
            <ion-item-option color="danger" @click="deleteSession(session)">
              <ion-icon slot="icon-only" :icon="trashOutline"></ion-icon>
            </ion-item-option>
          </ion-item-options>
        </ion-item-sliding>
      </ion-list>

      <!-- Message si aucune session -->
      <div v-else class="empty-state">
        <ion-icon :icon="folderOpenOutline" class="empty-icon"></ion-icon>
        <h2>Aucune session trouvée</h2>
        <p v-if="searchQuery || statusFilter !== 'all'">
          Essayez de modifier vos filtres
        </p>
        <p v-else>
          Créez votre première session pour commencer
        </p>
        <ion-button 
          v-if="!searchQuery && statusFilter === 'all'"
          @click="createNewSession"
          expand="block"
          class="ion-margin-top"
        >
          Nouvelle Session
        </ion-button>
      </div>

      <!-- Bouton flottant -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end">
        <ion-fab-button @click="createNewSession">
          <ion-icon :icon="addOutline"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonMenuButton,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
  IonBadge,
  IonText,
  IonIcon,
  IonButton,
  IonFab,
  IonFabButton,
  alertController,
  toastController
} from '@ionic/vue';
import { 
  addOutline, 
  playOutline, 
  trashOutline,
  folderOpenOutline
} from 'ionicons/icons';
import { useGalleryStore, type ArtworkSession } from '@/stores/galleryStore';

const router = useRouter();
const galleryStore = useGalleryStore();

// État local
const searchQuery = ref('');
const statusFilter = ref('all');

// Computed
const filteredSessions = computed(() => {
  let sessions = galleryStore.sessions;

  // Filtre par statut
  if (statusFilter.value !== 'all') {
    sessions = sessions.filter(s => s.status === statusFilter.value);
  }

  // Filtre par recherche
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    sessions = sessions.filter(s => 
      s.title.toLowerCase().includes(query) ||
      (s.collectionId && getCollectionName(s.collectionId).toLowerCase().includes(query))
    );
  }

  // Tri par date décroissante
  return sessions.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
});

const totalSessions = computed(() => galleryStore.sessions.length);
const totalPhotos = computed(() => 
  galleryStore.sessions.reduce((sum, s) => sum + s.photos.length, 0)
);
const publishedCount = computed(() => 
  galleryStore.sessions.filter(s => s.status === 'Published').length
);

// Méthodes
const getCollectionName = (collectionId: string): string => {
  const collection = galleryStore.collections.find(c => c.id === collectionId);
  return collection?.name || 'Sans collection';
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'Draft': return 'medium';
    case 'Ready': return 'warning';
    case 'Published': return 'success';
    default: return 'primary';
  }
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'Draft': return 'Brouillon';
    case 'Ready': return 'Prête';
    case 'Published': return 'Publiée';
    default: return status;
  }
};

const filterChanged = () => {
  // Réinitialiser la recherche lors du changement de filtre
  // searchQuery.value = '';
};

const viewSession = (session: ArtworkSession) => {
  // Naviguer vers les détails de la session
  router.push(`/publish/${session.id}`);
};

const continueSession = async (session: ArtworkSession) => {
  galleryStore.loadSessionProgress(session.id);
  
  // Rediriger vers l'étape appropriée selon le statut
  if (session.status === 'Draft') {
    router.push(`/photo-capture/${session.id}`);
  } else {
    router.push(`/publish/${session.id}`);
  }

  const toast = await toastController.create({
    message: `Session "${session.title}" activée`,
    duration: 2000,
    position: 'bottom',
    color: 'success'
  });
  await toast.present();
};

const deleteSession = async (session: ArtworkSession) => {
  const alert = await alertController.create({
    header: 'Supprimer la session',
    message: `Voulez-vous vraiment supprimer "${session.title}" ? Cette action est irréversible.`,
    buttons: [
      {
        text: 'Annuler',
        role: 'cancel'
      },
      {
        text: 'Supprimer',
        role: 'destructive',
        handler: async () => {
          galleryStore.deleteSession(session.id);
          
          const toast = await toastController.create({
            message: 'Session supprimée',
            duration: 2000,
            position: 'bottom',
            color: 'danger'
          });
          await toast.present();
        }
      }
    ]
  });

  await alert.present();
};

const createNewSession = () => {
  router.push('/new-session');
};
</script>

<style scoped>
.stats-card {
  margin: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--ion-color-primary);
}

.stat-label {
  font-size: 12px;
  color: var(--ion-color-medium);
  margin-top: 4px;
}

.session-badges {
  display: flex;
  align-items: center;
  gap: 8px;
}

ion-item {
  --padding-start: 16px;
  --inner-padding-end: 16px;
}

ion-item h2 {
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
}

ion-item p {
  font-size: 14px;
  margin: 2px 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  min-height: 50vh;
}

.empty-icon {
  font-size: 80px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

.empty-state h2 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: var(--ion-color-dark);
}

.empty-state p {
  font-size: 14px;
  color: var(--ion-color-medium);
  margin-bottom: 16px;
}

ion-fab-button {
  --box-shadow: 0 4px 16px rgba(var(--ion-color-primary-rgb), 0.4);
}
</style>
