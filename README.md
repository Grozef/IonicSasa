# Art Social Publisher

Application mobile Ionic/Vue pour artistes permettant de gérer, éditer et publier des photos d'œuvres sur les réseaux sociaux.

## 🎨 Description

Cette application permet aux artistes de :
- Photographier leurs œuvres
- Éditer et transformer les photos
- Ajouter des métadonnées complètes (titre, description, techniques, dimensions, etc.)
- Utiliser la reconnaissance vocale pour les notes
- Préparer des publications optimisées pour Instagram, Facebook, Twitter
- Organiser leurs œuvres par collections
- Gérer leurs sessions de photographie

## 🏗️ Architecture

### Stack Technique
- **Framework**: Vue 3 + TypeScript
- **UI**: Ionic 8
- **État**: Pinia avec persistance
- **Build**: Vite
- **Mobile**: Capacitor 7
- **Capacités natives**: 
  - Caméra
  - Reconnaissance vocale
  - Système de fichiers
  - Enregistrement audio

### Structure du projet

```
art-social-publisher/
├── src/
│   ├── stores/
│   │   ├── galleryStore.ts       # Gestion des sessions et collections
│   │   ├── photoStore.ts         # Gestion des photos
│   │   ├── metadataStore.ts      # Métadonnées et notes
│   │   └── ...
│   ├── views/
│   │   ├── Gallery.vue           # Galerie principale (ex-MainDashboard)
│   │   ├── NewSession.vue        # Création session (ex-NewInspection)
│   │   ├── PhotoCapture.vue      # Capture photos (ex-InspectionSubjects)
│   │   ├── PhotoEdit.vue         # Édition & métadonnées (nouveau)
│   │   └── Publish.vue           # Publication (ex-InspectionReview)
│   ├── components/
│   │   ├── PhotoGrid.vue         # Grille de photos
│   │   ├── MetadataForm.vue      # Formulaire métadonnées
│   │   ├── PhotoEditor.vue       # Éditeur de photos
│   │   ├── SocialPreview.vue     # Aperçu pour réseaux sociaux
│   │   └── ...
│   └── ...
├── package.json
└── README.md
```

## 📦 Stores (State Management)

### GalleryStore
Gère les sessions de photographie d'œuvres.

**Types principaux:**
```typescript
interface ArtworkSession {
  id: number;
  title: string;
  date: string;
  status: 'Draft' | 'Ready' | 'Published';
  collectionId: string | null;
  photos: Photo[];
  publishedTo: string[];
}

interface Collection {
  id: string;
  name: string;
  description?: string;
}
```

**Actions principales:**
- `initializeNewSession()` - Créer une nouvelle session
- `setActiveCollection(collectionId)` - Sélectionner une collection
- `addPhotoToSession(photoUri)` - Ajouter une photo
- `publishSession(platforms)` - Publier sur les réseaux

### PhotoStore
Gère les photos individuelles et leurs modifications.

**Types principaux:**
```typescript
interface PhotoRecord {
  id: string;
  base64OrWebPath: string;
  timestamp: number;
  edited: boolean;
  originalPath?: string;
}
```

**Actions principales:**
- `addPhoto(photoData)` - Ajouter une photo
- `selectPhoto(photoId)` - Sélectionner pour édition
- `updatePhoto(photoId, newPath)` - Mettre à jour après édition
- `restoreOriginal(photoId)` - Annuler les modifications
- `removePhoto(photoId)` - Supprimer une photo

### MetadataStore
Gère les métadonnées des œuvres et les notes.

**Types principaux:**
```typescript
interface PhotoMetadata {
  title: string;
  description: string;
  tags: string[];
  medium?: string;           // Technique (huile, acrylique, etc.)
  dimensions?: string;
  year?: string;
  price?: number;
  forSale: boolean;
  instagramCaption?: string;
  facebookCaption?: string;
  hashtags: string[];
  notes: string;
}
```

**Actions principales:**
- `updateMetadataField(field, value)` - Mettre à jour un champ
- `addTag(tag)` / `removeTag(tag)` - Gérer les tags
- `addHashtag(hashtag)` / `removeHashtag(hashtag)` - Gérer les hashtags
- `generateInstagramCaption()` - Générer une légende Instagram
- `appendToNotes(text)` - Ajouter du texte aux notes (vocal)
- `addPermanentRecording(uri)` - Ajouter un enregistrement audio

## 🚀 Workflow utilisateur

1. **Galerie** (`/gallery`)
   - Vue d'ensemble des sessions
   - Création de nouvelles sessions
   - Accès aux sessions existantes

2. **Nouvelle Session** (`/new-session`)
   - Choix de la collection
   - Définition du titre de la session
   - Configuration initiale

3. **Capture Photos** (`/photo-capture`)
   - Prise de photos avec la caméra
   - Import depuis la galerie
   - Gestion de multiples photos

4. **Édition & Métadonnées** (`/photo-edit`)
   - Édition des photos (filtres, recadrage, etc.)
   - Saisie des métadonnées
   - Utilisation de la reconnaissance vocale
   - Prévisualisation pour chaque réseau social

5. **Publication** (`/publish`)
   - Revue finale
   - Sélection des plateformes
   - Export des photos avec métadonnées
   - Publication (ou préparation pour publication manuelle)

## 🎯 Fonctionnalités principales

### Capture de photos
- Appareil photo natif via Capacitor Camera
- Import depuis la galerie
- Support multi-photos par session

### Édition d'images
- Filtres et ajustements
- Recadrage et rotation
- Comparaison avant/après
- Annulation des modifications

### Métadonnées riches
- Titre, description, tags
- Informations techniques (technique, dimensions, année)
- Prix et statut de vente
- Notes textuelles et vocales

### Reconnaissance vocale
- Dictée pour les notes
- Transcription automatique
- Stockage des enregistrements audio

### Optimisation réseaux sociaux
- Légendes personnalisées par plateforme
- Gestion des hashtags
- Prévisualisation du rendu
- Format adapté à chaque réseau

### Collections
- Organisation thématique
- Filtrage par collection
- Statistiques par collection

## 🔧 Développement

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Tests
```bash
npm run test:unit
npm run test:e2e
```

### Build mobile
```bash
# Android
npx cap add android
npx cap sync
npx cap open android

# iOS
npx cap add ios
npx cap sync
npx cap open ios
```

## 📝 Notes de migration

Ce projet est une adaptation du projet "LaTataSasaIonic" (application d'inspection d'équipements) vers une application de gestion de photos d'œuvres d'art.

**Changements principaux:**
- `InspectionStore` → `GalleryStore`
- `SubjectStore` → (Intégré dans PhotoStore/MetadataStore)
- `EquipmentStore` → (Remplacé par Collections)
- Ajout de `MetadataStore` pour les données artistiques
- Adaptation du workflow inspection → workflow publication

**Stores conservés:**
- `PhotoStore` (adapté pour les sessions)
- `NotesStore` → `MetadataStore` (étendu)

**Fonctionnalités conservées:**
- Système de prise de photos
- Reconnaissance vocale
- Enregistrements audio
- Persistance des données
- Navigation par étapes

## 📱 Plateformes supportées

- iOS (via Capacitor)
- Android (via Capacitor)
- Web (version limitée, sans fonctionnalités natives)

## 🔐 Permissions requises

- Caméra
- Galerie photos
- Microphone (pour reconnaissance vocale)
- Stockage (pour sauvegarde des photos)

## 📄 Licence

Voir le fichier LICENSE pour plus de détails.

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez le guide de contribution pour plus d'informations.
