<template>
  <ion-page>
    <!-- Page header with menu button -->
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Inspection History</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <InspectionHistory />
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonButtons, 
  IonMenuButton 
} from '@ionic/vue';
import InspectionHistory from '@/components/InspectionHistory.vue';
</script>