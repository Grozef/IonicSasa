<template>
    <ion-card class="ion-margin-bottom">
      <ion-card-header>
        <ion-card-title>Inspection Equipment ({{ selectedEquipmentList.length }})</ion-card-title>
        <ion-card-subtitle>Select the equipment you are currently observing.</ion-card-subtitle>
      </ion-card-header>
      <ion-card-content>
        <ion-list lines="full">
          <ion-item
            v-for="equipment in selectedEquipmentList"
            :key="equipment.id"
            button
            @click="selectEquipment(equipment.id)"
            :color="equipment.id === subjectStore.selectedEquipment.id ? 'primary' : undefined"
          >
            <ion-label class="ion-text-wrap">
              <h2>{{ equipment.name }}</h2>
              <p>{{ equipment.id }}</p>
            </ion-label>
            <ion-icon 
              slot="end" 
              :icon="equipment.id === subjectStore.selectedEquipment.id ? chevronDown : chevronForward"
              :color="equipment.id === subjectStore.selectedEquipment.id ? 'light' : 'medium'"
            ></ion-icon>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>
  </template>
  
  <script setup lang="ts">
  import {
    IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle,
    IonList, IonItem, IonLabel, IonIcon
  } from '@ionic/vue';
  import { computed } from 'vue';
  import { useInspectionStore } from '@/stores/inspectionStore';
  import { useSubjectStore } from '@/stores/subjectStore';
  import { chevronForward, chevronDown } from 'ionicons/icons';
  
  const inspectionStore = useInspectionStore();
  const subjectStore = useSubjectStore();
  
  // CRITICAL: Get the list of equipment selected for THIS specific inspection
  const selectedEquipmentList = computed(() => inspectionStore.selectedEquipmentList);
  
  /**
   * Handles the selection of a piece of equipment.
   * This triggers the loading of the associated subjects in the SubjectStore.
   * @param equipmentId The ID of the selected equipment.
   */
  const selectEquipment = (equipmentId: string) => {
      // Calls the action to switch the context in the SubjectStore
      subjectStore.loadEquipmentById(equipmentId);
  };
  </script>