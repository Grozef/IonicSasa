// src/stores/subjectStore.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useEquipmentStore } from './equipmentStore';
import { useInspectionStore } from './inspectionStore';

export interface InspectionSubject {
  id: number;
  name: string;
  category: string;
  appliesTo: string[];
  isMandatory: boolean;
}

export interface Subject {
  id: number;
  name: string;
  status: 'Draft' | 'Submitted' | 'Validated';
  criticality: 1 | 2 | 3;
}

const allInspectionSubjects: InspectionSubject[] = [
  { id: 1, name: 'Hydraulic Hoses', category: 'Hydraulics', appliesTo: ['EX-320-01'], isMandatory: true },
  { id: 2, name: 'Bucket Teeth', category: 'Structure', appliesTo: ['EX-320-01'], isMandatory: true },
  { id: 3, name: 'Cab Controls', category: 'Ergonomics', appliesTo: ['EX-320-01', 'FRK-25-10'], isMandatory: false },
  { id: 10, name: 'Mast Structure', category: 'Structure', appliesTo: ['TC-550-02'], isMandatory: true },
  { id: 11, name: 'Slewing Mechanism', category: 'Mechanics', appliesTo: ['TC-550-02'], isMandatory: true },
  { id: 12, name: 'Base Bolts', category: 'Structure', appliesTo: ['TC-550-02'], isMandatory: true },
  { id: 20, name: 'Drum Condition', category: 'Structure', appliesTo: ['CM-42-07'], isMandatory: true },
  { id: 101, name: 'Area Protection (Safety)', category: 'Safety & Environment', appliesTo: ['GEN-15-11', 'EX-320-01'], isMandatory: true },
  { id: 102, name: 'Grounding', category: 'Safety & Environment', appliesTo: ['GEN-15-11'], isMandatory: true },
  { id: 201, name: 'Engine Oil Level and Condition', category: 'Engine & Fluids', appliesTo: ['EX-320-01', 'GEN-15-11'], isMandatory: true },
  { id: 301, name: 'Output Voltage/Frequency (V/Hz)', category: 'Electrical System', appliesTo: ['GEN-15-11'], isMandatory: true },
  { id: 302, name: 'Battery and Cable Condition', category: 'Electrical System', appliesTo: ['GEN-15-11', 'CM-42-07'], isMandatory: true },
  { id: 401, name: 'Fuel Level and Quality', category: 'Fuel System', appliesTo: ['GEN-15-11'], isMandatory: true },
  { id: 402, name: 'Leaks and Tank Integrity', category: 'Fuel System', appliesTo: ['GEN-15-11'], isMandatory: false },
  { id: 999, name: 'General Visual Inspection', category: 'General', appliesTo: ['GEN-15-11', 'TC-550-02'], isMandatory: true },
  { id: 501, name: 'Lift Mechanism', category: 'Mechanics', appliesTo: ['SL-200-04'], isMandatory: true },
  { id: 502, name: 'Platform Stability', category: 'Structure', appliesTo: ['SL-200-04'], isMandatory: true },
];

