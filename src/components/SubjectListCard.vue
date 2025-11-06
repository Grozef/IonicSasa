<template>
  <ion-card>
    <ion-card-header>
      <ion-card-title>Subjects: {{ subjectStore.selectedEquipment.name }}</ion-card-title>
    </ion-card-header>
    <ion-card-content>
      <ion-list>
        <ion-item lines="none" v-if="!subjectStore.selectedEquipment.id">
            <ion-label>
                <p>No equipment loaded or selected.</p>
            </ion-label>
        </ion-item>
        <ion-item lines="none" v-else>
          <ion-label>
            <p>{{ subjectStore.subjects.length }} total subjects</p>
          </ion-label>
        </ion-item>
        
        <ion-item
          v-for="subject in subjectStore.subjects"
          :key="subject.id"
          button
          @click="handleSubjectSelection(subject)"
          :detail="false"
          :color="subject.id === subjectStore.selectedSubject?.id ? 'light' : undefined"
        >
          <ion-label>
            <h3>{{ subject.name }}</h3>
          </ion-label>
          <ion-badge :color="subjectStore.getStatusColor(subject.status)">
            {{ subject.status }}
          </ion-badge>
        </ion-item>
        
        <ion-item button @click="promptNewSubjectName()">
          <ion-icon :icon="addCircleOutline" slot="start"></ion-icon>
          <ion-label>Add Subject</ion-label>
        </ion-item>
      </ion-list>
    </ion-card-content>
  </ion-card>
</template>

<script setup lang="ts">
import {
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonList, IonItem, IonLabel, IonBadge, IonIcon,
  alertController, // Import alert controller
} from '@ionic/vue';
import { addCircleOutline } from 'ionicons/icons';
import { useSubjectStore, type Subject } from '@/stores/subjectStore'; 

const subjectStore = useSubjectStore();

/**
 * Handles subject selection by updating the active subject in the store.
 * @param subject The Subject object selected by the user.
 */
const handleSubjectSelection = (subject: Subject) => {
  if (subject.id === subjectStore.selectedSubject?.id) {
    return; 
  }
  
  subjectStore.setSelectedSubject(subject);
};

/**
 * Prompts the user for the name of the new subject using an Ionic alert controller.
 */
const promptNewSubjectName = async () => {
    if (!subjectStore.selectedEquipment.id) {
        // Prevent adding subject if no equipment is active
        const errorAlert = await alertController.create({
            header: 'Error',
            message: 'Please select an equipment item first before adding a subject.',
            buttons: ['OK'],
        });
        await errorAlert.present();
        return;
    }
    
    const alert = await alertController.create({
        header: 'New Subject Name',
        inputs: [
            {
                name: 'subjectName',
                type: 'text',
                placeholder: 'Enter component name (e.g., Engine Mount)',
            },
        ],
        buttons: [
            {
                text: 'Cancel',
                role: 'cancel',
            },
            {
                text: 'Add',
                handler: (data) => {
                    const name = data.subjectName.trim();
                    if (name) {
                        // Call the store action with the user-provided name
                        subjectStore.addSubject(name);
                    } else {
                        console.warn('Subject name cannot be empty.');
                        return false; // Prevent alert from closing if validation fails
                    }
                },
            },
        ],
    });

    await alert.present();
};
</script>

<style scoped>
ion-card {
  margin-bottom: 16px;
}
ion-badge {
  margin-inline-start: 16px;
  min-width: 80px; 
}
</style>