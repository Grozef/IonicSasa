<template>
  <ion-list>
    <ion-item v-for="equipment in equipments" :key="equipment.id">
      <ion-checkbox
        @ionChange="toggleEquipment(equipment)"
        :checked="modelValue.includes(equipment)"
      ></ion-checkbox>
      <ion-label>{{ equipment.name }} - {{ equipment.id }}</ion-label>
    </ion-item>
  </ion-list>
</template>

<script setup lang="ts">
import { IonList, IonItem, IonCheckbox, IonLabel } from '@ionic/vue';
import { ref } from 'vue';

// Define props for v-model
const props = defineProps<{
  modelValue: any[];
}>();

// Define emit for v-model
const emit = defineEmits<{
  (e: 'update:modelValue', value: any[]): void;
}>();

// List of equipments
const equipments = ref([
  { id: 'EX-320-01', name: 'Excavator - CAT 320' },
  { id: 'TC-550-02', name: 'Tower Crane - TC-550' },
  { id: 'CM-42-07', name: 'Concrete Mixer - CM-42' },
  { id: 'SL-200-04', name: 'Scissor Lift - SL-200' },
  { id: 'GEN-15-11', name: 'Generator - GEN-15kW' },
]);

// Toggle equipment selection
const toggleEquipment = (equipment: any) => {
  const updatedValue = [...props.modelValue];
  const index = updatedValue.indexOf(equipment);
  if (index > -1) {
    updatedValue.splice(index, 1);
  } else {
    updatedValue.push(equipment);
  }
  emit('update:modelValue', updatedValue);
};
</script>