<template>
  <ion-app class="ion-padding-top">
    <!-- Render side menu for web or Android -->
    <ion-split-pane content-id="main-content">
      <ion-menu content-id="main-content" type="overlay">
        <ion-content :fullscreen="true">
          <ion-list id="inbox-list">
            <ion-list-header>Art Social Publisher</ion-list-header>
            <ion-note>Mon Portfolio</ion-note>

            <ion-menu-toggle :auto-hide="false" v-for="(p, i) in menuPages" :key="i">
              <ion-item
                @click="selectedIndex = i"
                router-direction="root"
                :router-link="p.url"
                lines="none"
                :detail="false"
                class="hydrated"
                :class="{ selected: selectedIndex === i }"
              >
                <ion-icon aria-hidden="true" slot="start" :ios="p.iosIcon" :md="p.mdIcon"></ion-icon>
                <ion-label>{{ p.title }}</ion-label>
              </ion-item>
            </ion-menu-toggle>
          </ion-list>

          <ion-list id="labels-list">
            <ion-list-header>Collections</ion-list-header>
            <ion-item v-for="(collection, index) in galleryStore.collections" lines="none" :key="index">
              <ion-icon aria-hidden="true" slot="start" :ios="colorPaletteOutline" :md="colorPaletteSharp"></ion-icon>
              <ion-label>{{ collection.name }}</ion-label>
            </ion-item>
          </ion-list>
        </ion-content>
        <ReportProgressBar />
      </ion-menu>

      <!-- Render TabsLayout for mobile (Android/iOS), or router-outlet for web -->
      <TabsLayout v-if="isMobile" id="main-content" class="main-content-with-offset" />
      <ion-router-outlet v-else id="main-content" class="main-content-with-offset"></ion-router-outlet>
    </ion-split-pane>
  </ion-app>
</template>

<script setup lang="ts">
import {
  IonApp,
  IonContent,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonMenu,
  IonMenuToggle,
  IonNote,
  IonRouterOutlet,
  IonSplitPane,
} from '@ionic/vue';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useGalleryStore } from './stores/galleryStore';
import TabsLayout from './components/TabsLayout.vue';
import ReportProgressBar from './components/ReportProgressBar.vue';
import { Capacitor } from '@capacitor/core';
import {
  imagesOutline,
  imagesSharp,
  addCircleOutline,
  addCircleSharp,
  cameraOutline,
  cameraSharp,
  timeOutline,
  timeSharp,
  colorPaletteOutline,
  colorPaletteSharp,
  settingsOutline,
  settingsSharp,
  createOutline,
  createSharp,
} from 'ionicons/icons';

// --- PLATFORM DETECTION ---
const isMobile = Capacitor.isNativePlatform();
const isAndroid = Capacitor.getPlatform() === 'android';

// 1. DEFINE ALL PAGES WITH PLATFORM TAGS
const allAppPages = [
  { title: 'Ma Galerie', url: '/dashboard', iosIcon: imagesOutline, mdIcon: imagesSharp, platform: 'all' },
  { title: 'Nouvelle Session', url: '/new-inspection', iosIcon: addCircleOutline, mdIcon: addCircleSharp, platform: 'web' },
  { title: 'Capturer Photos', url: '/inspection-subjects', iosIcon: cameraOutline, mdIcon: cameraSharp, platform: 'web' },
  { title: 'Éditer & Métadonnées', url: '/add-subject', iosIcon: createOutline, mdIcon: createSharp, platform: 'all' },
  { title: 'Historique', url: '/past-inspections', iosIcon: timeOutline, mdIcon: timeSharp, platform: 'web' },
  { title: 'Paramètres', url: '/settings', iosIcon: settingsOutline, mdIcon: settingsSharp, platform: 'mobile' },
];

// 2. DYNAMICALLY FILTER THE MENU PAGES BASED ON PLATFORM
const menuPages = allAppPages.filter(p => {
  if (p.platform === 'all') return true;
  if (p.platform === 'mobile' && isMobile) return true;
  if (p.platform === 'web' && !isMobile) return true;
  return false;
});

// 3. Define reactive state and hooks
const selectedIndex = ref(-1);
const galleryStore = useGalleryStore();
const route = useRoute();

// 4. WATCH LOGIC
watch(
  () => route.path,
  (newPath) => {
    // Update selected index for side menu (web or Android)
    if (!isMobile || isAndroid) {
      if (newPath.startsWith('/inspection/') || newPath.startsWith('/photo/')) {
        galleryStore.setCurrentStepByPath(newPath);
      }
      const path = newPath.split('/')[1];
      if (path !== undefined) {
        selectedIndex.value = menuPages.findIndex((page) => page.url === `/${path}`);
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
/* Offset for ReportProgressBar */
.main-content-with-offset {
  padding-top: 60px; /* Matches ReportProgressBar height */
}

/* Ensure ion-app respects safe areas */
.ion-padding-top {
  padding-top: env(safe-area-inset-top, 0px);
}

/* Menu styles */
ion-menu ion-content {
  --background: var(--ion-item-background, var(--ion-background-color, #fff));
  --offset-top: 0px !important;
  --padding-top: calc(20px + env(safe-area-inset-top, 0px)) !important;
  --padding-bottom: 20px;
}

ion-menu.md ion-content {
  --padding-start: 8px;
  --padding-end: 8px;
}
ion-menu.md ion-list {
  padding: 20px 0;
}
ion-menu.md ion-note {
  margin-bottom: 30px;
}
ion-menu.md ion-list-header,
ion-menu.md ion-note {
  padding-left: 10px;
  padding-top: 20px;
}
ion-menu.md ion-list#inbox-list {
  border-bottom: 1px solid var(--ion-background-color-step-150, #d7d8da);
}
ion-menu.md ion-list#inbox-list ion-list-header {
  font-size: 22px;
  font-weight: 600;
  min-height: 20px;
}
ion-menu.md ion-list#labels-list ion-list-header {
  font-size: 16px;
  margin-bottom: 18px;
  color: #757575;
  min-height: 26px;
}
ion-menu.md ion-item {
  --padding-start: 10px;
  --padding-end: 10px;
  border-radius: 4px;
}
ion-menu.md ion-item.selected {
  --background: rgba(var(--ion-color-primary-rgb), 0.14);
}
ion-menu.md ion-item.selected ion-icon {
  color: var(--ion-color-primary);
}
ion-menu.md ion-item ion-icon {
  color: #616e7e;
}
ion-menu.md ion-item ion-label {
  font-weight: 500;
}

ion-note {
  display: inline-block;
  font-size: 16px;
  color: var(--ion-color-medium-shade);
}
ion-item.selected {
  --color: var(--ion-color-primary);
}
</style>
