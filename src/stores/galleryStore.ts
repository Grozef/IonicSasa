import { defineStore } from 'pinia';

// --- Types ---
interface ProgressStep {
  id: number;
  title: string;
  path: string;
}

interface Collection {
  id: string;
  name: string;
  description?: string;
}

interface ArtworkMetadata {
  title: string;
  description: string;
  tags: string[];
  medium?: string; // Technique (huile, acrylique, aquarelle, etc.)
  dimensions?: string;
  year?: string;
  price?: number;
  forSale: boolean;
  // Métadonnées pour réseaux sociaux
  instagramCaption?: string;
  facebookCaption?: string;
  hashtags: string[];
}

interface Photo {
  id: string;
  uri: string;
  timestamp: number;
  edited: boolean;
  metadata: ArtworkMetadata;
}

export interface ArtworkSession {
  id: number;
  title: string;
  date: string;
  status: 'Draft' | 'Ready' | 'Published';
  collectionId: string | null;
  photos: Photo[];
  currentFlowStepId: number;
  publishedTo: string[]; // ['instagram', 'facebook', etc.]
}

interface ActiveSession {
  id: number | null;
  collectionId: string | null;
  collectionName: string | null;
}

interface GalleryState {
  sessions: ArtworkSession[];
  collections: Collection[];
  workflowSteps: ProgressStep[];
  currentStepId: number;
  activeSession: ActiveSession;
}

