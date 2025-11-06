import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import { useGalleryStore } from '@/stores/galleryStore';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/MainDashboard.vue'),
    meta: {
      title: 'Ma Galerie'
    }
  },
  {
    path: '/new-session',
    name: 'NewSession',
    component: () => import('@/views/NewSession.vue'),
    meta: {
      title: 'Nouvelle Session',
      requiresActiveSession: false
    }
  },
  {
    path: '/photo-capture/:id',
    name: 'PhotoCapture',
    component: () => import('@/views/PhotoCapture.vue'),
    props: true,
    meta: {
      title: 'Capture Photos',
      requiresActiveSession: true
    }
  },
  {
    path: '/photo-edit',
    name: 'PhotoEdit',
    component: () => import('@/views/PhotoEdit.vue'),
    meta: {
      title: 'Édition & Métadonnées',
      requiresActiveSession: true
    }
  },
  {
    path: '/publish/:id',
    name: 'Publish',
    component: () => import('@/views/Publish.vue'),
    props: true,
    meta: {
      title: 'Publication',
      requiresActiveSession: true
    }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/InspectionHistory.vue'),
    meta: {
      title: 'Historique'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsPage.vue'),
    meta: {
      title: 'Paramètres'
    }
  },
  // Redirections pour compatibilité avec anciennes routes
  {
    path: '/new-inspection',
    redirect: '/new-session'
  },
  {
    path: '/inspection-subjects/:id',
    redirect: to => `/photo-capture/${to.params.id}`
  },
  {
    path: '/add-subject',
    redirect: '/photo-edit'
  },
  {
    path: '/inspection-review/:id',
    redirect: to => `/publish/${to.params.id}`
  },
  {
    path: '/past-inspections',
    redirect: '/history'
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Navigation guard pour vérifier la session active
router.beforeEach((to, from, next) => {
  const galleryStore = useGalleryStore();
  
  // Vérifier si la route nécessite une session active
  if (to.meta.requiresActiveSession) {
    if (galleryStore.activeSession.id === null) {
      // Rediriger vers la galerie si pas de session active
      console.warn('No active session, redirecting to dashboard');
      next('/dashboard');
      return;
    }
  }
  
  // Mettre à jour le step actuel si applicable
  if (to.path && typeof to.path === 'string') {
    galleryStore.setCurrentStepByPath(to.path);
  }
  
  next();
});

// Hook after navigation pour mettre à jour le titre de la page
router.afterEach((to) => {
  const title = to.meta.title as string || 'Art Social Publisher';
  document.title = `${title} - Art Social Publisher`;
});

export default router;
