# Spécifications - Art Social Publisher

## 📋 État actuel

### ✅ Stores créés/adaptés
- [x] `galleryStore.ts` - Gestion sessions et collections
- [x] `photoStore.ts` - Gestion photos avec édition
- [x] `metadataStore.ts` - Métadonnées et notes vocales

### ⏳ Stores à adapter
- [ ] `equipmentStore.ts` → Supprimer ou transformer en `collectionStore.ts`
- [ ] `subjectStore.ts` → Supprimer (logique intégrée dans photoStore)
- [ ] `inspectionStore.ts` → Garder temporairement ou supprimer

### 🔨 Vues à créer/adapter
- [ ] `MainDashboard.vue` → `Gallery.vue`
- [ ] `NewInspection.vue` → `NewSession.vue`
- [ ] `InspectionSubjects.vue` → `PhotoCapture.vue`
- [ ] Créer `PhotoEdit.vue` (nouveau)
- [ ] `InspectionReview.vue` → `Publish.vue`
- [ ] `InspectionConclusion.vue` → Supprimer ou transformer
- [ ] `InspectionHistory.vue` → `SessionHistory.vue`

### 🧩 Composants à créer/adapter
- [ ] `EquipmentList.vue` → `CollectionList.vue`
- [ ] `SubjectListCard.vue` → `PhotoCard.vue`
- [ ] `PhotoCaptureCard.vue` → Adapter pour œuvres
- [ ] Créer `PhotoEditor.vue` (éditeur d'images)
- [ ] Créer `MetadataForm.vue` (formulaire métadonnées)
- [ ] Créer `SocialPreview.vue` (aperçu réseaux sociaux)
- [ ] `NotesCaptureCard.vue` → Adapter pour métadonnées
- [ ] Créer `HashtagManager.vue`
- [ ] Créer `PhotoGrid.vue` (grille de photos)
- [ ] Créer `CollectionSelector.vue`

## 🎯 Fonctionnalités prioritaires

### 1. Galerie principale (Haute priorité)
**Vue:** `Gallery.vue`

**Fonctionnalités:**
- Afficher toutes les sessions (Draft, Ready, Published)
- Filtrer par collection
- Filtrer par statut
- Créer nouvelle session
- Statistiques rapides (nombre de photos, sessions, etc.)
- Recherche par titre/tags

**Composants nécessaires:**
- `SessionCard.vue` - Carte pour chaque session
- `CollectionFilter.vue` - Filtre par collection
- `StatusBadge.vue` - Badge de statut
- `StatsWidget.vue` - Widget statistiques

### 2. Création de session (Haute priorité)
**Vue:** `NewSession.vue`

**Fonctionnalités:**
- Sélection de collection (ou création nouvelle)
- Saisie du titre de session
- Date automatique
- Navigation vers capture photos

**Composants nécessaires:**
- `CollectionSelector.vue` - Sélecteur de collection
- `CollectionCreator.vue` - Modal création collection

### 3. Capture de photos (Haute priorité)
**Vue:** `PhotoCapture.vue`

**Fonctionnalités:**
- Bouton prise de photo (caméra)
- Bouton import galerie
- Affichage des photos capturées (grille)
- Suppression de photos
- Navigation vers édition/métadonnées

**Composants nécessaires:**
- `PhotoGrid.vue` - Grille de photos avec actions
- `CameraButton.vue` - Bouton stylisé caméra
- `PhotoThumbnail.vue` - Miniature photo avec actions

### 4. Édition et métadonnées (Priorité moyenne)
**Vue:** `PhotoEdit.vue`

**Fonctionnalités:**
- Sélection d'une photo
- Éditeur d'image (filtres, recadrage, rotation)
- Formulaire de métadonnées complet
- Reconnaissance vocale pour notes
- Gestion des tags et hashtags
- Prévisualisation réseaux sociaux

**Composants nécessaires:**
- `PhotoEditor.vue` - Éditeur d'images
  - Filtres (noir&blanc, sépia, contraste, etc.)
  - Recadrage
  - Rotation
  - Ajustements (luminosité, saturation, etc.)
- `MetadataForm.vue` - Formulaire métadonnées
  - Titre
  - Description
  - Technique/Medium
  - Dimensions
  - Année
  - Prix & À vendre
- `TagManager.vue` - Gestion des tags
- `HashtagManager.vue` - Gestion des hashtags
- `VoiceNotes.vue` - Prise de notes vocales
- `SocialPreview.vue` - Prévisualisation pour chaque plateforme

### 5. Publication (Priorité moyenne)
**Vue:** `Publish.vue`

**Fonctionnalités:**
- Revue de toutes les photos de la session
- Vérification des métadonnées
- Sélection des plateformes (Instagram, Facebook, Twitter)
- Génération des légendes par plateforme
- Export des photos avec métadonnées
- Marquage comme publié

**Composants nécessaires:**
- `PublishReview.vue` - Revue finale
- `PlatformSelector.vue` - Sélection plateformes
- `CaptionGenerator.vue` - Génération légendes
- `ExportButton.vue` - Bouton export

### 6. Historique (Priorité basse)
**Vue:** `SessionHistory.vue`

**Fonctionnalités:**
- Liste de toutes les sessions
- Filtres par date, collection, statut
- Statistiques détaillées
- Réédition de sessions

## 🎨 Fonctionnalités d'édition d'images

### Bibliothèques recommandées

1. **Pica** - Redimensionnement de qualité
   ```bash
   npm install pica
   ```

2. **CamanJS** ou **Fabric.js** - Filtres et manipulation
   ```bash
   npm install fabricjs
   ```

3. **Cropper.js** - Recadrage
   ```bash
   npm install cropperjs
   ```

### Filtres à implémenter
- Noir & Blanc
- Sépia
- Vintage
- Luminosité
- Contraste
- Saturation
- Teinte
- Flou
- Netteté
- Vignette

### Transformations
- Recadrage libre
- Recadrage avec ratios (1:1, 4:5, 16:9)
- Rotation (90°, 180°, 270°, libre)
- Flip horizontal/vertical
- Redimensionnement

## 📱 Fonctionnalités réseaux sociaux

### Instagram
- Format: 1080x1080 (carré) ou 1080x1350 (portrait)
- Légende: Titre + Description + Hashtags (max 30)
- Emojis suggérés
- @mentions

### Facebook
- Format: Flexible
- Légende: Plus longue, description détaillée
- Tags de lieu
- Options de vente (marketplace)

### Twitter
- Format: 1200x675 recommandé
- Légende: 280 caractères max
- Hashtags (2-3 recommandés)

### Export
- Métadonnées EXIF/IPTC intégrées
- Watermark optionnel
- Qualité compression paramétrable

## 🔧 Fonctionnalités techniques

### Persistance
- Utiliser `pinia-plugin-persistedstate` (déjà installé)
- Configuration dans `main.ts`:
  ```typescript
  pinia.use(piniaPluginPersistedstate)
  ```

### Stockage photos
- Photos originales: `Directory.Data` via Filesystem
- Photos éditées: Cache local
- Nettoyage automatique des anciennes sessions

### Performance
- Lazy loading des images
- Compression adaptative
- Pagination de la galerie
- Cache intelligent

### Offline first
- Toutes les fonctionnalités disponibles offline
- Synchronisation en arrière-plan (future)
- Indicateur de statut online/offline

## 📦 Dépendances à ajouter

```json
{
  "dependencies": {
    "pica": "^9.0.1",
    "fabricjs": "^5.3.0",
    "cropperjs": "^1.6.0",
    "exif-js": "^2.3.0"
  }
}
```

## 🚀 Roadmap de développement

### Phase 1 - MVP (2-3 semaines)
1. Adapter les vues principales
2. Créer la galerie de base
3. Système de capture photos
4. Formulaire métadonnées simple
5. Export simple des photos

### Phase 2 - Édition (2-3 semaines)
1. Éditeur d'images avec filtres de base
2. Recadrage et rotation
3. Gestion avancée des métadonnées
4. Reconnaissance vocale pour notes

### Phase 3 - Social (1-2 semaines)
1. Prévisualisation réseaux sociaux
2. Génération automatique de légendes
3. Optimisation des formats
4. Gestion des hashtags

### Phase 4 - Polish (1-2 semaines)
1. Animations et transitions
2. Onboarding utilisateur
3. Paramètres et préférences
4. Statistiques et analytics

### Phase 5 - Advanced (futur)
1. Synchronisation cloud
2. Partage direct sur réseaux sociaux (API)
3. Templates de légendes
4. AI pour suggestions de hashtags
5. Portfolio web généré automatiquement

## 📝 Notes importantes

### À supprimer/remplacer
- Tous les fichiers liés aux "inspections"
- Tous les fichiers liés aux "équipements" (sauf si transformé en collections)
- Tous les fichiers liés aux "subjects"
- Le vocabulaire technique (utiliser vocabulaire artistique)

### À conserver
- Structure de navigation par étapes
- Système de prise de photos
- Système de reconnaissance vocale
- Système d'enregistrement audio
- Persistance avec Pinia

### Considérations UI/UX
- Thème artistique (couleurs, typographie)
- Icônes adaptées (palette, pinceau, appareil photo)
- Workflow intuitif pour artistes
- Grande importance aux visuels
- Prévisualisation constante des photos

## 🎨 Design System

### Couleurs suggérées
```css
--primary: #6366f1 (indigo)
--secondary: #ec4899 (pink)
--accent: #f59e0b (amber)
--success: #10b981 (green)
--background: #f8fafc
--surface: #ffffff
--text: #1e293b
```

### Typographie
- Titre: Playfair Display ou Montserrat
- Corps: Inter ou Open Sans

## ✅ Checklist de migration

### Configuration
- [ ] Mettre à jour `package.json`
- [ ] Mettre à jour `capacitor.config.ts`
- [ ] Mettre à jour `ionic.config.json`
- [ ] Adapter les icônes et splash screens

### Stores
- [ ] Finaliser `galleryStore`
- [ ] Finaliser `photoStore`
- [ ] Finaliser `metadataStore`
- [ ] Supprimer stores obsolètes
- [ ] Tester persistance

### Routes
- [ ] Créer nouveau `router/index.ts`
- [ ] Définir toutes les routes
- [ ] Guards de navigation si nécessaire

### Vues
- [ ] Créer/adapter toutes les vues
- [ ] Tests de navigation
- [ ] Responsive design

### Composants
- [ ] Créer composants de base
- [ ] Tests d'intégration
- [ ] Documentation composants

### Tests
- [ ] Tests unitaires stores
- [ ] Tests E2E workflow complet
- [ ] Tests sur devices réels

### Documentation
- [ ] README complet
- [ ] Guide utilisateur
- [ ] Documentation technique
- [ ] Changelog

Cette spécification servira de guide pour le développement futur de l'application.
