<template>
  <div>
    <ion-item lines="full" class="ion-margin-bottom">
      <ion-label>
        <p>Inspection Site</p>
        <h2 class="ion-text-wrap">{{ activeSiteName || 'No site selected' }}</h2>
      </ion-label>
    </ion-item>

    <ion-list v-if="activeSiteId && !isLoading">
      <ion-list-header>
        Available Equipment ({{ availableEquipments.length }})
        <p class="ion-text-wrap ion-no-margin">Select the equipment you need to inspect at this site.</p>
      </ion-list-header>

      <ion-item v-for="equipment in availableEquipments" :key="equipment.id">
        <ion-checkbox
          slot="start"
          :checked="isEquipmentSelected(equipment)"
          @ionChange="toggleEquipment(equipment)"
        ></ion-checkbox>
        <ion-label class="ion-text-wrap">
          <h3>{{ equipment.name }}</h3>
          <p>{{ equipment.id }}</p>
        </ion-label>
      </ion-item>
      
      <ion-item v-if="availableEquipments.length === 0">
        <ion-label class="ion-text-center">No equipment linked to **{{ activeSiteName }}**.</ion-label>
      </ion-item>
    </ion-list>

    <ion-item v-else-if="isLoading">
      <ion-label class="ion-text-center">Loading equipment...</ion-label>
    </ion-item>

    <ion-item v-else>
      <ion-label class="ion-text-center">Please select a site first (via the Dashboard).</ion-label>
    </ion-item>
  </div>
</template>

<script setup lang="ts">
import {
  IonList,
  IonItem,
  IonCheckbox,
  IonLabel,
  IonListHeader,
} from '@ionic/vue';
import { computed, onMounted } from 'vue';
import { useInspectionStore } from '@/stores/inspectionStore';
import { useEquipmentStore, Equipment } from '@/stores/equipmentStore';

// --- Store Setup ---
const inspectionStore = useInspectionStore();
const equipmentStore = useEquipmentStore();

// --- V-Model Setup ---
const props = defineProps<{
  modelValue: Equipment[]; // The list of selected equipment objects (from equipmentStore)
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: Equipment[]): void;
}>();

// --- Computed Properties ---
const activeSiteId = computed(() => inspectionStore.activeInspection.siteId);
const activeSiteName = computed(() => inspectionStore.activeInspection.siteName);
const isLoading = computed(() => equipmentStore.isLoading);

// The list of equipment to display, filtered by the active site and aligned with equipmentStore
const availableEquipments = computed(() => {
  const inspectionEquipments = inspectionStore.equipmentsForActiveSite;
  return inspectionEquipments.map(inspectionEq => {
    const eqData = equipmentStore.getEquipmentById(inspectionEq.id);
    return eqData || { id: inspectionEq.id, name: `Unknown Equipment (${inspectionEq.id})` };
  });
});

// --- Lifecycle Hooks ---
onMounted(async () => {
  if (!equipmentStore.allEquipment.length) {
    await equipmentStore.loadAllEquipment();
  }
});

// --- Methods ---
/**
 * Checks if a specific equipment item is currently selected.
 * @param equipment The Equipment object to check.
 * @returns boolean
 */
const isEquipmentSelected = (equipment: Equipment) => {
  return props.modelValue.some(e => e.id === equipment.id);
};

/**
 * Toggles the selection status of an equipment item and emits the updated list (v-model).
 * @param equipment The Equipment object to toggle.
 */
const toggleEquipment = (equipment: Equipment) => {
  if (!equipment.name) {
    console.warn(`Cannot select equipment ${equipment.id}: Missing name`);
    return;
  }
  const updatedValue = [...props.modelValue];
  const index = updatedValue.findIndex(e => e.id === equipment.id);
    
  if (index > -1) {
    // Deselect
    updatedValue.splice(index, 1);
  } else {
    // Select
    updatedValue.push(equipment);
  }
  emit('update:modelValue', updatedValue);
};
</script>