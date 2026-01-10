# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

VoiceFlow is a Next.js 15 voice-note productivity application using Firebase for authentication/storage and Google Genkit for AI capabilities. It implements a GTD-inspired task management system with voice input.

## Development Commands

### Running the Application
```bash
npm run dev          # Start Next.js dev server on port 9002 with Turbopack
npm run build        # Production build (TypeScript/ESLint errors ignored)
npm start            # Start production server
npm run typecheck    # Run TypeScript validation without emitting
npm run lint         # Run Next.js linter
```

### Genkit AI Development
```bash
npm run genkit:dev   # Start Genkit dev server
npm run genkit:watch # Start Genkit with file watching
```

## Architecture Overview

### Application Structure (Next.js App Router)

**Route Organization:**
- `/` - "My Day" view (actionable tasks)
- `/login` - Google OAuth authentication
- `/entry` - Unprocessed inbox tasks
- `/incubate` - Tasks on hold/blocked
- `/reference` - Reference materials
- `/archive` - Completed/archived tasks

**Provider Hierarchy:**
```
FirebaseProvider (Firebase initialization)
  └─> AuthProvider (authentication + routing logic)
      └─> AppLayout (app shell with sidebar)
          └─> Page Content
```

All pages are client-side rendered ("use client") and follow the same pattern:
- Use `useTasks()` hook for task management
- Filter tasks by stage using `useMemo`
- Render `TaskList` or `TasksBoard` component
- Include `VoiceRecorder` floating button
- Show loading skeletons during data fetch

### Task Stage Flow (GTD-inspired)

```
Voice Input → Entry → [Actionable | Incubate | Reference] → Archive
```

- **Entry**: Unprocessed inbox
- **Actionable**: Ready to act on today
- **Incubate**: Waiting/blocked
- **Reference**: Information storage
- **Archive**: Completed/inactive

### Data Model & State Management

**Task Interface** (src/lib/types.ts):
- Core fields: id, detail, stage, completed, createdAt
- Optional: context, timeFrame, dayOfWeek, dayOfMonth, alertDateTime, deadlineDateTime, priority, children (subtasks)
- Stage type: 'Entry' | 'Actionable' | 'Incubate' | 'Reference' | 'Archive'

**Task Storage:**
- Tasks synced with **Firestore** in real-time
- Stored at: `/users/{uid}/tasks/{taskId}`
- Managed via `use-voice-notes.ts` hook
- Real-time updates using Firestore `onSnapshot`
- No global state library (Redux/Zustand) - uses Context for auth/Firebase only

### Firebase Integration

**Authentication** (use-auth.tsx):
- Google OAuth with `signInWithPopup` (popup-based authentication)
- Creates user document in Firestore on first login
- Automatic routing: logged out → /login, logged in → /

**Firestore Structure:**
```
/users/{uid}/
  - uid, email, displayName, photoURL, createdAt

  /tasks/{taskId}/
    - detail, stage, completed, createdAt
    - Optional: priority, context, timeFrame, etc.
```

**Configuration:**
- Firebase config from environment variables (NEXT_PUBLIC_FIREBASE_*)
- Defined in src/lib/firebase.ts

### AI/Genkit Integration

**Current Status:** Scaffolded but not actively used
- genkit.ts: Initializes Genkit with Google AI plugin (Gemini 2.5 Flash)
- dev.ts: Entry point for Genkit dev server (awaiting flow implementations)

**Future Integration Points:**
- Voice transcription processing
- Task extraction from natural language
- Smart categorization (determining stage)

### Component Organization

**Feature Components:**
- **voice-recorder.tsx**: Voice input interface using Web Speech Recognition API
- **app-layout.tsx**: Main app shell with responsive sidebar navigation
- **tasks-board.tsx**: Grid/board view grouped by stage
- **task-list.tsx**: Linear list view for tasks
- **note-card.tsx**: Individual task card with collapsible detail
- **firebase-provider.tsx**: Firebase initialization context

**UI Components** (src/components/ui/):
- Uses shadcn/ui component library (30+ components)
- Built on Radix UI primitives for accessibility
- Styled with Tailwind CSS
- All components use `cn()` utility for className merging

### Key Utilities

**src/lib/types.ts**: Central type definitions (Task, Stage, etc.)
**src/lib/utils.ts**: `cn()` function for merging Tailwind classes
**src/lib/firebase.ts**: Firebase configuration

### Custom Hooks

**use-auth.tsx**: Firebase authentication + routing logic
- Provides: user, loading, signInWithGoogle(), signOut()
- Handles redirect-based Google login
- Auto route protection

**use-voice-notes.ts**: Task CRUD operations with Firestore
- Provides: tasks, isLoading, addTask(), updateTask(), deleteTask()
- Storage: Firestore with real-time sync
- Uses `onSnapshot` for live updates
- Toast notifications on actions

**use-toast.ts**: Toast notification system
**use-mobile.tsx**: Responsive breakpoint detection (< 768px)

## Key Conventions

**File Naming:**
- Components: kebab-case (e.g., voice-recorder.tsx)
- Hooks: kebab-case with use- prefix
- Routes: Next.js convention (page.tsx)

**Import Alias:**
- `@/*` maps to `src/*` (tsconfig.json)

**Styling:**
- Tailwind CSS with custom theme
- Dark mode default (class strategy)
- PT Sans font for body and headlines

**Build Configuration:**
- TypeScript and ESLint errors ignored during builds (next.config.ts)
- Remote images allowed from: placehold.co, images.unsplash.com, picsum.photos

## Critical Files

For understanding the codebase, prioritize reading:
1. src/lib/types.ts - Core data model
2. src/hooks/use-auth.tsx - Authentication flow
3. src/hooks/use-voice-notes.ts - Task management
4. src/components/app-layout.tsx - App structure
5. src/app/layout.tsx - Provider hierarchy
6. src/components/voice-recorder.tsx - Voice input mechanism
7. src/app/page.tsx - Example page pattern

## Key Architectural Decisions

1. **Real-Time Sync**: Tasks synced with Firestore, live updates across devices
2. **Authentication-First**: All routes protected except /login
3. **Client-Side Only**: No server components or API routes currently
4. **Voice as Primary Input**: Floating mic button on all pages
5. **Stage-Based Organization**: Tasks filtered by stage across different pages
6. **Genkit Prepared but Unused**: AI scaffolding in place for future features

## Firestore Security

Security rules are defined in `firestore.rules`:
- Users can only access their own data
- All operations require authentication
- Deploy rules via Firebase Console or CLI (see FIRESTORE_SETUP.md)
