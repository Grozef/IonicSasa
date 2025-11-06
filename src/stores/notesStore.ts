import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useSubjectStore } from './subjectStore';

import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

// TypeScript definitions
type NotesBySubject = Record<number, string>;

// Type definition for a permanent audio recording record
export interface AudioRecord {
    permanentUri: string; // Permanent URI from Filesystem ( capacitor://... )
    timestamp: number;
}

// Key: subject.id (number), Value: Array of AudioRecord
type PermanentRecordingsBySubject = Record<number, AudioRecord[]>;

export const useNotesStore = defineStore('notes', () => {

    // --- State ---
    const notesBySubject = ref<NotesBySubject>({});
    const detectedText = ref('');
    // Temporary path state (kept for legacy/potential quick access, but not used for permanence)
    const lastRecordedAudioPath = ref('');

    // List of permanent audio recordings, mapped by Subject ID
    const allRecordings = ref<PermanentRecordingsBySubject>({});

    // --- Dependencies ---
    const subjectStore = useSubjectStore();

    // --- Getters/Setters ---
    const currentNotes = computed({
        get() {
            const subjectId = subjectStore.selectedSubject?.id;
            if (subjectId !== undefined) {
                return notesBySubject.value[subjectId] || '';
            }
            return '';
        },
        set(newNotes: string) {
            const subjectId = subjectStore.selectedSubject?.id;
            if (subjectId !== undefined) {
                notesBySubject.value = {
                    ...notesBySubject.value,
                    [subjectId]: newNotes,
                };
            }
        }
    });

    /**
     * Computed property that returns the list of permanent audio recordings 
     * for the currently selected subject (used by NotesCaptureCard).
     */
    const currentRecordings = computed<AudioRecord[]>(() => {
        const subjectId = subjectStore.selectedSubject?.id;
        return subjectId !== undefined ? allRecordings.value[subjectId] || [] : [];
    });

    // --- Retrieval Helpers for Conclusions Page ---

    /**
     * Helper to retrieve notes for a specific subject ID.
     * @param subjectId The ID of the subject.
     * @returns The notes string.
     */
    function getNotes(subjectId: number): string {
        return notesBySubject.value[subjectId] || '';
    }

    /**
     * Helper to retrieve permanent audio recordings for a specific subject ID.
     * @param subjectId The ID of the subject.
     * @returns Array of AudioRecord.
     */
    function getRecordings(subjectId: number): AudioRecord[] {
        return allRecordings.value[subjectId] || [];
    }


    // --- Actions ---
    function appendNote(textToAdd: string) {
        if (textToAdd && subjectStore.selectedSubject?.id) {
            const current = currentNotes.value;
            const newContent = current + (current ? ' ' : '') + textToAdd;
            currentNotes.value = newContent;
        }
    }

    function setDetectedText(text: string) {
        detectedText.value = text;
    }

    /**
     * Sets the temporary path of the last recorded audio file (usually reset after permanent save).
     */
    function setLastRecordedAudioPath(path: string) {
        lastRecordedAudioPath.value = path;
    }

    /**
     * ACTION: Adds a permanent recording URI to the subject's list.
     * @param permanentUri The permanent URI of the audio file.
     */
    function addPermanentRecording(permanentUri: string) {
        const subjectId = subjectStore.selectedSubject?.id;

        if (permanentUri && subjectId !== undefined) {
            const newRecord: AudioRecord = {
                permanentUri: permanentUri,
                timestamp: Date.now()
            };

            // 1. Ensure the entry for the subject ID exists.
            if (!allRecordings.value[subjectId]) {
                allRecordings.value[subjectId] = [];
            }

            // 2. DIRECT MUTATION: Use .push() on the reactive array.
            allRecordings.value[subjectId]!.push(newRecord);

            // Reset temporary path
            lastRecordedAudioPath.value = '';
        }
    }

    function resetNotes() {
        const subjectId = subjectStore.selectedSubject?.id;
        if (subjectId !== undefined) {
            delete notesBySubject.value[subjectId];
            delete allRecordings.value[subjectId]; // Also reset permanent recordings
        }
        detectedText.value = '';
        lastRecordedAudioPath.value = '';
    }

    /**
     * Removes an audio recording entry from the list and deletes the physical file.
     * @param uri The permanent URI of the file to delete.
     * @param subjectId Optional subject ID. If not provided, uses the currently selected subject.
     */
    async function removePermanentRecording(uri: string, subjectId?: number) {
        // Use provided subjectId or fall back to selected subject
        const targetSubjectId = subjectId ?? subjectStore.selectedSubject?.id;
        if (targetSubjectId === undefined) {
            console.warn('removePermanentRecording called without valid subjectId');
            return;
        }

        // 1. Remove the entry from the store (reactive update)
        const recordings = allRecordings.value[targetSubjectId];
        if (recordings) {
            allRecordings.value[targetSubjectId] = recordings.filter(
                (record) => record.permanentUri !== uri
            );
            console.log(`Audio recording removed from subject ${targetSubjectId}`);
        }

        // 2. Attempt to delete the physical file (on native platforms)
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
                } else {
                    console.warn(`Could not extract filename from URI: ${uri}`);
                }
            } catch (e) {
                console.error('Filesystem deletion failed for URI:', uri, e);
            }
        }
    }

    return {
        // State and Getters
        currentNotes,
        detectedText,
        lastRecordedAudioPath,
        currentRecordings, // Expose permanent list

        // Retrieval Helpers 
        getNotes,
        getRecordings,

        // Actions
        appendNote,
        setDetectedText,
        setLastRecordedAudioPath,
        addPermanentRecording,
        resetNotes,

        removePermanentRecording, // Now accepts optional subjectId parameter
    };
});