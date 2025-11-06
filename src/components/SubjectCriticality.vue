<template>
    <!--
      IonCard: A container for displaying a card with header, title, and content.
      ion-margin-top: Adds top margin to the card for better spacing.
    -->
    <ion-card class="ion-margin-top">
      <!--
        IonCardHeader: Container for the card's header section.
      -->
      <ion-card-header>
        <!--
          IonCardTitle: Displays the title of the card.
          The ion-chip displays the current criticality level and is aligned to the end.
        -->
        <ion-card-title>
          Criticity of the Subject
          <ion-chip
            :color="criticalityColor"
            slot="end"
            class="criticality-chip"
          >
            Level {{ currentCriticality }}
          </ion-chip>
        </ion-card-title>
      </ion-card-header>
  
      <!--
        IonCardContent: Container for the main content of the card.
      -->
      <ion-card-content>
        <!--
          IonList: Container for list items, here used to wrap the range slider.
          lines="none": Removes the default borders/lines for a cleaner look.
        -->
        <ion-list lines="none">
          <ion-item>
            <!--
              IonRange: A slider component for selecting a value within a range.
              :value: Binds the current criticality value.
              :min, :max, :step: Defines the range and step size.
              :pin: Shows a pin with the current value while sliding.
              @ionChange: Emits an event when the value changes.
              :color: Dynamically sets the color based on the criticality level.
            -->
            <ion-range
              :value="currentCriticality"
              :min="1"
              :max="3"
              :step="1"
              :pin="true"
              @ionChange="handleCriticalityChange($event)"
              :color="criticalityColor"
            >
              <!--
                IonLabel: Displays labels at the start and end of the range.
                :class: Dynamically applies a class based on the current criticality level for styling.
              -->
              <ion-label
                slot="start"
                :class="{
                  'red-label': currentCriticality === 3,
                  'orange-label': currentCriticality === 2,
                  'yellow-label': currentCriticality === 1
                }"
              >
                1 (Low)
              </ion-label>
              <ion-label
                slot="end"
                :class="{
                  'red-label': currentCriticality === 3,
                  'orange-label': currentCriticality === 2,
                  'yellow-label': currentCriticality === 1
                }"
              >
                3 (High)
              </ion-label>
  
              <!--
                IonBadge: Displays tick marks with labels for the range.
                slot: Positions the badge at the start, middle, or end of the range.
                color: Sets the color of the badge.
              -->
              <ion-badge slot="tick-mark-start" color="success">1</ion-badge>
              <ion-badge slot="tick-mark-middle" color="warning">2</ion-badge>
              <ion-badge slot="tick-mark-end" color="danger">3</ion-badge>
            </ion-range>
          </ion-item>
        </ion-list>
      </ion-card-content>
    </ion-card>
  </template>
  
  <script setup lang="ts">
  // Import necessary Ionic Vue components
  import {
    IonCard, IonCardHeader, IonCardTitle, IonCardContent,
    IonChip, IonRange, IonLabel, IonItem, IonList, IonBadge, RangeCustomEvent
  } from '@ionic/vue';
  // Import Vue's computed for reactive properties
  import { computed } from 'vue';
  // Import the subject store and Subject type
  import { useSubjectStore, Subject } from '@/stores/subjectStore';
  
  // Define props to receive the subject object from the parent component
  const props = defineProps<{
    subject: Subject
  }>();
  
  // Initialize the subject store
  const subjectStore = useSubjectStore();
  
  // Computed property to get the current criticality level from the subject prop
  const currentCriticality = computed<1 | 2 | 3>(() => props.subject.criticality);
  
  // Computed property to get the color based on the current criticality level
  const criticalityColor = computed(() => subjectStore.getCriticalityColor(currentCriticality.value));
  
  // Function to handle the change event of the range slider
  const handleCriticalityChange = (event: RangeCustomEvent) => {
    // Extract the new criticality value from the event
    const newCriticality = event.detail.value as 1 | 2 | 3;
    // Validate the new value and update the subject's criticality in the store
    if (newCriticality >= 1 && newCriticality <= 3) {
      subjectStore.updateSubjectCriticality(props.subject.id, newCriticality);
    }
  };
  </script>
  
  <style scoped>
  /*
    Custom styles for the criticality labels.
    These classes are dynamically applied based on the current criticality level.
  */
  .red-label {
    color: var(--ion-color-danger);
    font-weight: bold;
  }
  .orange-label {
    color: var(--ion-color-warning);
    font-weight: bold;
  }
  .yellow-label {
    /* Custom yellow color to match the desired visual style */
    color: #ffc409;
  }
  /*
    Style for the criticality chip to make the text bold.
  */
  .criticality-chip {
    font-weight: bold;
  }
  </style>
  