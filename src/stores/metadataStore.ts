import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { usePhotoStore } from './photoStore';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// TypeScript definitions
type MetadataByPhoto = Record<string, PhotoMetadata>;

export interface PhotoMetadata {
  title: string;
  description: string;
  tags: string[];
  medium?: string; // Technique artistique
  dimensions?: string;
  year?: string;
  price?: number;
  forSale: boolean;
  // Métadonnées pour réseaux sociaux
  instagramCaption?: string;
  facebookCaption?: string;
  twitterCaption?: string;
  hashtags: string[];
  location?: string;
  notes: string; // Notes vocales ou écrites
}

// Type definition for a permanent audio recording record
export interface AudioRecord {
  permanentUri: string;
  timestamp: number;
  transcription?: string; // Transcription si disponible
}

// Key: photo.id (string), Value: Array of AudioRecord
type AudioRecordingsByPhoto = Record<string, AudioRecord[]>;

export const useMetadataStore = defineStore('metadata', () => {

  // --- State ---
  const metadataByPhoto = ref<MetadataByPhoto>({});
  const detectedText = ref('');
  const lastRecordedAudioPath = ref('');
  
  // List of permanent audio recordings, mapped by Photo ID
  const allRecordings = ref<AudioRecordingsByPhoto>({});

  // --- Dependencies ---
  const photoStore = usePhotoStore();

  // --- Getters/Setters ---
  const currentMetadata = computed({
    get() {
      const photoId = photoStore.selectedPhoto?.id;
      if (photoId) {
        return metadataByPhoto.value[photoId] || createDefaultMetadata();
      }
      return createDefaultMetadata();
    },
    set(newMetadata: PhotoMetadata) {
      const photoId = photoStore.selectedPhoto?.id;
      if (photoId) {
        metadataByPhoto.value = {
          ...metadataByPhoto.value,
          [photoId]: newMetadata,
        };
      }
    }
  });

  /**
   * Computed property that returns the list of audio recordings 
   * for the currently selected photo.
   */
  const currentRecordings = computed<AudioRecord[]>(() => {
    const photoId = photoStore.selectedPhoto?.id;
    return photoId ? allRecordings.value[photoId] || [] : [];
  });

  // --- Helper Functions ---
  function createDefaultMetadata(): PhotoMetadata {
    return {
      title: '',
      description: '',
      tags: [],
      hashtags: [],
      forSale: false,
      notes: '',
    };
  }

  /**
   * Helper to retrieve metadata for a specific photo ID.
   */
  function getMetadata(photoId: string): PhotoMetadata {
    return metadataByPhoto.value[photoId] || createDefaultMetadata();
  }

  /**
   * Helper to retrieve audio recordings for a specific photo ID.
   */
  function getRecordings(photoId: string): AudioRecord[] {
    return allRecordings.value[photoId] || [];
  }

  // --- Actions ---
  
  /**
   * Update a specific field of the current photo's metadata
   */
  function updateMetadataField<K extends keyof PhotoMetadata>(
    field: K, 
    value: PhotoMetadata[K]
  ) {
    const photoId = photoStore.selectedPhoto?.id;
    if (photoId) {
      const current = metadataByPhoto.value[photoId] || createDefaultMetadata();
      metadataByPhoto.value[photoId] = {
        ...current,
        [field]: value,
      };
    }
  }

  /**
   * Append text to notes (useful for voice-to-text)
   */
  function appendToNotes(textToAdd: string) {
    if (textToAdd && photoStore.selectedPhoto?.id) {
      const current = currentMetadata.value.notes;
      const newNotes = current + (current ? ' ' : '') + textToAdd;
      updateMetadataField('notes', newNotes);
    }
  }

  /**
   * Add a tag to the current photo
   */
  function addTag(tag: string) {
    const photoId = photoStore.selectedPhoto?.id;
    if (photoId && tag.trim()) {
      const current = metadataByPhoto.value[photoId] || createDefaultMetadata();
      const tags = [...current.tags];
      if (!tags.includes(tag.trim())) {
        tags.push(tag.trim());
        metadataByPhoto.value[photoId] = {
          ...current,
          tags,
        };
      }
    }
  }

  /**
   * Remove a tag from the current photo
   */
  function removeTag(tag: string) {
    const photoId = photoStore.selectedPhoto?.id;
    if (photoId) {
      const current = metadataByPhoto.value[photoId] || createDefaultMetadata();
      metadataByPhoto.value[photoId] = {
        ...current,
        tags: current.tags.filter(t => t !== tag),
      };
    }
  }

  /**
   * Add a hashtag to the current photo
   */
  function addHashtag(hashtag: string) {
    const photoId = photoStore.selectedPhoto?.id;
    if (photoId && hashtag.trim()) {
      const current = metadataByPhoto.value[photoId] || createDefaultMetadata();
      const hashtags = [...current.hashtags];
      const cleanHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
      if (!hashtags.includes(cleanHashtag)) {
        hashtags.push(cleanHashtag);
        metadataByPhoto.value[photoId] = {
          ...current,
          hashtags,
        };
      }
    }
  }

  /**
   * Remove a hashtag from the current photo
   */
  function removeHashtag(hashtag: string) {
    const photoId = photoStore.selectedPhoto?.id;
    if (photoId) {
      const current = metadataByPhoto.value[photoId] || createDefaultMetadata();
      metadataByPhoto.value[photoId] = {
        ...current,
        hashtags: current.hashtags.filter(h => h !== hashtag),
      };
    }
  }

  /**
   * Generate Instagram caption with hashtags
   */
  function generateInstagramCaption(): string {
    const metadata = currentMetadata.value;
    let caption = '';
    
    if (metadata.title) {
      caption += `${metadata.title}\n\n`;
    }
    
    if (metadata.description) {
      caption += `${metadata.description}\n\n`;
    }
    
    if (metadata.medium) {
      caption += `Technique: ${metadata.medium}\n`;
    }
    
    if (metadata.dimensions) {
      caption += `Dimensions: ${metadata.dimensions}\n`;
    }
    
    if (metadata.year) {
      caption += `Année: ${metadata.year}\n`;
    }
    
    if (metadata.hashtags.length > 0) {
      caption += `\n${metadata.hashtags.join(' ')}`;
    }
    
    return caption;
  }

  function setDetectedText(text: string) {
    detectedText.value = text;
  }

  function setLastRecordedAudioPath(path: string) {
    lastRecordedAudioPath.value = path;
  }

  /**
   * Adds a permanent audio recording URI to the photo's list.
   */
  function addPermanentRecording(permanentUri: string, transcription?: string) {
    const photoId = photoStore.selectedPhoto?.id;

    if (permanentUri && photoId) {
      const newRecord: AudioRecord = {
        permanentUri: permanentUri,
        timestamp: Date.now(),
        transcription,
      };

      if (!allRecordings.value[photoId]) {
        allRecordings.value[photoId] = [];
      }

      allRecordings.value[photoId]!.push(newRecord);
      lastRecordedAudioPath.value = '';
    }
  }

  function resetMetadata() {
    const photoId = photoStore.selectedPhoto?.id;
    if (photoId) {
      delete metadataByPhoto.value[photoId];
      delete allRecordings.value[photoId];
    }
    detectedText.value = '';
    lastRecordedAudioPath.value = '';
  }

  /**
   * Removes an audio recording and deletes the physical file.
   */
  async function removePermanentRecording(uri: string, photoId?: string) {
    const targetPhotoId = photoId ?? photoStore.selectedPhoto?.id;
    if (!targetPhotoId) {
      console.warn('removePermanentRecording called without valid photoId');
      return;
    }

    const recordings = allRecordings.value[targetPhotoId];
    if (recordings) {
      allRecordings.value[targetPhotoId] = recordings.filter(
        (record) => record.permanentUri !== uri
      );
      console.log(`Audio recording removed from photo ${targetPhotoId}`);
    }

    if (Capacitor.isNativePlatform()) {
      try {
        const pathSegments = uri.split('/');
        const fileName = pathSegments.pop();
        if (fileName) {
          await Filesystem.deleteFile({
            path: fileName,
            directory: Directory.Data,
          });
          console.log(`Physical audio file deleted: ${fileName}`);
        }
      } catch (e) {
        console.error('Filesystem deletion failed for URI:', uri, e);
      }
    }
  }

  /**
   * Bulk update metadata for a photo
   */
  function setMetadata(photoId: string, metadata: Partial<PhotoMetadata>) {
    const current = metadataByPhoto.value[photoId] || createDefaultMetadata();
    metadataByPhoto.value[photoId] = {
      ...current,
      ...metadata,
    };
  }

  return {
    // State and Getters
    currentMetadata,
    detectedText,
    lastRecordedAudioPath,
    currentRecordings,

    // Retrieval Helpers 
    getMetadata,
    getRecordings,

    // Actions
    updateMetadataField,
    appendToNotes,
    addTag,
    removeTag,
    addHashtag,
    removeHashtag,
    generateInstagramCaption,
    setDetectedText,
    setLastRecordedAudioPath,
    addPermanentRecording,
    resetMetadata,
    removePermanentRecording,
    setMetadata,
  };
});
