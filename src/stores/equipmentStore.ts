import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// --- Types ---
// Represents a piece of equipment with a unique ID and name
export interface Equipment {
    id: string;
    name: string;
}

// --- FIXTURES (Simulates API) ---
// Mock data to simulate an API response for equipment
const allEquipmentData: Equipment[] = [
    { id: 'EX-320-01', name: 'Excavator - CAT 320' },
    { id: 'SL-200-04', name: 'Scissor Lift - SL-200' },
    { id: 'FRK-25-10', name: 'Forklift - Hyster 2.5T' },
    { id: 'TC-550-02', name: 'Tower Crane - TC-550' },
    { id: 'CM-42-07', name: 'Concrete Mixer - CM-42' },
    { id: 'GEN-15-11', name: 'Generator - GEN-15kW' },
    { id: 'TL-400-03', name: 'Telescopic Loader - TL-400' },
    { id: 'DR-100-05', name: 'Road Roller - DR-100' },
    { id: 'GRD-50-01', name: 'Motor Grader - GRD-50' },
    { id: 'PV-800-01', name: 'Paver Finisher - PV-800' },
    { id: 'WEL-6-12', name: 'Arc Welder - Miller' },
    { id: 'AIR-05-09', name: 'Air Compressor - 5 HP' },
    { id: 'PMP-10-06', name: 'Water Pump - Submersible' },
    { id: 'BS-90-14', name: 'Bulldozer - Shantui 90' },
    { id: 'TK-15K-08', name: 'Fuel Tanker - 15,000L' },
];

export const useEquipmentStore = defineStore('equipment', () => {
    // --- State ---
    // Reactive list of equipment, initially empty
    const equipmentList = ref<Equipment[]>([]);
    // Loading state to track if equipment is being loaded
    const isLoading = ref(false);

    // --- Getters ---
    // Computed property to expose the full list of equipment
    const allEquipment = computed(() => equipmentList.value);
    // Computed function to find equipment by ID
    const getEquipmentById = computed(() => (id: string) => {
        return equipmentList.value.find(e => e.id === id);
    });

    // --- Actions ---
    // Simulates an API call to load all equipment
    const loadAllEquipment = async () => {
        // Avoid reloading if equipment is already loaded
        if (equipmentList.value.length > 0) return;
        isLoading.value = true;
        try {
            // Simulate network delay and API call
            await new Promise(resolve => setTimeout(resolve, 500));
            // Populate the equipment list with mock data
            equipmentList.value = allEquipmentData;
        } catch (error) {
            // Log and rethrow any errors
            console.error('Failed to load equipment:', error);
            throw error;
        } finally {
            // Reset loading state
            isLoading.value = false;
        }
    };

    // Expose state, getters, and actions to the component
    return {
        equipmentList,
        isLoading,
        allEquipment,
        getEquipmentById,
        loadAllEquipment,
    };
});
