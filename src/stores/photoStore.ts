// Fichier: stores/photoStore.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useGalleryStore } from './galleryStore'; 
import { Capacitor } from '@capacitor/core'; 

export interface PhotoRecord {
    id: string;
    base64OrWebPath: string; 
    timestamp: number;
    edited: boolean;
    originalPath?: string; // Pour garder l'original si édité
}

// Key: session.id (number), Value: Array of PhotoRecord
type PhotosBySession = Record<number, PhotoRecord[]>;

export const usePhotoStore = defineStore('photos', () => {
    
    // --- State ---
    const allPhotos = ref<PhotosBySession>({});
    const selectedPhoto = ref<PhotoRecord | null>(null);
    
    // --- Dependencies ---
    const galleryStore = useGalleryStore();

    // --- Getters ---
    /**
     * Computed property that returns the list of photos for the currently active session.
     */
    const photos = computed<PhotoRecord[]>(() => {
        const sessionId = galleryStore.activeSession.id;
        if (sessionId !== null) {
            return allPhotos.value[sessionId] || []; 
        }
        return [];
    });
    
    // --- Retrieval Helper ---
    function getPhotos(sessionId: number): PhotoRecord[] {
        return allPhotos.value[sessionId] || [];
    }

    function getPhotoById(photoId: string): PhotoRecord | undefined {
        const sessionId = galleryStore.activeSession.id;
        if (sessionId !== null) {
            const sessionPhotos = allPhotos.value[sessionId] || [];
            return sessionPhotos.find(p => p.id === photoId);
        }
        return undefined;
    }

    // --- Actions ---
    /**
     * Action to add a new photo to the current session.
     */
    function addPhoto(photoData: string) {
        const sessionId = galleryStore.activeSession.id;

        if (photoData && sessionId !== null) {
            const newRecord: PhotoRecord = {
                id: `photo_${Date.now()}`,
                base64OrWebPath: photoData, 
                timestamp: Date.now(),
                edited: false,
            };

            const currentList = allPhotos.value[sessionId] || [];

            allPhotos.value = {
                ...allPhotos.value,
                [sessionId]: [...currentList, newRecord],
            };

            // Also add to gallery store
            galleryStore.addPhotoToSession(photoData);
        }
    }

    /**
     * Select a photo for editing or metadata input
     */
    function selectPhoto(photoId: string) {
        const photo = getPhotoById(photoId);
        if (photo) {
            selectedPhoto.value = photo;
        }
    }

    /**
     * Clear photo selection
     */
    function clearSelection() {
        selectedPhoto.value = null;
    }

    /**
     * Update a photo after editing
     */
    function updatePhoto(photoId: string, newPath: string) {
        const sessionId = galleryStore.activeSession.id;
        if (sessionId !== null) {
            const sessionPhotos = allPhotos.value[sessionId] || [];
            const photoIndex = sessionPhotos.findIndex(p => p.id === photoId);
            
            if (photoIndex !== -1) {
                const photo = sessionPhotos[photoIndex];
                
                // Save original if first edit
                if (!photo.edited) {
                    photo.originalPath = photo.base64OrWebPath;
                }
                
                photo.base64OrWebPath = newPath;
                photo.edited = true;
                photo.timestamp = Date.now();

                // Trigger reactivity
                allPhotos.value = {
                    ...allPhotos.value,
                    [sessionId]: [...sessionPhotos],
                };

                // Update in gallery store
                galleryStore.markPhotoAsEdited(photoId, newPath);
            }
        }
    }

    /**
     * Restore original photo (undo edit)
     */
    function restoreOriginal(photoId: string) {
        const sessionId = galleryStore.activeSession.id;
        if (sessionId !== null) {
            const sessionPhotos = allPhotos.value[sessionId] || [];
            const photo = sessionPhotos.find(p => p.id === photoId);
            
            if (photo && photo.originalPath) {
                photo.base64OrWebPath = photo.originalPath;
                photo.edited = false;
                photo.originalPath = undefined;

                // Trigger reactivity
                allPhotos.value = {
                    ...allPhotos.value,
                    [sessionId]: [...sessionPhotos],
                };
            }
        }
    }
    
    /**
     * Reset photos for current session
     */
    function resetPhotos() {
        const sessionId = galleryStore.activeSession.id;
        if (sessionId !== null && allPhotos.value[sessionId]) {
            delete allPhotos.value[sessionId];
        }
        selectedPhoto.value = null;
    }

    /**
     * Remove a photo from the session
     */
    async function removePhoto(photoId: string, sessionId?: number) {
        const targetSessionId = sessionId ?? galleryStore.activeSession.id;
        if (targetSessionId === null) {
            console.warn('removePhoto called without valid sessionId');
            return;
        }

        const photosList = allPhotos.value[targetSessionId];
        if (photosList) {
            const photo = photosList.find(p => p.id === photoId);
            
            allPhotos.value[targetSessionId] = photosList.filter(
                (p) => p.id !== photoId
            );
            console.log(`Photo ${photoId} removed from session ${targetSessionId}`);

            // Also remove from gallery store
            galleryStore.removePhotoFromSession(photoId);

            // Clear selection if removed photo was selected
            if (selectedPhoto.value?.id === photoId) {
                selectedPhoto.value = null;
            }

            // Attempt physical file deletion for native platforms
            if (Capacitor.isNativePlatform() && photo && photo.base64OrWebPath.startsWith('capacitor://')) {
                try {
                    const fileName = photo.base64OrWebPath.split('/').pop();
                    console.warn(`Photo ${fileName} removed from list. Physical file deletion is ignored (unreliable for camera/gallery URIs).`);
                } catch (e) {
                    console.error('Filesystem deletion failed:', photo.base64OrWebPath, e);
                }
            }
        }
    }

    return { 
        photos,
        selectedPhoto,
        
        // Retrieval Helpers
        getPhotos,
        getPhotoById,

        // Actions
        addPhoto, 
        selectPhoto,
        clearSelection,
        updatePhoto,
        restoreOriginal,
        resetPhotos, 
        removePhoto,
    };
});
