# Video Chat Practice App

## 🚀 Project Overview

`Video Chat Practice` is a modern React Native video collaboration app built with TypeScript and Expo, designed for asynchronous video creation, editing, uploading, and playback. It emphasizes fast media workflows, clip handling, world switching, and seamless user experience with camera/voice recording and real-time previews.

This repository is a polished, recruiter-friendly sample of a full-stack mobile app demonstrating advanced React Native architecture, native module integration, and performance-focused video processing.

## 🎯 Key Features

- Multi-screen navigation: `HomeScreen`, `VideoScreen`, world switcher, consumption flows, test camera flows
- Camera recording, selfie capture and media preview (`selfie-camera-component`)
- Background upload handling, upload queue and lifecycle management
- External API interaction with centralized service layer (`apiBaseQuery`, `apiCall`, `apiClient`, `endpoints`)
- Local state + async-thunks via Redux Toolkit (`store/apiSlice`, `store/features`)
- Media post-processing utilities (compression, thumbnail generation, video size calculations)
- Dynamic theme support (dark / light palette in `theme`), responsive layout helpers
- Support for custom plugins and native behavior (`plugins/withMergedMlKitDependencies.js`, `plugins/backgroundActions.js`)

## 🧩 Tech Stack

- React Native (Expo) + TypeScript
- Redux Toolkit for state management
- React Navigation for app routing
- Metro bundler + Babel config
- Native Android modules for camera + background actions
- Custom utilities: `videoCompressor`, `useVideoTimer`, `useBackgroundUploadTrigger`, etc.

## 📂 Architecture

- `app/` - app UI components, hooks, modules, screens and services
- `components/` - shared interface pieces (buttons, camera controls, emoji keyboard, etc.)
- `hooks/` - reusable hooks for camera, face validation, background behavior
- `service/` - API service layer with base query and endpoint clients
- `storage/` - persistence helpers (MMKV storage abstraction)
- `utilities/` - helper functions and core logic (video size, times, normalization)
- `theme/` - centralized color palette and theme helpers
- `types/` - app-wide TypeScript types and response models

## 🛠 Setup & Run

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npx expo start
```

3. Run on iOS / Android:

```bash
npx expo run:android
npx expo run:ios
```

## 🧪 Important Scripts

- `npm run lint` - run ESLint checks
- `npm run test` - run Jest / unit tests (if set up)
- `npm run build` - build for production (web or native via Expo)

## 🔧 Highlighted Engineering Contributions

- Implemented robust `useBackgroundUploadTrigger` hook to resume uploads on app background/foreground.
- Built `useCameraSafety` and `useFaceValidation` for safer, user-focused camera capture experience.
- Designed a modular `upload` module with retry logic and status tracking in `store/apiSlice`.
- Centralized API error handling and request pipeline in `service/apiClient.ts` and `service/endpoints.ts`.

## 📌 Why this is recruiter-ready

- Clean, modular folder structure with scale-ready design patterns
- Strong use of TypeScript for type safety across network, UI, and business logic layers
- End-to-end video upload/wrapper flow showing native capabilities
- Well-separated concerns (components/hooks/services/store) and good documentation footprint

## 💼 Next improvements / MVP scope

- Add comprehensive test coverage (unit/e2e)
- Add feature flags for world-specific behaviour
- Add user authentication (OAuth / JWT) and profile management
- Add analytics events and time-series performance tracking

---

Built with passion and user-first product design. Happy to demo the app live or walk through code flow details anytime.