export const useSubjectStore = defineStore('subject', () => {
  const equipmentStore = useEquipmentStore();
  const inspectionStore = useInspectionStore();

  const selectedEquipment = ref<{ id: string; name: string; subjects: Subject[] }>({
    id: '', name: 'No Equipment Selected', subjects: []
  });
  const selectedSubject = ref<Subject | null>(null);
  const activeSubjectIndex = ref(-1);

  // COMPUTED: list of subjects for current equipment
  const subjects = computed(() => selectedEquipment.value.subjects);

  const getSubjectsForEquipment = (equipmentId: string): Subject[] => {
    const applicable = allInspectionSubjects.filter(s => s.appliesTo.includes(equipmentId));
    return applicable.map(master => {
      const saved = inspectionStore.subjectData[master.id];
      return {
        id: master.id,
        name: master.name,
        criticality: saved?.criticality ?? 1,
        status: saved?.status ?? 'Draft'
      };
    });
  };

  const fullInspectionSummary = computed(() => {
    const selected = inspectionStore.selectedEquipmentList;
    if (!selected.length) return [];

    return selected.map(equipment => {
      const equipmentData = equipmentStore.getEquipmentById(equipment.id) || {
        id: equipment.id,
        name: `Unknown Equipment (${equipment.id})`
      };

      let subjects: Subject[] = getSubjectsForEquipment(equipment.id);
      subjects = subjects.sort((a: Subject, b: Subject) => b.criticality - a.criticality);

      return { equipment: equipmentData, subjects };
    });
  });

  const hasPreviousSubject = computed(() => activeSubjectIndex.value > 0);
  const hasNextSubject = computed(() => activeSubjectIndex.value < subjects.value.length - 1);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Draft': return 'medium';
      case 'Submitted': return 'warning';
      case 'Validated': return 'success';
      default: return 'primary';
    }
  };

  const getCriticalityColor = (level: 1 | 2 | 3): string => {
    switch (level) {
      case 3: return 'danger';
      case 2: return 'warning';
      case 1: return 'success';
      default: return 'medium';
    }
  };

  const loadEquipmentById = async (equipmentId: string) => {
    if (!equipmentStore.allEquipment.length) await equipmentStore.loadAllEquipment();
    const data = equipmentStore.getEquipmentById(equipmentId);
    const subjects = getSubjectsForEquipment(equipmentId);

    selectedEquipment.value = {
      id: equipmentId,
      name: data?.name || `Unknown (${equipmentId})`,
      subjects
    };

    if (subjects.length > 0) {
      activeSubjectIndex.value = 0;
      selectedSubject.value = subjects[0];
    } else {
      activeSubjectIndex.value = -1;
      selectedSubject.value = null;
    }
  };

  const updateSubjectCriticality = (subjectId: number, level: 1 | 2 | 3) => {
    inspectionStore.setSubjectCriticality(subjectId, level);
    const subject = selectedEquipment.value.subjects.find(s => s.id === subjectId);
    if (subject) subject.criticality = level;
  };

  const setSelectedSubject = (subject: Subject) => {
    const index = subjects.value.findIndex(s => s.id === subject.id);
    if (index !== -1) {
      activeSubjectIndex.value = index;
      selectedSubject.value = subject;
    }
  };

  const addSubject = (name: string) => {
    if (!name.trim() || !selectedEquipment.value.id || selectedEquipment.value.subjects.some(s => s.name === name)) {
      console.error('Invalid custom subject creation attempt.');
      return;
    }
    const maxAbsId = Math.max(...allInspectionSubjects.map(s => Math.abs(s.id)), 0);
    const newId = -(maxAbsId + 1);
    const newSubject: Subject = {
      id: newId,
      name,
      status: 'Draft',
      criticality: 1,
    };
    allInspectionSubjects.push({
      id: newId,
      name,
      category: 'Custom',
      appliesTo: [selectedEquipment.value.id],
      isMandatory: false,
    });
    selectedEquipment.value.subjects.push(newSubject);
    setSelectedSubject(newSubject);
  };

  const goToPreviousSubject = () => {
    if (hasPreviousSubject.value) {
      activeSubjectIndex.value--;
      selectedSubject.value = subjects.value[activeSubjectIndex.value];
    }
  };

  const goToNextSubject = () => {
    if (hasNextSubject.value) {
      activeSubjectIndex.value++;
      selectedSubject.value = subjects.value[activeSubjectIndex.value];
    }
  };

  return {
    selectedEquipment,
    selectedSubject,
    activeSubjectIndex,
    subjects, 
    hasPreviousSubject,
    hasNextSubject,
    fullInspectionSummary,
    allInspectionSubjects: computed(() => allInspectionSubjects),
    getStatusColor,
    getCriticalityColor,
    loadEquipmentById,
    updateSubjectCriticality,
    setSelectedSubject, 
    addSubject,         
    goToPreviousSubject,
    goToNextSubject,
    getSubjectsForEquipment,
  };
});