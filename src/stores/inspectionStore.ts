import { defineStore } from 'pinia';

// --- Types ---
interface ProgressStep {
  id: number;
  title: string;
  path: string;
}

interface Site {
  id: string;
  name: string;
}

interface Equipment {
  id: string;
  name: string;
  siteIds: string[];
}

// Runtime data for each subject: criticality, status, conclusion
interface SubjectData {
  criticality: 1 | 2 | 3;
  status: 'Draft' | 'Submitted' | 'Validated';
  conclusion?: string;
}

export interface Inspection {
  id: number;
  title: string;
  date: string;
  status: 'Draft' | 'Submitted' | 'Validated';
  siteId: string | null;
  equipmentIds: string[];
  currentFlowStepId: number;
  subjectData: Record<number, SubjectData>; // Stores criticality, status, conclusion
  finalReportConclusion: string;
}

interface ActiveInspection {
  id: number | null;
  siteId: string | null;
  siteName: string | null;
}

interface InspectionState {
  inspections: Inspection[];
  sites: Site[];
  allEquipments: Equipment[];
  reportSteps: ProgressStep[];
  currentStepId: number;
  activeInspection: ActiveInspection;
  subjectData: Record<number, SubjectData>;
  finalReportConclusion: string;
}

export const useInspectionStore = defineStore('inspection', {
  state: (): InspectionState => ({
    inspections: [
      {
        id: 4,
        title: 'Test Pinia Multi-Equipment',
        date: '2025-02-28',
        status: 'Draft',
        siteId: 'site_a',
        equipmentIds: ['TC-550-02', 'EX-320-01'],
        currentFlowStepId: 2,
        subjectData: {},
        finalReportConclusion: ''
      },
      {
        id: 1,
        title: 'Riverside Bridge',
        date: '2025-03-14',
        status: 'Draft',
        siteId: 'site_a',
        equipmentIds: ['EX-320-01'],
        currentFlowStepId: 3,
        subjectData: {},
        finalReportConclusion: ''
      },
      {
        id: 2,
        title: 'East Tunnel',
        date: '2025-03-10',
        status: 'Submitted',
        siteId: 'site_b',
        equipmentIds: ['CM-42-07'],
        currentFlowStepId: 5,
        subjectData: {},
        finalReportConclusion: ''
      },
    ],
    sites: [
      { id: 'site_a', name: 'Factory Alpha (Paris)' },
      { id: 'site_b', name: 'Warehouse Beta (Lyon)' },
      { id: 'site_c', name: 'Office Gamma (Marseille)' },
      { id: 'site_d', name: 'Tokyo Branch (Site Delta)' },
    ],
    allEquipments: [
      { id: 'EX-320-01', siteIds: ['site_a', 'site_b'], name: 'Excavator - CAT 320' },
      { id: 'SL-200-04', siteIds: ['site_b', 'site_c'], name: 'Scissor Lift - SL-200' },
      { id: 'FRK-25-10', siteIds: ['site_b', 'site_c'], name: 'Forklift - Hyster 2.5T' },
      { id: 'TC-550-02', siteIds: ['site_a'], name: 'Tower Crane - TC-550' },
      { id: 'CM-42-07', siteIds: ['site_b'], name: 'Concrete Mixer - CM-42' },
      { id: 'GEN-15-11', siteIds: ['site_c'], name: 'Generator - GEN-15kW' },
      { id: 'TL-400-03', siteIds: ['site_a'], name: 'Telescopic Loader - TL-400' },
      { id: 'DR-100-05', siteIds: ['site_a'], name: 'Road Roller - DR-100' },
      { id: 'GRD-50-01', siteIds: ['site_a'], name: 'Motor Grader - GRD-50' },
      { id: 'PV-800-01', siteIds: ['site_b'], name: 'Paver Finisher - PV-800' },
      { id: 'WEL-6-12', siteIds: ['site_b'], name: 'Arc Welder - Miller' },
      { id: 'AIR-05-09', siteIds: ['site_c'], name: 'Air Compressor - 5 HP' },
      { id: 'PMP-10-06', siteIds: ['site_c'], name: 'Water Pump - Submersible' },
      { id: 'BS-90-14', siteIds: ['site_d'], name: 'Bulldozer - Shantui 90' },
      { id: 'TK-15K-08', siteIds: ['site_d'], name: 'Fuel Tanker - 15,000L' },
    ],
    reportSteps: [
      { id: 1, title: 'Dashboard', path: '/dashboard' },
      { id: 2, title: 'New Inspection Setup', path: '/new-inspection' },
      { id: 3, title: 'Observations', path: '/inspection-subjects' },
      { id: 4, title: 'Conclusions', path: '/inspection-conclusions' },
      { id: 5, title: 'Review & Submit', path: '/inspection-review' },
    ],
    currentStepId: 1,
    activeInspection: {
      id: null,
      siteId: null,
      siteName: null,
    },
    subjectData: {},
    finalReportConclusion: '',
  }),

  getters: {
    availableSites: (state) => state.sites,
    equipmentsForActiveSite: (state) => {
      const siteId = state.activeInspection.siteId;
      return siteId ? state.allEquipments.filter(e => e.siteIds.includes(siteId)) : [];
    },
    selectedEquipmentList: (state) => {
      const insp = state.inspections.find(i => i.id === state.activeInspection.id);
      if (!insp) return [];
      return insp.equipmentIds
        .map(id => state.allEquipments.find(e => e.id === id))
        .filter((e): e is Equipment => !!e);
    },
    currentStepTitle: (state) => {
      const step = state.reportSteps.find(s => s.id === state.currentStepId);
      return step ? step.title : 'N/A';
    },
    totalSteps: (state) => state.reportSteps.length,
    progressPercentage: (state) => {
      const flowSteps = state.reportSteps.filter(s => s.id !== 1);
      const currentIndex = flowSteps.findIndex(s => s.id === state.currentStepId);
      const total = flowSteps.length;
      if (currentIndex === -1) return 0;
      return ((currentIndex + 1) / total) * 100;
    },
    getSubjectConclusion: (state) => (subjectId: number): string => {
      return state.subjectData[subjectId]?.conclusion || '';
    },
  },

  actions: {
    loadInspectionProgress(inspectionId: number) {
      const inspection = this.inspections.find(i => i.id === inspectionId);
      if (!inspection) return;

      this.currentStepId = inspection.currentFlowStepId;
      this.activeInspection.id = inspection.id;
      this.activeInspection.siteId = inspection.siteId;
      this.activeInspection.siteName = this.sites.find(s => s.id === inspection.siteId)?.name || null;
      this.subjectData = { ...inspection.subjectData };
      this.finalReportConclusion = inspection.finalReportConclusion;
    },

    updateInspectionProgress(inspectionId: number, newStepId: number) {
      const inspection = this.inspections.find(i => i.id === inspectionId);
      if (inspection && newStepId > inspection.currentFlowStepId) {
        inspection.currentFlowStepId = newStepId;
      }
    },

    goToNextStep() {
      const nextIndex = this.reportSteps.findIndex(s => s.id === this.currentStepId) + 1;
      if (nextIndex < this.reportSteps.length) {
        this.currentStepId = this.reportSteps[nextIndex].id;
        if (this.activeInspection.id !== null) {
          const insp = this.inspections.find(i => i.id === this.activeInspection.id);
          if (insp) insp.currentFlowStepId = this.currentStepId;
        }
      }
    },

    setCurrentStepByPath(path: string) {
      const step = this.reportSteps.find(s => s.path === path);
      if (step) {
        this.currentStepId = step.id;
        if (this.activeInspection.id !== null) {
          const insp = this.inspections.find(i => i.id === this.activeInspection.id);
          if (insp) insp.currentFlowStepId = step.id;
        }
      }
    },

    initializeNewInspection() {
      const newId = Date.now();
      this.activeInspection.id = newId;
      this.activeInspection.siteId = null;
      this.activeInspection.siteName = null;
      this.currentStepId = this.reportSteps.find(s => s.path === '/new-inspection')?.id || 2;
      this.subjectData = {};
      this.finalReportConclusion = '';

      const newInspection: Inspection = {
        id: newId,
        title: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Draft',
        siteId: null,
        equipmentIds: [],
        currentFlowStepId: this.currentStepId,
        subjectData: {},
        finalReportConclusion: ''
      };
      this.inspections.push(newInspection);
    },

    setActiveSite(siteId: string) {
      this.activeInspection.siteId = siteId;
      this.activeInspection.siteName = this.sites.find(s => s.id === siteId)?.name || null;
      if (this.activeInspection.id !== null) {
        const inspection = this.inspections.find(i => i.id === this.activeInspection.id);
        if (inspection) inspection.siteId = siteId;
      }
    },

    finalizeInspectionCreation(title: string, selectedEquipments: Equipment[]) {
      if (!this.activeInspection.id || !this.activeInspection.siteId) return;
      const inspection = this.inspections.find(i => i.id === this.activeInspection.id);
      if (inspection) {
        inspection.title = title || `Inspection at ${this.activeInspection.siteName}`;
        inspection.equipmentIds = selectedEquipments.map(e => e.id);
        inspection.date = new Date().toISOString().split('T')[0];
        inspection.status = 'Draft';
        inspection.currentFlowStepId = this.currentStepId;
      }
    },

    setSubjectConclusion(subjectId: number, text: string) {
      this.$patch(state => {
        if (!state.subjectData[subjectId]) {
          state.subjectData[subjectId] = { criticality: 1, status: 'Draft' };
        }
        state.subjectData[subjectId].conclusion = text;

        const insp = state.inspections.find(i => i.id === state.activeInspection.id);
        if (insp) {
          insp.subjectData[subjectId] = { ...state.subjectData[subjectId] };
        }
      });
    },

    setFinalReportConclusion(text: string) {
      this.finalReportConclusion = text;
      if (this.activeInspection.id !== null) {
        const insp = this.inspections.find(i => i.id === this.activeInspection.id);
        if (insp) insp.finalReportConclusion = text;
      }
    },

    setSubjectCriticality(subjectId: number, level: 1 | 2 | 3) {
      this.$patch(state => {
        if (!state.subjectData[subjectId]) {
          state.subjectData[subjectId] = { criticality: 1, status: 'Draft' };
        }
        state.subjectData[subjectId].criticality = level;

        const insp = state.inspections.find(i => i.id === state.activeInspection.id);
        if (insp) {
          insp.subjectData[subjectId] = { ...state.subjectData[subjectId] };
        }
      });
    },

    saveAllConclusions() {
      if (this.activeInspection.id === null) return;
      const insp = this.inspections.find(i => i.id === this.activeInspection.id);
      if (insp) {
        insp.subjectData = { ...this.subjectData };
        insp.finalReportConclusion = this.finalReportConclusion;
      }
    },
  },
});