export const useGalleryStore = defineStore('gallery', {
  state: (): GalleryState => ({
    sessions: [
      {
        id: 1,
        title: 'Série Abstraite Printemps 2025',
        date: '2025-03-15',
        status: 'Draft',
        collectionId: 'collection_abstract',
        photos: [],
        currentFlowStepId: 2,
        publishedTo: []
      },
      {
        id: 2,
        title: 'Portraits urbains',
        date: '2025-02-10',
        status: 'Published',
        collectionId: 'collection_portraits',
        photos: [],
        currentFlowStepId: 5,
        publishedTo: ['instagram', 'facebook']
      },
    ],
    collections: [
      { id: 'collection_abstract', name: 'Abstrait', description: 'Œuvres abstraites et expressionnistes' },
      { id: 'collection_portraits', name: 'Portraits', description: 'Portraits et études de personnages' },
      { id: 'collection_landscapes', name: 'Paysages', description: 'Paysages et natures mortes' },
      { id: 'collection_digital', name: 'Art Numérique', description: 'Créations numériques et mixed media' },
    ],
    workflowSteps: [
      { id: 1, title: 'Galerie', path: '/gallery' },
      { id: 2, title: 'Nouvelle Session', path: '/new-session' },
      { id: 3, title: 'Capture Photos', path: '/photo-capture' },
      { id: 4, title: 'Édition & Métadonnées', path: '/photo-edit' },
      { id: 5, title: 'Publication', path: '/publish' },
    ],
    currentStepId: 1,
    activeSession: {
      id: null,
      collectionId: null,
      collectionName: null,
    },
  }),

  getters: {
    availableCollections: (state) => state.collections,
    
    photosForActiveSession: (state) => {
      const session = state.sessions.find(s => s.id === state.activeSession.id);
      return session?.photos || [];
    },
    
    currentStepTitle: (state) => {
      const step = state.workflowSteps.find(s => s.id === state.currentStepId);
      return step ? step.title : 'N/A';
    },
    
    totalSteps: (state) => state.workflowSteps.length,
    
    progressPercentage: (state) => {
      const flowSteps = state.workflowSteps.filter(s => s.id !== 1);
      const currentIndex = flowSteps.findIndex(s => s.id === state.currentStepId);
      const total = flowSteps.length;
      if (currentIndex === -1) return 0;
      return ((currentIndex + 1) / total) * 100;
    },
    
    unpublishedSessions: (state) => {
      return state.sessions.filter(s => s.status !== 'Published');
    },
    
    publishedSessions: (state) => {
      return state.sessions.filter(s => s.status === 'Published');
    },
  },

  actions: {
    loadSessionProgress(sessionId: number) {
      const session = this.sessions.find(s => s.id === sessionId);
      if (!session) return;

      this.currentStepId = session.currentFlowStepId;
      this.activeSession.id = session.id;
      this.activeSession.collectionId = session.collectionId;
      this.activeSession.collectionName = this.collections.find(c => c.id === session.collectionId)?.name || null;
    },

    updateSessionProgress(sessionId: number, newStepId: number) {
      const session = this.sessions.find(s => s.id === sessionId);
      if (session && newStepId > session.currentFlowStepId) {
        session.currentFlowStepId = newStepId;
      }
    },

    goToNextStep() {
      const nextIndex = this.workflowSteps.findIndex(s => s.id === this.currentStepId) + 1;
      if (nextIndex < this.workflowSteps.length) {
        this.currentStepId = this.workflowSteps[nextIndex].id;
        if (this.activeSession.id !== null) {
          const session = this.sessions.find(s => s.id === this.activeSession.id);
          if (session) session.currentFlowStepId = this.currentStepId;
        }
      }
    },

    setCurrentStepByPath(path: string) {
      const step = this.workflowSteps.find(s => s.path === path);
      if (step) {
        this.currentStepId = step.id;
        if (this.activeSession.id !== null) {
          const session = this.sessions.find(s => s.id === this.activeSession.id);
          if (session) session.currentFlowStepId = step.id;
        }
      }
    },

    initializeNewSession() {
      const newId = Date.now();
      this.activeSession.id = newId;
      this.activeSession.collectionId = null;
      this.activeSession.collectionName = null;
      this.currentStepId = this.workflowSteps.find(s => s.path === '/new-session')?.id || 2;

      const newSession: ArtworkSession = {
        id: newId,
        title: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        collectionId: null,
        photos: [],
        currentFlowStepId: this.currentStepId,
        publishedTo: []
      };
      this.sessions.push(newSession);
    },

    setActiveCollection(collectionId: string) {
      this.activeSession.collectionId = collectionId;
      this.activeSession.collectionName = this.collections.find(c => c.id === collectionId)?.name || null;
      if (this.activeSession.id !== null) {
        const session = this.sessions.find(s => s.id === this.activeSession.id);
        if (session) session.collectionId = collectionId;
      }
    },

    finalizeSessionCreation(title: string) {
      if (!this.activeSession.id || !this.activeSession.collectionId) return;
      const session = this.sessions.find(s => s.id === this.activeSession.id);
      if (session) {
        session.title = title || `Session ${this.activeSession.collectionName}`;
        session.date = new Date().toISOString().split('T')[0];
        session.status = 'Draft';
        session.currentFlowStepId = this.currentStepId;
      }
    },

    addPhotoToSession(photoUri: string) {
      if (!this.activeSession.id) return;
      const session = this.sessions.find(s => s.id === this.activeSession.id);
      if (session) {
        const newPhoto: Photo = {
          id: `photo_${Date.now()}`,
          uri: photoUri,
          timestamp: Date.now(),
          edited: false,
          metadata: {
            title: '',
            description: '',
            tags: [],
            hashtags: [],
            forSale: false,
          }
        };
        session.photos.push(newPhoto);
      }
    },

    removePhotoFromSession(photoId: string) {
      if (!this.activeSession.id) return;
      const session = this.sessions.find(s => s.id === this.activeSession.id);
      if (session) {
        session.photos = session.photos.filter(p => p.id !== photoId);
      }
    },

    updatePhotoMetadata(photoId: string, metadata: Partial<ArtworkMetadata>) {
      if (!this.activeSession.id) return;
      const session = this.sessions.find(s => s.id === this.activeSession.id);
      if (session) {
        const photo = session.photos.find(p => p.id === photoId);
        if (photo) {
          photo.metadata = { ...photo.metadata, ...metadata };
        }
      }
    },

    markPhotoAsEdited(photoId: string, newUri: string) {
      if (!this.activeSession.id) return;
      const session = this.sessions.find(s => s.id === this.activeSession.id);
      if (session) {
        const photo = session.photos.find(p => p.id === photoId);
        if (photo) {
          photo.uri = newUri;
          photo.edited = true;
        }
      }
    },

    markSessionAsReady() {
      if (!this.activeSession.id) return;
      const session = this.sessions.find(s => s.id === this.activeSession.id);
      if (session) {
        session.status = 'Ready';
      }
    },

    publishSession(platforms: string[]) {
      if (!this.activeSession.id) return;
      const session = this.sessions.find(s => s.id === this.activeSession.id);
      if (session) {
        session.status = 'Published';
        session.publishedTo = platforms;
      }
    },

    addCollection(name: string, description?: string) {
      const newCollection: Collection = {
        id: `collection_${Date.now()}`,
        name,
        description
      };
      this.collections.push(newCollection);
      return newCollection.id;
    },
  },
});
