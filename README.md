# 📸 Pic-Swipe-Wipe

> Pic-Swipe-Wipe est une application de tri de galerie (“Smart-Sort”) qui vise à traiter **des milliers de photos/vidéos** via une UI **gestuelle**, **fluide** et **robuste**, avec une architecture **hautement typée** et **testable**.

---

## ✨ Objectif produit (la promesse)

Les galeries mobiles deviennent vite ingérables : doublons, captures, memes, vidéos inutiles, etc.  
Pic-Swipe-Wipe propose un flux simple et ultra rapide :

- Scanner la galerie (photos + vidéos)
- Afficher un “deck” de cartes plein écran
- **Swipe droite = Keep**, **Swipe gauche = Trash**
- Sauvegarder chaque décision (ledger local)
- Appliquer une action groupée (commit) quand l’utilisateur le décide

> L’idée clé : **le tri est une décision**, la suppression est une **transaction** (différée, contrôlée, auditable).

---

## 📚 Sommaire

- [Architecture & philosophie](#-architecture--philosophie)
- [Structure des dossiers](#-structure-des-dossiers)
- [Flux de données (de la galerie à l’écran)](#-flux-de-données-de-la-galerie-à-lécran)
- [Pourquoi cette stack](#-pourquoi-cette-stack)
- [Design System & “Style Factory”](#-design-system--style-factory)
- [Tests & “Confidence Suite”](#-tests--confidence-suite)
- [Storybook (Visual TDD)](#-storybook-visual-tdd)
- [Scripts & automatisation](#-scripts--automatisation)
- [Démarrage rapide](#-démarrage-rapide)
- [Notes plateforme (Android / iOS)](#-notes-plateforme-android--ios)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)

---

## 🏗️ Architecture & philosophie

### 1) Séparation stricte des responsabilités (SoC)

Le projet est pensé en couches, pour éviter le “spaghetti code” classique mobile :

- **UI atoms (`app/ui`)** : composants petits, réutilisables, _sans_ logique métier.
- **Components (`app/components`)** : “organismes” qui composent l’UI et orchestrent des interactions.
- **Screens (`app/screens`)** : pages métier (écrans router) qui câblent navigation + store + services.
- **Store (`app/store`)** : état global prévisible (scan, deck, curseur, filtres, états async).
- **Services (`app/services`)** : logique métier (scan, normalization, commit, opérations médias).
- **Database (`app/database`)** : persistance locale (ledger, migrations, requêtes).
- **Hooks (`app/hooks`)** : encapsulation de comportements complexes (styles dynamiques, gestures, etc).

👉 Résultat : on peut modifier une couche sans casser le reste, et on sait **où** mettre chaque morceau.

---

### 2) “Offline-first” et ledger transactionnel

Le tri peut être long (des milliers de médias).  
Le design vise donc :

- **Zéro dépendance réseau**
- **Persistance locale** des décisions (SQLite)
- Possibilité de reprendre un tri interrompu
- Audit/rejeu possible (un “ledger” est un journal d’événements)

> Ce choix évite le “j’ai swipé 500 items et j’ai perdu tout mon travail”.

---

### 3) Performance mobile : 60 FPS en priorité

Un deck de cartes + médias lourds = piège classique.

Principes appliqués :

- Animations **sur le thread UI** (Reanimated / Worklets)
- Limiter les re-renders et allocations
- Normaliser les données (structures simples, stables, typées)
- Gérer les médias par “fenêtre” (deck + index circulaire)
- Styles mémorisés (`useMemo`) et overrides contrôlés

---

## 🧬 Structure des dossiers

Structure (résumé) :

```text
.
├─ app/
│  ├─ (tabs)/                # Navigation principale (Expo Router)
│  ├─ ui/                    # Atomes UI (agnostiques métier)
│  ├─ components/            # Organismes / composants orchestrateurs
│  ├─ screens/               # Écrans métier (pages)
│  ├─ hooks/                 # Hooks custom (styles, logique UI)
│  ├─ services/              # Logique métier (scan, commit, etc.)
│  ├─ database/              # SQLite (init, ledger, queries)
│  ├─ store/                 # Redux Toolkit slices/thunks/selectors
│  ├─ _layout.tsx            # Layout racine (router, providers, theme)
│  └─ index.tsx              # Entry screen / route
├─ styles/                   # Tokens (theme, spacing, typo, etc.)
├─ scripts/                  # Génération de boilerplate / utilitaires
├─ docs/                     # (optionnel) docs projet / notes
├─ mocks/                    # Mocks Jest / fixtures
└─ ...
```

### Pourquoi Expo Router + file-based routing ?

- **Lisibilité** : un dossier = une route.
- **Scalabilité** : ajouter un écran ne demande pas de toucher une config géante.
- **Ergonomie** : parfait avec un projet qui va grossir (tabs + modals + stacks).

---

## 🔁 Flux de données (de la galerie à l’écran)

### 1) Scan & normalisation

Objectif : transformer les assets natifs (MediaLibrary) en un modèle UI stable.

**Étapes typiques :**

1. Demande de permission (MediaLibrary)
2. Scan paginé (limit, curseurs)
3. Chargement du ledger SQLite (ids déjà triés)
4. Filtrage (`exclude known ids`)
5. Normalisation vers `MediaItem[]` (format stable pour UI)

**Pourquoi normaliser ?**  
Parce que les objets natifs changent, sont verbeux et parfois instables.  
Un modèle “UI-friendly” évite les bugs et rend les tests simples.

---

### 2) État global & comportement déterministe (Redux Toolkit)

Le store porte l’état **source of truth** :

- Queue des médias à traiter
- Index courant / deck
- Statut async (idle/loading/error)
- Actions utilisateur (keep/trash)
- Progress (x/y triés)

**Pourquoi Redux Toolkit ici ?**

- Très bon pour modéliser un flux “pipeline” : scan → queue → verdict → ledger → commit
- Thunks async propres (`createAsyncThunk`)
- Immutabilité gérée (Immer)
- Debug clair (actions explicites)

---

### 3) Ledger SQLite (audit + reprise)

SQLite sert de **journal de décisions** :

- `media_id` (clé)
- `verdict` (KEEP/TRASH)
- timestamps (quand trié)
- (optionnel) infos minimales (type photo/vidéo, durée vidéo, etc.)

**Pourquoi SQLite plutôt qu’AsyncStorage ?**

- **Performance** (index, bulk queries)
- **Fiabilité** (transactions)
- Requêtes avancées (filtrage, stats, pagination)
- Stable même avec des volumes énormes

---

### 4) UI : deck gestuel (Reanimated + Gesture Handler)

Le deck de cartes doit :

- suivre le doigt
- animer inertie + spring
- déclencher un verdict au seuil
- rester fluide même en vidéo

**Pourquoi Reanimated v4 + worklets ?**

- Exécution d’animations sur le thread UI (moins de jank)
- Interpolations et springs très performants
- Parfait pour un deck Tinder-like

---

## 🛠️ Pourquoi cette stack

### Expo (SDK 54) + React Native 0.81.5

**Choix : Expo** pour :

- accélérer la livraison (build, permissions, APIs natives prêtes)
- réduire la dette d’infra
- rester productif (surtout sur un projet mobile solo / petite équipe)

**Expo Dev Client** (`expo-dev-client`) :

- indispensable dès que tu utilises des modules natifs avancés
- permet le confort Expo **sans** les limites d’Expo Go

---

### TypeScript ~5.9

TypeScript est central ici parce que :

- on manipule des données sensibles (ids, verdicts, états async)
- on veut des APIs internes “self-documented”
- les tests deviennent plus simples (modèles stables)

---

### Redux Toolkit

- pipeline lisible
- logique asynchrone cadrée
- actions traçables
- testabilité forte (reducers purs)

---

### expo-media-library

- accès natif à la galerie
- pagination et récupération de métadonnées
- cohérent avec l’objectif “scanner beaucoup, vite”

---

### expo-sqlite v16 (ledger)

- ledger solide
- meilleur contrôle sur les données
- extensible (stats, filtres, export)

---

### expo-video

Choix orienté performance & contrôle :

- lecteur natif
- compatible avec une UI custom (play/pause, seek, scrubbing)
- adapté à l’intégration “dans une card” (thumbnail → play → controls)

---

### @gorhom/bottom-sheet

Utile pour :

- actions de commit
- filtres / settings
- confirmations (trash, keep, batch operations)
  => UX moderne sans casser la navigation.

---

### Storybook (react-native) v10

Choix “qualité produit” :

- construire les atomes en isolation
- faire du Visual TDD (prop controls)
- tester les thèmes / responsive / états vides

---

### Jest + Testing Library (RNTL)

- tests unitaires et comportementaux
- focus sur “ce que voit l’utilisateur”
- mocks des modules natifs (MediaLibrary / SQLite / Video)

---

### ESLint + Prettier + Husky + lint-staged

Objectif : **zéro friction**, mais discipline automatique :

- formatage et lint **avant commit**
- cohérence codebase
- dette réduite

---

## 🎨 Design System & “Style Factory”

### Tokens (`styles/`)

Le design system est token-driven :

- couleurs (light/dark)
- spacing
- typography
- radius, elevations (si besoin)
- z-index (si besoin)

But : un changement de branding se fait _en un endroit_.

---

### Pattern “Style Factory” (makeStyles)

Problème RN : styles vite rigides, overrides dangereux, duplication.

Solution :

- chaque composant expose une **shape** de styles typée
- un parent peut fournir un `StylesOverride`
- un hook calcule le “resultedStyle” final (base + override)

Bénéfices :

- overrides “chirurgicaux” (pas de bricolage)
- typage qui empêche d’injecter des clés inexistantes
- perf : `useMemo` pour éviter de recalculer en boucle

---

## 🧪 Tests & “Confidence Suite”

### Objectif

Garantir que chaque geste (tap, swipe, seek) produit le bon effet :

- verdict déclenché au bon moment
- barre de progression cohérente
- états UI (loading/empty/error) corrects
- navigation stable

### Stratégie

- **Unit tests** : reducers, utils, normalizers, services purs
- **Component tests** : interactions UI (RNTL)
- **Mocks natifs** : expo-media-library, expo-sqlite, expo-video

---

## 📕 Storybook (Visual TDD)

Deux modes :

### Mode Dev Client (recommandé)

```bash
npm run storybook
```

- génère l’index stories
- lance expo avec `EXPO_PUBLIC_STORYBOOK_ENABLED=true`
- tu testes tes composants en isolation **dans l’app**

### Mode Expo Go (fallback)

```bash
npm run storybook:expo-go
```

Utile si tu veux juste un aperçu rapide, mais moins complet selon modules natifs.

---

## ⚙️ Scripts & automatisation

### Générateurs

- `npm run g:ui`  
  Génère un atome complet (component + styles + tests + stories)

- `npm run g:c`  
  Génère un composant orchestrateur (organisme)

> Pourquoi générer plutôt que coder à la main ?  
> Parce que ça force une structure cohérente (test/story/style) et évite la dérive.

### Tests

- `npm run test` : suite complète
- `npm run test:watch` : watch mode
- `npm run test:clean` : clear cache puis run
- `npm run test:clean:u` : clear cache + update snapshots

### Lint / format

- `npm run lint`
- `npm run format`

### Docs

- `npm run generate-docs` : TypeDoc (TSDoc → docs techniques)

### Build dev Android (EAS)

- `npm run expo-build-dev`

---

## 🚀 Démarrage rapide

### Prérequis

- Node.js + npm
- Android Studio (si Android)
- Expo CLI (via `npx expo ...`)
- Un device physique recommandé pour MediaLibrary + perf vidéo

### Installation

```bash
npm install
```

### Lancer l’app

```bash
npm run start
```

### Lancer sur Android (run natif)

```bash
npm run android
```

---

## 📱 Notes plateforme (Android / iOS)

### Permissions galerie

- Le scan dépend des permissions système.
- Android récent : permissions séparées (images/vidéos) selon versions.
- iOS : demande d’accès Photos (et parfois accès limité).

> Si tu vois “0 média trouvé”, c’est souvent un souci de permission ou de scope “limited access”.

---

## 🧯 Troubleshooting

### 1) “window is not defined” (storybook / tests)

Certains packages attendent un environnement web.  
Solution habituelle : mock ciblé ou config jest/storybook pour éviter les dépendances web côté node.

### 2) Tests qui “hang” (animations Reanimated)

- utiliser fake timers quand `Animated.loop` / worklets tournent
- mock reanimated (setup jest)
- éviter les timers infinis dans les tests

### 3) AsyncStorage / modules natifs non résolus (Android build)

Souvent lié à :

- mismatch versions RN/Expo
- cache Gradle
- dépendances transitive
  Actions :
- clean (`./gradlew clean`)
- `expo start -c`
- vérifier versions compatibles Expo SDK

---

## 🧭 Roadmap (idées d’évolution)

- ✅ Ledger SQLite + reprise tri
- ⏳ “Commit screen” : résumé Keep/Trash + confirmation
- ⏳ Filtres : screenshots, vidéos courtes, tailles, dates
- ⏳ Mode “Review Trash” avant suppression finale
- ⏳ Export/backup du ledger (JSON)
- ⏳ Détection doublons (hash perceptuel) _(plus tard)_

---

## 📌 Statut

Projet privé — **Pic-Swipe-Wipe v1.0.0**  
Construit avec une logique “production-grade” : typage strict, architecture claire, tests, storybook, automation.

---
