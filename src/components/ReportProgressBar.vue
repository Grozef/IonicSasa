<template>
    <div class="progress-bar-container">
      <ion-progress-bar :value="progressValue" color="tertiary"></ion-progress-bar>
      <div class="progress-label">
        Progress: 
        <strong>{{ percentage }}%</strong> (Step {{ currentId }} of {{ totalSteps }}: {{ currentTitle }})
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { IonProgressBar } from '@ionic/vue';
  import { useInspectionStore } from '../stores/inspectionStore'; 
  
  const store = useInspectionStore();
  
  const currentId = computed(() => store.currentStepId);
  const totalSteps = computed(() => store.totalSteps);
  const currentTitle = computed(() => store.currentStepTitle);
  const percentage = computed(() => Math.round(store.progressPercentage));
  const progressValue = computed(() => store.progressPercentage / 100);
  </script>
  
  <style scoped>
  /* Container is fixed at the top to overlay the main content */
  .progress-bar-container {
    margin: 8px 10px; 
    padding: 8px 10px;
    
    /* The position fixes the bar relative to the viewport. */
    position: fixed;
    top: 0;
    left: 0;
    /* Width calc ensures the margins are respected by the fixed container */
    width: calc(100% - 20px); 
    z-index: 900; 
    background: var(--ion-background-color, #fff);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 5px 0; /* Internal padding for the progress bar label */
  }
  
  /* Styling for the progress bar itself */
  ion-progress-bar {
    height: 5px;
    margin-bottom: 5px;
  }
  
  /* Current step text label */
  .progress-label {
    text-align: center;
    font-size: 0.8rem;
    color: var(--ion-color-medium);
  }
  </style>