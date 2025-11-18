<template>
  <ion-page>
    <!-- HEADER + HAMBURGER -->
    <ion-header>
      <!-- <ion-toolbar> -->
        <ion-buttons slot="start">
          <ion-menu-button menu="main-menu"></ion-menu-button>
        </ion-buttons>
        <!-- <ion-title>Art Social Publisher</ion-title> -->
      <!-- </ion-toolbar> -->
    </ion-header>

    <!-- TABS -->
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>

      <ion-tab-bar slot="bottom">
        <!-- Galerie / Dashboard -->
        <ion-tab-button tab="dashboard" href="/dashboard">
          <ion-icon :icon="imagesOutline" />
          <ion-label>Galerie</ion-label>
        </ion-tab-button>

        <!-- Capturer / Nouvelle photo -->
        <ion-tab-button tab="capture" href="/photo-capture">
          <ion-icon :icon="cameraOutline" />
          <ion-label>Capturer</ion-label>
        </ion-tab-button>

        <!-- Éditer / Métadonnées -->
        <ion-tab-button tab="edit" href="/photo-edit">
          <ion-icon :icon="createOutline" />
          <ion-label>Éditer</ion-label>
        </ion-tab-button>

        <!-- Paramètres -->
        <ion-tab-button tab="settings" href="/settings">
          <ion-icon :icon="settingsOutline" />
          <ion-label>Paramètres</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
/**
 * @file TabsLayout.vue
 * @description Bottom tabs adaptée pour l'application de galerie d'art
 * Navigation principale : Galerie, Capturer, Éditer, Paramètres
 */
import {
  IonPage,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonLabel,
  IonIcon,
  IonRouterOutlet,
  IonHeader,
  // IonToolbar,
  // IonTitle,
  IonButtons,
  IonMenuButton,
} from '@ionic/vue';
import { 
  imagesOutline,
  cameraOutline, 
  createOutline, 
  settingsOutline 
} from 'ionicons/icons';
</script>

<style scoped>
ion-header {
  --ion-toolbar-background: var(--ion-background-color);
}

/* Style personnalisé pour la tab bar */
/* ion-tab-bar {
  --background: var(--ion-background-color);
  border-top: 1px solid var(--ion-border-color, #e0e0e0);
  padding-bottom: env(safe-area-inset-bottom, 0px);
} */

ion-tab-button {
  --color: var(--ion-color-medium);
  --color-selected: var(--ion-color-primary);
}

/* Animation au tap */
ion-tab-button::part(native) {
  transition: transform 0.1s ease;
}

ion-tab-button:active::part(native) {
  transform: scale(0.95);
}
</style>
