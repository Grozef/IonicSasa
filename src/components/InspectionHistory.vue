<template>
  <ion-list>
    <ion-item v-for="inspection in inspectionStore.inspections" :key="inspection.id">
      <ion-label>
        <h2>{{ inspection.title }}</h2>
        <p>{{ inspection.date }}</p>
      </ion-label>
      <ion-badge :color="getStatusColor(inspection.status)">
        {{ inspection.status }}
      </ion-badge>
    </ion-item>
  </ion-list>
</template>

<script setup lang="ts">
import { IonList, IonItem, IonLabel, IonBadge } from '@ionic/vue';
import { useInspectionStore } from '@/stores/inspectionStore';

const inspectionStore = useInspectionStore();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Draft': return 'medium';
    case 'Submitted': return 'warning';
    case 'Validated': return 'success';
    default: return 'primary';
  }
};
</script>

<style scoped>
ion-item {
  --border-color: var(--ion-color-light-gray);
  margin-bottom: 8px;
}
ion-badge {
  margin-inline-start: 16px;
}
</style>
